"""Testes do endpoint /api/db_health (verifica conexão real com Supabase)."""

import json
from http.client import HTTPConnection
from http.server import HTTPServer
from threading import Thread
from unittest.mock import MagicMock, patch

import httpx
import pytest

from api import db_health
from api._lib import db


def _start_server() -> tuple[HTTPServer, Thread]:
    server = HTTPServer(("127.0.0.1", 0), db_health.handler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, thread


def _request_db_health() -> tuple[int, dict]:
    server, thread = _start_server()
    try:
        port = server.server_address[1]
        conn = HTTPConnection("127.0.0.1", port, timeout=2)
        conn.request("GET", "/api/db_health")
        response = conn.getresponse()
        return response.status, json.loads(response.read().decode("utf-8"))
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)


@pytest.fixture(autouse=True)
def _reset_client_cache() -> None:
    db.reset_client()
    yield
    db.reset_client()


def test_db_health_retorna_ok_quando_consulta_funciona() -> None:
    fake_client = MagicMock(spec=httpx.Client)
    fake_response = MagicMock()
    fake_response.raise_for_status.return_value = None
    fake_client.get.return_value = fake_response

    with patch.object(db_health, "get_client", return_value=fake_client):
        status, body = _request_db_health()

    assert status == 200
    assert body == {"ok": True, "db": "connected"}
    fake_client.get.assert_called_once_with(
        "/profissionais", params={"select": "id", "limit": "1"}
    )


def test_db_health_retorna_503_quando_config_ausente() -> None:
    erro = db.MissingSupabaseConfigError(
        "Variáveis de ambiente ausentes: SUPABASE_URL"
    )
    with patch.object(db_health, "get_client", side_effect=erro):
        status, body = _request_db_health()

    assert status == 503
    assert body["ok"] is False
    assert "SUPABASE_URL" in body["error"]


def test_db_health_retorna_500_quando_consulta_falha() -> None:
    fake_client = MagicMock(spec=httpx.Client)
    fake_client.get.side_effect = httpx.ConnectError("falha de conexão")

    with patch.object(db_health, "get_client", return_value=fake_client):
        status, body = _request_db_health()

    assert status == 500
    assert body["ok"] is False
    assert "falha de conexão" in body["error"]
