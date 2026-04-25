"""Endpoint de health check.

Acessível em ``GET /api/health`` quando rodando na Vercel.
Vercel Python runtime importa o símbolo ``handler`` deste arquivo.
"""

import json
from http.server import BaseHTTPRequestHandler


class handler(BaseHTTPRequestHandler):  # noqa: N801 - nome exigido pela Vercel
    def do_GET(self) -> None:  # noqa: N802 - assinatura do BaseHTTPRequestHandler
        body = json.dumps({"ok": True, "service": "v8-on-fire-api"}).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format: str, *args: object) -> None:  # noqa: A002
        # Silencia logs em testes; na Vercel os logs são capturados pela própria plataforma.
        return
