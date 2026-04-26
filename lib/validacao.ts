/**
 * Validações leves do lado do navegador. Servem só pra dar feedback
 * mais cedo ao usuário — o backend continua sendo a autoridade
 * (`api/_lib/validators.py`). Se algo passar daqui e o backend recusar,
 * a mensagem dele aparece naturalmente via `ApiError`.
 */

/** Aceita placas no padrão antigo (AAA1234) e Mercosul (AAA1A23). */
const REGEX_PLACA = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;

export function normalizarPlaca(input: string): string {
  return input.replace(/[\s-]/g, "").toUpperCase();
}

export function validarPlaca(input: string): string | null {
  const placa = normalizarPlaca(input);
  if (placa.length === 0) return "Placa é obrigatória.";
  if (!REGEX_PLACA.test(placa)) {
    return "Placa inválida. Use o formato AAA1234 ou AAA1B23 (Mercosul).";
  }
  return null;
}

/** Conta apenas dígitos — telefones BR têm 10 ou 11 (com DDD). */
export function validarTelefone(input: string): string | null {
  const digitos = input.replace(/\D/g, "");
  if (digitos.length === 0) return "Telefone é obrigatório.";
  if (digitos.length < 10 || digitos.length > 11) {
    return "Telefone deve ter 10 ou 11 dígitos (com DDD).";
  }
  return null;
}
