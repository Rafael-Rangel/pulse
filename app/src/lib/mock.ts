import type { ConfigMes, Lancamento } from "./types";
import { CATEGORIAS } from "./types";

const now = new Date();
const ano = now.getFullYear();
const mes = now.getMonth() + 1;
const dataInicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
const lastDay = new Date(ano, mes, 0);
const dataFim = lastDay.toISOString().slice(0, 10);
const total = 3900 + 4500 + 4120 - 0;

const percentuais: Record<string, number> = {
  Moradia: 0,
  Contas: 15,
  Mercado: 20,
  Transporte: 8,
  Saúde: 5,
  Lazer: 10,
  Educação: 25,
  Dívidas: 5,
  Reserva: 10,
  Outros: 2,
};

export const mockConfig: ConfigMes = {
  ano,
  mes,
  rendaBase: 3900,
  rendaExtra: 4500,
  saldoInicial: 4120,
  gastoAntecipadoExtra: 0,
  dataInicio,
  dataFim,
  totalDisponivel: total,
  categorias: CATEGORIAS.map((nome) => {
    const p = (percentuais[nome] ?? 0) / 100;
    const valor = total * p;
    return {
      nome,
      tipo: nome === "Moradia" || nome === "Contas" || nome === "Educação" || nome === "Dívidas" || nome === "Reserva" ? "Fixo" : "Variável",
      percentual: p,
      valorPlanejado: valor,
      limiteDiarioSugerido: valor / 30,
      ajusteManual: 0,
      valorPlanejadoAjustado: valor,
    };
  }),
};

export const mockLancamentos: Lancamento[] = [];
// Exemplo: { id: "1", data: dataInicio, descricao: "Internet", categoria: "Contas", tipo: "Fixo", valor: 60 },
// ];
