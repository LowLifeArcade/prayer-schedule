-- Local development reset only. Production rebuilds should use migrations.

DROP TABLE IF EXISTS prayer_progress;
DROP TABLE IF EXISTS prayer_days;
DROP TABLE IF EXISTS prayer_bodies;
DROP TABLE IF EXISTS prayer_positions;
DROP TABLE IF EXISTS prayers;
DROP TABLE IF EXISTS user_identities;
DROP TABLE IF EXISTS users;

-- Wrangler tracks applied local D1 migrations here. Dropping this lets
-- `npm run db:fresh` rebuild the local database from db/migrations.
DROP TABLE IF EXISTS d1_migrations;
