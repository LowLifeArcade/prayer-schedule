// server/api/auth/google.get.ts
export default defineOAuthGoogleEventHandler({
    async onError(event, error) {
        console.log({ event, message: 'oauth error', error });
        return sendRedirect(event, '/');
    },
    async onSuccess(event, { user }) {
        const db = useDatabase();

        const { success, error, lastInsertRowid } = await db.sql`
            INSERT INTO users (sub, name, email, avatar) 
            VALUES (${user.sub}, ${user.name}, ${user.email}, ${user.picture})
            ON CONFLICT(sub) DO UPDATE SET
                name = excluded.name,
                email = excluded.email,
                avatar = excluded.avatar
        `;

        if (!success) {
            console.error({ error, message: 'problem creating or updating user' });
            return sendRedirect(event, '/');
        }

        await setUserSession(event, { user });
        return sendRedirect(event, '/');
    },
});
