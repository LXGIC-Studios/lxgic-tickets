"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const INPUT =
  "w-full rounded-lg bg-zinc-950 border border-zinc-800 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 px-3 py-2 outline-none transition-colors text-sm";

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password, displayName }),
    });
    if (res.ok) {
      router.push("/my-tickets");
      router.refresh();
    } else {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "Register failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-3">
      <div>
        <label className="block text-sm text-zinc-400 mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          className={INPUT}
        />
      </div>
      <div>
        <label className="block text-sm text-zinc-400 mb-1.5">Display name (optional)</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className={INPUT}
        />
      </div>
      <div>
        <label className="block text-sm text-zinc-400 mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="8+ characters"
          className={INPUT}
        />
      </div>
      {error && <div className="text-red-400 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-green-500 hover:bg-green-400 text-black font-medium px-4 py-2.5 transition-colors disabled:opacity-50"
      >
        {loading ? "..." : "Create account"}
      </button>
      <div className="text-sm text-zinc-500 text-center pt-2">
        Already have one?{" "}
        <Link href="/login" className="text-green-500 hover:underline">
          Sign in
        </Link>
      </div>
    </form>
  );
}
