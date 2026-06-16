-- Base schema for a new PRAYERS database.
-- This migration intentionally matches the app's current production shape.

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
