-- supabase/migrations/002_news_schedules.sql

CREATE TABLE news (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id      UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  date          DATE NOT NULL,
  category      TEXT,
  url           TEXT NOT NULL,
  image_url     TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, url)
);

CREATE TABLE schedules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id      UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  date          DATE NOT NULL,
  category      TEXT,
  url           TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, url)
);

CREATE INDEX idx_news_group_id ON news(group_id);
CREATE INDEX idx_news_date ON news(date);
CREATE INDEX idx_news_group_date ON news(group_id, date);

CREATE INDEX idx_schedules_group_id ON schedules(group_id);
CREATE INDEX idx_schedules_date ON schedules(date);
CREATE INDEX idx_schedules_group_date ON schedules(group_id, date);
