"""Testes do endpoint /api/horarios_disponiveis."""

from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import httpx

from api import horarios_disponiveis as endpoint

from conftest import request_handler


def _resp(json_data, status_code=200):
    response = MagicMock()
    response.status_code = status_code
    response.json.return_value = json_data
    response.raise_for_status.return_value = None
    return response


# ----------------------------------------------------------- gerar_slots ---
def test_gerar_slots_intervalo_30min_no_horario_comercial() -> None:
    slots = endpoint.gerar_slots(datetime(2026, 5, 1, tzinfo=timezone.utc))
    # 08:00 até 18:00 = 10h * 2 = 20 slots
    assert len(slots) == 20
    assert slots[0].hour == 8
    assert slots[0].minute == 0
    assert slots[-1].hour == 17
    assert slots[-1].minute == 30


def test_filtrar_slots_disponiveis_remove_os_que_conflitam() -> None:
    dia = datetime(2026, 5, 1, tzinfo=timezone.utc)
    slots = endpoint.gerar_slots(dia)
    # Já agendado das 10:00 às 11:00 (60min)
    existentes = [
        {
            "data_hora": "2026-05-01T10:00:00+00:00",
            "servicos": {"duracao_minutos": 60},
        }
    ]
    # Pedindo um serviço de 30min: 09:30 conflita (09:30-10:00 toca, ok),
    # mas 09:45 não existe. Vamos verificar 10:00 e 10:30 são removidos.
    disponiveis = endpoint.filtrar_disponiveis(slots, 30, existentes)
    horarios = {s.strftime("%H:%M") for s in disponiveis}
    assert "10:00" not in horarios
    assert "10:30" not in horarios
    assert "09:30" in horarios  # 09:30-10:00 toca a borda → ok
    assert "11:00" in horarios  # 11:00-11:30 começa na borda → ok


# ------------------------------------------------------------------ HTTP ---
def test_get_devolve_lista_de_horarios_disponiveis() -> None:
    fake = MagicMock(spec=httpx.Client)
    fake.get.side_effect = [
        _resp([{"duracao_minutos": 30}]),  # serviço
        _resp([]),  # agendamentos do dia
    ]
    with patch.object(endpoint, "get_client", return_value=fake):
        status, body = request_handler(
            endpoint.handler,
            "GET",
            "/api/horarios_disponiveis?profissional_id=p1&servico_id=s1&data=2026-05-01",
        )
    assert status == 200
    assert isinstance(body["horarios"], list)
    assert len(body["horarios"]) == 20
    # 1ª entrada deve ser 08:00 do dia em UTC
    assert body["horarios"][0].endswith("08:00:00+00:00")


def test_get_remove_horarios_conflitantes() -> None:
    fake = MagicMock(spec=httpx.Client)
    fake.get.side_effect = [
        _resp([{"duracao_minutos": 60}]),
        _resp(
            [
                {
                    "data_hora": "2026-05-01T08:00:00+00:00",
                    "servicos": {"duracao_minutos": 60},
                }
            ]
        ),
    ]
    with patch.object(endpoint, "get_client", return_value=fake):
        status, body = request_handler(
            endpoint.handler,
            "GET",
            "/api/horarios_disponiveis?profissional_id=p1&servico_id=s1&data=2026-05-01",
        )
    horarios_str = " ".join(body["horarios"])
    assert "08:00:00" not in horarios_str
    assert "08:30:00" not in horarios_str
    # 09:00 deve estar livre (08:00-09:00 termina na borda)
    assert any("09:00:00" in h for h in body["horarios"])


def test_get_sem_query_params_obrigatorios_devolve_422() -> None:
    fake = MagicMock(spec=httpx.Client)
    with patch.object(endpoint, "get_client", return_value=fake):
        status, body = request_handler(
            endpoint.handler, "GET", "/api/horarios_disponiveis"
        )
    assert status == 422
    erros = " ".join(body["errors"])
    for campo in ("profissional_id", "servico_id", "data"):
        assert campo in erros


def test_get_data_invalida_devolve_422() -> None:
    fake = MagicMock(spec=httpx.Client)
    with patch.object(endpoint, "get_client", return_value=fake):
        status, body = request_handler(
            endpoint.handler,
            "GET",
            "/api/horarios_disponiveis?profissional_id=p&servico_id=s&data=ontem",
        )
    assert status == 422
    assert "data" in " ".join(body["errors"])


def test_get_servico_inexistente_devolve_404() -> None:
    fake = MagicMock(spec=httpx.Client)
    fake.get.return_value = _resp([])
    with patch.object(endpoint, "get_client", return_value=fake):
        status, body = request_handler(
            endpoint.handler,
            "GET",
            "/api/horarios_disponiveis?profissional_id=p&servico_id=s&data=2026-05-01",
        )
    assert status == 404
