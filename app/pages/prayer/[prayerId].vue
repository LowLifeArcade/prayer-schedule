<template>
    <NuxtPage v-if="isEditing" />
    <div
        v-else-if="loggedIn"
        class="v-prayer"
    >
        <div class="top container">
            <button
                class="back-btn"
                @click="router.back()"
            >
                <span aria-hidden="true">&lt;</span>
                <span>Prayers</span>
            </button>
        </div>

        <main class="prayer-shell container">
            <section class="prayer-hero">
                <div class="hero-copy">
                    <p class="eyebrow">{{ dayLabel }}</p>
                    <h1>{{ data?.title }}</h1>
                    <p
                        v-if="data?.totalDays > 1"
                        class="progress-note"
                    >
                        {{ progressLabel }}
                    </p>
                </div>
                <div
                    v-if="data?.totalDays > 1"
                    class="day-controls"
                >
                    <div class="day-picker">
                        <span>Day</span>
                        <div class="day-options">
                            <button
                                v-for="day in data.days"
                                :key="day.dayNumber"
                                type="button"
                                class="day-option"
                                :class="{
                                    current: day.dayNumber === selectedDayNumber,
                                    complete: day.isComplete,
                                }"
                                :aria-label="`Open day ${day.dayNumber}`"
                                @click="onDayChange(day.dayNumber)"
                            >
                                {{ day.dayNumber }}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <figure
                v-if="data?.selectedDayImageUrl"
                class="image-wrap"
            >
                <img
                    class="description-image"
                    :src="data.selectedDayImageUrl"
                    :alt="data.selectedDayTitle || data.title"
                />
            </figure>

            <article class="prayer-card">
                <h2
                    v-if="data?.selectedDayTitle"
                    class="day-title"
                >
                    {{ data.selectedDayTitle }}
                </h2>

                <div
                    v-if="data?.selectedBlocks?.length"
                    class="prayer-content"
                >
                    <section
                        v-for="block in data.selectedBlocks"
                        :key="block.id"
                        class="prayer-section"
                        :class="{ dynamic: block.type === 'dynamic' }"
                    >
                        <h2
                            v-if="block.title"
                            class="section-title"
                        >
                            {{ block.title }}
                        </h2>
                        <p v-if="block.body">{{ block.body }}</p>
                    </section>
                </div>
                <p
                    v-else
                    class="prayer-body"
                >
                    {{ data?.body }}
                </p>

                <section
                    v-if="data?.selectedDayBody && !data?.selectedBlocks?.length"
                    class="day-content"
                >
                    <p>{{ data.selectedDayBody }}</p>
                </section>
            </article>

            <div class="actions">
                <button
                    class="edit-btn"
                    @click="router.push(`/prayer/${prayerId}/edit`)"
                >
                    Edit
                </button>
                <button
                    class="done-btn"
                    :class="{ complete: isSelectedDayComplete }"
                    @click="onDone"
                >
                    {{ isSelectedDayComplete ? 'Mark not prayed' : 'Mark prayed' }}
                </button>
            </div>
        </main>
    </div>
</template>

<script setup>
// use lib to adjust textwrap flow on the fly for when user pinch zooms
// https://www.npmjs.com/package/@chenglou/pretext
const route = useRoute();
const prayerId = route.params.prayerId;
const selectedDayNumber = computed(() => Number(route.query.day || data.value?.selectedDayNumber || 1));
const { data, pending, refresh } = useFetch(`/api/prayer/${prayerId}`, {
    query: computed(() => ({ day: route.query.day })),
});

const { loggedIn, user, fetch: refreshSession, clear, ready, openInPopup, session } = useUserSession();
const router = useRouter();
const isEditing = computed(() => route.name === 'prayer-prayerId-edit');

const isSelectedDayComplete = computed(() => data.value?.completedDays?.includes(selectedDayNumber.value));
const dayLabel = computed(() => {
    if (!data.value?.totalDays || data.value.totalDays <= 1) {
        return 'Prayer';
    }

    return `Day ${selectedDayNumber.value} of ${data.value.totalDays}`;
});
const progressLabel = computed(() => {
    const completed = data.value?.completedDays?.length || 0;
    const total = data.value?.totalDays || 0;

    return `${completed} of ${total} days prayed`;
});

async function onDayChange(dayNumber) {
    await router.replace({
        name: 'prayer-prayerId',
        params: {
            prayerId,
        },
        query: {
            day: dayNumber,
        },
    });
}

async function onDone() {
    const shouldComplete = !isSelectedDayComplete.value;

    await $fetch(`/api/prayer/${prayerId}/progress`, {
        method: 'post',
        body: {
            dayNumber: selectedDayNumber.value,
            isComplete: shouldComplete,
        },
    });

    if (shouldComplete) {
        await router.push('/');
        return;
    }

    await refresh();
}
</script>

