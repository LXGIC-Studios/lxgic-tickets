import Link from "next/link";
import { cookies } from "next/headers";
import { Ticket } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/app/logout-button";

export async function Nav() {
  const user = await getCurrentUser();
  const jar = await cookies();
  const admin = jar.get("admin_session")?.value === "ok";
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-900 bg-black/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Ticket className="h-4 w-4 text-green-500" />
          <span>Lxgic Studios</span>
          {admin && (
            <span className="ml-1 rounded-md bg-red-500/15 text-red-400 px-1.5 py-0.5 text-[10px] font-semibold border border-red-500/30">
              ADMIN
            </span>
          )}
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/" className="text-zinc-400 hover:text-zinc-100 transition-colors">Home</Link>
          <Link href="/new" className="text-zinc-400 hover:text-zinc-100 transition-colors">File a ticket</Link>
          {user ? (
            <>
              <Link href="/my-tickets" className="text-zinc-400 hover:text-zinc-100 transition-colors">
                My tickets
              </Link>
              <span className="text-zinc-500 text-xs hidden sm:inline">
                {user.display_name ?? user.email}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-zinc-400 hover:text-zinc-100 transition-colors">Sign in</Link>
              <Link href="/register" className="rounded-lg bg-green-500 hover:bg-green-400 text-black font-medium px-3 py-1.5 transition-colors">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
