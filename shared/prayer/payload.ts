import { normalizeContentBlocks, renderContentBlocks, serializeContentBlocks } from './content';
import { isRecord } from './guards';
import type { NormalizedPrayerWritePayload, PrayerDayInput, PrayerWritePayload } from './types';

function optionalText(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function normalizePrayerDays(value: unknown): PrayerDayInput[] {
    if (!Array.isArray(value)) return [];

    return value
        .filter(isRecord)
        .map((day, index) => ({
            dayNumber: Number(day.dayNumber || index + 1),
            title: optionalText(day.title),
            body: optionalText(day.body) || '',
            imageUrl: optionalText(day.imageUrl),
            thumbnailImageUrl: optionalText(day.thumbnailImageUrl),
            contentMode: day.contentMode === 'dynamic' ? ('dynamic' as const) : ('static' as const),
        }))
        .sort((a, b) => a.dayNumber - b.dayNumber);
}

export function normalizePrayerWritePayload(input: PrayerWritePayload): NormalizedPrayerWritePayload {
    const title = input.title?.trim() || '';
    const body = input.body?.trim() || '';
    const contentBlocks = normalizeContentBlocks(input.contentBlocks);
    const days = normalizePrayerDays(input.days);
    const serializedBody = contentBlocks.length ? serializeContentBlocks(contentBlocks) : body;
    const previewSource = contentBlocks.length ? renderContentBlocks(contentBlocks, days[0]?.dayNumber || 1) : body;

    return {
        title,
        body,
        serializedBody,
        preview: previewSource.substring(0, 200),
        days,
        contentBlocks,
        listName: input.listName || 'default',
        visibility: input.visibility === 'public' ? 'public' : 'private',
        showTitleInThumbnail: input.showTitleInThumbnail !== false,
    };
}
