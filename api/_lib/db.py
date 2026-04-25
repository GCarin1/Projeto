"""Cliente HTTP compartilhado para falar com a API REST do Supabase (PostgREST).

Por que ``httpx`` em vez do SDK ``supabase``?
- O SDK puxa muitas dependências (gotrue, postgrest, realtime, storage3),
  o que costuma quebrar o build na Vercel (``uv pip install`` falha).
- Para CRUD simples sobre tabelas, basta o endpoint REST que o Supabase expõe
  automaticamente em ``<URL>/rest/v1/<tabela>``.

Uso:

    from api._lib.db import get_client

    client = get_client()
    resp = client.get("/profissionais", params={"select": "id", "limit": 1})
    resp.raise_for_status()
    data = resp.json()

A configuração vem das variáveis de ambiente ``SUPABASE_URL`` e
``SUPABASE_KEY`` (definidas em ``.env.local`` no dev e nas Environment
Variables da Vercel em produção).
"""

from __future__ import annotations

import os

import httpx


_client: httpx.Client | None = None


class MissingSupabaseConfigError(RuntimeError):
    """Erro lançado quando alguma variável de ambiente do Supabase está ausente."""


def get_client() -> httpx.Client:
    """Retorna um ``httpx.Client`` configurado para a API REST do Supabase.

    O cliente é criado na primeira chamada e reusado em chamadas seguintes
    (singleton por processo serverless).
    """
    global _client
    if _client is not None:
        return _client

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")

    missing = [
        name for name, value in (("SUPABASE_URL", url), ("SUPABASE_KEY", key)) if not value
    ]
    if missing:
        raise MissingSupabaseConfigError(
            "Variáveis de ambiente ausentes: " + ", ".join(missing),
        )

    _client = httpx.Client(
        base_url=f"{url.rstrip('/')}/rest/v1",
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        },
        timeout=10.0,
    )
    return _client


def reset_client() -> None:
    """Reseta o singleton — útil em testes."""
    global _client
    if _client is not None:
        _client.close()
    _client = None
