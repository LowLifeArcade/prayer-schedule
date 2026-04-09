-- Migration number: 0003 	 2026-03-18T00:34:38.964Z

CREATE TABLE IF NOT EXISTS prayer_bodies (
    prayer_id TEXT PRIMARY KEY REFERENCES prayers(id),
    body TEXT NOT NULL
);

-- populate positionally
INSERT INTO prayer_bodies (prayer_id, body)
SELECT id, body FROM prayers
WHERE body IS NOT NULL;

ALTER TABLE prayers ADD COLUMN preview TEXT;

UPDATE prayers
SET preview = SUBSTR(body, 1, 200)
WHERE body IS NOT NULL;

ALTER TABLE prayers DROP COLUMN body;