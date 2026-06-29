import { isPrayerContentEnvelope, isRecord } from './guards';
import type {
    PrayerContentBlock,
    PrayerContentEnvelope,
    PrayerDynamicContentDay,
    SelectedPrayerContentBlock,
} from './types';

function text(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

function normalizeDynamicDays(value: unknown): PrayerDynamicContentDay[] {
    if (!Array.isArray(value)) return [];

    return value
        .filter(isRecord)
        .map((day, index) => ({
            dayNumber: Number(day.dayNumber || index + 1),
            title: text(day.title),
            body: text(day.body),
        }))
        .sort((a, b) => a.dayNumber - b.dayNumber);
}

export function normalizeContentBlocks(value: unknown): PrayerContentBlock[] {
    if (!Array.isArray(value)) return [];

    return value.flatMap((candidate, index): PrayerContentBlock[] => {
        if (!isRecord(candidate)) return [];

        const id = String(candidate.id || `block-${index + 1}`);
        if (candidate.type === 'dynamic') {
            const block: PrayerContentBlock = {
                id,
                type: 'dynamic',
                name: text(candidate.name) || text(candidate.title),
                days: normalizeDynamicDays(candidate.days),
            };
            return block.name || block.days.some((day) => day.title || day.body) ? [block] : [];
        }

        if (candidate.type === 'image') {
            const block: PrayerContentBlock = {
                id,
                type: 'image',
                title: text(candidate.title),
                imageUrl: text(candidate.imageUrl),
                alt: text(candidate.alt),
            };
            return block.imageUrl ? [block] : [];
        }

        const block: PrayerContentBlock = {
            id,
            type: 'static',
            title: text(candidate.title),
            body: text(candidate.body),
        };
        return block.title || block.body ? [block] : [];
    });
}

export function parseContentBlocks(body: unknown): PrayerContentBlock[] {
    if (typeof body !== 'string') return [];

    try {
        const value: unknown = JSON.parse(body);
        return isPrayerContentEnvelope(value) ? normalizeContentBlocks(value.blocks) : [];
    } catch {
        return [];
    }
}

export function serializeContentBlocks(blocks: PrayerContentBlock[]): string {
    const envelope: PrayerContentEnvelope = { kind: 'prayer-content-blocks', version: 1, blocks };
    return JSON.stringify(envelope);
}

export function renderContentBlocks(blocks: PrayerContentBlock[], dayNumber: number): string {
    return blocks
        .map((block) => {
            if (block.type === 'dynamic') {
                const day = block.days.find((item) => item.dayNumber === dayNumber);
                return [day?.title, day?.body].filter(Boolean).join('\n');
            }
            if (block.type === 'image') return block.title || block.alt;
            return [block.title, block.body].filter(Boolean).join('\n');
        })
        .filter(Boolean)
        .join('\n\n');
}

export function renderSelectedBlocks(blocks: PrayerContentBlock[], dayNumber: number): SelectedPrayerContentBlock[] {
    return blocks.flatMap((block): SelectedPrayerContentBlock[] => {
        if (block.type === 'dynamic') {
            const day = block.days.find((item) => item.dayNumber === dayNumber);
            const selected = { id: block.id, type: block.type, name: block.name, title: day?.title || '', body: day?.body || '' };
            return selected.title || selected.body ? [selected] : [];
        }
        if (block.type === 'image') {
            const selected = { ...block, body: '' };
            return selected.title || selected.imageUrl ? [selected] : [];
        }
        return block.title || block.body ? [{ ...block }] : [];
    });
}

export function getFirstContentImageUrl(blocks: PrayerContentBlock[], body: unknown): string | null {
    const imageBlock = blocks.find((block) => block.type === 'image' && block.imageUrl);
    if (imageBlock?.type === 'image') return imageBlock.imageUrl;
    if (typeof body !== 'string') return null;

    const markdownImage = body.match(/!\[[^\]]*]\(([^)\s]+)[^)]*\)/);
    if (markdownImage?.[1]) return markdownImage[1];
    return body.match(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/i)?.[1] || null;
}

export function getReadablePreview(body: unknown, fallback: string, limit = 900): string {
    const blocks = parseContentBlocks(body);
    if (blocks.length) return renderContentBlocks(blocks, 1).substring(0, limit);
    return typeof body === 'string' && body.trim() ? body.substring(0, limit) : fallback;
}
