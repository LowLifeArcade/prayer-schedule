<template>
    <div class="v-prayers container">
        <div
            v-if="openMenuIndex != null"
            class="overlay"
            @click="openMenuIndex = null"
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
                v-model="prayers"
                class="prayers"
                :delay="250"
                :delay-on-touch-only="true"
                :touch-start-threshold="8"
                element="ul"
                @end="onMoved"
            >
                <li v-for="(item, i) in sortedPrayers">
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
                                    @click="toggleMenu(i)"
                                />
                                <div
                                    v-if="openMenuIndex === i"
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
            <label
                for="body"
                class="title"
                v-if="!prayer.isMultiDay"
            >
                <h4>Prayer</h4>
                <textarea
                    v-model="prayer.body"
                    type="text"
                    name="body"
                />
            </label>
            <label class="check-row">
                <input
                    v-model="prayer.isMultiDay"
                    type="checkbox"
                />
                Multi day prayer
            </label>
            <template v-if="prayer.isMultiDay">
                <label
                    for="dayCount"
                    class="title"
                >
                    <h4>Days</h4>
                    <input
                        v-model.number="prayer.dayCount"
                        type="number"
                        name="dayCount"
                        min="2"
                        @input="syncDays"
                    />
                </label>
                <label
                    for="contentMode"
                    class="title"
                >
                    <h4>Content</h4>
                    <select
                        v-model="prayer.contentMode"
                        name="contentMode"
                        @change="syncDays"
                    >
                        <option value="static">Static day by day</option>
                        <option value="dynamic">Dynamic per day</option>
                    </select>
                </label>
                <template v-if="prayer.contentMode === 'dynamic'">
                    <label
                        for="dynamicTemplate"
                        class="title"
                    >
                        <h4>Dynamic Prayer Template</h4>
                        <textarea
                            v-model="prayer.dynamicTemplate"
                            name="dynamicTemplate"
                            placeholder="Use {{day}} and {{totalDays}} where the day should appear."
                        />
                    </label>
                    <label
                        for="imageUrl"
                        class="title"
                    >
                        <h4>Description Image URL</h4>
                        <input
                            v-model="prayer.imageUrl"
                            type="url"
                            name="imageUrl"
                        />
                    </label>
                </template>
                <template v-else>
                    <section
                        v-for="day in prayer.days"
                        :key="day.dayNumber"
                        class="day-editor"
                    >
                        <h4>Day {{ day.dayNumber }}</h4>
                        <input
                            v-model="day.title"
                            type="text"
                            placeholder="Optional day title"
                        />
                        <textarea
                            v-model="day.body"
                            placeholder="Prayer for this day"
                        />
                        <input
                            v-model="day.imageUrl"
                            type="url"
                            placeholder="Description image URL"
                        />
                    </section>
                </template>
            </template>
            <div class="btns">
                <button
                    class="btn form"
                    @click="onAddPrayer"
                >
                    Create
                </button>
                <button
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
const sortedPrayers = computed(() => [...(prayers.value || [])].sort((a, b) => (a.pos > b.pos ? 1 : -1)));

async function onMoved(e) {
    const prayersArr = prayers.value;
    const prayeridx = prayersArr.findIndex((p) => p.id === e.data.id);
    const nextPrayerPos = prayersArr[prayeridx + 1]?.pos;
    const prevPrayerPos = prayersArr[prayeridx - 1]?.pos;

    let newPos;
    if (nextPrayerPos && prevPrayerPos) {
        newPos = Math.floor((prevPrayerPos + nextPrayerPos) / 2);
    } else if (nextPrayerPos) {
        newPos = nextPrayerPos - 1000;
    } else if (prevPrayerPos) {
        newPos = prevPrayerPos + 1000;
    }

    await $fetch('/api/prayers', {
        method: 'post',
        body: {
            id: e.data.id,
            newPos,
            listName: 'default',
        },
    });

    refresh();
}

const showAddPrayerForm = ref(false);
const initialState = () => ({
    title: null,
    body: null,
    isMultiDay: false,
    dayCount: 2,
    contentMode: 'static',
    dynamicTemplate: '',
    imageUrl: '',
    days: [
        { dayNumber: 1, title: '', body: '', imageUrl: '' },
        { dayNumber: 2, title: '', body: '', imageUrl: '' },
    ],
});
const prayer = reactive(initialState());
const openMenuIndex = ref();
const showBSOD = ref();
const bsodRef = ref(null);

const toggleMenu = (i) => {
    openMenuIndex.value = openMenuIndex.value === i ? null : i;
};

const closeMenu = () => (openMenuIndex.value = null);
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
        const resp = await $fetch('/api/prayer', {
            method: 'delete',
            query: {
                id,
            },
        });
    } catch (error) {
        console.log({ error });
    }

    closeMenu();
    refresh();
}

function syncDays() {
    const dayCount = Math.max(Number(prayer.dayCount) || 2, 2);
    prayer.dayCount = dayCount;

    while (prayer.days.length < dayCount) {
        prayer.days.push({
            dayNumber: prayer.days.length + 1,
            title: '',
            body: '',
            imageUrl: '',
        });
    }

    prayer.days.splice(dayCount);
    prayer.days.forEach((day, index) => {
        day.dayNumber = index + 1;
    });
}

function renderDynamicTemplate(dayNumber) {
    return prayer.dynamicTemplate
        .replaceAll('{{day}}', String(dayNumber))
        .replaceAll('{{totalDays}}', String(prayer.dayCount));
}

function buildPrayerPayload() {
    if (!prayer.isMultiDay) {
        return {
            title: prayer.title,
            body: prayer.body,
        };
    }

    syncDays();

    const days =
        prayer.contentMode === 'dynamic'
            ? Array.from({ length: prayer.dayCount }, (_, index) => ({
                  dayNumber: index + 1,
                  title: `Day ${index + 1}`,
                  body: renderDynamicTemplate(index + 1),
                  imageUrl: prayer.imageUrl,
                  contentMode: 'dynamic',
              }))
            : prayer.days.map((day) => ({
                  dayNumber: day.dayNumber,
                  title: day.title,
                  body: day.body,
                  imageUrl: day.imageUrl,
                  contentMode: 'static',
              }));

    return {
        title: prayer.title,
        body: days[0]?.body || '',
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

        .check-row {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .day-editor {
            display: grid;
            gap: 1rem;
            padding: 1.6rem;
            border: 1px solid var(--color-border-2);
            border-radius: 0.8rem;

            textarea {
                min-height: 16rem;
            }
        }

        .btns {
            display: grid;
            gap: 2rem;
        }
    }
}
</style>
