import type { PrayerWriteRecord, PrayerWriteRepository } from '../domain/prayer-service';

export class D1PrayerWriteRepository implements PrayerWriteRepository {
    constructor(private readonly d1: D1Database) {}

    async create(prayer: PrayerWriteRecord) {
        const statements = [
            this.d1
                .prepare('INSERT INTO prayers (id, title, user_id, visibility, show_title_in_thumbnail, preview) VALUES (?, ?, ?, ?, ?, ?)')
                .bind(prayer.id, prayer.title, prayer.userId, prayer.visibility, prayer.showTitleInThumbnail ? 1 : 0, prayer.preview),
            this.d1.prepare('INSERT INTO prayer_bodies (prayer_id, body) VALUES (?, ?)').bind(prayer.id, prayer.serializedBody),
            this.d1
                .prepare(`
                    INSERT INTO prayer_positions (user_id, prayer_id, list_name, pos)
                    VALUES (?, ?, ?, (
                        SELECT COALESCE(MAX(pos), 0) + 1000
                        FROM prayer_positions
                        WHERE user_id = ? AND list_name = ?
                    ))`)
                .bind(prayer.userId, prayer.id, prayer.listName, prayer.userId, prayer.listName),
            ...this.dayStatements(prayer),
        ];
        const [result] = await this.d1.batch(statements);
        if (!result?.success) throw new Error(result?.error || 'Could not create prayer');
    }

    async update(prayer: PrayerWriteRecord) {
        const existing = await this.d1
            .prepare('SELECT id FROM prayers WHERE id = ? AND user_id = ? AND deleted_at IS NULL')
            .bind(prayer.id, prayer.userId)
            .first<{ id: string }>();
        if (!existing) return false;

        const statements = [
            this.d1
                .prepare(`UPDATE prayers
                    SET title = ?, preview = ?, updated_at = unixepoch(), visibility = ?, show_title_in_thumbnail = ?
                    WHERE id = ? AND user_id = ? AND deleted_at IS NULL`)
                .bind(
                    prayer.title,
                    prayer.preview,
                    prayer.visibility,
                    prayer.showTitleInThumbnail ? 1 : 0,
                    prayer.id,
                    prayer.userId,
                ),
            this.d1.prepare('UPDATE prayer_bodies SET body = ? WHERE prayer_id = ?').bind(prayer.serializedBody, prayer.id),
            this.d1.prepare('DELETE FROM prayer_days WHERE prayer_id = ?').bind(prayer.id),
            this.d1.prepare('DELETE FROM prayer_progress WHERE user_id = ? AND prayer_id = ?').bind(prayer.userId, prayer.id),
            ...this.dayStatements(prayer),
        ];
        const [result] = await this.d1.batch(statements);
        if (!result?.success) throw new Error(result?.error || 'Could not update prayer');
        return true;
    }

    private dayStatements(prayer: PrayerWriteRecord) {
        return prayer.days.map((day) =>
            this.d1
                .prepare(`INSERT INTO prayer_days
                    (prayer_id, day_number, title, body, image_url, thumbnail_image_url, content_mode)
                    VALUES (?, ?, ?, ?, ?, ?, ?)`)
                .bind(prayer.id, day.dayNumber, day.title, day.body, day.imageUrl, day.thumbnailImageUrl, day.contentMode),
        );
    }
}
