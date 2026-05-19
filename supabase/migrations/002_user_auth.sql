-- Portal users + link tickets to users
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
