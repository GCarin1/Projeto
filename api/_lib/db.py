"""Cliente Supabase compartilhado por todas as funções serverless.

Uso:
    from api._lib.db import get_client

    supabase = get_client()
    rows = supabase.table("clientes").select("*").execute().data

A configuração vem das variáveis de ambiente ``SUPABASE_URL`` e
``SUPABASE_KEY`` — definidas em ``.env.local`` (dev) e nas Environment
Variables do projeto na Vercel (produção).
"""

from __future__ import annotations

import os
from typing import Any

try:  # pragma: no cover - import opcional para os testes não exigirem o pacote
    from supabase import create_client
except ImportError:  # pragma: no cover
    create_client = None  # type: ignore[assignment]


_client: Any | None = None


class MissingSupabaseConfigError(RuntimeError):
    """Erro lançado quando alguma variável de ambiente do Supabase está ausente."""


def get_client() -> Any:
    """Retorna um cliente Supabase, criando-o na primeira chamada."""
    global _client
    if _client is not None:
        return _client

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")

    missing = [name for name, value in (("SUPABASE_URL", url), ("SUPABASE_KEY", key)) if not value]
    if missing:
        raise MissingSupabaseConfigError(
            "Variáveis de ambiente ausentes: " + ", ".join(missing),
        )

    if create_client is None:  # pragma: no cover - só ocorre se pacote não estiver instalado
        raise RuntimeError(
            "Pacote 'supabase' não instalado. Rode: pip install -r requirements.txt",
        )

    _client = create_client(url, key)
    return _client
