export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const db = useDatabase();

    const { user } = await getUserSession(event);
    if (!user || !id) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const { error, rows, success } = await db.sql`
        SELECT *
        FROM prayers as p
        JOIN prayer_bodies as pb
            ON p.id = pb.prayer_id
        WHERE p.user_id = ${user.uid}
            AND p.id = ${id}
    `;

    if (!success) {
        console.error({ error });
        throw createError({ statusCode: 422, statusMessage: 'there was a problem getting your prayer' });
    }

    return rows?.[0] || {};
});
