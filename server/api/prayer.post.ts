export default defineEventHandler(async (event) => {
    const { title, body } = await readBody(event);
    const d1 = event.context.cloudflare.env.PRAYERS as D1Database;

    const { user } = await getUserSession(event);

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    let id;
    try {
        const [result] = await d1.batch([
            d1
                .prepare('INSERT INTO prayers (title, preview, user_id) VALUES (?, ?, ?)')
                .bind(title, body.substring(0, 200), user.sub),
            d1.prepare('INSERT INTO prayer_bodies (prayer_id, body) VALUES (last_insert_rowid(), ?)').bind(body),
        ]);

        const lastInsertRowid = result?.meta.last_row_id;

        if (!result?.success) {
            console.error({ error: result?.error });
            throw createError({ message: 'could not add prayer', statusCode: 422 });
        }

        id = lastInsertRowid;
    } catch (error) {
        console.error({ error });
        throw createError({ message: 'could not add prayer', statusCode: 422 });
    }

    return { message: 'success', id, title, body };
});
