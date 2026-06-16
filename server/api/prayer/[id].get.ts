export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const { day } = getQuery(event);
    const db = useDatabase();

    const { user } = await getUserSession(event);
    if (!user || !id) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const prayer = await db.sql`
        SELECT p.*, pb.body
        FROM prayers as p
        JOIN prayer_bodies as pb
            ON p.id = pb.prayer_id
        WHERE p.user_id = ${user.uid}
            AND p.id = ${id}
            AND p.deleted_at IS NULL
    `;

    if (!prayer.success) {
        console.error({ error: prayer.error });
        throw createError({ statusCode: 422, statusMessage: 'there was a problem getting your prayer' });
    }

    const prayerRow = prayer.rows?.[0];

    if (!prayerRow) {
        return {};
    }

    const days = await db.sql`
        SELECT day_number, title, body, image_url, content_mode
        FROM prayer_days
        WHERE prayer_id = ${id}
        ORDER BY day_number
    `;
    const progress = await db.sql`
        SELECT day_number
        FROM prayer_progress
        WHERE user_id = ${user.uid}
            AND prayer_id = ${id}
    `;

    if (!days.success || !progress.success) {
        console.error({ daysError: days.error, progressError: progress.error });
        throw createError({ statusCode: 422, statusMessage: 'there was a problem getting your prayer progress' });
    }

    const completedDays = new Set(progress.rows.map((item) => item.day_number));
    const requestedDay = Number(day);
    const selectedDay =
        days.rows.find((item) => item.day_number === requestedDay) ||
        days.rows.find((item) => !completedDays.has(item.day_number)) ||
        days.rows.at(-1);

    return {
        ...prayerRow,
        body: selectedDay?.body || prayerRow.body,
        selectedDayNumber: selectedDay?.day_number || 1,
        selectedDayTitle: selectedDay?.title || null,
        selectedDayImageUrl: selectedDay?.image_url || null,
        selectedDayContentMode: selectedDay?.content_mode || 'static',
        totalDays: days.rows.length || 1,
        completedDays: progress.rows.map((item) => item.day_number),
        days: days.rows.map((item) => ({
            dayNumber: item.day_number,
            title: item.title,
            imageUrl: item.image_url,
            contentMode: item.content_mode,
            isComplete: completedDays.has(item.day_number),
        })),
    };
});
