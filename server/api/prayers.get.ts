export default defineEventHandler(async (event) => {
    const session = await getUserSession(event);

    if (!session.user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const db = useDatabase();

    // use KV to cache
    const { rows, error, success } = await db.sql`
        SELECT
            p.id, p.title, p.preview, pp.pos
        FROM prayers p
        JOIN prayer_positions pp
            ON pp.prayer_id = p.id
        WHERE p.user_id = ${session.user.uid}
        AND deleted_at IS NULL
    `;

    if (!success) {
        console.error({ error });
        throw createError({ message: 'There was a problem getting prayers', statusCode: 400 });
    }

    return rows;
});
