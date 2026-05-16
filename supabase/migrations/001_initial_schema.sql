-- supabase/migrations/001_initial_schema.sql

CREATE TABLE groups (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ja       TEXT NOT NULL,
  name_cn       TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  color         TEXT NOT NULL,
  logo_url      TEXT,
  description_ja TEXT,
  description_cn TEXT,
  youtube_url   TEXT,
  official_url  TEXT,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id        UUID REFERENCES groups(id) ON DELETE CASCADE,
  name_ja         TEXT NOT NULL,
  name_cn         TEXT,
  name_en         TEXT,
  birthday        DATE,
  birthplace      TEXT,
  height          TEXT,
  blood_type      TEXT,
  hobby_ja        TEXT,
  hobby_cn        TEXT,
  profile_image_url TEXT,
  gallery_images  JSONB DEFAULT '[]',
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE videos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id      UUID REFERENCES groups(id) ON DELETE SET NULL,
  title_ja      TEXT NOT NULL,
  title_cn      TEXT,
  thumbnail_url TEXT NOT NULL,
  youtube_url   TEXT NOT NULL,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE carousel_images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   UUID REFERENCES groups(id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  link_url   TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_members_group_id ON members(group_id);
CREATE INDEX idx_members_name_ja ON members(name_ja);
CREATE INDEX idx_videos_group_id ON videos(group_id);
CREATE INDEX idx_carousel_group_id ON carousel_images(group_id);

-- Seed: three groups
INSERT INTO groups (name_ja, name_cn, slug, color, description_ja, description_cn, youtube_url, official_url, sort_order)
VALUES
  ('=LOVE', '=LOVE', 'equal-love', '#dc7280',
   '=LOVE（イコールラブ）は、指原莉乃プロデュースによる女性アイドルグループ。2017年結成。「愛」をテーマに活動中。',
   '=LOVE（等爱）是由指原莉乃制作的女性偶像团体。2017年成立，以"爱"为主题活动。',
   'https://www.youtube.com/@equallove_',
   'https://equal-love.jp', 1),
  ('≠ME', '≠ME', 'not-equal-me', '#8bcabe',
   '≠ME（ノットイコールミー）は、指原莉乃プロデュースによる女性アイドルグループ。2019年結成。',
   '≠ME（不等于我）是由指原莉乃制作的女性偶像团体。2019年成立。',
   'https://www.youtube.com/@notequalme6632',
   'https://not-equal-me.jp', 2),
  ('≒JOY', '≒JOY', 'nearly-equal-joy', '#fae06d',
   '≒JOY（ニアリーイコールジョイ）は、指原莉乃プロデュースによる女性アイドルグループ。2022年結成。',
   '≒JOY（约等于欢乐）是由指原莉乃制作的女性偶像团体。2022年成立。',
   'https://www.youtube.com/@nearlyequaljoy5843',
   'https://nearly-equal-joy.jp', 3);
