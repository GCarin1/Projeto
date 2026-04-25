"""Testes da camada de acesso ao banco (api/_lib/db.py).

Os testes usam mocks porque não dependem de uma conexão real com o Supabase —
queremos garantir o contrato do nosso wrapper (leitura de env vars, criação
preguiçosa do cliente, mensagens de erro claras).
"""

from unittest.mock import patch

import pytest

from api._lib import db


class FakeSupabaseClient:
    """Stub do cliente Supabase usado nos testes."""

    def __init__(self, url: str, key: str) -> None:
        self.url = url
        self.key = key


@pytest.fixture(autouse=True)
def _reset_client_cache() -> None:
    """Garante que cada teste comece sem cliente cacheado."""
    db._client = None  # noqa: SLF001 - acesso interno proposital nos testes
    yield
    db._client = None  # noqa: SLF001


def test_get_client_lê_env_vars_e_cria_cliente(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("SUPABASE_URL", "https://exemplo.supabase.co")
    monkeypatch.setenv("SUPABASE_KEY", "chave-anon")

    with patch.object(db, "create_client", side_effect=FakeSupabaseClient) as fake:
        client = db.get_client()

    assert isinstance(client, FakeSupabaseClient)
    assert client.url == "https://exemplo.supabase.co"
    assert client.key == "chave-anon"
    fake.assert_called_once_with("https://exemplo.supabase.co", "chave-anon")


def test_get_client_reusa_instancia_em_chamadas_subsequentes(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("SUPABASE_URL", "https://exemplo.supabase.co")
    monkeypatch.setenv("SUPABASE_KEY", "chave-anon")

    with patch.object(db, "create_client", side_effect=FakeSupabaseClient) as fake:
        primeiro = db.get_client()
        segundo = db.get_client()

    assert primeiro is segundo
    assert fake.call_count == 1


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
