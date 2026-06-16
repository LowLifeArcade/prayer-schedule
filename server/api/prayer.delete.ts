export default defineEventHandler(async (event) => {
    const { id } = getQuery(event);
    const db = useDatabase();
    const { user } = await getUserSession(event);

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    if (!id) {
        throw createError({ statusCode: 422, statusMessage: 'missing id' });
    }

    try {
        const { error, success, changes, rows } = await db.sql`
            UPDATE prayers
            SET deleted_at = (unixepoch())
            WHERE id = ${id}
                AND user_id = ${user.uid}
        `;

        if (!success) {
            console.error({ error });
            throw createError({ message: 'could not delete prayer', statusCode: 422 });
        }
    } catch (error) {
        console.error({ error });
        throw createError({ message: 'could not delete prayer', statusCode: 422 });
    }

    return { message: 'success' };
});
