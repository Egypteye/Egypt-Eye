create schema if not exists auth;
create schema if not exists storage;
create extension if not exists pgcrypto;
create table if not exists auth.users (id uuid primary key default gen_random_uuid(), email text);
create or replace function auth.uid() returns uuid language sql stable as $s$ select null::uuid $s$;
create or replace function auth.role() returns text language sql stable as $s$ select 'anon'::text $s$;
create or replace function auth.jwt() returns jsonb language sql stable as $s$ select '{}'::jsonb $s$;
create table if not exists storage.buckets (
  id text primary key, name text, public boolean default false,
  file_size_limit bigint, allowed_mime_types text[], created_at timestamptz default now());
create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(), bucket_id text, name text, owner uuid,
  created_at timestamptz default now(), metadata jsonb);
create or replace function storage.foldername(text) returns text[] language sql immutable as $s$ select string_to_array($1,'/') $s$;
