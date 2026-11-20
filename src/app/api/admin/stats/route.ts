import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/admin-auth";
import { getAdminSupabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  // 1. Bloqueia acesso sem cookie de sessão HttpOnly válido
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json(
      { error: "Acesso não autorizado. Sessão administrativa requerida." },
      { status: 401 }
    );
  }

  try {
    const supabaseAdmin = getAdminSupabase();

    // 1. Busca na tabela oficial respostas_pesquisa_oficial
    const { data: oficialData, error: oficialError } = await supabaseAdmin
      .from("respostas_pesquisa_oficial")
      .select("*")
      .order("created_at", { ascending: false });

    if (!oficialError && oficialData && oficialData.length > 0) {
      return NextResponse.json({ responses: oficialData, source: "oficial" });
    }

    // 2. Se a tabela nova ainda estiver vazia ou não migrada, busca da tabela anterior com filtro seguro
    const { data: legacyData, error: legacyError } = await supabaseAdmin
      .from("respostas_pesquisa")
      .select("*")
      .order("created_at", { ascending: false });

    if (legacyError) {
      return NextResponse.json({ error: legacyError.message }, { status: 500 });
    }

    const converted = (legacyData || [])
      .filter((r: any) => r.respostas_completas?.versao === "oficial_ago_2026")
      .map((r: any) => {
        const comp = r.respostas_completas || {};
        return {
          id: r.id,
          created_at: r.created_at,
          totem_id: r.totem_id || "totem_geral",
          regiao: comp.regiao || "Não informada",
          q1_gestao_nota: parseInt(comp[1] || "0", 10),
          q2_dificuldade_igrejas: comp[2] || "",
          q3_demandas_regiao: comp[3] || "",
          q4_prestacao_contas: comp[4] || "",
          q5_amparo_ministerial: comp[5] || "",
          q6_frequencia_visitas: comp[6] || "",
          q7_formacao_teologica: comp[7] || "",
          q8_comentario_livre: comp[8] || "",
          respostas_completas: comp,
        };
      });

    return NextResponse.json({ responses: converted, source: "fallback_audit" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro interno ao carregar estatísticas do banco." },
      { status: 500 }
    );
  }
}
