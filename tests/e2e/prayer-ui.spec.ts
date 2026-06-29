import { expect, test } from '@playwright/test';
import { createPrayer, loginBrowser, resetTestData, waitForHydration } from './helpers';

const tinyPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64',
);

test.describe('authenticated prayer UI', () => {
    test.beforeEach(async ({ context }) => {
        await resetTestData(context.request);
        await loginBrowser(context);
    });

    test('creates a single-day prayer with a display image and OCR-imported text', async ({ page }) => {
        await page.addInitScript(() => {
            window.__PRAYER_TEST_OCR_TEXT__ = 'Imported Hail Mary text';
        });
        await page.goto('/');
        await waitForHydration(page);
        await page.locator('.add-prayer').click();
        await page.locator('input[name="title"]').fill('UI Prayer');
        await page.getByPlaceholder('Prayer text').fill('Opening prayer text');

        await page.getByRole('button', { name: 'Add image' }).click();
        const imageBlock = page.locator('.content-block').filter({ has: page.getByPlaceholder('Image URL') });
        await imageBlock.locator('input[type=file]').setInputFiles({ name: 'mary.png', mimeType: 'image/png', buffer: tinyPng });
        await expect(imageBlock.locator('img.image-block-preview')).toBeVisible();

        await page.getByText('Read image as text', { exact: true }).locator('input[type=file]').setInputFiles({
            name: 'prayer.png',
            mimeType: 'image/png',
            buffer: tinyPng,
        });
        await expect(page.getByPlaceholder('Optional section title').last()).toHaveValue('Imported image text');
        await expect(page.getByPlaceholder('Prayer text').last()).toHaveValue('Imported Hail Mary text');

        await page.getByRole('button', { name: 'Create' }).click();
        await expect(page.locator('.prayer').filter({ hasText: 'UI Prayer' })).toBeVisible();
    });

    test('creates and edits a multi-day prayer', async ({ page, context }) => {
        await page.goto('/');
        await waitForHydration(page);
        await page.locator('.add-prayer').click();
        await page.locator('input[name="title"]').fill('UI Novena');
        await page.getByText('Multi day prayer', { exact: true }).click();
        await expect(page.getByRole('switch', { name: 'Multi day prayer' })).toBeChecked();
        await page.locator('.day-stepper input').fill('3');
        await page.locator('.day-stepper input').dispatchEvent('input');
        await expect(page.locator('.day-detail')).toHaveCount(3);
        await page.locator('.dynamic-day textarea').nth(0).fill('First day from UI');
        await page.getByRole('button', { name: 'Create' }).click();

        const list = await (await context.request.get('/api/prayers')).json();
        const prayer = list.find((item: { title: string }) => item.title === 'UI Novena');
        expect(prayer.totalDays).toBe(3);
        await page.goto(`/prayer/${prayer.id}/edit`);
        await waitForHydration(page);
        await page.locator('input[name="title"]').fill('Edited UI Novena');
        await page.getByRole('button', { name: 'Save Changes' }).click();
        await expect(page).toHaveURL(new RegExp(`/prayer/${prayer.id}$`));
        await expect(page.getByRole('heading', { name: 'Edited UI Novena' })).toBeVisible();
    });

    test('marks progress, restarts, and deletes from the prayer list', async ({ page, context }) => {
        const created = await createPrayer(context.request, {
            title: 'Progress Novena',
            days: [
                { dayNumber: 1, title: 'One', body: 'First', contentMode: 'dynamic' },
                { dayNumber: 2, title: 'Two', body: 'Second', contentMode: 'dynamic' },
            ],
            contentBlocks: [{ id: 'daily', type: 'dynamic', name: 'Daily', days: [
                { dayNumber: 1, title: 'One', body: 'First' },
                { dayNumber: 2, title: 'Two', body: 'Second' },
            ] }],
        });
        await page.goto('/');
        await waitForHydration(page);
        const card = page.locator('.prayer').filter({ hasText: 'Progress Novena' });
        await card.getByRole('button', { name: 'Prayer actions' }).click();
        await card.getByRole('menuitem', { name: 'Mark prayed' }).click();
        await expect(card.locator('.day-option').nth(0)).toHaveClass(/complete/);

        await card.getByRole('button', { name: 'Prayer actions' }).click();
        await card.getByRole('menuitem', { name: 'Restart prayer' }).click();
        await page.getByRole('button', { name: 'Restart' }).click();
        await expect(card.locator('.day-option').nth(0)).not.toHaveClass(/complete/);

        await card.getByRole('button', { name: 'Prayer actions' }).click();
        await card.getByRole('menuitem', { name: /Delete/ }).click();
        await expect(card).toHaveCount(0);
        expect((await context.request.get(`/api/prayer/${created.id}`)).ok()).toBe(true);
    });

    test('adds a public prayer and renders without horizontal overflow on mobile', async ({ page, context }) => {
        await createPrayer(context.request, { title: 'Shared Litany', visibility: 'public' });
        await loginBrowser(context, 'member');
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/prayers/public');
        await waitForHydration(page);
        await expect(page.getByRole('heading', { name: 'Public prayers' })).toBeVisible();
        const addResponse = page.waitForResponse((response) => response.url().includes('/add') && response.request().method() === 'POST');
        await page.getByRole('button', { name: 'Add to my prayers' }).click();
        expect((await addResponse).ok()).toBe(true);
        const memberPrayers = await (await context.request.get('/api/prayers')).json();
        expect(memberPrayers).toEqual(expect.arrayContaining([expect.objectContaining({ title: 'Shared Litany', isOwner: false })]));
        await page.reload();
        await expect(page.getByRole('button', { name: 'In my prayers' })).toBeDisabled();
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow).toBeLessThanOrEqual(1);
    });

    test('renders the prayer list, detail, and editor without mobile overflow', async ({ page, context }) => {
        const prayer = await createPrayer(context.request, { title: 'Mobile Prayer' });
        await page.setViewportSize({ width: 390, height: 844 });

        for (const path of ['/', `/prayer/${prayer.id}`, `/prayer/${prayer.id}/edit`]) {
            await page.goto(path);
            await waitForHydration(page);
            await expect(page.getByText('Mobile Prayer', { exact: true }).first()).toBeVisible();
            const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
            expect(overflow, `horizontal overflow at ${path}`).toBeLessThanOrEqual(1);
        }
    });
});
