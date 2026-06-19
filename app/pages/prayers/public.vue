<template>
    <main
        v-if="loggedIn"
        class="v-public-prayers container"
    >
        <header class="top-bar">
            <button
                class="back-btn"
                type="button"
                @click="router.push('/')"
            >
                <span aria-hidden="true">&lt;</span>
                <span>My prayers</span>
            </button>
            <h1>Public prayers</h1>
        </header>

        <section class="library-shell">
            <aside
                v-if="publicPrayers.length"
                class="prayer-list"
            >
                <button
                    v-for="prayer in publicPrayers"
                    :key="prayer.id"
                    type="button"
                    class="prayer-row"
                    :class="{ selected: prayer.id === selectedPrayerId }"
                    @click="selectedPrayerId = prayer.id"
                >
                    <strong>{{ prayer.title }}</strong>
                    <span>{{ prayer.totalDays }} {{ prayer.totalDays === 1 ? 'day' : 'days' }}</span>
                </button>
            </aside>

            <article
                v-if="selectedPrayer"
                class="prayer-reader"
            >
                <p class="eyebrow">{{ selectedPrayer.creatorName || 'Prayer List' }}</p>
                <h2>{{ selectedPrayer.title }}</h2>
                <p class="preview">{{ selectedPrayer.readPreview || selectedPrayer.preview }}</p>
                <div class="actions">
                    <button
                        class="secondary-btn"
                        type="button"
                        @click="router.push(`/prayer/${selectedPrayer.id}`)"
                    >
                        Read prayer
                    </button>
                    <button
                        class="primary-btn"
                        type="button"
                        :disabled="selectedPrayer.isAdded || selectedPrayer.isOwner || adding"
                        @click="onAddPrayer(selectedPrayer.id)"
                    >
                        {{ selectedPrayer.isAdded || selectedPrayer.isOwner ? 'In my prayers' : adding ? 'Adding' : 'Add to my prayers' }}
                    </button>
                </div>
            </article>

            <section
                v-else
                class="empty-state"
            >
                <h2>No public prayers yet</h2>
                <p>When someone makes a prayer public, it will appear here for others to pray with.</p>
            </section>
        </section>
    </main>
</template>

<script setup>
const router = useRouter();
const { loggedIn } = useUserSession();
const { data, refresh } = await useFetch('/api/prayers/public');
const publicPrayers = computed(() => data.value || []);
const selectedPrayerId = ref(null);
const adding = ref(false);

watch(
    publicPrayers,
    (items) => {
        if (!items.length) {
            selectedPrayerId.value = null;
            return;
        }

        if (!items.some((item) => item.id === selectedPrayerId.value)) {
            selectedPrayerId.value = items[0].id;
        }
    },
    { immediate: true },
);

const selectedPrayer = computed(() => publicPrayers.value.find((item) => item.id === selectedPrayerId.value));

async function onAddPrayer(prayerId) {
    adding.value = true;

    try {
        await $fetch(`/api/prayer/${prayerId}/add`, {
            method: 'post',
            body: {
                listName: 'default',
            },
        });
        await refresh();
    } finally {
        adding.value = false;
    }
}
</script>

<style scoped>
.v-public-prayers {
    min-height: 100vh;
    padding-block: 2rem 6rem;

    .top-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1.6rem;
        margin-bottom: 3rem;
    }

    h1 {
        font-size: 5.6rem;
        line-height: 1;
    }

    .back-btn,
    .primary-btn,
    .secondary-btn {
        min-height: 4.8rem;
        padding: 1rem 1.4rem;
        border-radius: 0.8rem;
        cursor: pointer;
        font-weight: 800;
    }

    .back-btn,
    .secondary-btn {
        border: 1px solid var(--color-border-2);
        background: var(--color-surface);
        color: var(--color-text);
    }

    .primary-btn {
        border: 1px solid var(--color-text);
        background: var(--color-text);
        color: var(--color-text-alt);
    }

    .primary-btn:disabled {
        cursor: not-allowed;
        opacity: 0.58;
    }

    .library-shell {
        display: grid;
        grid-template-columns: minmax(24rem, 34rem) minmax(0, 1fr);
        gap: 2rem;
        align-items: start;
    }

    .prayer-list,
    .prayer-reader,
    .empty-state {
        border: 1px solid var(--color-border);
        border-radius: 0.8rem;
        background: var(--color-surface);
    }

    .prayer-list {
        display: grid;
        overflow: hidden;
    }

    .prayer-row {
        display: grid;
        gap: 0.5rem;
        padding: 1.4rem;
        border: 0;
        border-bottom: 1px solid var(--color-border);
        background: transparent;
        color: var(--color-text);
        cursor: pointer;
        text-align: left;
    }

    .prayer-row.selected {
        background: var(--color-surface-2);
    }

    .prayer-row span,
    .eyebrow {
        color: var(--color-text-muted);
        font-size: 1.3rem;
        font-weight: 800;
        text-transform: uppercase;
    }

    .prayer-reader,
    .empty-state {
        display: grid;
        gap: 1.4rem;
        padding: 2.4rem;
    }

    h2 {
        font-size: 4rem;
        line-height: 1.08;
    }

    .preview {
        max-width: 72rem;
        font-size: 2.1rem;
        line-height: 1.6;
        white-space: pre-wrap;
    }

    .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-top: 1rem;
    }

    @media (width < 720px) {
        .top-bar {
            align-items: flex-start;
            flex-direction: column;
        }

        h1 {
            font-size: 4.2rem;
        }

        .library-shell {
            grid-template-columns: 1fr;
        }
    }
}
</style>
