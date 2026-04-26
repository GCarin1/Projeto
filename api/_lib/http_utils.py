"""Helpers HTTP compartilhados pelos endpoints serverless.

Os endpoints da Vercel herdam de ``BaseHTTPRequestHandler``. Estas funções
encapsulam parsing de query string, leitura de corpo JSON e escrita de
respostas JSON com erros padronizados, evitando repetição em cada arquivo.
"""

from __future__ import annotations

import json
from http.server import BaseHTTPRequestHandler
from typing import Any
from urllib.parse import parse_qs, urlparse


class ValidationError(ValueError):
    """Erro de validação de input. ``errors`` é uma lista de mensagens."""

    def __init__(self, errors: str | list[str]) -> None:
        self.errors: list[str] = (
            list(errors) if isinstance(errors, list) else [errors]
        )
        super().__init__("; ".join(self.errors))


def write_json(handler: BaseHTTPRequestHandler, status: int, payload: Any) -> None:
    body = json.dumps(payload, ensure_ascii=False, default=str).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def read_json_body(handler: BaseHTTPRequestHandler) -> dict[str, Any]:
    try:
        length = int(handler.headers.get("Content-Length") or 0)
    except (TypeError, ValueError) as exc:
        raise ValidationError("Content-Length inválido") from exc

    if length <= 0:
        raise ValidationError("Corpo da requisição vazio")

    raw = handler.rfile.read(length)
    try:
        data = json.loads(raw.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        msg = exc.msg if isinstance(exc, json.JSONDecodeError) else str(exc)
        raise ValidationError(f"JSON inválido: {msg}") from exc

    if not isinstance(data, dict):
        raise ValidationError("Corpo deve ser um objeto JSON")
    return data


def parse_query(handler: BaseHTTPRequestHandler) -> dict[str, str]:
    parsed = urlparse(handler.path)
    query = parse_qs(parsed.query, keep_blank_values=False)
    return {k: v[0] for k, v in query.items()}
