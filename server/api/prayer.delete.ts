export default defineEventHandler(async (event) => {
    try {
        const { id } = (await readBody(event)) || {};
        const db = useDatabase();
        const { user } = (await getUserSession(event)) || {};

        if (!user) {
            throw createError({ statusCode: 401, message: 'Unauthorized' });
        }

        const { error, success, lastInsertRowid } = await db.sql`
            UPDATE prayers SET deleted = '1' WHERE id = ${id}
        `;

        if (!success) {
            console.error({ error });
            throw createError({ message: 'could not add prayer', statusCode: 422 });
        }

        return { message: 'success', id: lastInsertRowid };
    } catch (error) {
        console.log({ error });
        throw createError({ message: 'could not add prayer', statusCode: 400 });
    }
});
