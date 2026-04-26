"""Endpoint REST para agendamentos.

- ``GET   /api/agendamentos``        → lista (com cliente, veículo, profissional, serviço)
- ``POST  /api/agendamentos``        → cria, validando conflito de horário
- ``PATCH /api/agendamentos?id=...`` → atualiza apenas o status

Regra de conflito (espelha o que está em ``contexto.md`` §3):
um profissional não pode ter dois agendamentos cujas janelas
``[data_hora, data_hora + servico.duracao_minutos)`` se sobreponham.
Janelas que apenas se tocam na borda (10:00–11:00 e 11:00–11:30) são OK.

Agendamentos com status ``cancelado`` são ignorados para fins de conflito.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler
from typing import Any

import httpx

from api._lib.crud import _write_db_error, handle_list, method_not_allowed
from api._lib.db import get_client
from api._lib.http_utils import (
    ValidationError,
    parse_query,
    read_json_body,
    write_json,
)
from api._lib.validators import validate_agendamento, validate_status_update


_SELECT_COMPLETO = (
    "*,"
    "clientes(nome),"
    "veiculos(placa,modelo),"
    "profissionais(nome),"
    "servicos(nome,duracao_minutos,preco)"
)


def _parse_iso(s: str) -> datetime:
    if s.endswith("Z"):
        s = s[:-1] + "+00:00"
    return datetime.fromisoformat(s)


def detectar_conflito(
    nova_data: datetime,
    nova_duracao_minutos: int,
    agendamentos_existentes: list[dict[str, Any]],
) -> dict[str, Any] | None:
    """Devolve o agendamento conflitante se houver, senão None.

    ``agendamentos_existentes`` deve conter ``data_hora`` (ISO) e a duração
    do serviço embutida em ``servicos.duracao_minutos`` — exatamente como
    o PostgREST devolve quando pedimos ``select=*,servicos(duracao_minutos)``.
    """
    nova_fim = nova_data + timedelta(minutes=nova_duracao_minutos)
    for ag in agendamentos_existentes:
        ini = _parse_iso(ag["data_hora"])
        duracao = ag.get("servicos", {}).get("duracao_minutos")
        if duracao is None:
            continue
        fim = ini + timedelta(minutes=int(duracao))
        # Sobreposição estrita: bordas iguais (fim == nova_data) não conflitam.
        if ini < nova_fim and nova_data < fim:
            return ag
    return None


def _criar_agendamento(handler: BaseHTTPRequestHandler) -> None:
    try:
        payload = read_json_body(handler)
        data = validate_agendamento(payload)
    except ValidationError as exc:
        write_json(handler, 422, {"ok": False, "errors": exc.errors})
        return

    try:
        client = get_client()

        # 1) buscar duração do serviço
        resp = client.get(
            "/servicos",
            params={
                "select": "duracao_minutos",
                "id": f"eq.{data['servico_id']}",
                "limit": "1",
            },
        )
        resp.raise_for_status()
        servicos = resp.json()
        if not servicos:
            write_json(
                handler,
                404,
                {"ok": False, "error": "servico_id não encontrado"},
            )
            return
        duracao = int(servicos[0]["duracao_minutos"])

        # 2) buscar agendamentos não cancelados do mesmo profissional
        resp = client.get(
            "/agendamentos",
            params={
                "select": "id,data_hora,servicos(duracao_minutos)",
                "profissional_id": f"eq.{data['profissional_id']}",
                "status": "neq.cancelado",
            },
        )
        resp.raise_for_status()
        existentes = resp.json()

        # 3) verificar conflito
        nova_data = _parse_iso(data["data_hora"])
        conflito = detectar_conflito(nova_data, duracao, existentes)
        if conflito is not None:
            write_json(
                handler,
                409,
                {
                    "ok": False,
                    "error": "conflito de horário com outro agendamento do profissional",
                    "conflito_com": conflito["id"],
                },
            )
            return

        # 4) inserir
        resp = client.post("/agendamentos", json=data)
        resp.raise_for_status()
    except Exception as exc:  # noqa: BLE001
        _write_db_error(handler, exc)
        return

    body = resp.json()
    if isinstance(body, list) and body:
        body = body[0]
    write_json(handler, 201, body)


def _atualizar_status(handler: BaseHTTPRequestHandler) -> None:
    query = parse_query(handler)
    erros: list[str] = []
    if not query.get("id"):
        erros.append("query param 'id' é obrigatório")
    try:
        payload = read_json_body(handler)
    except ValidationError as exc:
        erros.extend(exc.errors)
        write_json(handler, 422, {"ok": False, "errors": erros})
        return

    try:
        data = validate_status_update(payload)
    except ValidationError as exc:
        erros.extend(exc.errors)

    if erros:
        write_json(handler, 422, {"ok": False, "errors": erros})
        return

    try:
        client = get_client()
        resp = client.patch(
            "/agendamentos",
            params={"id": f"eq.{query['id']}"},
            json=data,
        )
        resp.raise_for_status()
    except Exception as exc:  # noqa: BLE001
        _write_db_error(handler, exc)
        return

    body = resp.json()
    if isinstance(body, list) and body:
        body = body[0]
    write_json(handler, 200, body)


class handler(BaseHTTPRequestHandler):  # noqa: N801
    def do_GET(self) -> None:  # noqa: N802
        handle_list(
            self,
            "agendamentos",
            params={"select": _SELECT_COMPLETO, "order": "data_hora.asc"},
        )

    def do_POST(self) -> None:  # noqa: N802
        _criar_agendamento(self)

    def do_PATCH(self) -> None:  # noqa: N802
        _atualizar_status(self)

    def do_DELETE(self) -> None:  # noqa: N802
        method_not_allowed(self, ["GET", "POST", "PATCH"])

    def do_PUT(self) -> None:  # noqa: N802
        method_not_allowed(self, ["GET", "POST", "PATCH"])

    def log_message(self, format: str, *args: object) -> None:  # noqa: A002
        return
