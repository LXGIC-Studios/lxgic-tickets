"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import type { Project, Severity } from "@/lib/supabase";

const SEVS: Severity[] = ["low", "medium", "high", "critical"];

const INPUT =
  "w-full rounded-lg bg-zinc-950 border border-zinc-800 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 px-3 py-2 outline-none transition-colors text-sm";

export function NewTicketForm({
  projects,
  preselect,
}: {
  projects: Project[];
  preselect?: string;
}) {
  const router = useRouter();
  const initialProj =
    projects.find((p) => p.slug === preselect)?.id ?? projects[0]?.id ?? "";
  const [projectId, setProjectId] = useState(initialProj);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [reporterName, setReporterName] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentProject = useMemo(
    () => projects.find((p) => p.id === projectId) ?? null,
    [projectId, projects]
  );
  const ticketVersion = currentProject?.current_version ?? "";

  const onDrop = useCallback((accepted: File[]) => {
    const fresh = accepted.filter((f) => f.size <= 5 * 1024 * 1024);
    setFiles((prev) => [...prev, ...fresh].slice(0, 8));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxSize: 5 * 1024 * 1024,
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!projectId || !title.trim() || !description.trim()) {
      setError("Project, title, and description are required.");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("project_id", projectId);
      fd.append("title", title);
      fd.append("description", description);
      fd.append("severity", severity);
      if (ticketVersion) fd.append("ticket_version", ticketVersion);
      if (reporterName) fd.append("reporter_name", reporterName);
      if (reporterContact) fd.append("reporter_contact", reporterContact);
      files.forEach((f) => fd.append("files", f));

      const res = await fetch("/api/tickets", { method: "POST", body: fd });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "Failed to file ticket.");
      }
      const json = (await res.json()) as { ticket_number: number };
      router.push(`/t/${json.ticket_number}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something broke.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Field label="Project">
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className={INPUT}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.current_version ? ` · v${p.current_version}` : ""}
            </option>
          ))}
        </select>
        {ticketVersion && (
          <div className="mt-1.5 text-xs text-zinc-500">
            Filing against <span className="font-mono text-zinc-400">v{ticketVersion}</span>
          </div>
        )}
      </Field>

      <Field label="Title">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Short summary"
          className={INPUT}
        />
      </Field>

      <Field label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          placeholder="What happened? Steps to reproduce, what you expected, what you got."
          className={INPUT}
        />
      </Field>

      <Field label="Severity">
        <div className="flex flex-wrap gap-2">
          {SEVS.map((s) => (
            <label
              key={s}
              className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm capitalize transition-colors ${
                severity === s
                  ? "border-green-500 text-green-400 bg-green-500/10"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              <input
                type="radio"
                name="severity"
                className="hidden"
                value={s}
                checked={severity === s}
                onChange={() => setSeverity(s)}
              />
              {s}
            </label>
          ))}
        </div>
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Your name (optional)">
          <input
            value={reporterName}
            onChange={(e) => setReporterName(e.target.value)}
            className={INPUT}
          />
        </Field>
        <Field label="Contact (optional)">
          <input
            value={reporterContact}
            onChange={(e) => setReporterContact(e.target.value)}
            placeholder="email or @telegram"
            className={INPUT}
          />
        </Field>
      </div>

      <Field label="Screenshots (optional, up to 5MB each)">
        <div
          {...getRootProps()}
          className={`rounded-xl border-2 border-dashed px-4 py-10 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-green-500 bg-green-500/5" : "border-zinc-800 hover:border-zinc-700"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto mb-2 h-6 w-6 text-zinc-500" />
          <div className="text-sm text-zinc-400">
            Drag images here or click to upload
          </div>
          <div className="text-xs text-zinc-600 mt-1">max 5MB each, 8 files total</div>
        </div>
        {files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {files.map((f, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-lg border border-zinc-800 px-3 py-2 text-sm"
              >
                <span className="truncate">{f.name}</span>
                <button
                  type="button"
                  onClick={() => setFiles(files.filter((_, j) => j !== i))}
                  className="text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Field>

      {error && <div className="text-red-400 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-green-500 hover:bg-green-400 text-black font-medium px-5 py-2.5 transition-colors disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit ticket"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-zinc-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
