create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  app_state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.student_subjects (
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  primary key (user_id, subject)
);

alter table public.profiles enable row level security;
alter table public.student_subjects enable row level security;

create policy "Students read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Students create own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "Students update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "Students delete own profile" on public.profiles for delete to authenticated using ((select auth.uid()) = id);

create policy "Students read own subjects" on public.student_subjects for select to authenticated using ((select auth.uid()) = user_id);
create policy "Students create own subjects" on public.student_subjects for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Students delete own subjects" on public.student_subjects for delete to authenticated using ((select auth.uid()) = user_id);
