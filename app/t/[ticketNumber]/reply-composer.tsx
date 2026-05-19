"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TicketReplyComposer({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/tickets/${ticketId}/replies`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "Failed");
      setBusy(false);
      return;
    }
    setBody("");
    setBusy(false);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="Add a reply..."
        className="w-full rounded-lg bg-zinc-950 border border-zinc-800 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 px-3 py-2 outline-none transition-colors text-sm"
      />
      {error && <div className="text-red-400 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={busy || !body.trim()}
        className="rounded-lg bg-green-500 hover:bg-green-400 text-black font-medium px-4 py-2 text-sm transition-colors disabled:opacity-50"
      >
        {busy ? "..." : "Post reply"}
      </button>
    </form>
  );
}
