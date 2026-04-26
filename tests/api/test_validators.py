"""Testes dos validadores de input (api/_lib/validators.py)."""

import pytest

from api._lib import validators
from api._lib.http_utils import ValidationError


# ---------------------------------------------------------------- clientes ---
def test_cliente_valido_normaliza_campos() -> None:
    saida = validators.validate_cliente(
        {"nome": "  Ana  ", "telefone": " 11999990000 ", "email": " a@b.com "}
    )
    assert saida == {"nome": "Ana", "telefone": "11999990000", "email": "a@b.com"}


def test_cliente_email_opcional_vira_none() -> None:
    saida = validators.validate_cliente({"nome": "Ana", "telefone": "1199999"})
    assert saida["email"] is None


def test_cliente_exige_nome_e_telefone() -> None:
    with pytest.raises(ValidationError) as exc:
        validators.validate_cliente({})
    assert any("nome" in e for e in exc.value.errors)
    assert any("telefone" in e for e in exc.value.errors)


def test_cliente_email_invalido_falha() -> None:
    with pytest.raises(ValidationError):
        validators.validate_cliente(
            {"nome": "Ana", "telefone": "11", "email": "sem-arroba"}
        )


# ---------------------------------------------------------------- veiculos ---
def test_veiculo_valido_normaliza_placa() -> None:
    saida = validators.validate_veiculo(
        {
            "cliente_id": "c1",
            "placa": " abc1d23 ",
            "marca": "Fiat",
            "modelo": "Uno",
            "ano": 2020,
        }
    )
    assert saida["placa"] == "ABC1D23"
    assert saida["ano"] == 2020


def test_veiculo_ano_opcional() -> None:
    saida = validators.validate_veiculo(
        {"cliente_id": "c1", "placa": "ABC1234", "marca": "Fiat", "modelo": "Uno"}
    )
    assert saida["ano"] is None


def test_veiculo_exige_campos_obrigatorios() -> None:
    with pytest.raises(ValidationError) as exc:
        validators.validate_veiculo({})
    erros = " ".join(exc.value.errors)
    for campo in ("cliente_id", "placa", "marca", "modelo"):
        assert campo in erros


def test_veiculo_ano_invalido_falha() -> None:
    with pytest.raises(ValidationError):
        validators.validate_veiculo(
            {
                "cliente_id": "c1",
                "placa": "ABC1234",
                "marca": "X",
                "modelo": "Y",
                "ano": "abc",
            }
        )


# ---------------------------------------------------------- profissionais ---
def test_profissional_valido() -> None:
    saida = validators.validate_profissional(
        {"nome": "João", "especialidade": "Mecânico", "ativo": True}
    )
    assert saida == {"nome": "João", "especialidade": "Mecânico", "ativo": True}


def test_profissional_ativo_default_true() -> None:
    saida = validators.validate_profissional(
        {"nome": "João", "especialidade": "Mecânico"}
    )
    assert saida["ativo"] is True


def test_profissional_exige_nome_e_especialidade() -> None:
    with pytest.raises(ValidationError):
        validators.validate_profissional({})


# --------------------------------------------------------------- servicos ---
def test_servico_valido() -> None:
    saida = validators.validate_servico(
        {
            "nome": "Troca de óleo",
            "descricao": "Inclui filtro",
            "duracao_minutos": 60,
            "preco": "150.50",
        }
    )
    assert saida["duracao_minutos"] == 60
    assert saida["preco"] == 150.50
    assert saida["descricao"] == "Inclui filtro"


def test_servico_duracao_e_preco_devem_ser_validos() -> None:
    with pytest.raises(ValidationError) as exc:
        validators.validate_servico(
            {"nome": "X", "duracao_minutos": 0, "preco": -1}
        )
    erros = " ".join(exc.value.errors)
    assert "duracao_minutos" in erros
    assert "preco" in erros


def test_servico_exige_nome() -> None:
    with pytest.raises(ValidationError):
        validators.validate_servico({"duracao_minutos": 30, "preco": 10})


# ----------------------------------------------------------- agendamentos ---
def test_agendamento_valido_normaliza_status_default() -> None:
    saida = validators.validate_agendamento(
        {
            "cliente_id": "c",
            "veiculo_id": "v",
            "profissional_id": "p",
            "servico_id": "s",
            "data_hora": "2026-05-01T10:00:00Z",
        }
    )
    assert saida["status"] == "pendente"
    assert saida["observacoes"] is None


def test_agendamento_aceita_status_explicito() -> None:
    saida = validators.validate_agendamento(
        {
            "cliente_id": "c",
            "veiculo_id": "v",
            "profissional_id": "p",
            "servico_id": "s",
            "data_hora": "2026-05-01T10:00:00Z",
            "status": "confirmado",
            "observacoes": "trazer chave reserva",
        }
    )
    assert saida["status"] == "confirmado"
    assert saida["observacoes"] == "trazer chave reserva"


def test_agendamento_status_invalido_falha() -> None:
    with pytest.raises(ValidationError):
        validators.validate_agendamento(
            {
                "cliente_id": "c",
                "veiculo_id": "v",
                "profissional_id": "p",
                "servico_id": "s",
                "data_hora": "2026-05-01T10:00:00Z",
                "status": "agendou",
            }
        )


def test_agendamento_data_hora_invalida_falha() -> None:
    with pytest.raises(ValidationError):
        validators.validate_agendamento(
            {
                "cliente_id": "c",
                "veiculo_id": "v",
                "profissional_id": "p",
                "servico_id": "s",
                "data_hora": "ontem às 10h",
            }
        )


def test_agendamento_status_update_apenas_status() -> None:
    """Validação parcial usada no PATCH de status."""
    saida = validators.validate_status_update({"status": "concluido"})
    assert saida == {"status": "concluido"}


def test_status_update_invalido_falha() -> None:
    with pytest.raises(ValidationError):
        validators.validate_status_update({"status": "qualquer"})

    with pytest.raises(ValidationError):
        validators.validate_status_update({})
