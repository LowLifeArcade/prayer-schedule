<template>
    <div
        v-if="loggedIn"
        class="v-prayer-edit container"
    >
        <div class="top-bar">
            <button
                class="logo"
                type="button"
                @click="router.push('/')"
            >
                <h1>Edit Prayer</h1>
            </button>
        </div>

        <form
            class="prayer-form"
            @submit.prevent="onSave"
        >
            <header class="edit-mode">
                <p>Editing</p>
                <h2>{{ prayer.title || 'Untitled prayer' }}</h2>
            </header>

            <label
                for="title"
                class="title"
            >
                <h4>Title</h4>
                <input
                    v-model="prayer.title"
                    type="text"
                    name="title"
                    required
                />
            </label>
            <label class="toggle-row">
                <span>Multi day prayer</span>
                <input
                    v-model="prayer.isMultiDay"
                    type="checkbox"
                    role="switch"
                    @change="syncDays"
                />
                <span class="toggle-track"></span>
            </label>
            <label
                v-if="!prayer.isMultiDay"
                for="body"
                class="title"
            >
                <h4>Prayer</h4>
                <textarea
                    v-model="prayer.body"
                    name="body"
                />
            </label>
            <template v-if="prayer.isMultiDay">
                <div class="title">
                    <h4>Days</h4>
                    <div class="day-stepper">
                        <button
                            type="button"
                            aria-label="Remove a day"
                            :disabled="prayer.dayCount <= 2"
                            @click="changeDayCount(-1)"
                        >
                            -
                        </button>
                        <input
                            v-model.number="prayer.dayCount"
                            type="number"
                            name="dayCount"
                            inputmode="numeric"
                            min="2"
                            @input="syncDays"
                        />
                        <button
                            type="button"
                            aria-label="Add a day"
                            @click="changeDayCount(1)"
                        >
                            +
                        </button>
                    </div>
                </div>
                <div class="content-builder">
                    <div class="content-builder-header">
                        <h4>Prayer Content</h4>
                    </div>
                    <section
                        v-for="(block, index) in prayer.contentBlocks"
                        :key="block.id"
                        class="content-block"
                        :class="{ dynamic: block.type === 'dynamic' }"
                    >
                        <div class="content-block-header">
                            <select
                                v-model="block.type"
                                class="block-type-select"
                                @change="syncBlockType(block)"
                            >
                                <option value="static">static</option>
                                <option value="dynamic">dynamic</option>
                            </select>
                            <div class="content-block-tools">
                                <button
                                    type="button"
                                    aria-label="Move block up"
                                    :disabled="index === 0"
                                    @click="moveContentBlock(index, -1)"
                                >
                                    ^
                                </button>
                                <button
                                    type="button"
                                    aria-label="Move block down"
                                    :disabled="index === prayer.contentBlocks.length - 1"
                                    @click="moveContentBlock(index, 1)"
                                >
                                    v
                                </button>
                                <button
                                    type="button"
                                    class="remove-block-btn"
                                    aria-label="Remove content block"
                                    :disabled="prayer.contentBlocks.length <= 1"
                                    @click="removeContentBlock(block.id)"
                                >
                                    <SvgTrash />
                                </button>
                            </div>
                        </div>
                        <textarea
                            v-if="block.type === 'static'"
                            v-model="block.body"
                            placeholder="This content appears every day"
                        />
                        <div
                            v-else
                            class="dynamic-placeholder"
                        >
                            {{ getDynamicBlockLabel(block) }}
                        </div>
                    </section>
                    <button
                        type="button"
                        class="add-content-block-btn"
                        aria-label="Add content block"
                        @click="addContentBlock('static')"
                    >
                        <SvgPlus size="30" />
                    </button>
                </div>
                <section class="day-media-editor">
                    <section
                        v-for="day in prayer.days"
                        :key="day.dayNumber"
                        class="day-detail"
                    >
                        <div class="day-detail-header">
                            <h4>Day {{ day.dayNumber }}</h4>
                            <button
                                type="button"
                                class="remove-day-btn"
                                aria-label="Remove day"
                                :disabled="prayer.days.length <= 2"
                                @click="removeDay(day.dayNumber)"
                            >
                                <SvgTrash />
                            </button>
                        </div>
                        <input
                            v-model="day.title"
                            type="text"
                            placeholder="Optional day title"
                        />
                        <label
                            v-for="block in dynamicContentBlocks"
                            :key="block.id"
                            class="dynamic-day"
                        >
                            <span>{{ getDynamicBlockLabel(block) }}</span>
                            <textarea
                                v-model="getDynamicDay(block, day.dayNumber).body"
                                placeholder="Content for this day"
                            />
                        </label>
                        <input
                            v-model="day.imageUrl"
                            type="url"
                            placeholder="Description image URL"
                        />
                        <button
                            type="button"
                            class="add-dynamic-section-btn"
                            aria-label="Add dynamic section"
                            @click="addContentBlock('dynamic')"
                        >
                            <SvgPlus size="24" />
                        </button>
                    </section>
                </section>
            </template>
            <p
                v-if="errorMessage"
                class="error"
            >
                {{ errorMessage }}
            </p>
            <div class="btns">
                <button
                    type="submit"
                    class="btn form"
                    :disabled="saving"
                >
                    {{ saving ? 'Saving' : 'Save Changes' }}
                </button>
                <button
                    type="button"
                    class="btn cancel"
                    @click="router.back()"
                >
                    Cancel
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
const route = useRoute();
const router = useRouter();
const prayerId = route.params.prayerId;
const { loggedIn } = useUserSession();
const { data } = await useFetch(`/api/prayer/${prayerId}`);
const saving = ref(false);
const errorMessage = ref('');

