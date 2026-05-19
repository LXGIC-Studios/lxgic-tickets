"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ConfirmFixBlock({
  ticketId,
  fixVersion,
  fixNotes,
  denialCount,
  lastDenialReason,
  canAct,
}: {
  ticketId: string;
  fixVersion: string | null;
  fixNotes: string | null;
  denialCount: number;
  lastDenialReason: string | null;
  canAct: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [denying, setDenying] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/tickets/${ticketId}/confirm-fix`, { method: "POST" });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "Failed");
      setBusy(false);
      return;
    }
    router.refresh();
  }

  async function deny(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (reason.trim().length < 5) {
      setError("Reason must be at least 5 characters.");
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/tickets/${ticketId}/deny-fix`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reason: reason.trim() }),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "Failed");
      setBusy(false);
      return;
    }
    router.refresh();
  }

  const attempts = denialCount + 1;

  return (
    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-5">
      <div className="flex items-start gap-3">
        <div className="text-2xl leading-none">🔧</div>
        <div className="flex-1">
          <div className="text-amber-200 font-semibold">
            Fix deployed{fixVersion ? ` in v${fixVersion}` : ""}. Please test and confirm.
          </div>
          {fixNotes && (
            <div className="mt-1 text-sm text-amber-100/80 whitespace-pre-wrap">{fixNotes}</div>
          )}
          {denialCount > 0 && (
            <div className="mt-2 text-xs text-amber-200/70">
              Fix attempted {attempts} times. Previous denial: &ldquo;{lastDenialReason}&rdquo;
            </div>
          )}
          {canAct && !denying && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={confirm}
                disabled={busy}
                className="rounded-lg bg-green-500 hover:bg-green-400 text-black font-medium px-4 py-2 text-sm transition-colors disabled:opacity-50"
              >
                {busy ? "..." : "Confirm fix"}
              </button>
              <button
                onClick={() => setDenying(true)}
                disabled={busy}
                className="rounded-lg bg-red-500 hover:bg-red-400 text-white font-medium px-4 py-2 text-sm transition-colors disabled:opacity-50"
              >
                Still broken
              </button>
            </div>
          )}
          {canAct && denying && (
            <form onSubmit={deny} className="mt-4 space-y-2">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                autoFocus
                placeholder="What is still broken? (min 5 chars)"
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 rounded-lg px-3 py-2 outline-none transition-colors text-sm text-zinc-100"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-lg bg-red-500 hover:bg-red-400 text-white font-medium px-4 py-2 text-sm disabled:opacity-50"
                >
                  {busy ? "..." : "Submit denial"}
                </button>
                <button
                  type="button"
                  onClick={() => { setDenying(false); setReason(""); }}
                  className="rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-4 py-2 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
          {error && <div className="mt-2 text-sm text-red-300">{error}</div>}
          {!canAct && (
            <div className="mt-3 text-xs text-amber-200/60">
              Sign in as the reporter to confirm or deny this fix.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
