export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const { dayNumber, isComplete = true } = await readBody(event);
    const db = useDatabase();
    const d1 = (await db.getInstance()) as D1Database;

    const { user } = await getUserSession(event);

    if (!user || !id) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const normalizedDayNumber = Number(dayNumber || 1);

    if (!Number.isInteger(normalizedDayNumber) || normalizedDayNumber < 1) {
        throw createError({ statusCode: 422, message: 'Invalid day number' });
    }

    const prayer = await db.sql`
        SELECT p.id
        FROM prayers p
        JOIN prayer_positions pp
            ON pp.prayer_id = p.id
            AND pp.user_id = ${user.uid}
        WHERE p.id = ${id}
            AND p.deleted_at IS NULL
    `;

    if (!prayer.success || !prayer.rows?.[0]) {
        throw createError({ statusCode: 404, message: 'Prayer not found' });
    }

    try {
        const result = isComplete
            ? await d1
                  .prepare(
                      `INSERT OR REPLACE INTO prayer_progress (user_id, prayer_id, day_number, completed_at)
                       VALUES (?, ?, ?, unixepoch())`,
                  )
                  .bind(user.uid, id, normalizedDayNumber)
                  .run()
            : await d1
                  .prepare(
                      `DELETE FROM prayer_progress
                       WHERE user_id = ?
                        AND prayer_id = ?
                        AND day_number = ?`,
                  )
                  .bind(user.uid, id, normalizedDayNumber)
                  .run();

        if (!result.success) {
            console.error({ error: result.error });
            throw createError({ statusCode: 422, message: 'Could not update progress' });
        }
    } catch (error) {
        console.error({ error });
        throw createError({ statusCode: 422, message: 'Could not update progress' });
    }

    return { message: 'success', dayNumber: normalizedDayNumber, isComplete };
});
