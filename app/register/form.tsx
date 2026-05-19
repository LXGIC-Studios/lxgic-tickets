"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoFocus
        className="w-full rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2"
      />
      <input
        type="text"
        placeholder="Display name (optional)"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        className="w-full rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2"
      />
      <input
        type="password"
        placeholder="Password (8+ chars)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2"
      />
      {error && <div className="text-red-400 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-green-500 px-4 py-2 font-medium text-black hover:bg-green-400 disabled:opacity-50"
      >
        {loading ? "..." : "Create account"}
      </button>
      <div className="text-sm text-zinc-500">
        Already have one?{" "}
        <Link href="/login" className="text-green-500 hover:underline">
          Sign in
        </Link>
      </div>
    </form>
  );
}
