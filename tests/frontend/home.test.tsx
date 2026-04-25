import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("Home page", () => {
  it("mostra o nome da oficina", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { level: 1, name: /V8 on Fire/i }),
    ).toBeInTheDocument();
  });

  it("oferece um link para a agenda", () => {
    render(<Home />);
    const link = screen.getByRole("link", { name: /^Agenda\b/i });
    expect(link).toHaveAttribute("href", "/agendamentos");
  });

  it("oferece um link para criar um novo agendamento", () => {
    render(<Home />);
    const link = screen.getByRole("link", { name: /^Novo agendamento\b/i });
    expect(link).toHaveAttribute("href", "/agendamentos/novo");
  });
});
