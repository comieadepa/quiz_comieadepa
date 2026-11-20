import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase";

/**
 * Endpoint de verificação de idempotência estrita.
 * Usado exclusivamente quando um erro 23505 ocorre para conferir se
 * o submission_token realmente foi persistido no banco de dados.
 */
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ verified: false }, { status: 400 });
    }

    const supabaseAdmin = getAdminSupabase();
    const { data, error } = await supabaseAdmin
      .from("respostas_pesquisa_oficial")
      .select("id")
      .eq("submission_token", token)
      .maybeSingle();

    if (!error && data && data.id) {
      return NextResponse.json({ verified: true, id: data.id });
    }

    return NextResponse.json({ verified: false }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ verified: false }, { status: 500 });
  }
}
