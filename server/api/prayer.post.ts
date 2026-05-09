export default defineEventHandler(async (event) => {
    const { title, body, listName = 'default' } = await readBody(event);
    const db = useDatabase();
    const d1 = (await db.getInstance()) as D1Database;

    const { user } = await getUserSession(event);

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const prayerId = uuidv7();
    const preview = body.substring(0, 200);

    try {
        const [result] = await d1.batch([
            d1
                .prepare('INSERT INTO prayers (id, title, user_id, preview) VALUES (?, ?, ?, ?)')
                .bind(prayerId, title, user.uid, preview),
            d1.prepare('INSERT INTO prayer_bodies (prayer_id, body) VALUES (?, ?)').bind(prayerId, body),
            d1
                .prepare(`
                    INSERT INTO prayer_positions (user_id, prayer_id, list_name, pos)
                    VALUES (
                        ?, ?, ?,
                        (
                            SELECT COALESCE(MAX(pos), 0) + 1000
                            FROM prayer_positions
                            WHERE user_id = ?
                            AND list_name = ?
                        )
                    )`)
                .bind(user.uid, prayerId, listName, user.uid, listName),
        ]);

        if (!result?.success) {
            console.error({ error: result?.error });
            throw createError({ message: 'could not add prayer', statusCode: 422 });
        }
    } catch (error) {
        console.error({ error });
        throw createError({ message: 'could not add prayer', statusCode: 422 });
    }

    return { message: 'success', id: prayerId, title, body };
});
