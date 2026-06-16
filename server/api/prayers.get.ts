export default defineEventHandler(async (event) => {
    const session = await getUserSession(event);

    if (!session.user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const db = useDatabase();

    // use KV to cache
    const prayers = await db.sql`
        SELECT
            p.id, p.title, p.preview, pp.pos
        FROM prayers p
        JOIN prayer_positions pp
            ON pp.prayer_id = p.id
        WHERE p.user_id = ${session.user.uid}
        AND deleted_at IS NULL
    `;

    if (!prayers.success) {
        console.error({ error: prayers.error });
        throw createError({ message: 'There was a problem getting prayers', statusCode: 400 });
    }

    const prayerIds = prayers.rows.map((prayer) => prayer.id);

    if (!prayerIds.length) {
        return [];
    }

    const days = await db.sql`
        SELECT pd.prayer_id, pd.day_number, pd.body, pd.image_url, pd.content_mode
        FROM prayer_days pd
        JOIN prayers p
            ON p.id = pd.prayer_id
        WHERE p.user_id = ${session.user.uid}
            AND p.deleted_at IS NULL
        ORDER BY pd.prayer_id, pd.day_number
    `;
    const progress = await db.sql`
        SELECT prayer_id, day_number
        FROM prayer_progress
        WHERE user_id = ${session.user.uid}
    `;

    if (!days.success || !progress.success) {
        console.error({ daysError: days.error, progressError: progress.error });
        throw createError({ message: 'There was a problem getting prayer progress', statusCode: 400 });
    }

    const daysByPrayer = new Map();
    for (const day of days.rows) {
        daysByPrayer.set(day.prayer_id, [...(daysByPrayer.get(day.prayer_id) || []), day]);
    }

    const completedByPrayer = new Map();
    for (const item of progress.rows) {
        completedByPrayer.set(item.prayer_id, [...(completedByPrayer.get(item.prayer_id) || []), item]);
    }

    return prayers.rows.map((prayer) => {
        const prayerDays = daysByPrayer.get(prayer.id) || [];
        const completedDays = new Set((completedByPrayer.get(prayer.id) || []).map((item) => item.day_number));
        const currentDay = prayerDays.find((day) => !completedDays.has(day.day_number)) || prayerDays.at(-1);

        return {
            ...prayer,
            days: prayerDays.map((day) => ({
                dayNumber: day.day_number,
                isComplete: completedDays.has(day.day_number),
            })),
            totalDays: prayerDays.length || 1,
            completedDays: completedDays.size,
            currentDayNumber: currentDay?.day_number || 1,
            currentDayPreview: currentDay?.body?.substring(0, 200) || prayer.preview,
            currentDayImageUrl: currentDay?.image_url || null,
            hasDynamicContent: prayerDays.some((day) => day.content_mode === 'dynamic'),
        };
    });
});
