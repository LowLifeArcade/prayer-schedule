const prayerDetailRequests = new Map<string, Promise<unknown>>();

function prayerDetailKey(prayerId: string | number, dayNumber?: string | number | null) {
    return `${prayerId}:${dayNumber || 'current'}`;
}

function prayerDetailQuery(dayNumber?: string | number | null) {
    return dayNumber ? { day: dayNumber } : undefined;
}

export function usePrayerDetailCache() {
    const cache = useState<Record<string, any>>('prayer-detail-cache', () => ({}));
    const activePrayerTransitionId = useState<string | null>('active-prayer-transition-id', () => null);

    function getCachedPrayerDetail(prayerId: string | number, dayNumber?: string | number | null) {
        return cache.value[prayerDetailKey(prayerId, dayNumber)];
    }

    function setCachedPrayerDetail(prayerId: string | number, dayNumber: string | number | null | undefined, value: any) {
        cache.value = {
            ...cache.value,
            [prayerDetailKey(prayerId, dayNumber)]: value,
        };
    }

    async function prefetchPrayerDetail(prayerId: string | number, dayNumber?: string | number | null) {
        const key = prayerDetailKey(prayerId, dayNumber);

        if (cache.value[key]) {
            return cache.value[key];
        }

        if (!prayerDetailRequests.has(key)) {
            prayerDetailRequests.set(
                key,
                $fetch(`/api/prayer/${prayerId}`, {
                    query: prayerDetailQuery(dayNumber),
                }).then((value: any) => {
                    setCachedPrayerDetail(prayerId, dayNumber, value);

                    if (value?.selectedDayNumber) {
                        setCachedPrayerDetail(prayerId, value.selectedDayNumber, value);
                    }

                    return value;
                }),
            );
        }

        try {
            return await prayerDetailRequests.get(key);
        } finally {
            prayerDetailRequests.delete(key);
        }
    }

    function prefetchPrayerDetails(prayers: Array<Record<string, any>> = []) {
        if (!import.meta.client || !prayers.length) {
            return;
        }

        const queue = prayers.flatMap((prayer) => {
            const days = prayer.days?.length ? prayer.days : [{ dayNumber: prayer.currentDayNumber }];

            return days.map((day: Record<string, any>) => ({
                prayerId: prayer.id,
                dayNumber: day.dayNumber || prayer.currentDayNumber,
            }));
        });

        const run = async () => {
            for (const item of queue) {
                try {
                    await prefetchPrayerDetail(item.prayerId, item.dayNumber);
                } catch (error) {
                    console.warn('Could not prefetch prayer detail', {
                        error,
                        prayerId: item.prayerId,
                        dayNumber: item.dayNumber,
                    });
                }
            }
        };

        const requestIdleCallback = window.requestIdleCallback || ((callback) => window.setTimeout(callback, 1));
        requestIdleCallback(() => {
            run();
        });
    }

    function toPrayerTransitionName(prayerId?: string | number | null) {
        return prayerId ? `prayer-${prayerId}` : 'none';
    }

    return {
        activePrayerTransitionId,
        getCachedPrayerDetail,
        prefetchPrayerDetail,
        prefetchPrayerDetails,
        setCachedPrayerDetail,
        toPrayerTransitionName,
    };
}
