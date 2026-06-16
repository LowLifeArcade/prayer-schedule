CREATE TABLE IF NOT EXISTS prayer_days (
    prayer_id TEXT NOT NULL REFERENCES prayers(id),
    day_number INTEGER NOT NULL,
    title TEXT,
    body TEXT NOT NULL,
    image_url TEXT,
    content_mode TEXT NOT NULL DEFAULT 'static' CHECK(content_mode IN ('static', 'dynamic')),
    PRIMARY KEY (prayer_id, day_number)
);

CREATE TABLE IF NOT EXISTS prayer_progress (
    user_id TEXT NOT NULL REFERENCES users(uid),
    prayer_id TEXT NOT NULL REFERENCES prayers(id),
    day_number INTEGER NOT NULL,
    completed_at INTEGER NOT NULL DEFAULT (unixepoch()),
    PRIMARY KEY (user_id, prayer_id, day_number)
);
