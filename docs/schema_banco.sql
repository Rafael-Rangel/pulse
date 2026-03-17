-- Schema do banco de dados para o sistema de planejamento financeiro mensal
-- Compatível com PostgreSQL (Supabase). Para SQLite local, troque SERIAL por INTEGER PRIMARY KEY AUTOINCREMENT e adapte tipos se necessário.

-- Tabela: meses (configuração de cada mês)
CREATE TABLE meses (
    id SERIAL PRIMARY KEY,
    ano INTEGER NOT NULL,
    mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
    renda_base NUMERIC(12, 2) NOT NULL DEFAULT 0,
    renda_extra NUMERIC(12, 2) NOT NULL DEFAULT 0,
    saldo_inicial NUMERIC(12, 2) NOT NULL DEFAULT 0,
    gasto_antecipado_extra NUMERIC(12, 2) NOT NULL DEFAULT 0,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (ano, mes)
);

-- Tabela: categorias (cadastro mestre de categorias)
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(80) NOT NULL UNIQUE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Fixo', 'Variável')),
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: planejamentos (percentuais e valores por mês por categoria)
CREATE TABLE planejamentos (
    id SERIAL PRIMARY KEY,
    mes_id INTEGER NOT NULL REFERENCES meses(id) ON DELETE CASCADE,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
    percentual_planejado NUMERIC(5, 4) NOT NULL DEFAULT 0,
    valor_planejado NUMERIC(12, 2) NOT NULL DEFAULT 0,
    ajuste_valor NUMERIC(12, 2) NOT NULL DEFAULT 0,
    ajuste_percentual NUMERIC(5, 4) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (mes_id, categoria_id)
);

-- Tabela: lancamentos (gastos registrados)
CREATE TABLE lancamentos (
    id SERIAL PRIMARY KEY,
    mes_id INTEGER NOT NULL REFERENCES meses(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
    subcategoria VARCHAR(80),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Fixo', 'Variável', 'Extra')),
    valor NUMERIC(12, 2) NOT NULL CHECK (valor >= 0),
    meio_pagamento VARCHAR(40),
    observacoes TEXT,
    usa_renda_extra BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: remanejamentos (histórico de transferências entre categorias)
CREATE TABLE remanejamentos (
    id SERIAL PRIMARY KEY,
    mes_id INTEGER NOT NULL REFERENCES meses(id) ON DELETE CASCADE,
    data TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    categoria_origem_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
    categoria_destino_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
    valor NUMERIC(12, 2) NOT NULL CHECK (valor > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas frequentes
CREATE INDEX idx_lancamentos_mes_data ON lancamentos (mes_id, data);
CREATE INDEX idx_lancamentos_mes_categoria ON lancamentos (mes_id, categoria_id);
CREATE INDEX idx_planejamentos_mes ON planejamentos (mes_id);
CREATE INDEX idx_remanejamentos_mes ON remanejamentos (mes_id);

-- Tabela: chat_conversas (uma conversa por thread)
CREATE TABLE chat_conversas (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: chat_mensagens (mensagens do chat com a IA)
CREATE TABLE chat_mensagens (
    id SERIAL PRIMARY KEY,
    conversa_id INTEGER NOT NULL REFERENCES chat_conversas(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    suggested_actions JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_mensagens_conversa ON chat_mensagens (conversa_id);

-- Inserir categorias padrão (alto nível)
INSERT INTO categorias (nome, tipo) VALUES
    ('Moradia', 'Fixo'),
    ('Contas', 'Fixo'),
    ('Mercado', 'Variável'),
    ('Transporte', 'Variável'),
    ('Saúde', 'Variável'),
    ('Lazer', 'Variável'),
    ('Educação', 'Fixo'),
    ('Dívidas', 'Fixo'),
    ('Reserva', 'Fixo'),
    ('Outros', 'Variável');
