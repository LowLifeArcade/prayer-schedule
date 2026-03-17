export default defineEventHandler(async (event) => {
    const session = await getUserSession(event);

    if (!session.user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const db = useDatabase();

    const { rows, error, success } = await db.sql`
        SELECT * FROM prayers where user_id = ${session.user.sub} and deleted_at IS NULL
    `;

    if (!success) {
        console.error({ error });
        throw createError({ message: 'There was a problem getting prayers', statusCode: 400 });
    }

    return rows;
});
