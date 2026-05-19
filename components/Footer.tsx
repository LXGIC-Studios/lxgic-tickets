import packageJson from "@/package.json";

export function Footer() {
  return (
    <footer className="border-t border-zinc-900 py-6 text-center">
      <div className="text-xs text-zinc-500">© 2026 Lxgic Studios</div>
      <div className="text-[10px] text-zinc-600 font-mono mt-1">
        lxgic-tickets v{packageJson.version}
      </div>
    </footer>
  );
}
