import { describe, expect, it } from 'vitest';
import { normalizePrayerWritePayload } from '../../shared/prayer';

describe('normalizePrayerWritePayload', () => {
    it('normalizes write input and derives its preview', () => {
        const result = normalizePrayerWritePayload({
            title: '  Rosary  ',
            visibility: 'public',
            days: [{ dayNumber: 2, title: ' Joyful ', body: ' Pray ', contentMode: 'dynamic' }],
            contentBlocks: [{ id: 'one', type: 'static', title: 'Opening', body: 'Hail Mary' }],
        });

        expect(result.title).toBe('Rosary');
        expect(result.visibility).toBe('public');
        expect(result.days[0]).toMatchObject({ dayNumber: 2, title: 'Joyful', body: 'Pray', contentMode: 'dynamic' });
        expect(result.preview).toBe('Opening\nHail Mary');
        expect(result.serializedBody).toContain('prayer-content-blocks');
    });
});
