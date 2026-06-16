<template>
    <div class="v-prayers container">
        <div
            v-if="openMenuId != null"
            class="overlay"
            @click="openMenuId = null"
        ></div>
        <div
            v-if="showBSOD"
            class="description"
            @click="bsodRef.focus()"
        >
            <pre>{{ prompt }}</pre>
            <input
                name=""
                ref="bsodRef"
                @keydown="showBSOD = false"
            />
        </div>
        <div class="top-bar">
            <div
                class="logo"
                @click="onLogoClick"
            >
                <h1>Prayer List</h1>
            </div>
            <div class="right-section">
                <div
                    v-if="loggedIn"
                    class="user"
                >
                    <div class="name-section">
                        <span>{{ user.given_name }}</span>
                        <div class="log-out">
                            <button @click="onLogout">Log Out</button>
                        </div>
                    </div>
                    <img
                        :src="user.picture"
                        alt=""
                        height="50"
                        width="50"
                    />
                </div>
                <div
                    v-else
                    class="login"
                >
                    <a
                        class="login"
                        href="/auth/google"
                        >Login</a
                    >
                </div>
                <ThemeToggle />
            </div>
        </div>
        <ul v-if="loggedIn && !showAddPrayerForm">
            <VueDraggable
                v-model="displayedPrayers"
                class="prayers"
                :delay="250"
                :delay-on-touch-only="true"
                :touch-start-threshold="8"
                element="ul"
                @end="onMoved"
            >
                <li
                    v-for="item in displayedPrayers"
                    :key="item.id"
                >
                    <div class="prayer">
                        <img
                            v-if="item.currentDayImageUrl"
                            class="prayer-image"
                            :src="item.currentDayImageUrl"
                            :alt="item.title"
                            @click="onPrayerClick(item.id, item.currentDayNumber)"
                        />
                        <div class="title">
                            <h3 @click="onPrayerClick(item.id, item.currentDayNumber)">{{ item.title }}</h3>
                            <span class="ctx-menu-section">
                                <SvgDots
                                    class="ctx-menu-btn"
                                    alt=""
                                    height="27"
                                    width="27"
                                    @click="toggleMenu(item.id)"
                                />
                                <div
                                    v-if="openMenuId === item.id"
                                    class="ctx-menu"
                                >
                                    <ul>
                                        <li>Open</li>
                                        <li
                                            class="delete danger"
                                            @click="onDelete(item.id)"
                                        >
                                            Delete <SvgTrash />
                                        </li>
                                    </ul>
                                </div>
                            </span>
                        </div>
                        <p @click="onPrayerClick(item.id, item.currentDayNumber)">
                            {{ item.currentDayPreview || item.preview }}
                        </p>
                        <div
                            v-if="item.totalDays > 1"
                            class="day-picker"
                            @click.stop
                        >
                            <span>Day</span>
                            <div class="day-options">
                                <button
                                    v-for="day in item.days"
                                    :key="day.dayNumber"
                                    type="button"
                                    class="day-option"
                                    :class="{
                                        current: day.dayNumber === item.currentDayNumber,
                                        complete: day.isComplete,
                                    }"
                                    @click="onDaySelect(item.id, day.dayNumber)"
                                >
                                    <span>{{ day.dayNumber }}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </li>
                <li v-if="!showAddPrayerForm">
                    <button
                        class="add-prayer"
                        @click="showAddPrayerForm = true"
                    >
                        <SvgPlus />
                    </button>
                </li>
            </VueDraggable>
        </ul>

        <form
            v-if="showAddPrayerForm"
            class="prayer-form"
            @submit.prevent
        >
            <label
                for="title"
                class="title"
            >
                <h4>Title</h4>
                <input
                    v-model="prayer.title"
                    type="text"
                    name="title"
                />
            </label>
            <label class="toggle-row">
                <span>Multi day prayer</span>
                <input
                    v-model="prayer.isMultiDay"
                    type="checkbox"
                    role="switch"
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
                    type="text"
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
            <div class="btns">
                <button
                    type="button"
                    class="btn form"
                    @click="onAddPrayer"
                >
                    Create
                </button>
                <button
                    type="button"
                    class="btn cancel"
                    @click="showAddPrayerForm = false"
                >
                    Cancel
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { VueDraggable } from 'vue-draggable-plus';

const { loggedIn, user, fetch: refreshSession, clear, ready, openInPopup, session } = useUserSession();
const router = useRouter();

const { data: prayers, pending, refresh, execute } = await useFetch('/api/prayers');
const displayedPrayers = ref([]);

const sortPrayers = (items = []) => [...items].sort((a, b) => a.pos - b.pos);

watch(
    prayers,
    (items) => {
        displayedPrayers.value = sortPrayers(items || []);
    },
    { immediate: true },
);

