"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Status } from "@/lib/supabase";

const STATUSES: Status[] = ["open", "in_progress", "resolved", "wontfix", "duplicate"];

export function AdminTicketActions({
  ticketId,
  currentStatus,
}: {
  ticketId: string;
  currentStatus: Status;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(currentStatus);
  const [author, setAuthor] = useState("Lxgic Team");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  async function changeStatus(s: Status) {
    setBusy(true);
    setStatus(s);
    await fetch(`/api/admin/tickets/${ticketId}/status`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: s }),
    });
    setBusy(false);
    router.refresh();
  }

  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    await fetch(`/api/admin/tickets/${ticketId}/replies`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ author, body, is_admin: true }),
    });
    setBody("");
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="mt-6 rounded-lg border border-zinc-800 p-4 space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-400">Status:</span>
        <select
          value={status}
          onChange={(e) => changeStatus(e.target.value as Status)}
          disabled={busy}
          className="rounded-md bg-zinc-950 border border-zinc-800 px-2 py-1 text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={submitReply} className="space-y-2">
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author"
          className="w-full rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Write a reply (visible publicly)"
          className="w-full rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-black hover:bg-green-400 disabled:opacity-50"
        >
          Post reply
        </button>
      </form>
    </div>
  );
}
