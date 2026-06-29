import { expect, test } from '@playwright/test';
import { createPrayer, loginAs, resetTestData } from './helpers';

test.describe('authenticated prayer API with local D1', () => {
    test.beforeEach(async ({ request }) => {
        await resetTestData(request);
        await loginAs(request);
    });

    test('creates, reads, edits, and deletes a prayer', async ({ request }) => {
        const created = await createPrayer(request, { title: 'Morning Offering' });
        const detail = await request.get(`/api/prayer/${created.id}`);
        expect(detail.ok()).toBe(true);
        expect(await detail.json()).toMatchObject({ id: created.id, title: 'Morning Offering', isOwner: true });

        const updated = await request.put(`/api/prayer/${created.id}`, {
            data: {
                title: 'Updated Morning Offering',
                contentBlocks: [{ id: 'one', type: 'static', title: '', body: 'I offer this day.' }],
            },
        });
        expect(updated.ok(), await updated.text()).toBe(true);
        expect(await updated.json()).toMatchObject({ title: 'Updated Morning Offering' });

        const removed = await request.delete('/api/prayer', { params: { id: created.id } });
        expect(removed.ok(), await removed.text()).toBe(true);
        const prayers = await (await request.get('/api/prayers')).json();
        expect(prayers).toEqual([]);
    });

    test('persists multi-day progress, restart, and list reordering', async ({ request }) => {
        const first = await createPrayer(request, { title: 'First prayer' });
        const novena = await createPrayer(request, {
            title: 'Test Novena',
            days: [
                { dayNumber: 1, title: 'Day One', body: 'First day', contentMode: 'dynamic' },
                { dayNumber: 2, title: 'Day Two', body: 'Second day', contentMode: 'dynamic' },
            ],
            contentBlocks: [{ id: 'daily', type: 'dynamic', name: 'Daily', days: [
                { dayNumber: 1, title: 'Day One', body: 'First day' },
                { dayNumber: 2, title: 'Day Two', body: 'Second day' },
            ] }],
        });

        expect((await request.post(`/api/prayer/${novena.id}/progress`, { data: { dayNumber: 1, isComplete: true } })).ok()).toBe(true);
        let detail = await (await request.get(`/api/prayer/${novena.id}`)).json();
        expect(detail.completedDays).toEqual([1]);
        expect(detail.selectedDayNumber).toBe(2);

        expect((await request.post(`/api/prayer/${novena.id}/progress`, { data: { reset: true } })).ok()).toBe(true);
        detail = await (await request.get(`/api/prayer/${novena.id}`)).json();
        expect(detail.completedDays).toEqual([]);
        expect(detail.selectedDayNumber).toBe(1);

        const reordered = await request.post('/api/prayers', { data: { id: novena.id, newPos: 500, listName: 'default' } });
        expect(reordered.ok(), await reordered.text()).toBe(true);
        const list = await (await request.get('/api/prayers')).json();
        expect(list.find((item: { id: string }) => item.id === novena.id).pos).toBe(500);
        expect(list.find((item: { id: string }) => item.id === first.id)).toBeTruthy();
    });

    test('shares a public prayer without transferring ownership', async ({ request }) => {
        const publicPrayer = await createPrayer(request, { title: 'Public Rosary', visibility: 'public' });
        await loginAs(request, 'member');

        const library = await (await request.get('/api/prayers/public')).json();
        expect(library).toEqual(expect.arrayContaining([expect.objectContaining({ id: publicPrayer.id, isOwner: false })]));
        expect((await request.post(`/api/prayer/${publicPrayer.id}/add`, { data: {} })).ok()).toBe(true);
        expect(await (await request.get('/api/prayers')).json()).toEqual(
            expect.arrayContaining([expect.objectContaining({ id: publicPrayer.id, isOwner: false })]),
        );

        expect((await request.delete('/api/prayer', { params: { id: publicPrayer.id } })).ok()).toBe(true);
        expect(await (await request.get('/api/prayers')).json()).toEqual([]);
        expect((await request.get(`/api/prayer/${publicPrayer.id}`)).ok()).toBe(true);
    });
});
