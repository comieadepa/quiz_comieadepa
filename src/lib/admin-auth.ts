import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "comieadepa_admin_session";
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "default_comieadepa_ago_2026_secret";

/**
 * Cria um token assinado HMAC-SHA256 para a sessão administrativa.
 */
export function createSessionToken(): string {
  const expiresAt = Date.now() + 8 * 60 * 60 * 1000; // 8 horas de validade
  const payload = JSON.stringify({ role: "admin", exp: expiresAt });
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(payload)
    .digest("hex");
  
  return Buffer.from(payload).toString("base64url") + "." + signature;
}

/**
 * Valida o token de sessão HMAC-SHA256.
 */
export function verifySessionToken(token: string): boolean {
  if (!token || !token.includes(".")) return false;
  
  const [b64Payload, signature] = token.split(".");
  if (!b64Payload || !signature) return false;

  try {
    const payloadStr = Buffer.from(b64Payload, "base64url").toString("utf-8");
    const expectedSig = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(payloadStr)
      .digest("hex");

    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      const payload = JSON.parse(payloadStr);
      if (payload.exp && payload.exp > Date.now()) {
        return true;
      }
    }
  } catch {
    return false;
  }

  return false;
}

/**
 * Verifica se a requisição atual possui um cookie de sessão válido.
 */
export async function isAuthenticatedAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) return false;
  return verifySessionToken(sessionCookie.value);
}

export { SESSION_COOKIE_NAME };
