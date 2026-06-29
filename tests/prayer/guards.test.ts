import { describe, expect, it } from 'vitest';
import { isPrayerContentEnvelope, isRecord } from '../../shared/prayer';

describe('prayer type guards', () => {
    it('recognizes records without accepting arrays or null', () => {
        expect(isRecord({ title: 'Angelus' })).toBe(true);
        expect(isRecord([])).toBe(false);
        expect(isRecord(null)).toBe(false);
    });

    it('recognizes the versioned prayer content envelope', () => {
        expect(isPrayerContentEnvelope({ kind: 'prayer-content-blocks', version: 1, blocks: [] })).toBe(true);
        expect(isPrayerContentEnvelope({ kind: 'prayer-content-blocks', version: 2, blocks: [] })).toBe(false);
        expect(isPrayerContentEnvelope({ kind: 'prayer-content-blocks', version: 1 })).toBe(false);
    });
});
