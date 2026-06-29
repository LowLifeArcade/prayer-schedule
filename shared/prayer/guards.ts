import type { PrayerContentEnvelope } from './types';

export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isPrayerContentEnvelope(value: unknown): value is PrayerContentEnvelope {
    return isRecord(value) && value.kind === 'prayer-content-blocks' && value.version === 1 && Array.isArray(value.blocks);
}
