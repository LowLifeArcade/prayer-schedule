// server/api/auth/google.get.ts
export default defineOAuthGoogleEventHandler({
    async onError(event) {
        console.log({ event, error: 'oauth error' });
        return sendRedirect(event, '/');
    },
    async onSuccess(event, { user }) {
        await setUserSession(event, { user });
        return sendRedirect(event, '/');
    },
});
