import { describe, expect, it } from 'vitest';
import {
    buildEditorPrayerPayload,
    createEditorContentBlock,
    createPrayerEditorState,
    syncPrayerEditorDays,
} from '../../app/composables/usePrayerEditor';

describe('prayer editor state', () => {
    it('keeps prayer days and dynamic block days in sync', () => {
        const prayer = createPrayerEditorState();
        prayer.isMultiDay = true;
        prayer.dayCount = 4;
        prayer.contentBlocks.push(createEditorContentBlock('dynamic', 2));
        syncPrayerEditorDays(prayer);
        expect(prayer.days.map((day) => day.dayNumber)).toEqual([1, 2, 3, 4]);
        expect(prayer.contentBlocks[1]?.days).toHaveLength(4);
    });

    it('builds a multi-day payload from dynamic sections', () => {
        const prayer = createPrayerEditorState();
        prayer.title = 'Novena';
        prayer.isMultiDay = true;
        const block = createEditorContentBlock('dynamic', 2);
        block.days[0]!.body = 'Day one prayer';
        prayer.contentBlocks = [block];
        const payload = buildEditorPrayerPayload(prayer);
        expect(payload.days?.[0]).toMatchObject({ dayNumber: 1, body: 'Day one prayer', contentMode: 'dynamic' });
    });
});
