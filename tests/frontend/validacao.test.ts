import { describe, expect, it } from "vitest";
import {
  normalizarPlaca,
  validarPlaca,
  validarTelefone,
} from "@/lib/validacao";

describe("normalizarPlaca", () => {
  it("remove espaços e traços e deixa em maiúsculo", () => {
    expect(normalizarPlaca("abc-1234")).toBe("ABC1234");
    expect(normalizarPlaca(" abc 1d23 ")).toBe("ABC1D23");
  });
});

describe("validarPlaca", () => {
  it("aceita placa antiga AAA1234", () => {
    expect(validarPlaca("ABC1234")).toBeNull();
  });

  it("aceita placa Mercosul AAA1B23", () => {
    expect(validarPlaca("ABC1D23")).toBeNull();
  });

  it("rejeita placa vazia", () => {
    expect(validarPlaca("")).toMatch(/obrigatória/);
  });

  it("rejeita formatos errados", () => {
    expect(validarPlaca("12AB345")).toMatch(/inválida/);
    expect(validarPlaca("ABCDE12")).toMatch(/inválida/);
  });
});

describe("validarTelefone", () => {
  it("aceita 10 dígitos (fixo) e 11 dígitos (celular)", () => {
    expect(validarTelefone("1133334444")).toBeNull();
    expect(validarTelefone("11933334444")).toBeNull();
  });

  it("ignora máscara mas valida quantidade", () => {
    expect(validarTelefone("(11) 9 3333-4444")).toBeNull();
  });

  it("rejeita telefone curto demais", () => {
    expect(validarTelefone("12345")).toMatch(/dígitos/);
  });

  it("rejeita telefone vazio", () => {
    expect(validarTelefone("")).toMatch(/obrigatório/);
  });
});
