"""Testes do endpoint /api/clientes (GET lista, POST cria)."""

from unittest.mock import MagicMock, patch

import httpx

from api import clientes as endpoint
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


# ------------------------------------------------------------------- GET ---
def test_get_lista_clientes_devolve_200_e_array() -> None:
    fake = _fake_client(
        json_data=[{"id": "1", "nome": "Ana", "telefone": "11", "email": None}]
    )

    with patch.object(crud, "get_client", return_value=fake):
        status, body = request_handler(endpoint.handler, "GET", "/api/clientes")

    assert status == 200
    assert isinstance(body, list)
    assert body[0]["nome"] == "Ana"
    fake.get.assert_called_once_with(
        "/clientes",
        params={"select": "*", "order": "criado_em.desc"},
    )


def test_get_propaga_erro_da_consulta_como_500() -> None:
    fake = MagicMock(spec=httpx.Client)
    fake.get.side_effect = httpx.ConnectError("boom")

    with patch.object(crud, "get_client", return_value=fake):
        status, body = request_handler(endpoint.handler, "GET", "/api/clientes")

    assert status == 500
    assert body["ok"] is False
    assert "boom" in body["error"]


# ------------------------------------------------------------------- POST --
def test_post_cliente_valido_cria_e_devolve_201() -> None:
    fake = _fake_client(
        status_code=201,
        json_data=[
            {
                "id": "uuid-1",
                "nome": "Maria",
                "telefone": "1199",
                "email": "m@x.com",
            }
        ],
    )

    with patch.object(crud, "get_client", return_value=fake):
        status, body = request_handler(
            endpoint.handler,
            "POST",
            "/api/clientes",
            body={"nome": " Maria ", "telefone": "1199", "email": "m@x.com"},
        )

    assert status == 201
    assert body["id"] == "uuid-1"
    fake.post.assert_called_once()
    args, kwargs = fake.post.call_args
    assert args[0] == "/clientes"
    assert kwargs["json"] == {
        "nome": "Maria",
        "telefone": "1199",
        "email": "m@x.com",
    }


def test_post_cliente_sem_nome_devolve_422_com_lista_de_erros() -> None:
    fake = _fake_client()

    with patch.object(crud, "get_client", return_value=fake):
        status, body = request_handler(
            endpoint.handler, "POST", "/api/clientes", body={"telefone": "11"}
        )

    assert status == 422
    assert body["ok"] is False
    assert any("nome" in e for e in body["errors"])
    fake.post.assert_not_called()


def test_post_corpo_vazio_devolve_422() -> None:
    fake = _fake_client()
    with patch.object(crud, "get_client", return_value=fake):
        status, body = request_handler(endpoint.handler, "POST", "/api/clientes")
    assert status == 422


def test_metodo_nao_suportado_devolve_405() -> None:
    fake = _fake_client()
    with patch.object(crud, "get_client", return_value=fake):
        status, _ = request_handler(endpoint.handler, "PUT", "/api/clientes")
    assert status == 405


def test_delete_remove_cliente_por_id() -> None:
    fake = MagicMock(spec=httpx.Client)
    response = MagicMock()
    response.status_code = 204
    response.raise_for_status.return_value = None
    response.json.return_value = []
    fake.delete.return_value = response

    with patch.object(crud, "get_client", return_value=fake):
        status, body = request_handler(
            endpoint.handler, "DELETE", "/api/clientes?id=abc-123"
        )

    assert status == 200
    assert body == {"ok": True}
    fake.delete.assert_called_once_with(
        "/clientes", params={"id": "eq.abc-123"}
    )


def test_delete_sem_id_devolve_422() -> None:
    fake = _fake_client()
    with patch.object(crud, "get_client", return_value=fake):
        status, body = request_handler(endpoint.handler, "DELETE", "/api/clientes")
    assert status == 422
    assert "id" in " ".join(body["errors"])
    fake.delete.assert_not_called()
