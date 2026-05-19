import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export async function isAdminAuthorized(req: NextRequest): Promise<boolean> {
  const jar = await cookies();
  if (jar.get("admin_session")?.value === "ok") return true;
  const auth = req.headers.get("authorization");
  const token = process.env.ADMIN_API_TOKEN;
  if (auth && token && auth === `Bearer ${token}`) return true;
  return false;
}
