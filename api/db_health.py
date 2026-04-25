"""Endpoint que valida a conexão com o Supabase.

Acessível em ``GET /api/db_health``. Faz um SELECT mínimo na tabela
``profissionais`` e responde com o status real da conexão.
"""

import json
from http.server import BaseHTTPRequestHandler

from api._lib.db import MissingSupabaseConfigError, get_client


def _write_json(handler: BaseHTTPRequestHandler, status: int, payload: dict) -> None:
    body = json.dumps(payload).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


class handler(BaseHTTPRequestHandler):  # noqa: N801 - nome exigido pela Vercel
    def do_GET(self) -> None:  # noqa: N802
        try:
            client = get_client()
            client.table("profissionais").select("id").limit(1).execute()
        except MissingSupabaseConfigError as exc:
            _write_json(self, 503, {"ok": False, "error": str(exc)})
            return
        except Exception as exc:  # noqa: BLE001 - relatamos qualquer erro de DB
            _write_json(self, 500, {"ok": False, "error": str(exc)})
            return

        _write_json(self, 200, {"ok": True, "db": "connected"})

    def log_message(self, format: str, *args: object) -> None:  # noqa: A002
        return
