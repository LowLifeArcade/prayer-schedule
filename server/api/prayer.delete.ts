export default defineEventHandler(async (event) => {
    const { id } = await readBody(event);
    const db = useDatabase();
    const { user } = await getUserSession(event);

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    try {
        const { error, success, changes, rows } = await db.sql`
            UPDATE prayers SET deleted_at = CURRENT_TIMESTAMP WHERE id = ${id}
        `;

        if (!success) {
            console.error({ error });
            throw createError({ message: 'could not delete prayer', statusCode: 422 });
        }
        console.log({ changes, rows });
    } catch (error) {
        console.error({ error });
        throw createError({ message: 'could not delete prayer', statusCode: 422 });
    }

    return { message: 'success' };
});
