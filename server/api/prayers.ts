export default defineEventHandler(async (event) => {
    const session = await getUserSession(event);
    console.log(`🚀 | session:`, session.user)

    if (!session.user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }
    
    const db = useDatabase();

    const { rows } = await db.sql`
        SELECT * FROM prayers
    `;

    return rows;
});
