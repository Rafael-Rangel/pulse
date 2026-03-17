export const CATEGORIAS = [
  "Moradia",
  "Contas",
  "Mercado",
  "Transporte",
  "Saúde",
  "Lazer",
  "Educação",
  "Dívidas",
  "Reserva",
  "Outros",
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

export const TIPOS_LANCAMENTO = ["Fixo", "Variável", "Extra"] as const;
export type TipoLancamento = (typeof TIPOS_LANCAMENTO)[number];

export const MEIOS_PAGAMENTO = ["Cartão crédito", "Cartão débito", "Pix", "Dinheiro"] as const;
export type MeioPagamento = (typeof MEIOS_PAGAMENTO)[number];

export interface ConfigMes {
  ano: number;
  mes: number;
  rendaBase: number;
  rendaExtra: number;
  saldoInicial: number;
  gastoAntecipadoExtra: number;
  dataInicio: string; // YYYY-MM-DD
  dataFim: string;
  totalDisponivel: number;
  categorias: ConfigCategoria[];
}

export interface ConfigCategoria {
  nome: string;
  tipo: "Fixo" | "Variável";
  percentual: number;
  valorPlanejado: number;
  limiteDiarioSugerido: number;
  ajusteManual: number;
  valorPlanejadoAjustado: number;
}

export interface Lancamento {
  id?: string;
  data: string;
  descricao: string;
  categoria: string;
  subcategoria?: string;
  tipo: TipoLancamento;
  valor: number;
  meioPagamento?: string;
  observacoes?: string;
}

export interface DiaCalendario {
  data: string;
  diaSemana: string;
  saldoInicial: number;
  limiteDiario: number;
  gastoDia: number;
  saldoFinal: number;
}

export interface ResumoMensal {
  totalDisponivel: number;
  totalGasto: number;
  saldoFinal: number;
  percentualUsado: number;
  porCategoria: { categoria: string; planejado: number; gasto: number; diferenca: number; percentualUsado: number }[];
}

/** Ações que a IA pode sugerir para o usuário aplicar no app */
export type AddLancamentoAction = {
  type: "add_lancamento";
  payload: { data: string; descricao: string; categoria: string; valor: number; tipo?: "Fixo" | "Variável" | "Extra" };
};
export type UpdateConfigAction = {
  type: "update_config";
  payload: Partial<Pick<ConfigMes, "rendaBase" | "rendaExtra" | "saldoInicial" | "gastoAntecipadoExtra">> & {
    categorias?: { nome: string; percentual?: number; ajusteManual?: number }[];
  };
};
export type SuggestedAction = AddLancamentoAction | UpdateConfigAction;
