export default defineEventHandler(async (event) => {
    const { title, body, days = [], contentBlocks = [], listName = 'default', visibility = 'private' } = await readBody(event);
    const db = useDatabase();
    const d1 = (await db.getInstance()) as D1Database;

    const { user } = await getUserSession(event);

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const prayerId = uuidv7();
    const normalizedTitle = title?.trim();
    const normalizedVisibility = visibility === 'public' ? 'public' : 'private';

    if (!normalizedTitle) {
        throw createError({ statusCode: 422, message: 'Title is required' });
    }

    const normalizedContentBlocks = normalizeContentBlocks(contentBlocks);
    const normalizedDays = Array.isArray(days)
        ? days
              .map((day, index) => ({
                  dayNumber: Number(day.dayNumber || index + 1),
                  title: day.title?.trim() || null,
                  body: day.body?.trim() || '',
                  imageUrl: day.imageUrl?.trim() || null,
                  thumbnailImageUrl: day.thumbnailImageUrl?.trim() || null,
                  contentMode: day.contentMode === 'dynamic' ? 'dynamic' : 'static',
              }))
              .sort((a, b) => a.dayNumber - b.dayNumber)
        : [];
    const plainPrayerBody = body?.trim() || '';
    const prayerBody = normalizedContentBlocks.length
        ? JSON.stringify({
              kind: 'prayer-content-blocks',
              version: 1,
              blocks: normalizedContentBlocks,
          })
        : plainPrayerBody;
    const preview = (
        normalizedContentBlocks.length ? renderContentBlocks(normalizedContentBlocks, normalizedDays[0]?.dayNumber || 1) : plainPrayerBody
    ).substring(0, 200);

    try {
        const statements = [
            d1
                .prepare('INSERT INTO prayers (id, title, user_id, visibility, preview) VALUES (?, ?, ?, ?, ?)')
                .bind(prayerId, normalizedTitle, user.uid, normalizedVisibility, preview),
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
                        `INSERT INTO prayer_days (prayer_id, day_number, title, body, image_url, thumbnail_image_url, content_mode)
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    )
                    .bind(prayerId, day.dayNumber, day.title, day.body, day.imageUrl, day.thumbnailImageUrl, day.contentMode),
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

    return { message: 'success', id: prayerId, title: normalizedTitle, body: prayerBody, visibility: normalizedVisibility, days: normalizedDays };
});

function normalizeContentBlocks(contentBlocks: unknown) {
    if (!Array.isArray(contentBlocks)) {
        return [];
    }

    return contentBlocks
        .map((block, index) => {
            if (!block || typeof block !== 'object') {
                return null;
            }

            const value = block as Record<string, any>;

            if (value.type === 'dynamic') {
                const dynamicDays = Array.isArray(value.days)
                    ? value.days
                          .map((day: Record<string, any>, dayIndex: number) => ({
                              dayNumber: Number(day?.dayNumber || dayIndex + 1),
                              title: day?.title?.trim() || '',
                              body: day?.body?.trim() || '',
                          }))
                          .sort((a, b) => a.dayNumber - b.dayNumber)
                    : [];

                return {
                    id: String(value.id || `block-${index + 1}`),
                    type: 'dynamic',
                    name: value.name?.trim() || value.title?.trim() || '',
                    days: dynamicDays,
                };
            }

            if (value.type === 'image') {
                return {
                    id: String(value.id || `block-${index + 1}`),
                    type: 'image',
                    title: value.title?.trim() || '',
                    imageUrl: value.imageUrl?.trim() || '',
                    alt: value.alt?.trim() || '',
                };
            }

            return {
                id: String(value.id || `block-${index + 1}`),
                type: 'static',
                title: value.title?.trim() || '',
                body: value.body?.trim() || '',
            };
        })
        .filter((block) => {
            if (!block) {
                return false;
            }

            return block.type === 'dynamic'
                ? Boolean(block.name) || block.days.some((day) => day.title || day.body)
                : block.type === 'image'
                  ? Boolean(block.imageUrl)
                : Boolean(block.title || block.body);
        });
}

function renderContentBlocks(blocks: Array<Record<string, any>>, dayNumber: number) {
    return blocks
        .map((block) => {
            let title = block.title || '';
            let body = '';

            if (block.type === 'dynamic') {
                const day = block.days.find((item: Record<string, any>) => item.dayNumber === dayNumber);
                title = day?.title || '';
                body = day?.body || '';
            } else if (block.type === 'image') {
                title = block.title || block.alt || 'Image';
            } else {
                body = block.body || '';
            }

            return [title, body].filter(Boolean).join('\n');
        })
        .filter(Boolean)
        .join('\n\n');
}
