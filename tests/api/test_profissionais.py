"""Testes do endpoint /api/profissionais."""

from unittest.mock import MagicMock, patch

import httpx

from api import profissionais as endpoint
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


def test_get_lista_apenas_ativos_por_default() -> None:
    fake = _fake_client(json_data=[{"id": "p1", "nome": "Carlos", "ativo": True}])
    with patch.object(crud, "get_client", return_value=fake):
        status, body = request_handler(
            endpoint.handler, "GET", "/api/profissionais"
        )
    assert status == 200
    fake.get.assert_called_once_with(
        "/profissionais",
        params={"select": "*", "ativo": "eq.true", "order": "nome.asc"},
    )


def test_get_inclui_inativos_quando_pedido() -> None:
    fake = _fake_client(json_data=[])
    with patch.object(crud, "get_client", return_value=fake):
        request_handler(
            endpoint.handler, "GET", "/api/profissionais?incluir_inativos=1"
        )
    args, kwargs = fake.get.call_args
    assert "ativo" not in kwargs["params"]


def test_post_cria_profissional() -> None:
    fake = _fake_client(
        status_code=201,
        json_data=[{"id": "p1", "nome": "Carlos", "especialidade": "Mec"}],
    )
    with patch.object(crud, "get_client", return_value=fake):
        status, body = request_handler(
            endpoint.handler,
            "POST",
            "/api/profissionais",
            body={"nome": "Carlos", "especialidade": "Mec"},
        )
    assert status == 201
    args, kwargs = fake.post.call_args
    assert kwargs["json"]["ativo"] is True
