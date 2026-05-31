import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

// Collect every valid API token. ADMIN_API_TOKEN stays for backward compat
// (the cron poller). ADMIN_API_TOKENS is a comma-separated list of additional
// tokens (team members) that can be added or revoked independently.
function validTokens(): string[] {
  const tokens: string[] = [];
  if (process.env.ADMIN_API_TOKEN) tokens.push(process.env.ADMIN_API_TOKEN);
  if (process.env.ADMIN_API_TOKENS) {
    for (const t of process.env.ADMIN_API_TOKENS.split(",")) {
      const trimmed = t.trim();
      if (trimmed) tokens.push(trimmed);
    }
  }
  return tokens;
}

export async function isAdminAuthorized(req: NextRequest): Promise<boolean> {
  const jar = await cookies();
  if (jar.get("admin_session")?.value === "ok") return true;
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return false;
  const presented = auth.slice("Bearer ".length).trim();
  return validTokens().some((t) => t === presented);
}
