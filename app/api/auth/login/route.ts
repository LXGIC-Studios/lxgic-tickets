import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data: user } = await sb
    .from("portal_users")
    .select("id,email,display_name,created_at,last_login,password_hash")
    .eq("email", email)
    .maybeSingle();

  if (!user) {
    return NextResponse.json({ error: "Wrong email or password" }, { status: 401 });
  }
  const ok = await bcrypt.compare(password, user.password_hash as string);
  if (!ok) {
    return NextResponse.json({ error: "Wrong email or password" }, { status: 401 });
  }

  await sb.from("portal_users").update({ last_login: new Date().toISOString() }).eq("id", user.id);

  const token = signSession({ id: user.id as string, email: user.email as string });
  const res = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      created_at: user.created_at,
      last_login: user.last_login,
    },
  });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
