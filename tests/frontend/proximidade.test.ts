import { describe, expect, it } from "vitest";
import { calcularProximidade } from "@/lib/proximidade";

/**
 * Sempre fixamos uma data de "agora" pra evitar dependência do relógio
 * real. Trabalhamos no fuso local: as datas montadas com `new Date(year, ...)`
 * já estão no fuso do runtime, mesmo que o teste rode em outro timezone.
 */
const AGORA = new Date(2026, 3, 26, 14, 0, 0); // 26-abr-2026 14:00 local

function emHoras(horas: number): string {
  return new Date(AGORA.getTime() + horas * 3600 * 1000).toISOString();
}

describe("calcularProximidade", () => {
  it("retorna 'agora' para até 1h antes ou depois", () => {
    expect(calcularProximidade(emHoras(0), AGORA)).toBe("agora");
    expect(calcularProximidade(emHoras(0.5), AGORA)).toBe("agora");
    expect(calcularProximidade(emHoras(-0.5), AGORA)).toBe("agora");
  });

  it("retorna 'atrasado' quando passou há mais de 1h", () => {
    expect(calcularProximidade(emHoras(-2), AGORA)).toBe("atrasado");
    expect(calcularProximidade(emHoras(-24), AGORA)).toBe("atrasado");
  });

  it("retorna 'hoje' para horários posteriores no mesmo dia", () => {
    expect(calcularProximidade(emHoras(3), AGORA)).toBe("hoje");
  });

  it("retorna 'amanha' para o dia seguinte", () => {
    const amanha = new Date(AGORA);
    amanha.setDate(amanha.getDate() + 1);
    amanha.setHours(9, 0, 0, 0);
    expect(calcularProximidade(amanha.toISOString(), AGORA)).toBe("amanha");
  });

  it("retorna 'futuro' para datas além de amanhã", () => {
    const depois = new Date(AGORA);
    depois.setDate(depois.getDate() + 5);
    expect(calcularProximidade(depois.toISOString(), AGORA)).toBe("futuro");
  });
});
