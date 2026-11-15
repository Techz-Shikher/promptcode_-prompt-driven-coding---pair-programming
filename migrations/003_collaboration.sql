CREATE TABLE collaboration_rooms (
  id uuid PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 160),
  invite_code_hash bytea NOT NULL UNIQUE,
  code text NOT NULL DEFAULT '' CHECK (char_length(code) <= 100000),
  language text NOT NULL CHECK (language IN ('typescript', 'python', 'cpp', 'java', 'go')),
  revision bigint NOT NULL DEFAULT 0 CHECK (revision >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(id, owner_id)
);
CREATE INDEX collaboration_rooms_owner_idx ON collaboration_rooms(owner_id, updated_at DESC, id DESC);

CREATE TABLE collaboration_room_members (
  room_id uuid NOT NULL REFERENCES collaboration_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(room_id, user_id)
);
CREATE INDEX collaboration_members_user_idx ON collaboration_room_members(user_id, joined_at DESC);

CREATE TABLE collaboration_room_messages (
  id uuid PRIMARY KEY,
  room_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(room_id, sender_id) REFERENCES collaboration_room_members(room_id, user_id) ON DELETE CASCADE
);
CREATE INDEX collaboration_messages_history_idx ON collaboration_room_messages(room_id, created_at DESC, id DESC);
