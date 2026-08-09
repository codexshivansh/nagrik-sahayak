-- Nagrik Sahayak — feedback / feature-request table.
-- Run this once in the Supabase SQL Editor. Does NOT touch the existing
-- `schemes` table (unlike schema.sql, this has no `drop table` — safe to
-- run alongside live scheme data).

create table if not exists feedback (
  id bigint generated always as identity primary key,
  type text not null default 'feedback' check (type in ('feedback', 'feature_request')),
  message text not null,
  name text,
  lang text,
  created_at timestamptz not null default now()
);

create index if not exists feedback_created_at_idx on feedback (created_at desc);