async function onMoved(e) {
    const prayersArr = displayedPrayers.value;
    const movedPrayerId = e.data?.id ?? prayersArr[e.newIndex]?.id;
    const prayeridx = prayersArr.findIndex((p) => p.id === movedPrayerId);

    if (prayeridx === -1) {
        return;
    }

    const nextPrayerPos = prayersArr[prayeridx + 1]?.pos;
    const prevPrayerPos = prayersArr[prayeridx - 1]?.pos;

    let newPos;
    if (nextPrayerPos != null && prevPrayerPos != null) {
        newPos = Math.floor((prevPrayerPos + nextPrayerPos) / 2);
    } else if (nextPrayerPos != null) {
        newPos = nextPrayerPos - 1000;
    } else if (prevPrayerPos != null) {
        newPos = prevPrayerPos + 1000;
    }

    if (newPos == null) {
        return;
    }

    prayersArr[prayeridx].pos = newPos;

    await $fetch('/api/prayers', {
        method: 'post',
        body: {
            id: movedPrayerId,
            newPos,
            listName: 'default',
        },
    });

    refresh();
}

const showAddPrayerForm = ref(false);
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
    title: null,
    body: null,
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
const openMenuId = ref();
const showBSOD = ref();
const bsodRef = ref(null);

const toggleMenu = (id) => {
    openMenuId.value = openMenuId.value === id ? null : id;
};

const closeMenu = () => (openMenuId.value = null);
const prompt = `C:\\WINDOWS>
C:\\Documents and Settings\\${user.value?.name || 'anonymous'}>

A fatal exception 0E has occurred at 0028:C0011E36 in VXD VMM(01) +
00010E36. The current application will be terminated.

*  Press any key to terminate the current application.
*  Press CTRL+ALT+DEL again to restart your computer. You will
   lose any unsaved information in all applications.

Press any key to continue _`;

async function onLogout() {
    await clear();
    refresh();
}

function onPrayerClick(prayerId, dayNumber) {
    closeMenu();
    router.push({
        name: 'prayer-prayerId',
        params: {
            prayerId,
        },
        query: dayNumber ? { day: dayNumber } : undefined,
    });
}

function onDaySelect(prayerId, dayNumber) {
    onPrayerClick(prayerId, dayNumber);
}

async function onLogoClick() {
    if (true) {
        return;
    }

    showBSOD.value = true;
    await nextTick();
    bsodRef.value?.focus();
}

async function onAddPrayer() {
    try {
        const payload = buildPrayerPayload();
        await $fetch('/api/prayer', {
            method: 'post',
            body: payload,
        });
        showAddPrayerForm.value = false;
        Object.assign(prayer, initialState());
        refresh();
    } catch (error) {
        console.error({ error });
    }
}

async function onDelete(id) {
    try {
        await $fetch('/api/prayer', {
            method: 'delete',
            query: {
                id,
            },
        });

        prayers.value = (prayers.value || []).filter((prayer) => prayer.id !== id);
        displayedPrayers.value = displayedPrayers.value.filter((prayer) => prayer.id !== id);
    } catch (error) {
        console.log({ error });
    }

    closeMenu();
    await refresh();
}

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

