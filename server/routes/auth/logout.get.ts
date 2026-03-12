// server/routes/auth/logout.get.ts
export default defineEventHandler(async (event) => {
    await clearUserSession(event);
    return sendRedirect(event, '/');
});
