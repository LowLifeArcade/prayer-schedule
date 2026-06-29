import { describe, expect, it, vi } from 'vitest';
import {
    PrayerNotFoundError,
    PrayerService,
    PrayerValidationError,
    type PrayerWriteRecord,
    type PrayerWriteRepository,
} from '../../server/domain/prayer-service';

function repository(updateResult = true) {
    return {
        create: vi.fn<(prayer: PrayerWriteRecord) => Promise<void>>().mockResolvedValue(undefined),
        update: vi.fn<(prayer: PrayerWriteRecord) => Promise<boolean>>().mockResolvedValue(updateResult),
    } satisfies PrayerWriteRepository;
}

describe('PrayerService', () => {
    it('normalizes and persists a new prayer', async () => {
        const repo = repository();
        const service = new PrayerService(repo, () => 'prayer-id');
        const result = await service.create('user-id', { title: '  Angelus  ', body: 'The Angel of the Lord' });
        expect(result).toMatchObject({ id: 'prayer-id', userId: 'user-id', title: 'Angelus' });
        expect(repo.create).toHaveBeenCalledWith(result);
    });

    it('rejects a blank title before persistence', async () => {
        const repo = repository();
        const service = new PrayerService(repo, () => 'prayer-id');
        await expect(service.create('user-id', { title: '  ' })).rejects.toBeInstanceOf(PrayerValidationError);
        expect(repo.create).not.toHaveBeenCalled();
    });

    it('reports an update for a prayer the repository cannot find', async () => {
        const service = new PrayerService(repository(false), () => 'unused');
        await expect(service.update('missing', 'user-id', { title: 'Rosary' })).rejects.toBeInstanceOf(PrayerNotFoundError);
    });
});
