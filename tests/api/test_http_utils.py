"""Testes dos helpers HTTP compartilhados (api/_lib/http_utils.py)."""

import io
import json
from unittest.mock import MagicMock

import pytest

from api._lib import http_utils


class _FakeHandler:
    """Stub mínimo de BaseHTTPRequestHandler para testes unitários."""

    def __init__(self, body: bytes = b"", path: str = "/") -> None:
        self.rfile = io.BytesIO(body)
        self.wfile = io.BytesIO()
        self.headers = {"Content-Length": str(len(body))} if body else {}
        self.path = path
        self.send_response = MagicMock()
        self.send_header = MagicMock()
        self.end_headers = MagicMock()


def test_write_json_serializa_e_escreve_status_e_body() -> None:
    handler = _FakeHandler()

    http_utils.write_json(handler, 201, {"ok": True, "n": 7})

    handler.send_response.assert_called_once_with(201)
    headers = dict(call.args for call in handler.send_header.call_args_list)
    assert headers["Content-Type"].startswith("application/json")
    body = handler.wfile.getvalue().decode("utf-8")
    assert json.loads(body) == {"ok": True, "n": 7}
    assert headers["Content-Length"] == str(len(body))


def test_read_json_body_devolve_dict() -> None:
    handler = _FakeHandler(body=b'{"nome": "Ana"}')

    assert http_utils.read_json_body(handler) == {"nome": "Ana"}


def test_read_json_body_rejeita_json_malformado() -> None:
    handler = _FakeHandler(body=b"{nome:}")

    with pytest.raises(http_utils.ValidationError) as exc:
        http_utils.read_json_body(handler)
    assert "JSON inválido" in str(exc.value)


def test_read_json_body_rejeita_corpo_vazio() -> None:
    handler = _FakeHandler(body=b"")

    with pytest.raises(http_utils.ValidationError):
        http_utils.read_json_body(handler)


def test_read_json_body_rejeita_lista_no_topo() -> None:
    handler = _FakeHandler(body=b'[1, 2]')

    with pytest.raises(http_utils.ValidationError):
        http_utils.read_json_body(handler)


def test_parse_query_extrai_parametros() -> None:
    handler = _FakeHandler(path="/api/x?cliente_id=abc&limit=10")

    assert http_utils.parse_query(handler) == {
        "cliente_id": "abc",
        "limit": "10",
    }


def test_parse_query_sem_query_string() -> None:
    handler = _FakeHandler(path="/api/x")
    assert http_utils.parse_query(handler) == {}


def test_validation_error_aceita_string_ou_lista() -> None:
    erro = http_utils.ValidationError("nome obrigatório")
    assert erro.errors == ["nome obrigatório"]

    erro = http_utils.ValidationError(["a", "b"])
    assert erro.errors == ["a", "b"]
