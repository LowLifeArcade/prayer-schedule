// server/plugins/error.ts
export default defineNitroPlugin((nitroApp) => {
    nitroApp.hooks.hook('error', (error: any, { event }) => {
        if (!event) {
            return;
        }

        if (error.statusCode && error.statusCode < 500) {
            return;
        }

        console.error({ error, message: 'uncaught' });

        // sendError(
        //     event,
        //     createError({
        //         statusCode: 500,
        //         statusMessage: 'Internal Server Error',
        //         message: error.message,
        //     }),
        // );
    });
});
