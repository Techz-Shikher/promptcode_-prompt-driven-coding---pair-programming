CREATE TABLE learning_progress (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id text NOT NULL CHECK (lesson_id ~ '^lesson-[a-z0-9-]{1,80}$'),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  best_score smallint NOT NULL DEFAULT 0 CHECK (best_score BETWEEN 0 AND 100),
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, lesson_id)
);
CREATE INDEX learning_progress_user_updated_idx ON learning_progress(user_id, updated_at DESC);

CREATE TABLE learning_assessment_attempts (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id text NOT NULL,
  score smallint NOT NULL CHECK (score BETWEEN 0 AND 100),
  correct_count smallint NOT NULL CHECK (correct_count >= 0),
  question_count smallint NOT NULL CHECK (question_count > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX learning_attempts_user_recent_idx ON learning_assessment_attempts(user_id, created_at DESC);

CREATE TABLE learning_daily_challenges (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_date date NOT NULL,
  lesson_id text NOT NULL,
  best_score smallint NOT NULL CHECK (best_score BETWEEN 0 AND 100),
  attempts smallint NOT NULL DEFAULT 1 CHECK (attempts > 0),
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, challenge_date)
);

CREATE TABLE learning_privacy_settings (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  leaderboard_opt_in boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE community_prompts (
  id uuid PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  content text NOT NULL CHECK (char_length(content) BETWEEN 20 AND 6000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  hidden_at timestamptz
);
CREATE INDEX community_prompts_public_idx ON community_prompts(created_at DESC, id DESC) WHERE hidden_at IS NULL;
CREATE INDEX community_prompts_owner_idx ON community_prompts(owner_id, created_at DESC);

CREATE TABLE community_prompt_votes (
  prompt_id uuid NOT NULL REFERENCES community_prompts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(prompt_id, user_id)
);

CREATE TABLE community_prompt_reports (
  prompt_id uuid NOT NULL REFERENCES community_prompts(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (reason IN ('spam', 'unsafe', 'personal_data', 'other')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(prompt_id, reporter_id)
);
