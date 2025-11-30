-- 1. users
CREATE TABLE users (
  id            BIGSERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255)        NOT NULL,
  display_name  VARCHAR(100)        NOT NULL,
  avatar_url    VARCHAR(500),
  rank          VARCHAR(50),
  created_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- 2. car_reports
CREATE TABLE car_reports (
  id             BIGSERIAL PRIMARY KEY,
  author_id      BIGINT         NOT NULL REFERENCES users(id),
  plate_number   VARCHAR(32)    NOT NULL,
  title          VARCHAR(255)   NOT NULL,
  description    TEXT           NOT NULL,
  car_type       VARCHAR(100),
  location       VARCHAR(255),
  main_image_url VARCHAR(500),

  category_tag   VARCHAR(50),   -- backend decide meaning

  like_count     INTEGER        NOT NULL DEFAULT 0,
  comment_count  INTEGER        NOT NULL DEFAULT 0,
  share_count    INTEGER        NOT NULL DEFAULT 0,

  created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_car_reports_plate
  ON car_reports (plate_number);

CREATE INDEX idx_car_reports_created
  ON car_reports (created_at DESC);

CREATE INDEX idx_car_reports_category_created
  ON car_reports (category_tag, created_at DESC);



-- 3. user_likes (generic: report, comment, ...)
CREATE TABLE user_likes (
  user_id     BIGINT       NOT NULL REFERENCES users(id),
  target_type VARCHAR(20)  NOT NULL,  -- 'report' | 'comment' | ...
  target_id   BIGINT       NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, target_type, target_id)
);

CREATE INDEX idx_user_likes_target
  ON user_likes (target_type, target_id);



-- 4. comments
CREATE TABLE comments (
  id          BIGSERIAL PRIMARY KEY,
  report_id   BIGINT        NOT NULL REFERENCES car_reports(id),
  author_id   BIGINT        NOT NULL REFERENCES users(id),
  content     TEXT          NOT NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  parent_id   BIGINT,
  like_count  INTEGER       NOT NULL DEFAULT 0,

  CONSTRAINT fk_comments_parent
    FOREIGN KEY (parent_id) REFERENCES comments(id)
);

CREATE INDEX idx_comments_report_created
  ON comments (report_id, created_at);



-- 5. comment_media (max 1 image + 1 video / comment)
CREATE TABLE comment_media (
  id           BIGSERIAL PRIMARY KEY,
  comment_id   BIGINT        NOT NULL REFERENCES comments(id),
  media_type   VARCHAR(10)   NOT NULL, -- 'image' | 'video'
  url          VARCHAR(500)  NOT NULL,
  file_name    VARCHAR(255),
  duration_sec INTEGER,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_comment_media_comment_type
  ON comment_media (comment_id, media_type);



-- 6. report_media (media gắn với bài report)
CREATE TABLE report_media (
  id           BIGSERIAL PRIMARY KEY,
  report_id    BIGINT        NOT NULL REFERENCES car_reports(id),
  media_type   VARCHAR(10)   NOT NULL, -- 'image' | 'video'
  url          VARCHAR(500)  NOT NULL,
  file_name    VARCHAR(255),
  duration_sec INTEGER,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_report_media_report
  ON report_media (report_id);
