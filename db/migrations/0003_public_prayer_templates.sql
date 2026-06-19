ALTER TABLE prayers
ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private' CHECK(visibility IN ('private', 'public'));

INSERT OR IGNORE INTO prayer_positions (user_id, prayer_id, list_name, pos)
SELECT
    p.user_id,
    p.id,
    'default',
    (
        SELECT COALESCE(MAX(pp.pos), 0) + 1000
        FROM prayer_positions pp
        WHERE pp.user_id = p.user_id
            AND pp.list_name = 'default'
    ) + (ROW_NUMBER() OVER (PARTITION BY p.user_id ORDER BY p.created_at, p.id) * 1000)
FROM prayers p
WHERE p.deleted_at IS NULL
    AND NOT EXISTS (
        SELECT 1
        FROM prayer_positions existing
        WHERE existing.user_id = p.user_id
            AND existing.prayer_id = p.id
            AND existing.list_name = 'default'
    );
