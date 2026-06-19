export default defineEventHandler(async (event) => {
    const { user } = await getUserSession(event);

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const db = useDatabase();
    const prayers = await db.sql`
        SELECT
            p.id,
            p.title,
            p.preview,
            p.user_id,
            u.name AS creator_name,
            pb.body,
            COUNT(pd.day_number) AS total_days,
            MAX(CASE WHEN pp.user_id IS NULL THEN 0 ELSE 1 END) AS is_added
        FROM prayers p
        JOIN prayer_bodies pb
            ON pb.prayer_id = p.id
        LEFT JOIN users u
            ON u.uid = p.user_id
        LEFT JOIN prayer_days pd
            ON pd.prayer_id = p.id
        LEFT JOIN prayer_positions pp
            ON pp.prayer_id = p.id
            AND pp.user_id = ${user.uid}
        WHERE p.visibility = 'public'
            AND p.deleted_at IS NULL
        GROUP BY p.id
        ORDER BY p.updated_at DESC, p.created_at DESC
    `;

    if (!prayers.success) {
        console.error({ error: prayers.error });
        throw createError({ message: 'There was a problem getting public prayers', statusCode: 400 });
    }

    return prayers.rows.map((prayer) => ({
        id: prayer.id,
        title: prayer.title,
        preview: prayer.preview,
        creatorName: prayer.creator_name,
        totalDays: prayer.total_days || 1,
        isAdded: Boolean(prayer.is_added),
        isOwner: prayer.user_id === user.uid,
        readPreview: getReadablePreview(prayer.body, prayer.preview),
    }));
});

function getReadablePreview(body: unknown, fallback: string) {
    if (typeof body !== 'string') {
        return fallback;
    }

    try {
        const value = JSON.parse(body);

        if (value?.kind !== 'prayer-content-blocks' || !Array.isArray(value.blocks)) {
            return fallback;
        }

        return value.blocks
            .map((block: Record<string, any>) => {
                if (block.type === 'dynamic') {
                    const firstDay = block.days?.[0];
                    return [firstDay?.title, firstDay?.body].filter(Boolean).join('\n');
                }

                if (block.type === 'image') {
                    return block.title || block.alt || 'Image';
                }

                return [block.title, block.body].filter(Boolean).join('\n');
            })
            .filter(Boolean)
            .join('\n\n')
            .substring(0, 900);
    } catch {
        return body.substring(0, 900);
    }
}
