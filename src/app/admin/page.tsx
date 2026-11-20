"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Users, 
  BarChart3, 
  FileSpreadsheet, 
  Lock, 
  Home, 
  TrendingUp, 
  RefreshCw, 
  Database,
  MapPin,
  MessageSquare,
  Award,
  Filter,
  CheckCircle2,
  LogOut,
  AlertCircle
} from "lucide-react";

interface OfficialSurveyResponse {
  id: string;
  created_at: string;
  totem_id: string;
  regiao: string;
  q1_gestao_nota: number;
  q2_dificuldade_igrejas: string;
  q3_demandas_regiao: string;
  q4_prestacao_contas: string;
  q5_amparo_ministerial: string;
  q6_frequencia_visitas: string;
  q7_formacao_teologica: string;
  q8_comentario_livre?: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [accessKey, setAccessKey] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  
  // Respostas protegidas vindas do backend
  const [responses, setResponses] = useState<OfficialSurveyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRegiao, setSelectedRegiao] = useState<string>("todas");

  // 1. Verifica se já existe sessão ativa segura via cookie HttpOnly
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/auth");
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // 2. Busca dados pelo endpoint protegido do servidor
  const fetchResponses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setResponses(data.responses || []);
      } else if (res.status === 401) {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Exceção ao buscar dados da API administrativa:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchResponses();
    }
  }, [isAuthenticated, fetchResponses]);

  // 3. Login seguro no servidor
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: accessKey }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        setAccessKey("");
      } else {
        const data = await res.json();
        setAuthError(data.error || "Chave de acesso inválida.");
      }
    } catch {
      setAuthError("Erro na comunicação com o servidor de autenticação.");
    } finally {
      setAuthLoading(false);
    }
  };

  // 4. Logout seguro
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      setIsAuthenticated(false);
      setResponses([]);
    } catch (err) {
      console.error("Erro no logout:", err);
    }
  };

  // Tela de carregamento de sessão
  if (isAuthenticated === null) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
          <span>Validando credenciais seguras...</span>
        </div>
      </main>
    );
  }

  // Formulário de Login Seguro (sem senha exposta no código)
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-slate-950 select-none">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5 mx-auto">
            <Lock className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-1">
            Painel da Gestão AGO 2026
          </h1>
          <p className="text-sm text-slate-400 text-center mb-6">
            Acesso administrativo protegido no servidor.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                Chave de Acesso Administrativa
              </label>
              <input
                type="password"
                placeholder="Digite a chave oficial"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                disabled={authLoading}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-white outline-none transition-colors"
              />
              {authError && (
                <p className="text-xs text-rose-400 mt-2 font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={authLoading || !accessKey.trim()}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 transition-colors shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              {authLoading ? "Verificando..." : "Acessar Painel"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-300 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> Voltar ao Totem
            </Link>
            <span className="flex items-center gap-1 text-emerald-400">
              <Database className="w-3 h-3" /> Sessão Criptografada
            </span>
          </div>
        </div>
      </main>
    );
  }

  // Filtragem por região
  const regioesDisponiveis = Array.from(new Set(responses.map(r => r.regiao).filter(Boolean)));
  const filteredResponses = selectedRegiao === "todas" 
    ? responses 
    : responses.filter(r => r.regiao === selectedRegiao);

  const totalCount = filteredResponses.length;

  // 1. Estatísticas da Nota de Gestão Administrativa (0 a 10)
  const notasArray = filteredResponses.map(r => r.q1_gestao_nota).filter(n => !isNaN(n));
  const mediaGestao = notasArray.length > 0 
    ? (notasArray.reduce((acc, curr) => acc + curr, 0) / notasArray.length).toFixed(1)
    : "0.0";

  const distNotas: Record<number, number> = {};
  for (let i = 0; i <= 10; i++) distNotas[i] = 0;
  notasArray.forEach(n => {
    if (distNotas[n] !== undefined) distNotas[n]++;
  });

  // 2. Estatísticas Q2: Principal Dificuldade
  const contagemDificuldades: Record<string, number> = {};
  filteredResponses.forEach(r => {
    const val = r.q2_dificuldade_igrejas;
    if (val) contagemDificuldades[val] = (contagemDificuldades[val] || 0) + 1;
  });

  const rotulosDificuldade: Record<string, string> = {
    financeira: "Financeira",
    estrutura_templos: "Estrutura de templos",
    formacao_ministerial: "Formação ministerial",
    acesso_logistica: "Acesso e logística",
    questoes_sociais: "Questões sociais",
    outra: "Outra",
  };

  // 3. Comentários livres válidos
  const comentarios = filteredResponses.filter(r => r.q8_comentario_livre && r.q8_comentario_livre.trim().length > 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-sm">
              CP
            </div>
            <div>
              <h1 className="font-bold text-white text-sm sm:text-base leading-tight">
                COMIEADEPA • Painel da Gestão AGO 2026
              </h1>
              <p className="text-[11px] text-slate-400">
                Sessão Autenticada com HttpOnly Cookie
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Servidor Seguro Ativo
            </span>

            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Totem</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 border border-slate-700 text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        {/* Banner de Filtros */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Filtro por Região Pastoral
              </p>
              <p className="text-xs text-slate-400">
                Consulta protegida exclusivamente no backend com validação de credencial.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={selectedRegiao}
              onChange={(e) => setSelectedRegiao(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-500 transition-colors cursor-pointer"
            >
              <option value="todas">Todas as Regiões ({responses.length} respostas)</option>
              {regioesDisponiveis.map(r => (
                <option key={r} value={r}>Região: {r}</option>
              ))}
            </select>

            <button 
              onClick={fetchResponses}
              disabled={loading}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Carregando..." : "Atualizar Dados"}</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
              <span>Total de Respostas Oficiais</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{totalCount}</div>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-2 font-medium">
              <TrendingUp className="w-3.5 h-3.5" /> Anonimato e RLS ativos
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
              <span>Média de Gestão (Q1)</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {mediaGestao} <span className="text-sm font-normal text-slate-400">/ 10</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Calculada sobre notas de 0 a 10
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
              <span>Regiões Registradas</span>
              <MapPin className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {regioesDisponiveis.length}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Regiões pastorais ativas
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
              <span>Comentários Livres (Q8)</span>
              <MessageSquare className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{comentarios.length}</div>
            <p className="text-xs text-slate-400 mt-2">
              Sugestões e observações
            </p>
          </div>
        </div>

        {/* Action Header: Export CSV/Excel */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Relatório Oficial da Gestão</h2>
            <p className="text-xs text-slate-400">Dados consolidados do formulário oficial aprovado para a AGO 2026</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (filteredResponses.length === 0) {
                  alert("Ainda não há respostas registradas no novo questionário para exportar.");
                  return;
                }
                const csvHeader = "ID,Data,Totem,Regiao,Q1_Nota,Q2_Dificuldade,Q3_Demandas,Q4_PrestacaoContas,Q5_Amparo,Q6_Visitas,Q7_Formacao,Q8_Comentario\n";
                const csvRows = filteredResponses.map(r => {
                  const safeComentario = `"${(r.q8_comentario_livre || "").replace(/"/g, '""')}"`;
                  return `${r.id},${r.created_at},${r.totem_id},${r.regiao},${r.q1_gestao_nota},${r.q2_dificuldade_igrejas},${r.q3_demandas_regiao},${r.q4_prestacao_contas},${r.q5_amparo_ministerial},${r.q6_frequencia_visitas},${r.q7_formacao_teologica},${safeComentario}`;
                }).join("\n");

                const blob = new Blob(["\uFEFF" + csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `comieadepa_pesquisa_oficial_${new Date().toISOString().slice(0, 10)}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Exportar Dados em CSV/Excel</span>
            </button>
          </div>
        </div>

        {/* 1. DISTRIBUIÇÃO DAS NOTAS DE 0 A 10 (Q1) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pergunta 1 • Gestão Administrativa</span>
              <h3 className="text-base font-bold text-white mt-1">
                Distribuição das Notas de 0 a 10
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Média Geral:</span>
              <span className="text-xl font-extrabold text-amber-400 ml-2">{mediaGestao}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-11 gap-2 pt-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((nota) => {
              const count = distNotas[nota] || 0;
              const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
              const isAlta = nota >= 8;
              const isMedia = nota >= 5 && nota < 8;

              return (
                <div key={nota} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-between text-center">
                  <span className="text-xs font-bold text-slate-400">Nota {nota}</span>
                  <div className="my-2">
                    <span className="text-xl font-extrabold text-white">{count}</span>
                    <span className="text-[10px] text-slate-500 block">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${isAlta ? "bg-emerald-500" : isMedia ? "bg-amber-500" : "bg-rose-500"}`} 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. ANÁLISE DAS PRINCIPAIS DIFICULDADES (Q2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pergunta 2 • Realidade Regional</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">6 Alternativas</span>
            </div>
            <h3 className="text-sm font-semibold text-white mb-4">
              Principal dificuldade enfrentada pelas igrejas da sua região
            </h3>

            <div className="space-y-3">
              {Object.keys(rotulosDificuldade).map((chave) => {
                const count = contagemDificuldades[chave] || 0;
                const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;

                return (
                  <div key={chave}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">{rotulosDificuldade[chave]}</span>
                      <span className="text-white font-bold">{pct}% ({count})</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. RESUMO POR REGIÃO PASTORAL */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Mapeamento Regional</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Identificação</span>
            </div>
            <h3 className="text-sm font-semibold text-white mb-4">
              Respostas Coletadas por Região
            </h3>

            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {regioesDisponiveis.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">Nenhuma região registrada ainda.</p>
              ) : (
                regioesDisponiveis.map((reg) => {
                  const regCount = responses.filter(r => r.regiao === reg).length;
                  const regPct = responses.length > 0 ? Math.round((regCount / responses.length) * 100) : 0;

                  return (
                    <div key={reg}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium">{reg}</span>
                        <span className="text-white font-bold">{regCount} respostas ({regPct}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${regPct}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* 4. COMENTÁRIOS, SUGESTÕES E OBSERVAÇÕES (Q8 - ESPAÇO LIVRE) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              Espaço Aberto • Comentários e Sugestões da Liderança (Q8)
            </span>
            <span className="text-xs text-slate-500 font-normal">
              {comentarios.length} observações registradas
            </span>
          </h3>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {comentarios.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                Nenhum comentário deixado até o momento.
              </p>
            ) : (
              comentarios.map((c) => (
                <div key={c.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-amber-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Região: {c.regiao}
                    </span>
                    <span>{new Date(c.created_at).toLocaleString("pt-BR")}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                    "{c.q8_comentario_livre}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 5. TABELA DE RESPOSTAS RECENTES */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Últimas Respostas Recebidas no Banco de Dados
            </span>
            <span className="text-xs text-slate-500 font-normal">
              Mostrando as coletas mais recentes
            </span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Horário / Data</th>
                  <th className="py-3 px-4">Região</th>
                  <th className="py-3 px-4">Q1: Gestão (Nota)</th>
                  <th className="py-3 px-4">Q2: Dificuldade</th>
                  <th className="py-3 px-4">Q3: Demandas</th>
                  <th className="py-3 px-4">Q4: Contas</th>
                  <th className="py-3 px-4">Comentário Livre</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredResponses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500">
                      Nenhuma resposta oficial registrada ainda.
                    </td>
                  </tr>
                ) : (
                  filteredResponses.slice(0, 15).map((r) => (
                    <tr key={r.id}>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(r.created_at).toLocaleString("pt-BR")}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">{r.regiao}</td>
                      <td className="py-3 px-4 font-black text-amber-400 text-sm">Nota {r.q1_gestao_nota}</td>
                      <td className="py-3 px-4 capitalize text-slate-300">{rotulosDificuldade[r.q2_dificuldade_igrejas] || r.q2_dificuldade_igrejas || "-"}</td>
                      <td className="py-3 px-4 capitalize text-emerald-300">{r.q3_demandas_regiao || "-"}</td>
                      <td className="py-3 px-4 capitalize text-blue-300">{r.q4_prestacao_contas || "-"}</td>
                      <td className="py-3 px-4 text-slate-400 max-w-[200px] truncate">
                        {r.q8_comentario_livre ? `"${r.q8_comentario_livre}"` : <span className="text-slate-600">Sem comentário</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
