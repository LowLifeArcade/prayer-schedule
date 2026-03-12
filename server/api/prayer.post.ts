export default defineEventHandler(async (event) => {
    const { title, body } = await readBody(event);
    const db = useDatabase();

    const { error, success, lastInsertRowid } = await db.sql`
        INSERT INTO prayers (title, body) VALUES (${title}, ${body})
    `;

    if (!success) {
        console.error({ error });
        throw createError({ message: 'could not add prayer', statusCode: 422 });
    }

    return { message: 'success', id: lastInsertRowid, title, body };
});
