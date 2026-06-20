export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const { day } = getQuery(event);
    const db = useDatabase();

    const { user } = await getUserSession(event);
    if (!user || !id) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const prayer = await db.sql`
        SELECT p.*, pb.body, pp.user_id AS added_user_id
        FROM prayers as p
        JOIN prayer_bodies as pb
            ON p.id = pb.prayer_id
        LEFT JOIN prayer_positions pp
            ON pp.prayer_id = p.id
            AND pp.user_id = ${user.uid}
        WHERE p.id = ${id}
            AND p.deleted_at IS NULL
            AND (pp.user_id IS NOT NULL OR p.visibility = 'public')
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
        SELECT day_number, title, body, image_url, thumbnail_image_url, content_mode
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

    const dayNumbers = new Set(days.rows.length ? days.rows.map((item) => item.day_number) : [1]);
    const completedDays = new Set(progress.rows.map((item) => item.day_number).filter((dayNumber) => dayNumbers.has(dayNumber)));
    const requestedDay = Number(day);
    const selectedDay =
        days.rows.find((item) => item.day_number === requestedDay) ||
        days.rows.find((item) => !completedDays.has(item.day_number)) ||
        days.rows.at(-1);

    const selectedDayBody = selectedDay?.body || '';
    const selectedDayContentMode = selectedDay?.content_mode || 'static';
    const composedBlocks = parseContentBlocks(prayerRow.body);
    const usesLegacyStaticDayBody = selectedDay && selectedDayContentMode === 'static';
    const dynamicDayBody =
        selectedDay && selectedDayContentMode === 'dynamic' && selectedDayBody !== prayerRow.body && !composedBlocks.length
            ? selectedDayBody
            : null;
    const selectedBlocks = composedBlocks.length ? renderSelectedBlocks(composedBlocks, selectedDay?.day_number || 1) : [];

    return {
        ...prayerRow,
        showTitleInThumbnail: prayerRow.show_title_in_thumbnail !== 0,
        body: composedBlocks.length
            ? selectedBlocks
                  .map((block) => block.body)
                  .filter(Boolean)
                  .join('\n\n')
            : usesLegacyStaticDayBody
              ? selectedDayBody
              : prayerRow.body,
        editBody: composedBlocks.length ? '' : prayerRow.body,
        contentBlocks: composedBlocks,
        selectedDayNumber: selectedDay?.day_number || 1,
        selectedDayTitle: selectedDay?.title || null,
        selectedDayBody: dynamicDayBody,
        selectedBlocks,
        selectedDayImageUrl: selectedDay?.image_url || null,
        selectedDayContentMode,
        isOwner: prayerRow.user_id === user.uid,
        isAdded: Boolean(prayerRow.added_user_id),
        totalDays: days.rows.length || 1,
        completedDays: [...completedDays],
        isPrayed: completedDays.size >= (days.rows.length || 1),
        days: days.rows.map((item) => ({
            dayNumber: item.day_number,
            title: item.title,
            body: item.body,
            imageUrl: item.image_url,
            thumbnailImageUrl: item.thumbnail_image_url,
            contentMode: item.content_mode,
            isComplete: completedDays.has(item.day_number),
        })),
    };
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

function renderSelectedBlocks(blocks: Array<Record<string, any>>, dayNumber: number) {
    return blocks
        .map((block) => {
            if (block.type === 'dynamic') {
                const day = block.days?.find((item: Record<string, any>) => item.dayNumber === dayNumber);
                return {
                    id: block.id,
                    type: 'dynamic',
                    name: block.name || block.title || '',
                    title: day?.title || '',
                    body: day?.body || '',
                };
            }

            if (block.type === 'image') {
                return {
                    id: block.id,
                    type: 'image',
                    title: block.title || '',
                    imageUrl: block.imageUrl || '',
                    alt: block.alt || '',
                    body: '',
                };
            }

            return {
                id: block.id,
                type: 'static',
                title: block.title || '',
                body: block.body || '',
            };
        })
        .filter((block) => block.title || block.body || block.imageUrl);
}
