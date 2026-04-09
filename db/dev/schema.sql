-- ====================
-- USER
-- ====================
DROP TABLE IF EXISTS user_identities;
DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
    -- uid = uuid v7
    uid text primary key,
    email text not null unique,
    name text,
    avatar_url text,
    created_at integer not null default (unixepoch())
);
CREATE TABLE IF NOT EXISTS user_identities (
    user_id text not null references users(uid),
    -- 'google', 'github', 'email'
    provider text not null,
    -- auth providers give you a string ID
    provider_uid text not null,
    primary key (provider, provider_uid)
);
-- =======================
-- PRAYERS
-- =======================
-- drop first since is has foreign key constraints
DROP TABLE IF EXISTS prayer_bodies;
DROP TABLE IF EXISTS prayers;
CREATE TABLE IF NOT EXISTS prayers (
    -- id = uuidv7
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    user_id TEXT NOT NULL,
    preview text not null,
    created_at TIMESTAMP DEFAULT (unixepoch()),
    updated_at TIMESTAMP DEFAULT (unixepoch()),
    deleted_at TIMESTAMP DEFAULT NULL
);
CREATE TABLE IF NOT EXISTS prayer_bodies (
    prayer_id TEXT PRIMARY KEY REFERENCES prayers(id),
    body TEXT NOT NULL
);
-- =======================
-- MEMBERSHIPS
-- =======================
-- create table ratings (
--     user_id text not null references users(id),
--     item_id text not null references items(id),
--     rating integer not null check(
--         rating between 1 and 5
--     ),
--     created_at integer not null default (unixepoch()),
--     primary key (user_id, item_id) -- enforces one rating per user per item
-- );
-- CREATE TABLE IF NOT EXISTS memberships (
--     id text primary key,
--     user_id text not null references users(id),
--     stripe_customer_id text,
--     stripe_subscription_id text,
--     plan text check(plan in ('monthly', 'annual')),
--     status text check(
--         status in ('active', 'cancelled', 'past_due', 'trialing')
--     ),
--     expires_at integer
-- );
-- CREATE TABLE IF NOT EXISTS items (
--     id text primary key,
--     title text not null,
--     content text,
--     is_premium integer not null default 0,
--     created_at integer not null default (unixepoch())
-- );