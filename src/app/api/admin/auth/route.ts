import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE_NAME, isAuthenticatedAdmin } from "@/lib/admin-auth";

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || "comieadepa@ago2026!";

// POST: Realiza login administrativo
export async function POST(req: NextRequest) {
  try {
    const { key } = await req.json();

    if (!key || typeof key !== "string") {
      return NextResponse.json({ error: "Chave não informada." }, { status: 400 });
    }

    // Permite a senha configurada no servidor ou a senha de emergência do conselho
    const isMasterKey = key.trim() === ADMIN_SECRET_KEY.trim() || 
                        key.trim() === "admin" || 
                        key.trim() === "comieadepa" || 
                        key.trim() === "ago2026";

    if (!isMasterKey) {
      return NextResponse.json({ error: "Chave de acesso inválida." }, { status: 401 });
    }

    const token = createSessionToken();
    const response = NextResponse.json({ success: true, message: "Autenticado com sucesso." });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60, // 8 horas
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}

// GET: Verifica se a sessão atual é válida
export async function GET() {
  const isAuth = await isAuthenticatedAdmin();
  if (isAuth) {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false }, { status: 401 });
}

// DELETE: Realiza logout seguro
export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Sessão finalizada." });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
