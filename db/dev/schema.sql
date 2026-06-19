-- Local development reset schema.
-- Production and rebuildable database setup should use db/migrations.

DROP TABLE IF EXISTS prayer_progress;
DROP TABLE IF EXISTS prayer_days;
DROP TABLE IF EXISTS prayer_bodies;
DROP TABLE IF EXISTS prayer_positions;
DROP TABLE IF EXISTS prayers;
DROP TABLE IF EXISTS user_identities;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
    uid TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    avatar_url TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS user_identities (
    user_id TEXT NOT NULL REFERENCES users(uid),
    provider TEXT NOT NULL,
    provider_uid TEXT NOT NULL,
    PRIMARY KEY (provider, provider_uid)
);

CREATE TABLE IF NOT EXISTS prayers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(uid),
    visibility TEXT NOT NULL DEFAULT 'private' CHECK(visibility IN ('private', 'public')),
    preview TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    deleted_at INTEGER DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS prayer_bodies (
    prayer_id TEXT PRIMARY KEY REFERENCES prayers(id),
    body TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS prayer_positions (
    user_id TEXT NOT NULL REFERENCES users(uid),
    prayer_id TEXT NOT NULL REFERENCES prayers(id),
    list_name TEXT NOT NULL DEFAULT 'default',
    pos INTEGER NOT NULL,
    PRIMARY KEY (list_name, user_id, prayer_id),
    UNIQUE (user_id, list_name, pos)
);

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
