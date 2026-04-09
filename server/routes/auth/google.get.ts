import type { D1Database } from '@cloudflare/workers-types';
import { ONE_DAY, ONE_HOUR } from '~~/server/constants/time';
import { uuidv7 } from '~~/server/utils/uuid';
import { OAUTH } from '~~/server/constants/auth';

// server/api/auth/google.get.ts
export default defineOAuthGoogleEventHandler({
    async onError(event, error) {
        console.log({ event, message: 'oauth error', error });
        return sendRedirect(event, '/');
    },
    async onSuccess(event, { user }) {
        const db = useDatabase();
        const d1 = (await db.getInstance()) as D1Database;

        try {
            const existing = await db.sql`
                SELECT u.uid
                FROM user_identities ui
                JOIN users u ON u.uid = ui.user_id
                WHERE ui.provider = ${OAUTH.google}
                AND ui.provider_uid = ${user.sub}
            `;

            let uid = existing.rows?.[0]?.uid as string;
            if (uid) {
                await db.sql`
                    UPDATE users
                    SET name = ${user.name},
                        email = ${user.email},
                        avatar_url = ${user.picture}
                    WHERE uid = ${uid}
                `;
            } else {
                try {
                    uid = uuidv7();
                    await d1.batch([
                        d1
                            .prepare(
                                `
                                    INSERT INTO users (uid, name, email, avatar_url)
                                    VALUES (?, ?, ?, ?)
                                `,
                            )
                            .bind(uid, user.name, user.email, user.picture),
                        d1
                            .prepare(
                                `
                                    INSERT INTO user_identities (user_id, provider, provider_uid)
                                    VALUES (?, ?, ?)
                                `,
                            )
                            .bind(uid, OAUTH.google, user.sub),
                    ]);
                } catch (innerError) {
                    throw innerError;
                }
            }
            await setUserSession(event, { user: { ...user, uid } }, { maxAge: ONE_HOUR });
        } catch (error) {
            console.error({ error, message: 'problem creating or updating user' });
            return sendRedirect(event, '/');
        }

        return sendRedirect(event, '/');
    },
});
