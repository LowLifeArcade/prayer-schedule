import { expect, type APIRequestContext, type BrowserContext, type Page } from '@playwright/test';

export async function resetTestData(request: APIRequestContext) {
    const response = await request.post('/api/test/reset');
    expect(response.ok(), await response.text()).toBe(true);
}

export async function loginAs(request: APIRequestContext, persona: 'owner' | 'member' = 'owner') {
    const response = await request.post('/api/test/session', { data: { persona } });
    expect(response.ok(), await response.text()).toBe(true);
    return response.json();
}

export async function loginBrowser(context: BrowserContext, persona: 'owner' | 'member' = 'owner') {
    await loginAs(context.request, persona);
}

export async function waitForHydration(page: Page) {
    await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as Element & { __vue_app__?: unknown })?.__vue_app__));
}

export async function createPrayer(request: APIRequestContext, overrides: Record<string, unknown> = {}) {
    const response = await request.post('/api/prayer', {
        data: {
            title: `Test prayer ${Date.now()}`,
            body: 'Lord, hear our prayer.',
            contentBlocks: [{ id: 'opening', type: 'static', title: 'Opening', body: 'Lord, hear our prayer.' }],
            ...overrides,
        },
    });
    expect(response.ok(), await response.text()).toBe(true);
    return response.json();
}
