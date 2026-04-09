export default defineEventHandler(async (event) => {
    const session = await getUserSession(event);

    if (!session.user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const db = useDatabase();

    // use KV to cache
    const { rows, error, success } = await db.sql`
        SELECT
            id, title, preview
        FROM prayers
        WHERE user_id = ${session.user.uid}
        AND deleted_at IS NULL
    `;

    if (!success) {
        console.error({ error });
        throw createError({ message: 'There was a problem getting prayers', statusCode: 400 });
    }

    return rows;
});
