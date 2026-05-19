-- 003_fix_tracking.sql
-- v0.3.0 fix-confirmation lifecycle

alter table tickets drop constraint if exists tickets_status_check;
alter table tickets add constraint tickets_status_check
  check (status in ('open','in_progress','fix_deployed','resolved','wontfix','duplicate'));

alter table tickets add column if not exists fix_version text;
alter table tickets add column if not exists fix_commit text;
alter table tickets add column if not exists fix_notes text;
alter table tickets add column if not exists fix_deployed_at timestamptz;
alter table tickets add column if not exists denial_count integer default 0;
alter table tickets add column if not exists last_denial_reason text;
alter table tickets add column if not exists ticket_version text;

alter table projects add column if not exists current_version text;
alter table projects add column if not exists health_url text;
alter table projects add column if not exists repo_url text;
alter table projects add column if not exists version_checked_at timestamptz;

update projects set
  health_url = 'https://lxgic-mm-base.vercel.app/api/health',
  repo_url = 'https://github.com/LXGIC-Studios/lxgic-mm-base'
  where slug = 'lxgic-mm-base';

update projects set
  repo_url = 'https://github.com/LXGIC-Studios/Lxgic-MM'
  where slug = 'lxgic-mm-solana';
