CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 80),
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  disabled_at timestamptz
);
CREATE UNIQUE INDEX users_email_normalized_unique_idx ON users(lower(email));

CREATE TABLE sessions (
  token_hash bytea PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sessions_user_expiry_idx ON sessions(user_id, expires_at);
CREATE INDEX sessions_expiry_idx ON sessions(expires_at);

CREATE TABLE projects (
  id uuid PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(id, owner_id)
);
CREATE INDEX projects_owner_page_idx ON projects(owner_id, created_at DESC, id DESC);

CREATE TABLE prompts (
  id uuid PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  current_version integer NOT NULL DEFAULT 1 CHECK (current_version > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(id, owner_id),
  FOREIGN KEY(project_id, owner_id) REFERENCES projects(id, owner_id) ON DELETE CASCADE
);
CREATE INDEX prompts_owner_project_page_idx ON prompts(owner_id, project_id, created_at DESC, id DESC);

CREATE TABLE prompt_versions (
  id uuid PRIMARY KEY,
  prompt_id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  version integer NOT NULL CHECK (version > 0),
  content text NOT NULL CHECK (char_length(content) <= 20000),
  parent_version_id uuid REFERENCES prompt_versions(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(prompt_id, version),
  UNIQUE(id, owner_id),
  FOREIGN KEY(prompt_id, owner_id) REFERENCES prompts(id, owner_id) ON DELETE CASCADE
);
CREATE INDEX prompt_versions_history_idx ON prompt_versions(prompt_id, version DESC);

CREATE TABLE prompt_runs (
  id uuid PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt_version_id uuid,
  provider text NOT NULL,
  model text,
  status text NOT NULL,
  latency_ms integer CHECK (latency_ms IS NULL OR latency_ms >= 0),
  usage_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  cost_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(id, owner_id),
  FOREIGN KEY(prompt_version_id, owner_id) REFERENCES prompt_versions(id, owner_id) ON DELETE CASCADE
);
CREATE INDEX prompt_runs_owner_page_idx ON prompt_runs(owner_id, created_at DESC, id DESC);

CREATE TABLE evaluations (
  id uuid PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  run_id uuid NOT NULL,
  rubric_version text NOT NULL,
  scores jsonb NOT NULL,
  judge_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  limitations text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(run_id, owner_id) REFERENCES prompt_runs(id, owner_id) ON DELETE CASCADE
);
CREATE INDEX evaluations_owner_page_idx ON evaluations(owner_id, created_at DESC, id DESC);

CREATE TABLE code_submissions (
  id uuid PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id uuid,
  language text NOT NULL,
  source_code text NOT NULL CHECK (char_length(source_code) <= 100000),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(id, owner_id),
  FOREIGN KEY(project_id, owner_id) REFERENCES projects(id, owner_id) ON DELETE CASCADE
);
CREATE INDEX code_submissions_owner_page_idx ON code_submissions(owner_id, created_at DESC, id DESC);

CREATE TABLE test_cases (
  id uuid PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  submission_id uuid NOT NULL,
  input text NOT NULL CHECK (char_length(input) <= 4000),
  expected_output text NOT NULL CHECK (char_length(expected_output) <= 4000),
  label text NOT NULL CHECK (char_length(label) <= 200),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(id, owner_id),
  FOREIGN KEY(submission_id, owner_id) REFERENCES code_submissions(id, owner_id) ON DELETE CASCADE
);
CREATE INDEX test_cases_owner_submission_idx ON test_cases(owner_id, submission_id, created_at DESC, id DESC);

CREATE TABLE execution_results (
  id uuid PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  submission_id uuid NOT NULL,
  test_case_id uuid,
  provider text NOT NULL,
  provider_reference text,
  status text NOT NULL,
  actual_output text,
  cpu_time_ms integer CHECK (cpu_time_ms IS NULL OR cpu_time_ms >= 0),
  memory_kb integer CHECK (memory_kb IS NULL OR memory_kb >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(submission_id, owner_id) REFERENCES code_submissions(id, owner_id) ON DELETE CASCADE,
  FOREIGN KEY(test_case_id, owner_id) REFERENCES test_cases(id, owner_id) ON DELETE CASCADE
);
CREATE INDEX execution_results_owner_page_idx ON execution_results(owner_id, created_at DESC, id DESC);

CREATE TABLE user_progress (
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id text NOT NULL,
  state jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(owner_id, problem_id)
);

CREATE TABLE prompt_templates (
  id uuid PRIMARY KEY,
  owner_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  content text NOT NULL CHECK (char_length(content) <= 20000),
  category text NOT NULL,
  visibility text NOT NULL CHECK (visibility IN ('private', 'public')),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX prompt_templates_public_idx ON prompt_templates(category, created_at DESC, id DESC) WHERE visibility = 'public';
CREATE INDEX prompt_templates_owner_idx ON prompt_templates(owner_id, created_at DESC, id DESC);

CREATE TABLE feedback (
  id uuid PRIMARY KEY,
  owner_id uuid REFERENCES users(id) ON DELETE CASCADE,
  category text NOT NULL,
  content text NOT NULL CHECK (char_length(content) <= 10000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_events (
  id uuid PRIMARY KEY,
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_events_actor_page_idx ON audit_events(actor_id, created_at DESC, id DESC);
