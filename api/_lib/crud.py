"""Helpers para os handlers CRUD que falam com o PostgREST.

Centraliza o try/except (ValidationError, MissingSupabaseConfigError, erros
HTTP) para que cada endpoint serverless seja apenas um shim fino.
"""

from __future__ import annotations

import json
from collections.abc import Callable
from http.server import BaseHTTPRequestHandler
from typing import Any

import httpx

from .db import MissingSupabaseConfigError, get_client
from .http_utils import ValidationError, read_json_body, write_json


def _write_db_error(handler: BaseHTTPRequestHandler, exc: Exception) -> None:
    if isinstance(exc, MissingSupabaseConfigError):
        write_json(handler, 503, {"ok": False, "error": str(exc)})
        return
    if isinstance(exc, httpx.HTTPStatusError):
        # Erro vindo do PostgREST (ex.: violação de constraint).
        try:
            payload = exc.response.json()
        except (json.JSONDecodeError, ValueError):
            payload = {"message": exc.response.text}
        write_json(
            handler,
            exc.response.status_code,
            {"ok": False, "error": payload},
        )
        return
    write_json(handler, 500, {"ok": False, "error": str(exc)})


def handle_list(
    handler: BaseHTTPRequestHandler,
    table: str,
    *,
    params: dict[str, str] | None = None,
) -> None:
    """GET genérico: lista todos os registros de ``table`` via PostgREST."""
    query = {"select": "*"}
    if params:
        query.update(params)
    try:
        client = get_client()
        resp = client.get(f"/{table}", params=query)
        resp.raise_for_status()
    except Exception as exc:  # noqa: BLE001
        _write_db_error(handler, exc)
        return
    write_json(handler, 200, resp.json())


def handle_create(
    handler: BaseHTTPRequestHandler,
    table: str,
    validator: Callable[[dict[str, Any]], dict[str, Any]],
) -> None:
    """POST genérico: lê JSON, valida e insere via PostgREST."""
    try:
        payload = read_json_body(handler)
        data = validator(payload)
    except ValidationError as exc:
        write_json(handler, 422, {"ok": False, "errors": exc.errors})
        return

    try:
        client = get_client()
        resp = client.post(f"/{table}", json=data)
        resp.raise_for_status()
    except Exception as exc:  # noqa: BLE001
        _write_db_error(handler, exc)
        return

    body = resp.json()
    # PostgREST retorna lista quando ``Prefer: return=representation``.
    if isinstance(body, list) and body:
        body = body[0]
    write_json(handler, 201, body)


def method_not_allowed(handler: BaseHTTPRequestHandler, allowed: list[str]) -> None:
    write_json(
        handler,
        405,
        {"ok": False, "error": "método não permitido", "allowed": allowed},
    )


def handle_delete(handler: BaseHTTPRequestHandler, table: str) -> None:
    """DELETE genérico: remove registros filtrando por ?id=...

    422 se faltar ``id`` na query string. Devolve 204 (sem corpo) em caso
    de sucesso para casar com a semântica REST.
    """
    from .http_utils import parse_query  # import local pra evitar ciclo

    query = parse_query(handler)
    if not query.get("id"):
        write_json(
            handler,
            422,
            {"ok": False, "errors": ["query param 'id' é obrigatório"]},
        )
        return

    try:
        client = get_client()
        resp = client.delete(f"/{table}", params={"id": f"eq.{query['id']}"})
        resp.raise_for_status()
    except Exception as exc:  # noqa: BLE001
        _write_db_error(handler, exc)
        return

    write_json(handler, 200, {"ok": True})
