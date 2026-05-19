import Link from "next/link";
import { cookies } from "next/headers";
import packageJson from "@/package.json";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const c = await cookies();
  const isAuth = c.get("admin_session")?.value === "ok";
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {isAuth && (
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-900">
          <nav className="flex gap-5 text-sm">
            <Link href="/admin" className="text-zinc-300 hover:text-green-500">Overview</Link>
            <Link href="/admin/tickets" className="text-zinc-300 hover:text-green-500">Tickets</Link>
            <Link href="/admin/projects" className="text-zinc-300 hover:text-green-500">Projects</Link>
          </nav>
          <span className="text-[10px] text-zinc-600 font-mono">v{packageJson.version}</span>
        </div>
      )}
      {children}
    </div>
  );
}
