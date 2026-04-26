"""Endpoint REST para serviços oferecidos pela oficina.

- ``GET  /api/servicos`` lista alfabeticamente
- ``POST /api/servicos`` cadastra um novo serviço
"""

from __future__ import annotations

from http.server import BaseHTTPRequestHandler

from api._lib.crud import handle_create, handle_list, method_not_allowed
from api._lib.validators import validate_servico


class handler(BaseHTTPRequestHandler):  # noqa: N801
    def do_GET(self) -> None:  # noqa: N802
        handle_list(self, "servicos", params={"order": "nome.asc"})

    def do_POST(self) -> None:  # noqa: N802
        handle_create(self, "servicos", validate_servico)

    def do_DELETE(self) -> None:  # noqa: N802
        method_not_allowed(self, ["GET", "POST"])

    def do_PUT(self) -> None:  # noqa: N802
        method_not_allowed(self, ["GET", "POST"])

    def do_PATCH(self) -> None:  # noqa: N802
        method_not_allowed(self, ["GET", "POST"])

    def log_message(self, format: str, *args: object) -> None:  # noqa: A002
        return
