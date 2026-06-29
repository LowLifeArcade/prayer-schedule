import { TEST_USERS, assertTestAuthEnabled } from '../../utils/test-auth';

export default defineEventHandler(async (event) => {
    assertTestAuthEnabled();
    const { persona = 'owner' } = await readBody<{ persona?: keyof typeof TEST_USERS }>(event);
    const user = TEST_USERS[persona];
    if (!user) throw createError({ statusCode: 422, message: 'Unknown test persona' });

    const db = useDatabase();
    const d1 = (await db.getInstance()) as D1Database;
    const result = await d1
        .prepare(`INSERT INTO users (uid, email, name, avatar_url)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(uid) DO UPDATE SET email = excluded.email, name = excluded.name, avatar_url = excluded.avatar_url`)
        .bind(user.uid, user.email, user.name, user.picture)
        .run();
    if (!result.success) throw createError({ statusCode: 500, message: 'Could not create test user' });

    await setUserSession(event, { user }, { cookie: { secure: false, sameSite: 'lax' } });
    return { user };
});
