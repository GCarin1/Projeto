"""Fixtures e helpers compartilhados pelos testes de endpoints serverless."""

from __future__ import annotations

import json
from http.client import HTTPConnection
from http.server import BaseHTTPRequestHandler, HTTPServer
from threading import Thread
from typing import Any

import pytest

from api._lib import db


@pytest.fixture(autouse=True)
def _reset_db_client_cache() -> None:
    """Cada teste começa com o singleton do client zerado."""
    db.reset_client()
    yield
    db.reset_client()


def request_handler(
    handler_cls: type[BaseHTTPRequestHandler],
    method: str,
    path: str = "/",
    body: dict | list | None = None,
) -> tuple[int, Any]:
    """Sobe um HTTPServer efêmero, faz uma requisição e devolve (status, body).

    O ``handler_cls`` é a classe ``handler`` definida em cada arquivo de
    endpoint (ex.: ``api.clientes.handler``). Usa um servidor real para
    exercitar todo o ciclo do BaseHTTPRequestHandler (parsing de método,
    leitura de body, escrita de resposta).
    """
    server = HTTPServer(("127.0.0.1", 0), handler_cls)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        port = server.server_address[1]
        conn = HTTPConnection("127.0.0.1", port, timeout=2)
        headers = {"Content-Type": "application/json"}
        raw = json.dumps(body).encode("utf-8") if body is not None else None
        conn.request(method, path, body=raw, headers=headers)
        resp = conn.getresponse()
        raw_body = resp.read()
        try:
            parsed = json.loads(raw_body.decode("utf-8")) if raw_body else None
        except json.JSONDecodeError:
            parsed = raw_body
        return resp.status, parsed
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)
