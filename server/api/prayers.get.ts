import { getFirstContentImageUrl, parseContentBlocks, renderContentBlocks } from '~~/shared/prayer';

interface PrayerListRow {
    id: string;
    title: string;
    user_id: string;
    visibility: string;
    show_title_in_thumbnail: number;
    preview: string;
    body: string;
    pos: number;
}

interface PrayerDayRow {
    prayer_id: string;
    day_number: number;
    body: string;
    image_url: string | null;
    thumbnail_image_url: string | null;
    content_mode: string;
}

interface PrayerProgressRow {
    prayer_id: string;
    day_number: number;
}

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event);

    if (!session.user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const db = useDatabase();

    // use KV to cache
    const prayers = await db.sql`
        SELECT
            p.id, p.title, p.user_id, p.visibility, p.show_title_in_thumbnail, p.preview, pb.body, pp.pos
        FROM prayers p
        JOIN prayer_bodies pb
            ON pb.prayer_id = p.id
        JOIN prayer_positions pp
            ON pp.prayer_id = p.id
            AND pp.user_id = ${session.user.uid}
        WHERE p.deleted_at IS NULL
    `;

    if (!prayers.success) {
        console.error({ error: prayers.error });
        throw createError({ message: 'There was a problem getting prayers', statusCode: 400 });
    }

    const prayerRows = (prayers.rows || []) as unknown as PrayerListRow[];
    const prayerIds = prayerRows.map((prayer) => prayer.id);

    if (!prayerIds.length) {
        return [];
    }

    const days = await db.sql`
        SELECT pd.prayer_id, pd.day_number, pd.body, pd.image_url, pd.thumbnail_image_url, pd.content_mode
        FROM prayer_days pd
        JOIN prayers p
            ON p.id = pd.prayer_id
        JOIN prayer_positions pp
            ON pp.prayer_id = p.id
            AND pp.user_id = ${session.user.uid}
        WHERE p.deleted_at IS NULL
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

    const dayRows = (days.rows || []) as unknown as PrayerDayRow[];
    const progressRows = (progress.rows || []) as unknown as PrayerProgressRow[];
    const daysByPrayer = new Map<string, PrayerDayRow[]>();
    for (const day of dayRows) {
        daysByPrayer.set(day.prayer_id, [...(daysByPrayer.get(day.prayer_id) || []), day]);
    }

    const completedByPrayer = new Map<string, PrayerProgressRow[]>();
    for (const item of progressRows) {
        completedByPrayer.set(item.prayer_id, [...(completedByPrayer.get(item.prayer_id) || []), item]);
    }

    const userId = session.user.uid;
    return prayerRows.map((prayer) => {
        const prayerDays: PrayerDayRow[] = daysByPrayer.get(prayer.id) || [];
        const availableDayNumbers = new Set(prayerDays.length ? prayerDays.map((day) => day.day_number) : [1]);
        const completedDays = new Set(
            (completedByPrayer.get(prayer.id) || []).map((item) => item.day_number).filter((dayNumber) => availableDayNumbers.has(dayNumber)),
        );
        const currentDay = prayerDays.find((day) => !completedDays.has(day.day_number)) || prayerDays.at(-1);
        const composedBlocks = parseContentBlocks(prayer.body);
        const contentImageUrl = getFirstContentImageUrl(composedBlocks, currentDay?.body || prayer.body);
        const composedPreview = composedBlocks.length
            ? renderContentBlocks(composedBlocks, currentDay?.day_number || 1).substring(0, 200)
            : null;
        const { body: _body, ...prayerSummary } = prayer;

        return {
            ...prayerSummary,
            isOwner: prayer.user_id === userId,
            showTitleInThumbnail: prayer.show_title_in_thumbnail !== 0,
            days: prayerDays.map((day) => ({
                dayNumber: day.day_number,
                isComplete: completedDays.has(day.day_number),
            })),
            totalDays: prayerDays.length || 1,
            completedDays: completedDays.size,
            isPrayed: completedDays.size >= (prayerDays.length || 1),
            currentDayNumber: currentDay?.day_number || 1,
            currentDayPreview: composedBlocks.length
                ? composedPreview
                : currentDay?.content_mode === 'static'
                  ? currentDay.body?.substring(0, 200) || prayer.preview
                  : prayer.preview,
            currentDayImageUrl: currentDay?.thumbnail_image_url || currentDay?.image_url || contentImageUrl,
            hasDynamicContent: prayerDays.some((day) => day.content_mode === 'dynamic'),
        };
    });
});
