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

    const prayerIds = prayers.rows.map((prayer) => prayer.id);

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
            isOwner: prayer.user_id === session.user.uid,
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

function parseContentBlocks(body: unknown) {
    if (typeof body !== 'string') {
        return [];
    }

    try {
        const value = JSON.parse(body);

        if (value?.kind !== 'prayer-content-blocks' || !Array.isArray(value.blocks)) {
            return [];
        }

        return value.blocks;
    } catch {
        return [];
    }
}

function getFirstContentImageUrl(blocks: Array<Record<string, any>>, body: unknown) {
    const imageBlock = blocks.find((block) => block?.type === 'image' && block.imageUrl?.trim());

    if (imageBlock) {
        return imageBlock.imageUrl.trim();
    }

    if (typeof body !== 'string') {
        return null;
    }

    const markdownImage = body.match(/!\[[^\]]*]\(([^)\s]+)[^)]*\)/);
    if (markdownImage?.[1]) {
        return markdownImage[1];
    }

    const htmlImage = body.match(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/i);
    return htmlImage?.[1] || null;
}

function renderContentBlocks(blocks: Array<Record<string, any>>, dayNumber: number) {
    return blocks
        .map((block) => {
            let title = block.title || '';
            let body = '';

            if (block.type === 'dynamic') {
                const day = block.days?.find((item: Record<string, any>) => item.dayNumber === dayNumber);
                title = day?.title || '';
                body = day?.body || '';
            } else if (block.type === 'image') {
                title = block.title || block.alt || '';
            } else {
                body = block.body || '';
            }

            return [title, body].filter(Boolean).join('\n');
        })
        .filter(Boolean)
        .join('\n\n');
}
