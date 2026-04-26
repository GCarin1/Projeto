"""Endpoint REST para veículos.

- ``GET  /api/veiculos[?cliente_id=...]`` lista veículos (já com nome do dono)
- ``POST /api/veiculos`` cadastra um novo veículo
"""

from __future__ import annotations

from http.server import BaseHTTPRequestHandler

from api._lib.crud import handle_create, handle_list, method_not_allowed
from api._lib.http_utils import parse_query
from api._lib.validators import validate_veiculo


class handler(BaseHTTPRequestHandler):  # noqa: N801
    def do_GET(self) -> None:  # noqa: N802
        # Embutimos o nome do cliente via "embedded resource" do PostgREST.
        params = {"select": "*,clientes(nome)"}
        query = parse_query(self)
        if "cliente_id" in query:
            params["cliente_id"] = f"eq.{query['cliente_id']}"
        handle_list(self, "veiculos", params=params)

    def do_POST(self) -> None:  # noqa: N802
        handle_create(self, "veiculos", validate_veiculo)

    def do_DELETE(self) -> None:  # noqa: N802
        method_not_allowed(self, ["GET", "POST"])

    def do_PUT(self) -> None:  # noqa: N802
        method_not_allowed(self, ["GET", "POST"])

    def do_PATCH(self) -> None:  # noqa: N802
        method_not_allowed(self, ["GET", "POST"])

    def log_message(self, format: str, *args: object) -> None:  # noqa: A002
        return
