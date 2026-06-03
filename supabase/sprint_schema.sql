/* Sprint schema for Project Management */
-- Table to store sprints per project
create table if not exists project_sprints (
  id uuid primary key default uuid_generate_v4(),
  project_id text references projects(id) on delete cascade,
  name text not null,
  start_date date,
  end_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add sprint_id column to workspace_tasks
alter table workspace_tasks
  add column if not exists sprint_id uuid references project_sprints(id) on delete set null;

-- Enable row level security on project_sprints
alter table project_sprints enable row level security;

-- RLS policies for project_sprints
create policy "sprint_select" on project_sprints for select using (
  auth.uid() = (select creator_id from projects where id = project_id) or
  auth.uid() in (
    select applicant_id from applications where project_id = project_id and status = 'accepted'
  )
);
create policy "sprint_insert" on project_sprints for insert with check (
  auth.uid() = (select creator_id from projects where id = project_id)
);
create policy "sprint_update" on project_sprints for update using (
  auth.uid() = (select creator_id from projects where id = project_id)
) with check (
  auth.uid() = (select creator_id from projects where id = project_id)
);
create policy "sprint_delete" on project_sprints for delete using (
  auth.uid() = (select creator_id from projects where id = project_id)
);

-- Ensure row level security on workspace_tasks
alter table workspace_tasks enable row level security;

-- RLS policies for workspace_tasks
create policy "task_select" on workspace_tasks for select using (
  auth.uid() = (select creator_id from projects where id = project_id) or
  auth.uid() in (
    select applicant_id from applications where project_id = project_id and status = 'accepted'
  )
);
create policy "task_insert" on workspace_tasks for insert with check (
  auth.uid() = (select creator_id from projects where id = project_id) or
  auth.uid() in (
    select applicant_id from applications where project_id = project_id and status = 'accepted'
  )
);
create policy "task_update" on workspace_tasks for update using (
  auth.uid() = (select creator_id from projects where id = project_id) or
  auth.uid() in (
    select applicant_id from applications where project_id = project_id and status = 'accepted'
  )
) with check (
  auth.uid() = (select creator_id from projects where id = project_id) or
  auth.uid() in (
    select applicant_id from applications where project_id = project_id and status = 'accepted'
  )
);
create policy "task_delete" on workspace_tasks for delete using (
  auth.uid() = (select creator_id from projects where id = project_id) or
  auth.uid() in (
    select applicant_id from applications where project_id = project_id and status = 'accepted'
  )
);