function addDay() {
    prayer.dayCount = prayer.days.length + 1;
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
</script>

<style scoped>
.v-prayers {
    .overlay {
        position: absolute;
        background-color: var(--color-bg-2);
        opacity: 0.2;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1;
    }

    .description {
        position: absolute;
        z-index: 100;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        /* background-color: #0000AA; */
        color: white;
        background: blue;

        input {
            background: blue;
            border: unset;
            color: white;
            width: 100%;

            &:focus {
                border: unset;
                outline: unset;
            }
        }
    }

    .top-bar {
        padding-block: 2rem;
        display: flex;
        justify-content: space-between;

        .right-section {
            display: grid;
            gap: 2rem;
        }

        .user {
            display: flex;
            align-items: center;
            gap: 2rem;

            .name-section {
                display: grid;
                gap: 0.5rem;

                .log-out {
                    font-size: 1.4rem;
                }
            }

            img {
                border-radius: 10rem;
            }
        }

        .login {
            display: grid;
            place-items: center;
            font-weight: 600;
        }
    }

    .prayers {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 2rem;
        margin-bottom: 3rem;

        @media (width < 1100px) {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        }

        @media (width < 800px) {
            grid-template-columns: repeat(2, 1fr);
        }

        .prayer,
        .add-prayer {
            padding: 2rem;
            min-height: 200px;
            border-radius: 1.3rem;
        }

        .prayer {
            border: 1px solid var(--color-border-2);
            background-color: var(--color-surface);
            cursor: pointer;
            display: flex;
            flex-direction: column;
            gap: 1rem;

            .prayer-image {
                width: 100%;
                aspect-ratio: 4 / 3;
                object-fit: cover;
                border-radius: 0.8rem;
                margin-bottom: 0.5rem;
            }

            .title {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                width: 100%;

                h3 {
                    cursor: pointer;
                    width: 100%;
                }

                .ctx-menu-section {
                    position: relative;

                    .ctx-menu-btn {
                        cursor: pointer;
                    }

                    .ctx-menu {
                        border-radius: 0.8rem;
                        position: absolute;
                        top: 0;
                        right: 0;
                        box-shadow: 0.1rem 0.1rem 0.4rem rgba(0 0 0 / 0.3);
                        padding: 1rem;
                        z-index: 1;
                        background: var(--color-surface-2);

                        ul {
                            display: grid;
                            gap: 1rem;

                            li {
                                cursor: pointer;
                            }

                            .delete {
                                display: flex;
                                align-items: center;
                                gap: 1rem;
                            }
                        }
                    }
                }
            }

            .day-picker {
                display: grid;
                gap: 0.7rem;
                cursor: default;
                font-size: 1.2rem;
                margin-top: auto;
                width: 100%;

                > span {
                    color: var(--color-text-muted);
                }

                .day-options {
                    display: flex;
                    gap: 0.5rem;
                    overflow-x: auto;
                    padding-bottom: 0.2rem;
                }

                .day-option {
                    --day-bg: var(--color-surface-2);
                    flex: 0 0 auto;
                    display: grid;
                    place-items: center;
                    width: 3rem;
                    height: 3rem;
                    border: 1px solid var(--color-border-2);
                    border-radius: 999px;
                    background: var(--day-bg);
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

            p {
                text-overflow: ellipsis;
                flex: 1 1 auto;
                width: 100%;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                cursor: pointer;
            }
        }

        .add-prayer {
            width: 100%;
            display: grid;
            place-items: center;
            height: 100%;
            background-color: var(--color-surface-2);
            transition: filter 200ms ease-in-out;

            &:hover {
                filter: brightness(1.5);
            }
        }
    }

    .prayer-form {
        display: flex;
        flex-direction: column;
        gap: 3rem;
        max-width: 800px;
        margin-inline: auto;

        label {
            h4 {
                margin-bottom: 1rem;
            }
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

        .content-block {
            display: grid;
            gap: 1rem;
            padding: 1.6rem;
            border: 2px dashed var(--color-border-2);
            border-radius: 0.8rem;
            background: transparent;

            textarea {
                min-height: 18rem;
                border-radius: 0.8rem;
            }
        }

        .content-block.dynamic {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            width: fit-content;
            max-width: 100%;
            padding: 0.7rem;
            border-style: solid;
            background: var(--color-surface);
        }

        .block-type-select {
            width: fit-content;
            min-height: 3.8rem;
            padding-inline: 1.2rem;
            border: 1px solid var(--color-border-2);
            border-radius: 0.6rem;
            background: var(--color-surface);
            color: var(--color-text);
            font-weight: 700;
        }

        .dynamic-placeholder {
            padding-inline: 0.8rem;
            color: var(--color-text-muted);
            font-weight: 700;
        }

        .add-content-block-btn {
            display: grid;
            place-items: center;
            width: min(18rem, 100%);
            min-height: 5.6rem;
            border: 1px solid var(--color-border-2);
            border-radius: 0.8rem;
            color: var(--color-text);
            background: var(--color-surface);
        }

        .day-detail {
            display: grid;
            gap: 1.4rem;
            padding: 2rem;
            border: 1px solid var(--color-border-2);
            border-radius: 1.2rem;
            background: var(--color-surface);
        }

        .dynamic-day,
        .day-detail {
            span {
                color: var(--color-text-muted);
                font-size: 1.2rem;
            }

            textarea {
                min-height: 12rem;
                border-radius: 0.8rem;
            }
        }

        .remove-block-btn,
        .remove-day-btn {
            display: grid;
            place-items: center;
            width: 4.4rem;
            height: 4.4rem;
            border: 1px solid var(--danger-border);
            border-radius: 0.8rem;
            color: var(--danger-text);
            background: var(--danger-bg);

            &:disabled {
                cursor: not-allowed;
                opacity: 0.45;
            }
        }

        .add-dynamic-section-btn {
            display: grid;
            place-items: center;
            min-height: 4.2rem;
            border: 1px solid var(--color-border-2);
            border-radius: 0.6rem;
            color: var(--color-text);
            background: transparent;
        }

        .add-day-btn {
            display: grid;
            place-items: center;
            min-height: 7rem;
            border: 1px dashed var(--color-border-2);
            border-radius: 0.8rem;
            color: var(--color-text);
            background: var(--color-surface);
        }

        .btns {
            display: grid;
            gap: 2rem;
        }
    }
}
</style>
