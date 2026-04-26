"""Testes do endpoint /api/servicos."""

from unittest.mock import MagicMock, patch

import httpx

from api import servicos as endpoint
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


def test_get_lista_servicos_ordenados_por_nome() -> None:
    fake = _fake_client(json_data=[{"id": "s1", "nome": "Troca de óleo"}])
    with patch.object(crud, "get_client", return_value=fake):
        status, body = request_handler(endpoint.handler, "GET", "/api/servicos")
    assert status == 200
    fake.get.assert_called_once_with(
        "/servicos", params={"select": "*", "order": "nome.asc"}
    )


def test_post_cria_servico() -> None:
    fake = _fake_client(
        status_code=201,
        json_data=[{"id": "s1", "nome": "Troca de óleo"}],
    )
    with patch.object(crud, "get_client", return_value=fake):
        status, body = request_handler(
            endpoint.handler,
            "POST",
            "/api/servicos",
            body={
                "nome": "Troca de óleo",
                "duracao_minutos": 60,
                "preco": "150.50",
            },
        )
    assert status == 201
    args, kwargs = fake.post.call_args
    assert kwargs["json"]["preco"] == 150.50


def test_post_servico_com_preco_negativo_devolve_422() -> None:
    fake = _fake_client()
    with patch.object(crud, "get_client", return_value=fake):
        status, body = request_handler(
            endpoint.handler,
            "POST",
            "/api/servicos",
            body={"nome": "X", "duracao_minutos": 30, "preco": -5},
        )
    assert status == 422
