"""Testes do endpoint /api/veiculos."""

from unittest.mock import MagicMock, patch

import httpx

from api import veiculos as endpoint
from api._lib import crud

from conftest import request_handler


def _fake_client(*, json_data=None, status_code: int = 200) -> MagicMock:
    fake = MagicMock(spec=httpx.Client)
    response = MagicMock()
    response.status_code = status_code
    response.json.return_value = json_data if json_data is not None else []
    response.raise_for_status.return_value = None
    fake.get.return_value = response
    fake.post.return_value = response
    return fake


def test_get_lista_veiculos() -> None:
    fake = _fake_client(json_data=[{"id": "v1", "placa": "ABC1234"}])
    with patch.object(crud, "get_client", return_value=fake):
        status, body = request_handler(endpoint.handler, "GET", "/api/veiculos")
    assert status == 200
    assert body[0]["placa"] == "ABC1234"
    fake.get.assert_called_once_with(
        "/veiculos", params={"select": "*,clientes(nome)"}
    )


def test_get_filtra_por_cliente_id() -> None:
    fake = _fake_client(json_data=[])
    with patch.object(crud, "get_client", return_value=fake):
        request_handler(
            endpoint.handler, "GET", "/api/veiculos?cliente_id=abc-123"
        )
    fake.get.assert_called_once_with(
        "/veiculos",
        params={"select": "*,clientes(nome)", "cliente_id": "eq.abc-123"},
    )


def test_post_veiculo_valido_cria() -> None:
    fake = _fake_client(
        status_code=201,
        json_data=[{"id": "v1", "placa": "ABC1234", "marca": "Fiat"}],
    )
    with patch.object(crud, "get_client", return_value=fake):
        status, body = request_handler(
            endpoint.handler,
            "POST",
            "/api/veiculos",
            body={
                "cliente_id": "c1",
                "placa": "abc1234",
                "marca": "Fiat",
                "modelo": "Uno",
                "ano": 2020,
            },
        )
    assert status == 201
    args, kwargs = fake.post.call_args
    assert args[0] == "/veiculos"
    assert kwargs["json"]["placa"] == "ABC1234"
    assert kwargs["json"]["ano"] == 2020


def test_post_sem_placa_devolve_422() -> None:
    fake = _fake_client()
    with patch.object(crud, "get_client", return_value=fake):
        status, body = request_handler(
            endpoint.handler,
            "POST",
            "/api/veiculos",
            body={"cliente_id": "c1", "marca": "Fiat", "modelo": "Uno"},
        )
    assert status == 422
    assert any("placa" in e for e in body["errors"])