<style>
.v-prayer {
    min-height: 100vh;
    padding-bottom: 6rem;
    background:
        linear-gradient(180deg, color-mix(in srgb, var(--color-surface) 78%, transparent), transparent 34rem),
        var(--color-bg);

    .top {
        padding-block: 2rem 1rem;
    }

    .prayer-shell {
        display: grid;
        gap: 2.4rem;
        max-width: 920px;
    }

    .back-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.8rem;
        min-height: 4rem;
        padding: 0.8rem 1rem;
        border: 1px solid var(--color-border);
        border-radius: 0.8rem;
        background: color-mix(in srgb, var(--color-surface) 72%, transparent);
        color: var(--color-text-muted);
        cursor: pointer;
        font-size: 1.5rem;
        font-weight: 700;
        transition:
            border-color 160ms ease,
            color 160ms ease,
            transform 160ms ease;

        &:hover {
            border-color: var(--color-border-2);
            color: var(--color-text);
            transform: translateY(-1px);
        }
    }

    .prayer-hero {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 2.4rem;
        padding-block: 1.2rem 0.4rem;

        @media (width < 720px) {
            align-items: stretch;
            flex-direction: column;
            gap: 1.8rem;
        }
    }

    .hero-copy {
        display: grid;
        gap: 0.8rem;
        /* min-width: 0; */
    }

    .eyebrow {
        color: var(--color-text-muted);
        font-size: 1.3rem;
        font-weight: 800;
        text-transform: uppercase;
    }

    h1 {
        max-width: 72rem;
        font-size: 7.2rem;
        line-height: 0.96;
        font-weight: 800;
    }

    .day-title {
        max-width: 68rem;
        font-size: 4.8rem;
        line-height: 1;
        margin-bottom: 2rem;
    }

    .section-title {
        max-width: 68rem;
        font-size: 3.6rem;
        line-height: 1.08;
        margin-bottom: 1.2rem;
    }

    .progress-note {
        color: var(--color-text-muted);
        font-size: 1.6rem;
    }

    .day-controls {
        display: flex;
        align-items: flex-start;
        gap: 1.2rem;
        min-width: min(100%, 28rem);

        .day-picker {
            display: grid;
            gap: 0.8rem;
            width: 100%;
        }

        .day-picker > span {
            color: var(--color-text-muted);
            font-size: 1.3rem;
            font-weight: 800;
            text-transform: uppercase;
        }

        .day-options {
            display: flex;
            flex-wrap: wrap;
            gap: 0.7rem;
        }

        .day-option {
            display: grid;
            place-items: center;
            width: 4rem;
            height: 4rem;
            border: 1px solid var(--color-border-2);
            border-radius: 0.8rem;
            background: var(--color-surface);
            color: var(--color-text);
            cursor: pointer;
            font-weight: 800;
            transition:
                background-color 160ms ease,
                border-color 160ms ease,
                transform 160ms ease;

            &:hover {
                transform: translateY(-1px);
            }

            &.current {
                border-color: var(--color-text);
                background: var(--color-bg);
                box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-text) 16%, transparent);
            }

            &.complete {
                color: var(--color-text-alt);
                background: var(--color-text);
            }
        }
    }

    .image-wrap {
        overflow: hidden;
        border: 1px solid var(--color-border);
        border-radius: 0.8rem;
        background: var(--color-surface);
        box-shadow: 0 2.4rem 5rem color-mix(in srgb, var(--black) 12%, transparent);
    }

    .description-image {
        display: block;
        width: 100%;
        max-height: 42rem;
        object-fit: cover;
    }

    .prayer-card {
        padding: 5.2rem;
        border: 1px solid var(--color-border);
        border-radius: 0.8rem;
        background: var(--color-surface);
        box-shadow: 0 1.8rem 4rem color-mix(in srgb, var(--black) 8%, transparent);
    }

    .prayer-content {
        display: grid;
        gap: 2.2rem;
    }

    .prayer-body,
    .prayer-section p,
    .day-content p {
        max-width: 68rem;
        color: var(--color-text);
        font-size: 2.4rem;
        line-height: 1.62;
        white-space: pre-wrap;
    }

    .prayer-content p.dynamic {
        padding-left: 2rem;
        border-left: 3px solid var(--color-border-2);
    }

    .day-content {
        margin-top: 3rem;
        padding-top: 3rem;
        border-top: 1px solid var(--color-border);
    }

    .actions {
        position: sticky;
        bottom: 1.6rem;
        display: flex;
        justify-content: flex-end;
        pointer-events: none;
    }

    .edit-btn,
    .done-btn {
        min-height: 5.6rem;
        padding: 1.4rem 2.2rem;
        border-radius: 0.8rem;
        cursor: pointer;
        font-weight: 800;
        pointer-events: auto;
        box-shadow: 0 1rem 2.4rem color-mix(in srgb, var(--black) 18%, transparent);
        transition:
            filter 160ms ease,
            transform 160ms ease;

        &:hover {
            filter: brightness(0.88);
            transform: translateY(-1px);
        }
    }

    .actions {
        gap: 1rem;
    }

    .edit-btn {
        border: 1px solid var(--color-border-2);
        background: var(--color-surface);
        color: var(--color-text);
    }

    .done-btn {
        border: 1px solid var(--color-text);
        background: var(--color-text);
        color: var(--color-text-alt);

        &.complete {
            border-color: var(--color-border-2);
            background: var(--color-surface);
            color: var(--color-text);
        }
    }

    @media (width < 560px) {
        .prayer-shell {
            gap: 1.8rem;
        }

        h1 {
            font-size: 4.4rem;
        }

        .day-title {
            font-size: 3.4rem;
        }

        .section-title {
            font-size: 2.8rem;
        }

        .prayer-card {
            padding: 2.2rem;
        }

        .prayer-body,
        .prayer-content p,
        .day-content p {
            font-size: 2rem;
        }

        .actions {
            align-items: stretch;
            flex-direction: column;
        }

        .edit-btn,
        .done-btn {
            width: 100%;
        }
    }
}
</style>
