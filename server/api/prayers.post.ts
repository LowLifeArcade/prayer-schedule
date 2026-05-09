export default defineEventHandler(async (event) => {
    const { id, newPos, listName } = await readBody(event);
    const db = useDatabase();
    const { user } = await getUserSession(event);

    // const d1 = (await db.getInstance()) as D1Database;

    if (!user) {
        return ''
    }

    const { changes, error, rows, success } = await db.sql`
        UPDATE prayer_positions
        SET pos = ${newPos}
        WHERE prayer_id = ${id}
            AND user_id = ${user.uid}
            AND list_name = ${listName}
    `
    const row = await db.sql`
        SELECT pos
        FROM prayer_positions
        WHERE prayer_id = ${id}
            AND user_id = ${user.uid}
            AND list_name = ${listName}
    `

    return { message: 'success '}
});
