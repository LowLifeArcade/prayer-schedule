export default defineEventHandler(async (event) => {
    try {
        const db = useDatabase();
        const { user } = await getUserSession(event);
        if (!user) {
            throw createError({ statusCode: 401, message: 'Unauthorized' });
        }

        const body = await readBody(event);
        const id = body?.id;
        // return { message: 'success2', id };
        if (!id) {
            throw createError({ statusCode: 422, statusMessage: 'no id given' });
        }

        const { error, success, changes, rows } = await db.sql`
            UPDATE prayers SET deleted_at = CURRENT_TIMESTAMP WHERE id = ${id}
        `;
        console.log({ success });

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
