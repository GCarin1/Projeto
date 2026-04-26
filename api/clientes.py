"""Endpoint REST para clientes.

- ``GET  /api/clientes`` lista todos (mais recentes primeiro)
- ``POST /api/clientes`` cria um novo cliente

A interação com o Supabase é feita via PostgREST (httpx). Esta função roda
como serverless na Vercel (Python runtime), por isso o handler estende
``BaseHTTPRequestHandler``.
"""

from __future__ import annotations

from http.server import BaseHTTPRequestHandler

from api._lib.crud import (
    handle_create,
    handle_delete,
    handle_list,
    method_not_allowed,
)
from api._lib.db import get_client  # re-export para mocking nos testes
from api._lib.validators import validate_cliente

__all__ = ["handler", "get_client"]


class handler(BaseHTTPRequestHandler):  # noqa: N801 - exigido pela Vercel
    def do_GET(self) -> None:  # noqa: N802
        handle_list(self, "clientes", params={"order": "criado_em.desc"})

    def do_POST(self) -> None:  # noqa: N802
        handle_create(self, "clientes", validate_cliente)

    def do_DELETE(self) -> None:  # noqa: N802
        handle_delete(self, "clientes")

    def do_PUT(self) -> None:  # noqa: N802
        method_not_allowed(self, ["GET", "POST", "DELETE"])

    def do_PATCH(self) -> None:  # noqa: N802
        method_not_allowed(self, ["GET", "POST", "DELETE"])

    def log_message(self, format: str, *args: object) -> None:  # noqa: A002
        return
