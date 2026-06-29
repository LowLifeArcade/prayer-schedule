import { TEST_USERS, assertTestAuthEnabled } from '../../utils/test-auth';

export default defineEventHandler(async () => {
    assertTestAuthEnabled();
    const db = useDatabase();
    const d1 = (await db.getInstance()) as D1Database;
    const userIds = [TEST_USERS.owner.uid, TEST_USERS.member.uid];
    const placeholders = userIds.map(() => '?').join(', ');
    const ownedPrayerIds = `SELECT id FROM prayers WHERE user_id IN (${placeholders})`;

    const statements = [
        d1.prepare(`DELETE FROM prayer_progress WHERE user_id IN (${placeholders}) OR prayer_id IN (${ownedPrayerIds})`).bind(...userIds, ...userIds),
        d1.prepare(`DELETE FROM prayer_positions WHERE user_id IN (${placeholders}) OR prayer_id IN (${ownedPrayerIds})`).bind(...userIds, ...userIds),
        d1.prepare(`DELETE FROM prayer_days WHERE prayer_id IN (${ownedPrayerIds})`).bind(...userIds),
        d1.prepare(`DELETE FROM prayer_bodies WHERE prayer_id IN (${ownedPrayerIds})`).bind(...userIds),
        d1.prepare(`DELETE FROM prayers WHERE user_id IN (${placeholders})`).bind(...userIds),
        d1.prepare(`DELETE FROM user_identities WHERE user_id IN (${placeholders})`).bind(...userIds),
        d1.prepare(`DELETE FROM users WHERE uid IN (${placeholders})`).bind(...userIds),
    ];
    const results = await d1.batch(statements);
    if (results.some((result) => !result.success)) throw createError({ statusCode: 500, message: 'Could not reset test data' });
    return { reset: true };
});
