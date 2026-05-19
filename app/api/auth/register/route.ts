import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
    displayName?: string;
  };
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  const displayName = (body.displayName ?? "").trim() || null;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password too short" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data: existing } = await sb
    .from("portal_users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const { data, error } = await sb
    .from("portal_users")
    .insert({ email, password_hash, display_name: displayName, last_login: new Date().toISOString() })
    .select("id,email,display_name,created_at,last_login")
    .single();
  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Register failed" }, { status: 500 });
  }

  const token = signSession({ id: data.id as string, email: data.email as string });
  const res = NextResponse.json({ user: data });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
