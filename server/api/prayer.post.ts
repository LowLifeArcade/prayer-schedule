export default defineEventHandler(async (event) => {
    try {
        const { title, body } = await readBody(event);
        const db = useDatabase();
        const { user } = await getUserSession(event);

        if (!user) {
            throw createError({ statusCode: 401, message: 'Unauthorized' });
        }

        const { error, success, lastInsertRowid } = await db.sql`
        INSERT INTO prayers (title, body, user_id) VALUES (${title}, ${body}, ${user.sub})
    `;

        if (!success) {
            console.error({ error });
            throw createError({ message: 'could not add prayer', statusCode: 422 });
        }

        return { message: 'success', id: lastInsertRowid, title, body };
    } catch (error) {
        console.log({ error })
            throw createError({ message: 'could not add prayer', statusCode: 500 });
    }
});