const createDynamicDays = (dayCount) =>
    Array.from({ length: dayCount }, (_, index) => ({
        dayNumber: index + 1,
        body: '',
    }));
const createContentBlock = (type = 'static', dayCount = 2) => ({
    id: `${Date.now()}-${Math.random()}`,
    type,
    body: '',
    days: type === 'dynamic' ? createDynamicDays(dayCount) : [],
});
const initialState = () => ({
    title: '',
    body: '',
    isMultiDay: false,
    dayCount: 2,
    contentBlocks: [createContentBlock('static'), createContentBlock('dynamic')],
    days: [
        { dayNumber: 1, title: '', imageUrl: '' },
        { dayNumber: 2, title: '', imageUrl: '' },
    ],
});
const prayer = reactive(initialState());
const dynamicContentBlocks = computed(() => prayer.contentBlocks.filter((block) => block.type === 'dynamic'));

watch(
    data,
    (value) => {
        if (!value?.id) {
            return;
        }

        const dayCount = Math.max(value.days?.length || 0, 2);
        prayer.title = value.title || '';
        prayer.body = value.editBody || value.body || '';
        prayer.isMultiDay = Boolean(value.days?.length || value.contentBlocks?.length);
        prayer.dayCount = dayCount;
        prayer.days = value.days?.length
            ? value.days.map((day) => ({
                  dayNumber: day.dayNumber,
                  title: day.title || '',
                  imageUrl: day.imageUrl || '',
                  body: day.body || '',
              }))
            : initialState().days;
        if (value.contentBlocks?.length) {
            prayer.contentBlocks = value.contentBlocks.map((block) => ({
                id: block.id || `${Date.now()}-${Math.random()}`,
                type: block.type === 'dynamic' ? 'dynamic' : 'static',
                body: block.body || '',
                days: block.type === 'dynamic' ? block.days || createDynamicDays(dayCount) : [],
            }));
        } else if (value.days?.length) {
            prayer.contentBlocks = [
                {
                    ...createContentBlock('dynamic', dayCount),
                    days: value.days.map((day) => ({
                        dayNumber: day.dayNumber,
                        body: day.body || '',
                    })),
                },
            ];
        } else {
            prayer.contentBlocks = [createContentBlock('static', dayCount), createContentBlock('dynamic', dayCount)];
        }
        syncDays();
    },
    { immediate: true },
);

function syncDays() {
    const dayCount = Math.max(Number(prayer.dayCount) || 2, 2);
    prayer.dayCount = dayCount;

    while (prayer.days.length < dayCount) {
        prayer.days.push({
            dayNumber: prayer.days.length + 1,
            title: '',
            imageUrl: '',
        });
    }

    prayer.days.splice(dayCount);
    prayer.days.forEach((day, index) => {
        day.dayNumber = index + 1;
    });

    prayer.contentBlocks.forEach((block) => {
        if (block.type !== 'dynamic') {
            return;
        }

        while (block.days.length < dayCount) {
            block.days.push({
                dayNumber: block.days.length + 1,
                body: '',
            });
        }

        block.days.splice(dayCount);
        block.days.forEach((day, index) => {
            day.dayNumber = index + 1;
        });
    });
}

