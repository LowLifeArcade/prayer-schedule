export default defineEventHandler(async (event) => {
    const session = await getUserSession(event);

    if (!session.user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const db = useDatabase();

    const { rows } = await db.sql`
        SELECT * FROM prayers where user_id = ${session.user.sub}
    `;

    return rows;
});
