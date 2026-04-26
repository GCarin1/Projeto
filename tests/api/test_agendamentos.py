"""Testes do endpoint /api/agendamentos.

Cobre:
- GET (lista com joins)
- POST (cria, com verificação de conflito de janela do profissional)
- PATCH (atualiza status)
- Função pura ``detectar_conflito``
"""

from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import httpx

from api import agendamentos as endpoint
from api._lib import crud

from conftest import request_handler


# ------------------------------------------------------ detectar_conflito ---
def test_detectar_conflito_devolve_none_quando_lista_vazia() -> None:
    nova = datetime(2026, 5, 1, 10, 0, tzinfo=timezone.utc)
    assert endpoint.detectar_conflito(nova, 60, []) is None


def test_detectar_conflito_quando_janelas_se_sobrepoem() -> None:
    nova = datetime(2026, 5, 1, 10, 0, tzinfo=timezone.utc)
    existentes = [
        {
            "id": "a1",
            "data_hora": "2026-05-01T10:30:00+00:00",
            "servicos": {"duracao_minutos": 30},
        }
    ]
    conflito = endpoint.detectar_conflito(nova, 60, existentes)
    assert conflito is not None
    assert conflito["id"] == "a1"


def test_sem_conflito_quando_janelas_so_se_tocam_na_borda() -> None:
    nova = datetime(2026, 5, 1, 10, 0, tzinfo=timezone.utc)
    existentes = [
        {
            "id": "a1",
            "data_hora": "2026-05-01T11:00:00+00:00",
            "servicos": {"duracao_minutos": 30},
        }
    ]
    assert endpoint.detectar_conflito(nova, 60, existentes) is None


def test_sem_conflito_quando_horarios_distintos() -> None:
    nova = datetime(2026, 5, 1, 14, 0, tzinfo=timezone.utc)
    existentes = [
        {
            "id": "a1",
            "data_hora": "2026-05-01T08:00:00+00:00",
            "servicos": {"duracao_minutos": 60},
        }
    ]
    assert endpoint.detectar_conflito(nova, 60, existentes) is None


# ------------------------------------------------------------------- GET ---
def _fake_response(json_data, status_code=200):
    response = MagicMock()
    response.status_code = status_code
    response.json.return_value = json_data
    response.raise_for_status.return_value = None
    return response


def test_get_lista_agendamentos_com_joins() -> None:
    fake = MagicMock(spec=httpx.Client)
    fake.get.return_value = _fake_response(
        [{"id": "a1", "data_hora": "2026-05-01T10:00:00+00:00"}]
    )
    with patch.object(crud, "get_client", return_value=fake):
        status, body = request_handler(
            endpoint.handler, "GET", "/api/agendamentos"
        )
    assert status == 200
    args, kwargs = fake.get.call_args
    assert args[0] == "/agendamentos"
    select = kwargs["params"]["select"]
    assert "clientes(nome)" in select
    assert "veiculos(placa,modelo)" in select
    assert "profissionais(nome)" in select
    assert "servicos(nome,duracao_minutos,preco)" in select


# ------------------------------------------------------------------ POST ---
def _payload_valido() -> dict:
    return {
        "cliente_id": "c1",
        "veiculo_id": "v1",
        "profissional_id": "p1",
        "servico_id": "s1",
        "data_hora": "2026-05-01T10:00:00Z",
    }


def test_post_cria_quando_nao_ha_conflito() -> None:
    fake = MagicMock(spec=httpx.Client)
    # 1ª chamada: busca duração do serviço
    # 2ª chamada: busca agendamentos existentes do profissional
    fake.get.side_effect = [
        _fake_response([{"duracao_minutos": 60}]),
        _fake_response([]),
    ]
    fake.post.return_value = _fake_response(
        [{"id": "a-novo", "status": "pendente"}], status_code=201
    )

    with patch.object(endpoint, "get_client", return_value=fake):
        status, body = request_handler(
            endpoint.handler, "POST", "/api/agendamentos", body=_payload_valido()
        )

    assert status == 201
    assert body["id"] == "a-novo"
    fake.post.assert_called_once()


def test_post_devolve_409_quando_ha_conflito() -> None:
    fake = MagicMock(spec=httpx.Client)
    fake.get.side_effect = [
        _fake_response([{"duracao_minutos": 60}]),
        _fake_response(
            [
                {
                    "id": "a-existente",
                    "data_hora": "2026-05-01T10:30:00+00:00",
                    "servicos": {"duracao_minutos": 30},
                }
            ]
        ),
    ]
    with patch.object(endpoint, "get_client", return_value=fake):
        status, body = request_handler(
            endpoint.handler, "POST", "/api/agendamentos", body=_payload_valido()
        )
    assert status == 409
    assert body["ok"] is False
    assert "conflito" in body["error"].lower()
    assert body["conflito_com"] == "a-existente"
    fake.post.assert_not_called()


def test_post_devolve_404_quando_servico_nao_existe() -> None:
    fake = MagicMock(spec=httpx.Client)
    fake.get.return_value = _fake_response([])
    with patch.object(endpoint, "get_client", return_value=fake):
        status, body = request_handler(
            endpoint.handler, "POST", "/api/agendamentos", body=_payload_valido()
        )
    assert status == 404
    assert "servico" in body["error"].lower()


def test_post_payload_invalido_devolve_422() -> None:
    fake = MagicMock(spec=httpx.Client)
    with patch.object(endpoint, "get_client", return_value=fake):
        status, body = request_handler(
            endpoint.handler,
            "POST",
            "/api/agendamentos",
            body={"cliente_id": "c1"},  # faltam campos obrigatórios
        )
    assert status == 422
    fake.get.assert_not_called()


# ------------------------------------------------------------------ PATCH --
def test_patch_atualiza_status() -> None:
    fake = MagicMock(spec=httpx.Client)
    fake.patch.return_value = _fake_response(
        [{"id": "a1", "status": "concluido"}]
    )
    with patch.object(endpoint, "get_client", return_value=fake):
        status, body = request_handler(
            endpoint.handler,
            "PATCH",
            "/api/agendamentos?id=a1",
            body={"status": "concluido"},
        )
    assert status == 200
    fake.patch.assert_called_once_with(
        "/agendamentos",
        params={"id": "eq.a1"},
        json={"status": "concluido"},
    )


def test_patch_sem_id_devolve_422() -> None:
    fake = MagicMock(spec=httpx.Client)
    with patch.object(endpoint, "get_client", return_value=fake):
        status, body = request_handler(
            endpoint.handler,
            "PATCH",
            "/api/agendamentos",
            body={"status": "concluido"},
        )
    assert status == 422
    assert "id" in " ".join(body["errors"])


def test_patch_status_invalido_devolve_422() -> None:
    fake = MagicMock(spec=httpx.Client)
    with patch.object(endpoint, "get_client", return_value=fake):
        status, body = request_handler(
            endpoint.handler,
            "PATCH",
            "/api/agendamentos?id=a1",
            body={"status": "qualquer"},
        )
    assert status == 422