function changeDayCount(amount) {
    prayer.dayCount = Math.max(Number(prayer.dayCount) + amount || 2, 2);
    syncDays();
}

function removeDay(dayNumber) {
    if (prayer.days.length <= 2) {
        return;
    }

    const dayIndex = prayer.days.findIndex((day) => day.dayNumber === dayNumber);
    if (dayIndex === -1) {
        return;
    }

    prayer.days.splice(dayIndex, 1);
    prayer.dayCount = prayer.days.length;
    syncDays();
}

function addContentBlock(type) {
    syncDays();
    prayer.contentBlocks.push(createContentBlock(type, prayer.dayCount));
}

function syncBlockType(block) {
    if (block.type === 'dynamic' && !block.days?.length) {
        block.days = createDynamicDays(prayer.dayCount);
    }

    if (block.type === 'static') {
        block.days = [];
    }

    syncDays();
}

function removeContentBlock(id) {
    if (prayer.contentBlocks.length <= 1) {
        return;
    }

    prayer.contentBlocks = prayer.contentBlocks.filter((block) => block.id !== id);
}

function moveContentBlock(index, direction) {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= prayer.contentBlocks.length) {
        return;
    }

    const [block] = prayer.contentBlocks.splice(index, 1);
    prayer.contentBlocks.splice(nextIndex, 0, block);
}

function getDynamicDay(block, dayNumber) {
    let day = block.days.find((item) => item.dayNumber === dayNumber);

    if (!day) {
        day = {
            dayNumber,
            body: '',
        };
        block.days.push(day);
        block.days.sort((a, b) => a.dayNumber - b.dayNumber);
    }

    return day;
}

function getDynamicBlockLabel(block) {
    const dynamicIndex = dynamicContentBlocks.value.findIndex((item) => item.id === block.id);
    return `dynamic section ${dynamicIndex + 1}`;
}

function getDynamicDayBody(dayNumber) {
    return prayer.contentBlocks
        .filter((block) => block.type === 'dynamic')
        .map((block) => block.days.find((day) => day.dayNumber === dayNumber)?.body?.trim() || '')
        .filter(Boolean)
        .join('\n\n');
}

function serializeContentBlocks() {
    return prayer.contentBlocks.map((block) => {
        if (block.type === 'dynamic') {
            return {
                id: block.id,
                type: 'dynamic',
                days: block.days.map((day) => ({
                    dayNumber: day.dayNumber,
                    body: day.body,
                })),
            };
        }

        return {
            id: block.id,
            type: 'static',
            body: block.body,
        };
    });
}

function buildPrayerPayload() {
    if (!prayer.isMultiDay) {
        return {
            title: prayer.title,
            body: prayer.body,
        };
    }

    syncDays();

    const days = prayer.days.map((day) => ({
        dayNumber: day.dayNumber,
        title: day.title,
        body: getDynamicDayBody(day.dayNumber),
        imageUrl: day.imageUrl,
        contentMode: 'dynamic',
    }));

    return {
        title: prayer.title,
        contentBlocks: serializeContentBlocks(),
        days,
    };
}

async function onSave() {
    saving.value = true;
    errorMessage.value = '';

    try {
        await $fetch(`/api/prayer/${prayerId}`, {
            method: 'put',
            body: buildPrayerPayload(),
        });
        await router.push(`/prayer/${prayerId}`);
    } catch (error) {
        console.error({ error });
        errorMessage.value = 'Could not save this prayer.';
    } finally {
        saving.value = false;
    }
}
</script>

