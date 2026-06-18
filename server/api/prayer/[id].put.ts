export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const { title, body, days = [], contentBlocks = [] } = await readBody(event);
    const db = useDatabase();
    const d1 = (await db.getInstance()) as D1Database;
    const { user } = await getUserSession(event);

    if (!user || !id) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const normalizedTitle = title?.trim();
    if (!normalizedTitle) {
        throw createError({ statusCode: 422, message: 'Title is required' });
    }

    const existing = await db.sql`
        SELECT id
        FROM prayers
        WHERE id = ${id}
            AND user_id = ${user.uid}
            AND deleted_at IS NULL
    `;

    if (!existing.success) {
        console.error({ error: existing.error });
        throw createError({ message: 'could not update prayer', statusCode: 422 });
    }

    if (!existing.rows?.length) {
        throw createError({ statusCode: 404, message: 'Prayer not found' });
    }

    const normalizedContentBlocks = normalizeContentBlocks(contentBlocks);
    const normalizedDays = Array.isArray(days)
        ? days
              .map((day, index) => ({
                  dayNumber: Number(day.dayNumber || index + 1),
                  title: day.title?.trim() || null,
                  body: day.body?.trim() || '',
                  imageUrl: day.imageUrl?.trim() || null,
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
                .prepare(
                    `UPDATE prayers
                     SET title = ?, preview = ?, updated_at = unixepoch()
                     WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
                )
                .bind(normalizedTitle, preview, id, user.uid),
            d1.prepare('UPDATE prayer_bodies SET body = ? WHERE prayer_id = ?').bind(prayerBody, id),
            d1.prepare('DELETE FROM prayer_days WHERE prayer_id = ?').bind(id),
            d1.prepare('DELETE FROM prayer_progress WHERE user_id = ? AND prayer_id = ?').bind(user.uid, id),
            ...normalizedDays.map((day) =>
                d1
                    .prepare(
                        `INSERT INTO prayer_days (prayer_id, day_number, title, body, image_url, content_mode)
                         VALUES (?, ?, ?, ?, ?, ?)`,
                    )
                    .bind(id, day.dayNumber, day.title, day.body, day.imageUrl, day.contentMode),
            ),
        ];

        const [result] = await d1.batch(statements);

        if (!result?.success) {
            console.error({ error: result?.error });
            throw createError({ message: 'could not update prayer', statusCode: 422 });
        }
    } catch (error) {
        console.error({ error });
        throw createError({ message: 'could not update prayer', statusCode: 422 });
    }

    return { message: 'success', id, title: normalizedTitle, body: prayerBody, days: normalizedDays };
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
            } else {
                body = block.body || '';
            }

            return [title, body].filter(Boolean).join('\n');
        })
        .filter(Boolean)
        .join('\n\n');
}
