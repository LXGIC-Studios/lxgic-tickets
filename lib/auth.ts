import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { supabaseAdmin } from "@/lib/supabase";

export interface PortalUser {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  last_login: string | null;
}

interface JwtPayload {
  sub: string;
  email: string;
}

const COOKIE = "portal_session";
const MAX_AGE = 60 * 60 * 24 * 30;

function secret(): string {
  const s = process.env.PORTAL_JWT_SECRET;
  if (!s) throw new Error("PORTAL_JWT_SECRET missing");
  return s;
}

export function signSession(user: { id: string; email: string }): string {
  return jwt.sign({ sub: user.id, email: user.email } satisfies JwtPayload, secret(), {
    expiresIn: MAX_AGE,
  });
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE,
  };
}

export const SESSION_COOKIE = COOKIE;

export async function getCurrentUser(): Promise<PortalUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, secret()) as JwtPayload;
  } catch {
    return null;
  }
  const { data } = await supabaseAdmin()
    .from("portal_users")
    .select("id,email,display_name,created_at,last_login")
    .eq("id", payload.sub)
    .single();
  return (data as PortalUser | null) ?? null;
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, secret()) as JwtPayload;
  } catch {
    return null;
  }
}
