// server/api/auth/google.get.ts
export default defineOAuthGoogleEventHandler({
    async onError(event, error) {
        console.log({ event, message: 'oauth error', error });
        return sendRedirect(event, '/');
    },
    async onSuccess(event, { user }) {
        await setUserSession(event, { user });
        return sendRedirect(event, '/');
    },
});
