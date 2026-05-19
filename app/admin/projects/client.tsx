"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/supabase";

export function ProjectsAdmin({ initial }: { initial: Project[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  async function addProject(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !slug) return;
    setBusy(true);
    await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, slug, description }),
    });
    setName("");
    setSlug("");
    setDescription("");
    setBusy(false);
    router.refresh();
  }

  async function toggle(p: Project) {
    setBusy(true);
    await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: p.id, is_active: !p.is_active }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="mt-5 space-y-6">
      <form onSubmit={addProject} className="rounded-lg border border-zinc-800 p-4 space-y-2">
        <div className="grid sm:grid-cols-2 gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            className="rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm"
          />
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="slug-here"
            className="rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm"
          />
        </div>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="w-full rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-black hover:bg-green-400 disabled:opacity-50"
        >
          Add project
        </button>
      </form>

      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-950 text-zinc-400">
            <tr>
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-left px-4 py-2">Slug</th>
              <th className="text-left px-4 py-2">Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {initial.map((p) => (
              <tr key={p.id} className="border-t border-zinc-900">
                <td className="px-4 py-2">{p.name}</td>
                <td className="px-4 py-2 text-zinc-500">{p.slug}</td>
                <td className="px-4 py-2">
                  {p.is_active ? (
                    <span className="text-green-500">yes</span>
                  ) : (
                    <span className="text-zinc-500">no</span>
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => toggle(p)}
                    disabled={busy}
                    className="text-xs text-zinc-400 hover:text-green-500"
                  >
                    toggle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
