export default defineEventHandler(async event => {
    const { cloudflare } = event.context;
    const db = cloudflare.env.DB;

    const prayers = await db.prepare('SELECT * FROM prayers').all();
    return prayers.results;
});
