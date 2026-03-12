// server/plugins/error.ts
export default defineNitroPlugin((nitroApp) => {
    nitroApp.hooks.hook('error', (error, { event }) => {
        if (!event) return;

        sendError(
            event,
            createError({
                statusCode: 500,
                statusMessage: 'Internal Server Error',
                message: error.message,
            }),
        );
    });
});
