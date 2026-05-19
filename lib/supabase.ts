import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabasePublic = () => createClient(url, anon);
export const supabaseAdmin = () =>
  createClient(url, service, { auth: { persistSession: false } });

export type Severity = "low" | "medium" | "high" | "critical";
export type Status = "open" | "in_progress" | "resolved" | "wontfix" | "duplicate";

export interface Project {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Ticket {
  id: string;
  ticket_number: number;
  project_id: string;
  title: string;
  description: string;
  severity: Severity;
  status: Status;
  reporter_name: string | null;
  reporter_contact: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  url: string;
  filename: string | null;
  created_at: string;
}

export interface TicketReply {
  id: string;
  ticket_id: string;
  author: string;
  body: string;
  is_admin: boolean;
  created_at: string;
}

export const fmtTicketNum = (n: number) => `#${String(n).padStart(3, "0")}`;
