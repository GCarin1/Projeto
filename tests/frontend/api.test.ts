import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  api,
  type AgendamentoCreate,
} from "@/lib/api";

const okResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const errorResponse = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("lib/api", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("clientes", () => {
    it("listar() faz GET em /api/clientes", async () => {
      fetchMock.mockResolvedValueOnce(okResponse([{ id: "1", nome: "Ana" }]));

      const data = await api.clientes.listar();

      expect(fetchMock).toHaveBeenCalledWith("/api/clientes", expect.any(Object));
      expect(data).toEqual([{ id: "1", nome: "Ana" }]);
    });

    it("criar() faz POST em /api/clientes com JSON do body", async () => {
      fetchMock.mockResolvedValueOnce(okResponse({ id: "x", nome: "Bia" }, 201));

      const data = await api.clientes.criar({
        nome: "Bia",
        telefone: "11",
        email: "b@x.com",
      });

      const [, init] = fetchMock.mock.calls[0];
      expect(init.method).toBe("POST");
      expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
      expect(JSON.parse(init.body)).toEqual({
        nome: "Bia",
        telefone: "11",
        email: "b@x.com",
      });
      expect(data.id).toBe("x");
    });

    it("excluir() faz DELETE em /api/clientes?id=", async () => {
      fetchMock.mockResolvedValueOnce(okResponse({ ok: true }));

      await api.clientes.excluir("abc-123");

      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe("/api/clientes?id=abc-123");
      expect(init.method).toBe("DELETE");
    });
  });

  describe("veiculos", () => {
    it("listar() sem filtro", async () => {
      fetchMock.mockResolvedValueOnce(okResponse([]));
      await api.veiculos.listar();
      expect(fetchMock).toHaveBeenCalledWith("/api/veiculos", expect.any(Object));
    });

    it("listar({clienteId}) inclui query string", async () => {
      fetchMock.mockResolvedValueOnce(okResponse([]));
      await api.veiculos.listar({ clienteId: "c1" });
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/veiculos?cliente_id=c1",
        expect.any(Object),
      );
    });
  });

  describe("profissionais", () => {
    it("listar() filtra ativos por default", async () => {
      fetchMock.mockResolvedValueOnce(okResponse([]));
      await api.profissionais.listar();
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/profissionais",
        expect.any(Object),
      );
    });

    it("listar({incluirInativos:true}) traz todos", async () => {
      fetchMock.mockResolvedValueOnce(okResponse([]));
      await api.profissionais.listar({ incluirInativos: true });
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/profissionais?incluir_inativos=1",
        expect.any(Object),
      );
    });
  });

  describe("agendamentos", () => {
    const novoPayload: AgendamentoCreate = {
      cliente_id: "c",
      veiculo_id: "v",
      profissional_id: "p",
      servico_id: "s",
      data_hora: "2026-05-01T10:00:00Z",
    };

    it("criar() devolve corpo em sucesso", async () => {
      fetchMock.mockResolvedValueOnce(okResponse({ id: "novo" }, 201));
      const r = await api.agendamentos.criar(novoPayload);
      expect(r.id).toBe("novo");
    });

    it("criar() lança ApiError em conflito (409)", async () => {
      fetchMock.mockResolvedValueOnce(
        errorResponse(
          { ok: false, error: "conflito", conflito_com: "abc" },
          409,
        ),
      );
      await expect(api.agendamentos.criar(novoPayload)).rejects.toMatchObject({
        name: "ApiError",
        status: 409,
      });
    });

    it("atualizarStatus() faz PATCH com query id", async () => {
      fetchMock.mockResolvedValueOnce(okResponse({ id: "a", status: "concluido" }));
      await api.agendamentos.atualizarStatus("a", "concluido");
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe("/api/agendamentos?id=a");
      expect(init.method).toBe("PATCH");
      expect(JSON.parse(init.body)).toEqual({ status: "concluido" });
    });
  });

  describe("horariosDisponiveis", () => {
    it("listar() monta query string corretamente", async () => {
      fetchMock.mockResolvedValueOnce(
        okResponse({ horarios: ["2026-05-01T08:00:00+00:00"] }),
      );
      const r = await api.horariosDisponiveis.listar({
        profissionalId: "p",
        servicoId: "s",
        data: "2026-05-01",
      });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(
        "/api/horarios_disponiveis?profissional_id=p&servico_id=s&data=2026-05-01",
      );
      expect(r).toHaveLength(1);
    });
  });

  describe("erros", () => {
    it("propaga 422 com lista de errors", async () => {
      fetchMock.mockResolvedValueOnce(
        errorResponse({ ok: false, errors: ["nome obrigatório"] }, 422),
      );

      try {
        await api.clientes.criar({ nome: "", telefone: "" });
        expect.fail("deveria lançar ApiError");
      } catch (e) {
        expect(e).toBeInstanceOf(ApiError);
        const err = e as ApiError;
        expect(err.status).toBe(422);
        expect(err.errors).toContain("nome obrigatório");
      }
    });

    it("erro de rede vira ApiError genérico", async () => {
      fetchMock.mockRejectedValueOnce(new TypeError("network down"));
      await expect(api.clientes.listar()).rejects.toMatchObject({
        name: "ApiError",
        status: 0,
      });
    });
  });
});
