export default defineEventHandler(async (event) => {
    const queryId = getQuery(event).id;
    const id = typeof queryId === 'string' ? queryId : '';
    const db = useDatabase();
    const d1 = (await db.getInstance()) as D1Database;
    const { user } = await getUserSession(event);

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    if (!id) {
        throw createError({ statusCode: 422, statusMessage: 'missing id' });
    }

    try {
        const existing = await db.sql`
            SELECT user_id
            FROM prayers
            WHERE id = ${id}
                AND deleted_at IS NULL
        `;

        if (!existing.success) {
            console.error({ error: existing.error });
            throw createError({ message: 'could not delete prayer', statusCode: 422 });
        }

        const prayer = existing.rows?.[0];

        if (!prayer) {
            throw createError({ statusCode: 404, message: 'Prayer not found' });
        }

        const statements =
            prayer.user_id === user.uid
                ? [d1.prepare('UPDATE prayers SET deleted_at = unixepoch() WHERE id = ? AND user_id = ?').bind(id, user.uid)]
                : [
                      d1.prepare('DELETE FROM prayer_positions WHERE prayer_id = ? AND user_id = ?').bind(id, user.uid),
                      d1.prepare('DELETE FROM prayer_progress WHERE prayer_id = ? AND user_id = ?').bind(id, user.uid),
                  ];
        const [result] = await d1.batch(statements);

        if (!result?.success) {
            console.error({ error: result?.error });
            throw createError({ message: 'could not delete prayer', statusCode: 422 });
        }
    } catch (error) {
        console.error({ error });
        throw createError({ message: 'could not delete prayer', statusCode: 422 });
    }

    return { message: 'success' };
});
