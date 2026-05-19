create table projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number serial unique,
  project_id uuid references projects(id) not null,
  title text not null,
  description text not null,
  severity text default 'medium' check (severity in ('low','medium','high','critical')),
  status text default 'open' check (status in ('open','in_progress','resolved','wontfix','duplicate')),
  reporter_name text,
  reporter_contact text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table ticket_attachments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references tickets(id) on delete cascade not null,
  url text not null,
  filename text,
  created_at timestamptz default now()
);

create table ticket_replies (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references tickets(id) on delete cascade not null,
  author text not null,
  body text not null,
  is_admin boolean default false,
  created_at timestamptz default now()
);

insert into projects (slug, name, description) values
  ('lxgic-mm-solana', 'Lxgic-MM Solana', 'Market making bot on Solana.'),
  ('lxgic-mm-base', 'Lxgic-MM Base', 'Market making bot on Base.')
on conflict (slug) do nothing;

-- v0.2.0: portal users + ticket->user link
create table if not exists portal_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  display_name text,
  created_at timestamptz default now(),
  last_login timestamptz
);

alter table tickets add column if not exists user_id uuid references portal_users(id);
create index if not exists tickets_user_id_idx on tickets(user_id);
