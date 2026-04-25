"""Testes da camada de acesso ao banco (api/_lib/db.py).

Não dependem de uma conexão real — validam apenas o contrato do wrapper:
leitura de env vars, criação preguiçosa do cliente HTTP e mensagens de erro.
"""

import httpx
import pytest

from api._lib import db


@pytest.fixture(autouse=True)
def _reset_client_cache() -> None:
    db.reset_client()
    yield
    db.reset_client()


def test_get_client_lê_env_vars_e_cria_httpx_client(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("SUPABASE_URL", "https://exemplo.supabase.co")
    monkeypatch.setenv("SUPABASE_KEY", "chave-anon")

    client = db.get_client()

    assert isinstance(client, httpx.Client)
    assert str(client.base_url) == "https://exemplo.supabase.co/rest/v1/"
    assert client.headers["apikey"] == "chave-anon"
    assert client.headers["Authorization"] == "Bearer chave-anon"


def test_get_client_aceita_url_com_barra_no_final(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("SUPABASE_URL", "https://exemplo.supabase.co/")
    monkeypatch.setenv("SUPABASE_KEY", "chave-anon")

    client = db.get_client()
    assert str(client.base_url) == "https://exemplo.supabase.co/rest/v1/"


def test_get_client_reusa_instancia_em_chamadas_subsequentes(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("SUPABASE_URL", "https://exemplo.supabase.co")
    monkeypatch.setenv("SUPABASE_KEY", "chave-anon")

    primeiro = db.get_client()
    segundo = db.get_client()

    assert primeiro is segundo


def test_get_client_falha_quando_supabase_url_ausente(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.delenv("SUPABASE_URL", raising=False)
    monkeypatch.setenv("SUPABASE_KEY", "chave-anon")

    with pytest.raises(db.MissingSupabaseConfigError) as exc:
        db.get_client()

    assert "SUPABASE_URL" in str(exc.value)


def test_get_client_falha_quando_supabase_key_ausente(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("SUPABASE_URL", "https://exemplo.supabase.co")
    monkeypatch.delenv("SUPABASE_KEY", raising=False)

    with pytest.raises(db.MissingSupabaseConfigError) as exc:
        db.get_client()

    assert "SUPABASE_KEY" in str(exc.value)
