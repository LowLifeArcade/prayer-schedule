<template>
    <div
        v-if="loggedIn"
        class="v-prayer"
    >
        <div class="top container">
            <button
                class="back-btn"
                @click="router.back()"
            >
                < Go back
            </button>
        </div>
        <h1 class="container">{{ data?.title }}</h1>
        <div
            v-if="data?.totalDays > 1"
            class="day-controls container"
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
                        @click="onDayChange(day.dayNumber)"
                    >
                        {{ day.dayNumber }}
                    </button>
                </div>
            </div>
            <span
                v-if="data.selectedDayContentMode === 'dynamic'"
                class="dynamic-label"
            >
                Dynamic
            </span>
        </div>
        <img
            v-if="data?.selectedDayImageUrl"
            class="description-image container"
            :src="data.selectedDayImageUrl"
            :alt="data.selectedDayTitle || data.title"
        />
        <h2
            v-if="data?.selectedDayTitle"
            class="container"
        >
            {{ data.selectedDayTitle }}
        </h2>
        <p class="container">
            {{ data?.body }}
        </p>
        <div class="actions container">
            <button
                class="done-btn"
                @click="onDone"
            >
                {{ isSelectedDayComplete ? 'Mark not done' : 'Mark done' }}
            </button>
        </div>
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

const isSelectedDayComplete = computed(() => data.value?.completedDays?.includes(selectedDayNumber.value));

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
    h1 {
        margin-bottom: 1rem;
    }

    h2 {
        margin-block: 2rem 1rem;
    }

    .back-btn {
        cursor: pointer;
    }

    .day-controls {
        display: flex;
        align-items: flex-start;
        gap: 1.2rem;
        margin-bottom: 2rem;

        .day-picker {
            display: grid;
            gap: 0.8rem;
        }

        .day-picker > span {
            color: var(--color-text-muted);
            font-size: 1.2rem;
        }

        .day-options {
            display: flex;
            flex-wrap: wrap;
            gap: 0.6rem;
        }

        .day-option {
            display: grid;
            place-items: center;
            min-width: 3.6rem;
            height: 3.6rem;
            border: 1px solid var(--color-border-2);
            border-radius: 999px;
            background: var(--color-surface);
            color: var(--color-text);
            cursor: pointer;
            transition:
                background-color 160ms ease,
                border-color 160ms ease,
                transform 160ms ease;

            &:hover {
                transform: translateY(-1px);
            }

            &.current {
                border-color: var(--color-text);
                box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-text) 16%, transparent);
            }

            &.complete {
                color: var(--color-text-alt);
                background: var(--color-text);
            }
        }
    }

    .dynamic-label {
        border: 1px solid var(--color-border-2);
        border-radius: 0.6rem;
        padding: 0.4rem 0.8rem;
        font-size: 1.2rem;
    }

    .description-image {
        display: block;
        width: min(100%, 72rem);
        max-height: 34rem;
        object-fit: cover;
        border-radius: 0.8rem;
        margin-bottom: 2rem;
    }

    .actions {
        margin-top: 3rem;
    }

    .done-btn {
        cursor: pointer;
        padding: 1rem 1.6rem;
        border-radius: 0.8rem;
        background: var(--color-surface-2);

    }
}
</style>
