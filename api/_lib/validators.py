"""Validadores leves para os payloads dos endpoints REST.

Substitui o pydantic (originalmente cogitado) por funções puras: o build
serverless da Vercel fica menor e o domínio é simples o suficiente para não
justificar uma dependência extra.

Cada validador:
- Recebe um ``dict`` (vindo de ``read_json_body``)
- Retorna um ``dict`` normalizado, pronto para enviar ao PostgREST
- Lança ``ValidationError`` com lista de mensagens em caso de problema
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from .http_utils import ValidationError


_STATUS_VALIDOS = ("pendente", "confirmado", "concluido", "cancelado")


def _str_obrigatorio(payload: dict, campo: str, erros: list[str]) -> str | None:
    valor = payload.get(campo)
    if not isinstance(valor, str) or not valor.strip():
        erros.append(f"{campo} é obrigatório")
        return None
    return valor.strip()


def _str_opcional(payload: dict, campo: str) -> str | None:
    valor = payload.get(campo)
    if valor is None:
        return None
    if not isinstance(valor, str):
        return None
    valor = valor.strip()
    return valor or None


def _check_email(email: str | None, erros: list[str]) -> None:
    if email is None:
        return
    if "@" not in email or "." not in email.split("@")[-1]:
        erros.append("email inválido")


def validate_cliente(payload: dict[str, Any]) -> dict[str, Any]:
    erros: list[str] = []
    nome = _str_obrigatorio(payload, "nome", erros)
    telefone = _str_obrigatorio(payload, "telefone", erros)
    email = _str_opcional(payload, "email")
    _check_email(email, erros)
    if erros:
        raise ValidationError(erros)
    return {"nome": nome, "telefone": telefone, "email": email}


def validate_veiculo(payload: dict[str, Any]) -> dict[str, Any]:
    erros: list[str] = []
    cliente_id = _str_obrigatorio(payload, "cliente_id", erros)
    placa = _str_obrigatorio(payload, "placa", erros)
    marca = _str_obrigatorio(payload, "marca", erros)
    modelo = _str_obrigatorio(payload, "modelo", erros)

    ano: int | None = None
    if "ano" in payload and payload["ano"] is not None:
        try:
            ano = int(payload["ano"])
        except (TypeError, ValueError):
            erros.append("ano deve ser um inteiro")

    if erros:
        raise ValidationError(erros)
    return {
        "cliente_id": cliente_id,
        "placa": placa.upper() if placa else placa,
        "marca": marca,
        "modelo": modelo,
        "ano": ano,
    }


def validate_profissional(payload: dict[str, Any]) -> dict[str, Any]:
    erros: list[str] = []
    nome = _str_obrigatorio(payload, "nome", erros)
    especialidade = _str_obrigatorio(payload, "especialidade", erros)
    ativo = payload.get("ativo", True)
    if not isinstance(ativo, bool):
        erros.append("ativo deve ser booleano")
    if erros:
        raise ValidationError(erros)
    return {"nome": nome, "especialidade": especialidade, "ativo": ativo}


def validate_servico(payload: dict[str, Any]) -> dict[str, Any]:
    erros: list[str] = []
    nome = _str_obrigatorio(payload, "nome", erros)
    descricao = _str_opcional(payload, "descricao")

    duracao: int | None = None
    try:
        duracao = int(payload.get("duracao_minutos"))
        if duracao <= 0:
            erros.append("duracao_minutos deve ser maior que zero")
    except (TypeError, ValueError):
        erros.append("duracao_minutos é obrigatório e numérico")

    preco: float | None = None
    try:
        preco = float(payload.get("preco"))
        if preco < 0:
            erros.append("preco não pode ser negativo")
    except (TypeError, ValueError):
        erros.append("preco é obrigatório e numérico")

    if erros:
        raise ValidationError(erros)
    return {
        "nome": nome,
        "descricao": descricao,
        "duracao_minutos": duracao,
        "preco": preco,
    }


def _parse_data_hora(valor: Any, erros: list[str]) -> datetime | None:
    if not isinstance(valor, str) or not valor.strip():
        erros.append("data_hora é obrigatório (ISO 8601)")
        return None
    s = valor.strip()
    # ``fromisoformat`` no Python 3.11+ aceita o sufixo "Z".
    if s.endswith("Z"):
        s = s[:-1] + "+00:00"
    try:
        return datetime.fromisoformat(s)
    except ValueError:
        erros.append("data_hora inválida (use ISO 8601, ex: 2026-05-01T10:00:00Z)")
        return None


def validate_agendamento(payload: dict[str, Any]) -> dict[str, Any]:
    erros: list[str] = []
    cliente_id = _str_obrigatorio(payload, "cliente_id", erros)
    veiculo_id = _str_obrigatorio(payload, "veiculo_id", erros)
    profissional_id = _str_obrigatorio(payload, "profissional_id", erros)
    servico_id = _str_obrigatorio(payload, "servico_id", erros)
    data_hora = _parse_data_hora(payload.get("data_hora"), erros)

    status = payload.get("status", "pendente")
    if status not in _STATUS_VALIDOS:
        erros.append(
            "status inválido (use: " + ", ".join(_STATUS_VALIDOS) + ")"
        )

    observacoes = _str_opcional(payload, "observacoes")

    if erros:
        raise ValidationError(erros)

    return {
        "cliente_id": cliente_id,
        "veiculo_id": veiculo_id,
        "profissional_id": profissional_id,
        "servico_id": servico_id,
        "data_hora": data_hora.isoformat() if data_hora else None,
        "status": status,
        "observacoes": observacoes,
    }


def validate_status_update(payload: dict[str, Any]) -> dict[str, Any]:
    status = payload.get("status")
    if status not in _STATUS_VALIDOS:
        raise ValidationError(
            "status inválido (use: " + ", ".join(_STATUS_VALIDOS) + ")"
        )
    return {"status": status}
