-- ============================================================
-- Real-time Chat Schema — CollabFind
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- ── 1. Conversations (channels & DMs) ────────────────────────
create table public.conversations (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('channel', 'dm')),
  project_id  text references public.projects(id) on delete cascade,
  name        text,
  created_at  timestamptz default now()
);

-- ── 2. Conversation members ───────────────────────────────────
create table public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  joined_at       timestamptz default now(),
  primary key (conversation_id, user_id)
);

-- ── 3. Messages ───────────────────────────────────────────────
create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references auth.users(id) on delete cascade,
  content         text,
  type            text not null default 'text' check (type in ('text', 'code', 'file')),
  language        text,                      -- untuk code: bahasa (js, py, dll)
  file_url        text,                      -- untuk file
  file_name       text,
  file_size       bigint,
  created_at      timestamptz default now(),
  is_edited       boolean default false,
  updated_at      timestamptz
);

-- ── 4. Indexes ────────────────────────────────────────────────
create index messages_conversation_idx on public.messages(conversation_id, created_at);
create index conversation_members_user_idx on public.conversation_members(user_id);

-- ── 5. Enable RLS ─────────────────────────────────────────────
alter table public.conversations        enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages             enable row level security;

-- ── 6. Helper: is_conversation_member ────────────────────────
create or replace function public.is_conversation_member(conv_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.conversation_members
    where conversation_id = conv_id and user_id = auth.uid()
  );
$$;

-- ── 7. RLS — conversations ────────────────────────────────────
create policy "conversations: member read"
  on public.conversations for select
  using (public.is_conversation_member(id));

create policy "conversations: auth insert"
  on public.conversations for insert
  with check (auth.uid() is not null);

create policy "conversations: member update"
  on public.conversations for update
  using (public.is_conversation_member(id));

create policy "conversations: member delete"
  on public.conversations for delete
  using (public.is_conversation_member(id));

-- ── 8. RLS — conversation_members ────────────────────────────
create policy "conv_members: member read"
  on public.conversation_members for select
  using (public.is_conversation_member(conversation_id));

create policy "conv_members: auth insert"
  on public.conversation_members for insert
  with check (auth.uid() is not null);

create policy "conv_members: self delete"
  on public.conversation_members for delete
  using (auth.uid() = user_id);

-- ── 9. RLS — messages ─────────────────────────────────────────
create policy "messages: member read"
  on public.messages for select
  using (public.is_conversation_member(conversation_id));

create policy "messages: member insert"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and public.is_conversation_member(conversation_id)
  );

create policy "messages: sender update"
  on public.messages for update
  using (
    auth.uid() = sender_id 
    and (now() - created_at) < interval '5 minutes'
  );

create policy "messages: sender delete"
  on public.messages for delete
  using (auth.uid() = sender_id);

-- ── 10. Enable Realtime ───────────────────────────────────────
-- Jalankan juga ini di SQL Editor:
-- alter publication supabase_realtime add table public.messages;
-- alter publication supabase_realtime add table public.conversations;
