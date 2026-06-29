import { parseContentBlocks, renderSelectedBlocks } from '~~/shared/prayer';

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

    const dayRows = days.rows || [];
    const progressRows = progress.rows || [];
    const dayNumbers = new Set(dayRows.length ? dayRows.map((item) => Number(item.day_number)) : [1]);
    const completedDays = new Set(progressRows.map((item) => Number(item.day_number)).filter((dayNumber) => dayNumbers.has(dayNumber)));
    const requestedDay = Number(day);
    const selectedDay =
        dayRows.find((item) => item.day_number === requestedDay) ||
        dayRows.find((item) => !completedDays.has(Number(item.day_number))) ||
        dayRows.at(-1);

    const selectedDayBody = selectedDay?.body || '';
    const selectedDayContentMode = selectedDay?.content_mode || 'static';
    const composedBlocks = parseContentBlocks(prayerRow.body);
    const usesLegacyStaticDayBody = selectedDay && selectedDayContentMode === 'static';
    const dynamicDayBody =
        selectedDay && selectedDayContentMode === 'dynamic' && selectedDayBody !== prayerRow.body && !composedBlocks.length
            ? selectedDayBody
            : null;
    const selectedBlocks = composedBlocks.length ? renderSelectedBlocks(composedBlocks, Number(selectedDay?.day_number || 1)) : [];

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
        totalDays: dayRows.length || 1,
        completedDays: [...completedDays],
        isPrayed: completedDays.size >= (dayRows.length || 1),
        days: dayRows.map((item) => ({
            dayNumber: item.day_number,
            title: item.title,
            body: item.body,
            imageUrl: item.image_url,
            thumbnailImageUrl: item.thumbnail_image_url,
            contentMode: item.content_mode,
            isComplete: completedDays.has(Number(item.day_number)),
        })),
    };
});
