CREATE TABLE workflows (
  id uuid PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  problem_id text NOT NULL CHECK (char_length(problem_id) <= 200),
  status text NOT NULL CHECK (status IN ('active', 'paused', 'completed')),
  snapshot jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(id, owner_id)
);
CREATE INDEX workflows_owner_updated_idx ON workflows(owner_id, updated_at DESC, id DESC);

CREATE TABLE workflow_runs (
  id uuid PRIMARY KEY,
  workflow_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('prompt', 'execution', 'review', 'assistant')),
  status text NOT NULL CHECK (status IN ('completed', 'failed')),
  started_at timestamptz NOT NULL,
  finished_at timestamptz NOT NULL,
  summary text NOT NULL DEFAULT '' CHECK (char_length(summary) <= 2000),
  error_message text NOT NULL DEFAULT '' CHECK (char_length(error_message) <= 4000),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  FOREIGN KEY(workflow_id, owner_id) REFERENCES workflows(id, owner_id) ON DELETE CASCADE
);
CREATE INDEX workflow_runs_owner_history_idx ON workflow_runs(owner_id, workflow_id, started_at DESC, id DESC);
