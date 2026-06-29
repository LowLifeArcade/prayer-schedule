import type { PrayerWritePayload } from '~~/shared/prayer';
import { PrayerService, PrayerValidationError } from '../domain/prayer-service';
import { D1PrayerWriteRepository } from '../repositories/d1-prayer-write-repository';

export default defineEventHandler(async (event) => {
    const { user } = await getUserSession(event);
    if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' });

    const db = useDatabase();
    const d1 = (await db.getInstance()) as D1Database;
    const service = new PrayerService(new D1PrayerWriteRepository(d1), uuidv7);

    try {
        const prayer = await service.create(user.uid, await readBody<PrayerWritePayload>(event));
        return {
            message: 'success',
            id: prayer.id,
            title: prayer.title,
            body: prayer.serializedBody,
            visibility: prayer.visibility,
            showTitleInThumbnail: prayer.showTitleInThumbnail,
            days: prayer.days,
        };
    } catch (error) {
        if (error instanceof PrayerValidationError) {
            throw createError({ statusCode: 422, message: error.message });
        }
        console.error({ error });
        throw createError({ statusCode: 422, message: 'could not add prayer' });
    }
});
