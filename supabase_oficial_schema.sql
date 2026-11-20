-- ==============================================================================
-- SCHEMA OFICIAL E BLINDAGEM DE SEGURANÇA: COMIEADEPA AGO 2026 (PROMPT 16 DEFINITIVO)
-- Instruções: Execute este script completo no SQL Editor do Supabase.
-- Nenhuma operação destrutiva é realizada. Dados históricos são preservados.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABELA OFICIAL (respostas_pesquisa_oficial)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.respostas_pesquisa_oficial (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Identificador de idempotência gerado no cliente (UUID v4)
  submission_token UUID UNIQUE NOT NULL,
  
  -- Identificação obrigatória por Região Pastoral (sem identificação pessoal)
  regiao VARCHAR(120) NOT NULL CHECK (char_length(trim(regiao)) > 0),
  
  -- Identificação opcional do Totem
  totem_id VARCHAR(50) DEFAULT 'totem_geral',
  
  -- Perguntas Oficiais Validadas com Constraints Rígidas:
  -- Q1: Gestão Administrativa (Escala de 0 a 10)
  q1_gestao_nota INTEGER NOT NULL CHECK (q1_gestao_nota >= 0 AND q1_gestao_nota <= 10),
  
  -- Q2: Principal dificuldade enfrentada pelas igrejas
  q2_dificuldade_igrejas VARCHAR(50) NOT NULL CHECK (
    q2_dificuldade_igrejas IN ('financeira', 'estrutura_templos', 'formacao_ministerial', 'acesso_logistica', 'questoes_sociais', 'outra')
  ),
  
  -- Q3: Demandas da região consideradas
  q3_demandas_regiao VARCHAR(50) NOT NULL CHECK (
    q3_demandas_regiao IN ('sim', 'as_vezes', 'nao')
  ),
  
  -- Q4: Prestação de contas
  q4_prestacao_contas VARCHAR(50) NOT NULL CHECK (
    q4_prestacao_contas IN ('clara', 'parcial', 'insuficiente', 'nao_conheco')
  ),
  
  -- Q5: Amparo pessoal e ministerial
  q5_amparo_ministerial VARCHAR(50) NOT NULL CHECK (
    q5_amparo_ministerial IN ('sim', 'em_parte', 'nao')
  ),
  
  -- Q6: Frequência de visitas da diretoria
  q6_frequencia_visitas VARCHAR(50) NOT NULL CHECK (
    q6_frequencia_visitas IN ('frequente', 'ocasional', 'rara', 'nunca')
  ),
  
  -- Q7: Formação teológica/ministerial atende necessidades
  q7_formacao_teologica VARCHAR(50) NOT NULL CHECK (
    q7_formacao_teologica IN ('sim', 'em_parte', 'nao')
  ),
  
  -- Q8: Campo livre opcional (sugestão, crítica ou observação) - máximo 1.000 caracteres
  q8_comentario_livre TEXT CHECK (q8_comentario_livre IS NULL OR char_length(q8_comentario_livre) <= 1000),
  
  -- Payload completo em JSONB para auditoria
  respostas_completas JSONB NOT NULL
);

-- ------------------------------------------------------------------------------
-- 2. PRIVILÉGIOS SQL E PERMISSÕES DE TABELA (REVOKE / GRANT EXPLÍCITOS)
-- ------------------------------------------------------------------------------
-- Revoga todos os privilégios prévios de anon e authenticated por segurança
REVOKE ALL ON TABLE public.respostas_pesquisa_oficial FROM anon, authenticated;

-- Concede estritamente INSERT para anon e authenticated (necessário para gravação pública no totem)
GRANT INSERT ON TABLE public.respostas_pesquisa_oficial TO anon, authenticated;

-- Não concede SELECT, UPDATE ou DELETE para anon nem authenticated
-- Apenas a role administrativa de serviço (service_role) e superusers possuem privilégios de leitura e gerenciamento.

-- ------------------------------------------------------------------------------
-- 3. HABILITAÇÃO E POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.respostas_pesquisa_oficial ENABLE ROW LEVEL SECURITY;

-- Limpeza de políticas prévias
DROP POLICY IF EXISTS "Insercao anonima estrita" ON public.respostas_pesquisa_oficial;
DROP POLICY IF EXISTS "Permitir insercao anonima de respostas oficiais" ON public.respostas_pesquisa_oficial;
DROP POLICY IF EXISTS "Permitir leitura anonima e autenticada de respostas oficiais" ON public.respostas_pesquisa_oficial;
DROP POLICY IF EXISTS "Leitura restrita a administracao" ON public.respostas_pesquisa_oficial;

-- 1) POLÍTICA DE INSERÇÃO: pública, restrita a payloads íntegros
CREATE POLICY "Insercao publica autorizada com validacao"
ON public.respostas_pesquisa_oficial
FOR INSERT
TO anon, authenticated
WITH CHECK (
  regiao IS NOT NULL AND char_length(trim(regiao)) > 0 AND
  q1_gestao_nota >= 0 AND q1_gestao_nota <= 10 AND
  submission_token IS NOT NULL
);

-- 2) POLÍTICA DE LEITURA (SELECT): 
-- Nenhuma política pública criada para anon ou authenticated.
-- O PostgREST bloqueará qualquer tentativa de SELECT externo via chave pública anônima.
-- Somente o backend com service_role (que ignora RLS) acessará as leituras administrativas.

-- ------------------------------------------------------------------------------
-- 4. PROTEÇÃO NÃO-DESTRUTIVA DA TABELA LEGADA (respostas_pesquisa)
-- ------------------------------------------------------------------------------
-- Preserva integralmente a tabela e dados anteriores.
-- Apenas garante que RLS está ativo e revoga privilégios abertos de modificação pública.
ALTER TABLE IF EXISTS public.respostas_pesquisa ENABLE ROW LEVEL SECURITY;
REVOKE UPDATE, DELETE ON TABLE public.respostas_pesquisa FROM anon, authenticated;

-- ------------------------------------------------------------------------------
-- 5. ÍNDICES DE PERFORMANCE E UNICIDADE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_pesquisa_oficial_created_at ON public.respostas_pesquisa_oficial (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pesquisa_oficial_regiao ON public.respostas_pesquisa_oficial (regiao);
CREATE INDEX IF NOT EXISTS idx_pesquisa_oficial_nota ON public.respostas_pesquisa_oficial (q1_gestao_nota);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pesquisa_oficial_submission_token ON public.respostas_pesquisa_oficial (submission_token);
