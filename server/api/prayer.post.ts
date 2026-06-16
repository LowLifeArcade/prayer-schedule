export default defineEventHandler(async (event) => {
    const { title, body, days = [], listName = 'default' } = await readBody(event);
    const db = useDatabase();
    const d1 = (await db.getInstance()) as D1Database;

    const { user } = await getUserSession(event);

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const prayerId = uuidv7();
    const normalizedDays = Array.isArray(days)
        ? days
              .map((day, index) => ({
                  dayNumber: Number(day.dayNumber || index + 1),
                  title: day.title?.trim() || null,
                  body: day.body?.trim() || '',
                  imageUrl: day.imageUrl?.trim() || null,
                  contentMode: day.contentMode === 'dynamic' ? 'dynamic' : 'static',
              }))
              .filter((day) => day.body)
              .sort((a, b) => a.dayNumber - b.dayNumber)
        : [];
    const prayerBody = body?.trim() || '';
    const preview = (prayerBody || normalizedDays[0]?.body || '').substring(0, 200);

    try {
        const statements = [
            d1
                .prepare('INSERT INTO prayers (id, title, user_id, preview) VALUES (?, ?, ?, ?)')
                .bind(prayerId, title, user.uid, preview),
            d1.prepare('INSERT INTO prayer_bodies (prayer_id, body) VALUES (?, ?)').bind(prayerId, prayerBody),
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
            ...normalizedDays.map((day) =>
                d1
                    .prepare(
                        `INSERT INTO prayer_days (prayer_id, day_number, title, body, image_url, content_mode)
                         VALUES (?, ?, ?, ?, ?, ?)`,
                    )
                    .bind(prayerId, day.dayNumber, day.title, day.body, day.imageUrl, day.contentMode),
            ),
        ];

        const [result] = await d1.batch(statements);

        if (!result?.success) {
            console.error({ error: result?.error });
            throw createError({ message: 'could not add prayer', statusCode: 422 });
        }
    } catch (error) {
        console.error({ error });
        throw createError({ message: 'could not add prayer', statusCode: 422 });
    }

    return { message: 'success', id: prayerId, title, body: prayerBody, days: normalizedDays };
});