<style scoped>
.v-prayer-edit {
    min-height: 100vh;
    padding-bottom: 6rem;

    .top-bar {
        padding-block: 2rem;
        display: flex;
        justify-content: space-between;
    }

    .prayer-form {
        display: flex;
        flex-direction: column;
        gap: 3rem;
        max-width: 800px;
        margin-inline: auto;
    }

    .edit-mode {
        display: grid;
        gap: 0.8rem;
        padding: 1.4rem 1.6rem;
        border: 1px solid var(--color-border-2);
        border-left: 0.6rem solid firebrick;
        border-radius: 0.8rem;
        background: var(--color-surface);

        p {
            color: var(--color-text-muted);
            font-size: 1.3rem;
            font-weight: 800;
            text-transform: uppercase;
        }

        h2 {
            font-size: 2.4rem;
            line-height: 1.15;
        }
    }

    label h4,
    .title h4 {
        margin-bottom: 1rem;
    }

    textarea {
        field-sizing: content;
        min-height: 50rem;
        resize: none;
    }

    .toggle-row {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1.5rem;
        width: 100%;
        padding: 1.4rem 1.6rem;
        border: 1px solid var(--color-border-2);
        border-radius: 0.8rem;
        background: var(--color-surface);
        cursor: pointer;

        input {
            position: absolute;
            right: 1.6rem;
            width: 5rem;
            height: 3rem;
            opacity: 0;
            cursor: pointer;
        }

        .toggle-track {
            position: relative;
            width: 5rem;
            height: 3rem;
            flex: 0 0 auto;
            border: 1px solid var(--color-border-2);
            border-radius: 999px;
            background: var(--color-surface-2);
            transition:
                background-color 160ms ease,
                border-color 160ms ease;

            &::after {
                content: '';
                position: absolute;
                top: 0.3rem;
                left: 0.3rem;
                width: 2.2rem;
                height: 2.2rem;
                border-radius: 999px;
                background: var(--color-text-alt);
                box-shadow: 0 1px 4px rgba(0 0 0 / 0.25);
                transition: transform 160ms ease;
            }
        }

        input:checked + .toggle-track {
            border-color: var(--color-text);
            background: var(--color-text);

            &::after {
                transform: translateX(2rem);
            }
        }

        input:focus-visible + .toggle-track {
            outline: 2px solid var(--color-text);
            outline-offset: 3px;
        }
    }

    .day-stepper {
        display: grid;
        grid-template-columns: 5rem minmax(0, 1fr) 5rem;
        gap: 0.8rem;

        button,
        input {
            min-height: 5rem;
        }

        button {
            display: grid;
            place-items: center;
            border: 1px solid var(--color-border-2);
            border-radius: 0.8rem;
            background: var(--color-surface-2);
            font-size: 2.4rem;
            font-weight: 700;
            line-height: 1;

            &:disabled {
                cursor: not-allowed;
                opacity: 0.45;
            }
        }

        input {
            text-align: center;
        }
    }

    .content-builder,
    .day-media-editor {
        display: grid;
        gap: 1.4rem;
    }

    .content-builder-header,
    .content-block-header,
    .day-detail-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }

    .content-block,
    .day-detail {
        display: grid;
        gap: 1.2rem;
        padding: 1.6rem;
        border: 1px solid var(--color-border-2);
        border-radius: 0.8rem;
        background: var(--color-surface);
    }

    .content-block-tools {
        display: flex;
        flex-wrap: wrap;
        gap: 0.8rem;

        button {
            display: grid;
            place-items: center;
            min-width: 4.4rem;
            min-height: 4.4rem;
            border: 1px solid var(--color-border-2);
            border-radius: 0.8rem;
            background: var(--color-surface-2);

            &:disabled {
                cursor: not-allowed;
                opacity: 0.45;
            }
        }
    }

    .block-type-select {
        width: min(100%, 18rem);
        padding: 1.2rem;
        border: 1px solid var(--color-border-2);
        border-radius: 0.8rem;
        background: var(--color-surface-2);
        color: var(--color-text);
    }

    .dynamic-placeholder {
        padding: 1.5rem;
        border: 1px dashed var(--color-border-2);
        border-radius: 0.8rem;
        color: var(--color-text-muted);
    }

    .dynamic-day {
        display: grid;
        gap: 0.8rem;

        span {
            color: var(--color-text-muted);
            font-size: 1.3rem;
            font-weight: 800;
            text-transform: uppercase;
        }
    }

    .add-content-block-btn,
    .add-dynamic-section-btn,
    .remove-day-btn,
    .remove-block-btn {
        display: grid;
        place-items: center;
        min-width: 4.4rem;
        min-height: 4.4rem;
        border: 1px solid var(--color-border-2);
        border-radius: 0.8rem;
        background: var(--color-surface-2);

        &:disabled {
            cursor: not-allowed;
            opacity: 0.45;
        }
    }

    .error {
        color: var(--danger);
        font-weight: 700;
    }

    .btns {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
    }

    @media (width < 560px) {
        .top-bar {
            align-items: flex-start;
        }

        .logo {
            height: auto;
            min-height: 6rem;
        }

        .edit-mode h2 {
            font-size: 2rem;
        }

        .btns {
            flex-direction: column;
        }
    }
}
</style>
