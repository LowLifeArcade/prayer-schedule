import { normalizePrayerWritePayload } from '../../shared/prayer';
import type { NormalizedPrayerWritePayload, PrayerWritePayload } from '../../shared/prayer';

export interface PrayerWriteRecord extends NormalizedPrayerWritePayload {
    id: string;
    userId: string;
}

export interface PrayerWriteRepository {
    create(prayer: PrayerWriteRecord): Promise<void>;
    update(prayer: PrayerWriteRecord): Promise<boolean>;
}

export class PrayerValidationError extends Error {}
export class PrayerNotFoundError extends Error {}

export class PrayerService {
    constructor(
        private readonly repository: PrayerWriteRepository,
        private readonly createId: () => string,
    ) {}

    async create(userId: string, input: PrayerWritePayload) {
        const prayer = this.prepare(this.createId(), userId, input);
        await this.repository.create(prayer);
        return prayer;
    }

    async update(id: string, userId: string, input: PrayerWritePayload) {
        const prayer = this.prepare(id, userId, input);
        if (!(await this.repository.update(prayer))) throw new PrayerNotFoundError('Prayer not found');
        return prayer;
    }

    private prepare(id: string, userId: string, input: PrayerWritePayload): PrayerWriteRecord {
        const payload = normalizePrayerWritePayload(input);
        if (!payload.title) throw new PrayerValidationError('Title is required');
        return { id, userId, ...payload };
    }
}
