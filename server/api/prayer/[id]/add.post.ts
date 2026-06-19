export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const { listName = 'default' } = await readBody(event);
    const db = useDatabase();
    const d1 = (await db.getInstance()) as D1Database;
    const { user } = await getUserSession(event);

    if (!user || !id) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const prayer = await db.sql`
        SELECT id
        FROM prayers
        WHERE id = ${id}
            AND visibility = 'public'
            AND deleted_at IS NULL
    `;

    if (!prayer.success) {
        console.error({ error: prayer.error });
        throw createError({ statusCode: 422, message: 'Could not add prayer' });
    }

    if (!prayer.rows?.length) {
        throw createError({ statusCode: 404, message: 'Prayer not found' });
    }

    const result = await d1
        .prepare(
            `INSERT OR IGNORE INTO prayer_positions (user_id, prayer_id, list_name, pos)
             VALUES (
                ?, ?, ?,
                (
                    SELECT COALESCE(MAX(pos), 0) + 1000
                    FROM prayer_positions
                    WHERE user_id = ?
                        AND list_name = ?
                )
             )`,
        )
        .bind(user.uid, id, listName, user.uid, listName)
        .run();

    if (!result.success) {
        console.error({ error: result.error });
        throw createError({ statusCode: 422, message: 'Could not add prayer' });
    }

    return { message: 'success', id };
});
