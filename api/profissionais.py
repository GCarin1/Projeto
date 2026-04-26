"""Endpoint REST para profissionais (mecânicos).

- ``GET  /api/profissionais``                 → apenas ativos
- ``GET  /api/profissionais?incluir_inativos=1`` → todos
- ``POST /api/profissionais``                 → cadastra novo
"""

from __future__ import annotations

from http.server import BaseHTTPRequestHandler

from api._lib.crud import handle_create, handle_list, method_not_allowed
from api._lib.http_utils import parse_query
from api._lib.validators import validate_profissional


class handler(BaseHTTPRequestHandler):  # noqa: N801
    def do_GET(self) -> None:  # noqa: N802
        params = {"select": "*", "order": "nome.asc"}
        query = parse_query(self)
        if "incluir_inativos" not in query:
            params["ativo"] = "eq.true"
        handle_list(self, "profissionais", params=params)

    def do_POST(self) -> None:  # noqa: N802
        handle_create(self, "profissionais", validate_profissional)

    def do_DELETE(self) -> None:  # noqa: N802
        method_not_allowed(self, ["GET", "POST"])

    def do_PUT(self) -> None:  # noqa: N802
        method_not_allowed(self, ["GET", "POST"])

    def do_PATCH(self) -> None:  # noqa: N802
        method_not_allowed(self, ["GET", "POST"])

    def log_message(self, format: str, *args: object) -> None:  # noqa: A002
        return
