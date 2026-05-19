import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();
    const project_id = String(fd.get("project_id") ?? "");
    const title = String(fd.get("title") ?? "").trim();
    const description = String(fd.get("description") ?? "").trim();
    const severity = String(fd.get("severity") ?? "medium");
    const reporter_name = (fd.get("reporter_name") as string) || null;
    const reporter_contact = (fd.get("reporter_contact") as string) || null;

    if (!project_id || !title || !description) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (!["low", "medium", "high", "critical"].includes(severity)) {
      return NextResponse.json({ error: "Bad severity" }, { status: 400 });
    }

    const sb = supabaseAdmin();
    const { data: ticket, error } = await sb
      .from("tickets")
      .insert({
        project_id,
        title,
        description,
        severity,
        reporter_name,
        reporter_contact,
      })
      .select("*")
      .single();

    if (error || !ticket) {
      return NextResponse.json({ error: error?.message ?? "Insert failed" }, { status: 500 });
    }

    const files = fd.getAll("files").filter((f): f is File => f instanceof File);
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) continue;
      const ext = file.name.split(".").pop() || "bin";
      const key = `${ticket.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const buf = Buffer.from(await file.arrayBuffer());
      const up = await sb.storage.from("ticket-images").upload(key, buf, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
      if (!up.error) {
        const { data: pub } = sb.storage.from("ticket-images").getPublicUrl(key);
        await sb.from("ticket_attachments").insert({
          ticket_id: ticket.id,
          url: pub.publicUrl,
          filename: file.name,
        });
      }
    }

    return NextResponse.json({
      id: ticket.id,
      ticket_number: ticket.ticket_number,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
