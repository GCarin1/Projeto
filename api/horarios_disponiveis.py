"""Endpoint que lista horários livres para um agendamento.

``GET /api/horarios_disponiveis?profissional_id=...&servico_id=...&data=YYYY-MM-DD``

Estratégia (consciente das limitações desta v1):
- Horário comercial fixo: 08:00 às 18:00 (UTC).
- Slots a cada 30 minutos.
- Um slot é descartado se sua janela
  ``[slot, slot + servico.duracao_minutos)`` se sobrepõe a algum
  agendamento não-cancelado do profissional naquele dia.
- Janelas que apenas se tocam na borda NÃO são consideradas conflito
  (mesma regra de ``api/agendamentos.py``).

Para v2, se virar requisito, dá pra parametrizar a janela do dia por
profissional e respeitar timezone do cliente.
"""

from __future__ import annotations

from datetime import date, datetime, time, timedelta, timezone
from http.server import BaseHTTPRequestHandler
from typing import Any

from api._lib.crud import _write_db_error, method_not_allowed
from api._lib.db import get_client
from api._lib.http_utils import (
    ValidationError,
    parse_query,
    write_json,
)


_HORA_INICIO = time(8, 0)
_HORA_FIM = time(18, 0)
_INTERVALO_MIN = 30


def _parse_iso(s: str) -> datetime:
    if s.endswith("Z"):
        s = s[:-1] + "+00:00"
    return datetime.fromisoformat(s)


def gerar_slots(dia: datetime) -> list[datetime]:
    """Gera os slots de início entre 08:00 e 18:00 (exclusive) do ``dia``.

    O ``dia`` deve ser um datetime tz-aware. Os slots herdam o tzinfo dele.
    """
    inicio = datetime.combine(dia.date(), _HORA_INICIO, tzinfo=dia.tzinfo)
    fim = datetime.combine(dia.date(), _HORA_FIM, tzinfo=dia.tzinfo)
    slots: list[datetime] = []
    atual = inicio
    delta = timedelta(minutes=_INTERVALO_MIN)
    while atual < fim:
        slots.append(atual)
        atual += delta
    return slots


def filtrar_disponiveis(
    slots: list[datetime],
    duracao_minutos: int,
    agendamentos_existentes: list[dict[str, Any]],
) -> list[datetime]:
    """Remove slots cuja janela se sobrepõe a algum agendamento existente."""
    if not agendamentos_existentes:
        return slots

    janelas: list[tuple[datetime, datetime]] = []
    for ag in agendamentos_existentes:
        ini = _parse_iso(ag["data_hora"])
        dur = ag.get("servicos", {}).get("duracao_minutos")
        if dur is None:
            continue
        janelas.append((ini, ini + timedelta(minutes=int(dur))))

    livres: list[datetime] = []
    nova_dur = timedelta(minutes=duracao_minutos)
    for slot in slots:
        slot_fim = slot + nova_dur
        conflita = any(
            ini < slot_fim and slot < fim for ini, fim in janelas
        )
        if not conflita:
            livres.append(slot)
    return livres


def _validar_query(query: dict[str, str]) -> tuple[str, str, datetime]:
    erros: list[str] = []
    prof = query.get("profissional_id")
    serv = query.get("servico_id")
    data_str = query.get("data")
    if not prof:
        erros.append("query param 'profissional_id' é obrigatório")
    if not serv:
        erros.append("query param 'servico_id' é obrigatório")

    dia: datetime | None = None
    if not data_str:
        erros.append("query param 'data' é obrigatório (YYYY-MM-DD)")
    else:
        try:
            d = date.fromisoformat(data_str)
            dia = datetime.combine(d, time(0, 0), tzinfo=timezone.utc)
        except ValueError:
            erros.append("data inválida (use YYYY-MM-DD)")

    if erros:
        raise ValidationError(erros)
    return prof, serv, dia  # type: ignore[return-value]


def _listar_horarios(handler: BaseHTTPRequestHandler) -> None:
    query = parse_query(handler)
    try:
        prof_id, serv_id, dia = _validar_query(query)
    except ValidationError as exc:
        write_json(handler, 422, {"ok": False, "errors": exc.errors})
        return

    try:
        client = get_client()

        resp = client.get(
            "/servicos",
            params={
                "select": "duracao_minutos",
                "id": f"eq.{serv_id}",
                "limit": "1",
            },
        )
        resp.raise_for_status()
        servicos = resp.json()
        if not servicos:
            write_json(
                handler, 404, {"ok": False, "error": "servico_id não encontrado"}
            )
            return
        duracao = int(servicos[0]["duracao_minutos"])

        # Buscar agendamentos do profissional naquele dia (intervalo [00:00, +1d))
        proximo_dia = dia + timedelta(days=1)
        resp = client.get(
            "/agendamentos",
            params={
                "select": "data_hora,servicos(duracao_minutos)",
                "profissional_id": f"eq.{prof_id}",
                "status": "neq.cancelado",
                "data_hora": f"gte.{dia.isoformat()}",
                "and": f"(data_hora.lt.{proximo_dia.isoformat()})",
            },
        )
        resp.raise_for_status()
        existentes = resp.json()
    except Exception as exc:  # noqa: BLE001
        _write_db_error(handler, exc)
        return

    slots = gerar_slots(dia)
    livres = filtrar_disponiveis(slots, duracao, existentes)
    write_json(
        handler,
        200,
        {"horarios": [s.isoformat() for s in livres]},
    )


class handler(BaseHTTPRequestHandler):  # noqa: N801
    def do_GET(self) -> None:  # noqa: N802
        _listar_horarios(self)

    def do_POST(self) -> None:  # noqa: N802
        method_not_allowed(self, ["GET"])

    def do_PATCH(self) -> None:  # noqa: N802
        method_not_allowed(self, ["GET"])

    def do_DELETE(self) -> None:  # noqa: N802
        method_not_allowed(self, ["GET"])

    def log_message(self, format: str, *args: object) -> None:  # noqa: A002
        return
