import { describe, expect, it } from 'vitest';
import {
    getFirstContentImageUrl,
    getReadablePreview,
    normalizeContentBlocks,
    parseContentBlocks,
    renderContentBlocks,
    renderSelectedBlocks,
    serializeContentBlocks,
} from '../../shared/prayer';

const input = [
    { id: 'static', type: 'static', title: 'Opening', body: 'In the name of the Father' },
    { id: 'daily', type: 'dynamic', name: 'Daily prayer', days: [{ dayNumber: 2, title: 'Second day', body: 'Pray with hope' }] },
    { id: 'image', type: 'image', title: '', imageUrl: ' https://example.com/mary.jpg ', alt: 'Our Lady' },
];

describe('prayer content', () => {
    it('normalizes, serializes, and parses discriminated blocks', () => {
        const blocks = normalizeContentBlocks([...input, null, { type: 'static', body: '   ' }]);
        expect(blocks).toHaveLength(3);
        expect(parseContentBlocks(serializeContentBlocks(blocks))).toEqual(blocks);
        expect(parseContentBlocks('ordinary prayer text')).toEqual([]);
    });

    it('renders the selected day consistently', () => {
        const blocks = normalizeContentBlocks(input);
        expect(renderContentBlocks(blocks, 2)).toBe('Opening\nIn the name of the Father\n\nSecond day\nPray with hope\n\nOur Lady');
        expect(renderSelectedBlocks(blocks, 2)).toHaveLength(3);
        expect(getReadablePreview(serializeContentBlocks(blocks), 'fallback')).toContain('Opening');
    });

    it('finds images in blocks, markdown, and HTML', () => {
        expect(getFirstContentImageUrl(normalizeContentBlocks(input), '')).toBe('https://example.com/mary.jpg');
        expect(getFirstContentImageUrl([], '![Mary](https://example.com/mary.png)')).toBe('https://example.com/mary.png');
        expect(getFirstContentImageUrl([], '<img src="https://example.com/mary.webp">')).toBe('https://example.com/mary.webp');
    });
});
