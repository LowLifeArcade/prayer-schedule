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
                    <NuxtLink
                        class="library-link"
                        to="/prayers/public"
                    >
                        Public prayers
                    </NuxtLink>
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
        <main
            v-if="!loggedIn"
            class="home-page"
        >
            <section class="home-hero">
                <div class="hero-copy">
                    <p class="eyebrow">Catholic prayer, ordered for ordinary days</p>
                    <h2>Keep your devotions close to the rhythm of grace.</h2>
                    <p>
                        Prayer List helps you carry novenas, chaplets, intentions, and daily devotions without
                        turning prayer into another productivity score. Make a quiet plan, return faithfully, and
                        let the Church's seasons shape your day.
                    </p>
                    <div class="hero-actions">
                        <a
                            class="primary-action"
                            href="/auth/google"
                            >Begin with prayer</a
                        >
                        <a
                            class="secondary-action"
                            href="#features"
                            >See features</a
                        >
                    </div>
                </div>
                <div
                    class="hero-visual"
                    aria-label="Preview of Catholic prayer planning features"
                >
                    <div class="orbital-ring"></div>
                    <article class="prayer-preview main-preview">
                        <span>Today</span>
                        <h3>St. Joseph Novena</h3>
                        <p>Day 4: For steadfast work, family life, and a heart obedient to God.</p>
                        <div class="day-dots">
                            <span
                                v-for="day in 9"
                                :key="day"
                                :class="{ active: day === 4, complete: day < 4 }"
                            ></span>
                        </div>
                    </article>
                    <article class="prayer-preview intention-preview">
                        <span>Intentions</span>
                        <strong>For Anna's surgery</strong>
                    </article>
                    <article class="prayer-preview season-preview">
                        <span>Liturgical time</span>
                        <strong>Ordinary Time</strong>
                    </article>
                </div>
            </section>

            <section
                id="features"
                class="feature-section"
            >
                <div class="section-heading">
                    <p class="eyebrow">Features</p>
                    <h2>Built for real Catholic prayer habits.</h2>
                </div>
                <div class="feature-grid">
                    <article
                        v-for="feature in homeFeatures"
                        :key="feature.title"
                        class="feature-card"
                    >
                        <span class="feature-icon">{{ feature.icon }}</span>
                        <h3>{{ feature.title }}</h3>
                        <p>{{ feature.body }}</p>
                    </article>
                </div>
            </section>

            <section class="rhythm-section">
                <div class="rhythm-copy">
                    <p class="eyebrow">A gentler structure</p>
                    <h2>Reminders that serve recollection, not anxiety.</h2>
                    <p>
                        Keep a simple list for the prayers you mean to return to: the Rosary, Divine Mercy Chaplet,
                        a novena before a feast, lectio divina, or intercessions entrusted to you by friends.
                    </p>
                </div>
                <div class="rhythm-list">
                    <article
                        v-for="item in prayerRhythms"
                        :key="item.label"
                    >
                        <span>{{ item.time }}</span>
                        <div>
                            <h3>{{ item.label }}</h3>
                            <p>{{ item.body }}</p>
                        </div>
                    </article>
                </div>
            </section>

            <section class="closing-cta">
                <p class="eyebrow">Ora et labora</p>
                <h2>Make space for prayer before the day fills itself.</h2>
                <a
                    class="primary-action"
                    href="/auth/google"
                    >Log in to start</a
                >
            </section>
        </main>
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
                                    @click.stop="toggleMenu(item.id)"
                                />
                                <div
                                    v-if="openMenuId === item.id"
                                    class="ctx-menu"
                                    @click.stop
                                >
                                    <ul>
                                        <li @click.stop="onPrayerClick(item.id, item.currentDayNumber)">Open</li>
                                        <li
                                            v-if="item.isOwner"
                                            @click.stop="onEdit(item.id)"
                                        >
                                            Edit
                                        </li>
                                        <li
                                            class="delete danger"
                                            @click.stop="onDelete(item.id)"
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
                <span>Public prayer</span>
                <input
                    v-model="prayer.isPublic"
                    type="checkbox"
                    role="switch"
                />
                <span class="toggle-track"></span>
            </label>
            <label class="toggle-row">
                <span>Multi day prayer</span>
                <input
                    v-model="prayer.isMultiDay"
                    type="checkbox"
                    role="switch"
                    @change="onMultiDayToggle"
                />
                <span class="toggle-track"></span>
            </label>
            <div
                v-if="!prayer.isMultiDay"
                class="content-builder"
            >
                <div class="content-builder-header">
                    <h4>Prayer Content</h4>
                </div>
                <section
                    v-for="(block, index) in prayer.contentBlocks"
                    :key="block.id"
                    class="content-block"
                >
                    <div class="content-block-header">
                        <select
                            v-model="block.type"
                            class="block-type-select"
                            @change="syncBlockType(block)"
                        >
                            <option value="static">section</option>
                            <option value="image">image</option>
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
                    <input
                        v-if="block.type === 'static'"
                        v-model="block.title"
                        type="text"
                        placeholder="Optional section title"
                    />
                    <input
                        v-else
                        v-model="block.title"
                        type="text"
                        placeholder="Optional image title"
                    />
                    <textarea
                        v-if="block.type === 'static'"
                        v-model="block.body"
                        placeholder="Prayer text"
                    />
                    <div
                        v-else
                        class="image-block-editor"
                        @dragover.prevent
                        @drop.prevent="onImageDrop($event, (file) => setDisplayImage(block, file))"
                    >
                        <img
                            v-if="block.imageUrl"
                            class="image-block-preview"
                            :src="block.imageUrl"
                            :alt="block.alt || block.title || `Prayer image ${index + 1}`"
                        />
                        <input
                            v-model="block.imageUrl"
                            type="url"
                            placeholder="Image URL"
                        />
                        <input
                            v-model="block.alt"
                            type="text"
                            placeholder="Image description"
                        />
                        <label class="image-drop compact">
                            <span>Drop or choose display image</span>
                            <input
                                type="file"
                                accept="image/*"
                                @change="onDisplayImageFile(block, $event)"
                            />
                        </label>
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
                <div class="content-add-actions">
                    <button
                        type="button"
                        @click="addImageContentBlock"
                    >
                        Add image
                    </button>
                    <label>
                        Read image as text
                        <input
                            type="file"
                            accept="image/*"
                            @change="onTextImageFile"
                        />
                    </label>
                </div>
                <p
                    v-if="ocrStatus"
                    class="import-status"
                >
                    {{ ocrStatus }}
                </p>
            </div>
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
                                <option value="image">image</option>
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
                        <input
                            v-if="block.type === 'static'"
                            v-model="block.title"
                            type="text"
                            placeholder="Optional section title"
                        />
                        <input
                            v-else-if="block.type === 'image'"
                            v-model="block.title"
                            type="text"
                            placeholder="Optional image title"
                        />
                        <input
                            v-else
                            v-model="block.name"
                            type="text"
                            placeholder="Dynamic section name"
                        />
                        <textarea
                            v-if="block.type === 'static'"
                            v-model="block.body"
                            placeholder="This content appears every day"
                        />
                        <div
                            v-else-if="block.type === 'image'"
                            class="image-block-editor"
                            @dragover.prevent
                            @drop.prevent="onImageDrop($event, (file) => setDisplayImage(block, file))"
                        >
                            <img
                                v-if="block.imageUrl"
                                class="image-block-preview"
                                :src="block.imageUrl"
                                :alt="block.alt || block.title || 'Prayer image'"
                            />
                            <input
                                v-model="block.imageUrl"
                                type="url"
                                placeholder="Image URL"
                            />
                            <input
                                v-model="block.alt"
                                type="text"
                                placeholder="Image description"
                            />
                            <label class="image-drop compact">
                                <span>Drop or choose display image</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    @change="onDisplayImageFile(block, $event)"
                                />
                            </label>
                        </div>
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
                    <div class="content-add-actions">
                        <button
                            type="button"
                            @click="addImageContentBlock"
                        >
                            Add image
                        </button>
                        <label>
                            Read image as text
                            <input
                                type="file"
                                accept="image/*"
                                @change="onTextImageFile"
                            />
                        </label>
                    </div>
                    <p
                        v-if="ocrStatus"
                        class="import-status"
                    >
                        {{ ocrStatus }}
                    </p>
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
                        <section
                            v-for="block in dynamicContentBlocks"
                            :key="block.id"
                            class="dynamic-day"
                        >
                            <span>{{ getDynamicBlockLabel(block) }}</span>
                            <input
                                v-model="getDynamicDay(block, day.dayNumber).title"
                                type="text"
                                placeholder="Optional section title"
                            />
                            <textarea
                                v-model="getDynamicDay(block, day.dayNumber).body"
                                placeholder="Content for this day"
                            />
                            <label
                                class="image-drop compact"
                                @dragover.prevent
                                @drop.prevent="onImageDrop($event, (file) => addTextFromImage(file, day, block))"
                            >
                                <span>Read image as this day's text</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    @change="
                                        (event) =>
                                            addTextFromImage(event.target.files?.[0], day, block).then(() => (event.target.value = ''))
                                    "
                                />
                            </label>
                        </section>
                        <input
                            v-model="day.thumbnailImageUrl"
                            type="url"
                            placeholder="Thumbnail image URL"
                        />
                        <label
                            class="image-drop compact"
                            @dragover.prevent
                            @drop.prevent="onImageDrop($event, (file) => setDayThumbnailImage(day, file))"
                        >
                            <span>Drop or choose thumbnail image</span>
                            <input
                                type="file"
                                accept="image/*"
                                @change="onDayThumbnailImageFile(day, $event)"
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
const { ocrStatus, clearOcrStatus, imageFileToDataUrl, imageFileToText } = usePrayerImageTools();

const { data: prayers, pending, refresh, execute } = await useFetch('/api/prayers');
const displayedPrayers = ref([]);
const homeFeatures = [
    {
        icon: '✚',
        title: 'Novenas and multi-day prayers',
        body: 'Create a prayer once, then move day by day with the right text, image, and intention ready when you return.',
    },
    {
        icon: '☩',
        title: 'Intentions kept with care',
        body: 'Hold names, needs, and entrusted petitions in one place without making them feel like tasks to clear.',
    },
    {
        icon: '✦',
        title: 'Liturgical awareness',
        body: 'Shape personal devotion around seasons, feasts, solemnities, and the ordinary fidelity of daily prayer.',
    },
    {
        icon: '◐',
        title: 'Quiet progress',
        body: 'See where you are in a devotion without streak pressure, badges, or pretending grace can be measured.',
    },
];
const prayerRhythms = [
    {
        time: 'Morning',
        label: 'Offer the day',
        body: 'Begin with a prayer, a saint, or a simple intention before work starts pulling at you.',
    },
    {
        time: 'Midday',
        label: 'Return briefly',
        body: 'Open the devotion you are carrying and recollect yourself in the middle of ordinary duties.',
    },
    {
        time: 'Evening',
        label: 'Close in gratitude',
        body: 'Pray an examen, finish a novena day, or entrust tomorrow to the Lord with peace.',
    },
];

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
        title: '',
        body: '',
    }));
const createContentBlock = (type = 'static', dayCount = 2) => ({
    id: `${Date.now()}-${Math.random()}`,
    type,
    name: '',
    title: '',
    body: '',
    imageUrl: '',
    alt: '',
    days: type === 'dynamic' ? createDynamicDays(dayCount) : [],
});
const initialState = () => ({
    title: null,
    body: null,
    isPublic: false,
    isMultiDay: false,
    dayCount: 2,
    contentBlocks: [createContentBlock('static')],
    days: [
        { dayNumber: 1, title: '', imageUrl: '', thumbnailImageUrl: '' },
        { dayNumber: 2, title: '', imageUrl: '', thumbnailImageUrl: '' },
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

function onEdit(prayerId) {
    closeMenu();
    router.push(`/prayer/${prayerId}/edit`);
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
            thumbnailImageUrl: '',
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
                title: '',
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
    prayer.contentBlocks.push(createContentBlock(prayer.isMultiDay ? type : type === 'image' ? 'image' : 'static', prayer.dayCount));
}

function addImageContentBlock() {
    addContentBlock('image');
}

function syncBlockType(block) {
    if (!prayer.isMultiDay && block.type === 'dynamic') {
        block.type = 'static';
    }

    if (block.type === 'dynamic' && !block.days?.length) {
        block.days = createDynamicDays(prayer.dayCount);
    }

    if (block.type !== 'dynamic') {
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
            title: '',
            body: '',
        };
        block.days.push(day);
        block.days.sort((a, b) => a.dayNumber - b.dayNumber);
    }

    return day;
}

function getDynamicBlockLabel(block) {
    const name = block.name?.trim();
    if (name) {
        return name;
    }

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

async function onImageDrop(event, handler) {
    const file = event.dataTransfer?.files?.[0];

    if (file) {
        await handler(file);
    }
}

async function onDisplayImageFile(block, event) {
    const file = event.target.files?.[0];

    if (!file) {
        return;
    }

    await setDisplayImage(block, file);
    event.target.value = '';
}

async function onDayThumbnailImageFile(day, event) {
    const file = event.target.files?.[0];

    if (!file) {
        return;
    }

    await setDayThumbnailImage(day, file);
    event.target.value = '';
}

async function setDisplayImage(block, file) {
    try {
        block.type = 'image';
        block.imageUrl = await imageFileToDataUrl(file);
        block.alt = block.alt || file.name.replace(/\.[^.]+$/, '');
        clearOcrStatus();
    } catch (error) {
        console.error({ error });
    }
}

async function setDayThumbnailImage(day, file) {
    try {
        day.thumbnailImageUrl = await imageFileToDataUrl(file);
        clearOcrStatus();
    } catch (error) {
        console.error({ error });
    }
}

async function addDisplayImageFromFile(file) {
    if (!file) {
        return;
    }

    const block = createContentBlock('image', prayer.dayCount);
    await setDisplayImage(block, file);

    if (block.imageUrl) {
        prayer.contentBlocks.push(block);
    }
}

async function onTextImageFile(event) {
    const file = event.target.files?.[0];

    if (!file) {
        return;
    }

    await addTextFromImage(file);
    event.target.value = '';
}

async function addTextFromImage(file, targetDay = null, block = null) {
    if (!file) {
        return;
    }

    try {
        const text = await imageFileToText(file);

        if (targetDay && block) {
            const day = getDynamicDay(block, targetDay.dayNumber);
            day.body = [day.body, text].filter(Boolean).join('\n\n');
            return;
        }

        if (!prayer.isMultiDay) {
            prayer.contentBlocks.push({
                ...createContentBlock('static', prayer.dayCount),
                title: 'Imported image text',
                body: text,
            });
            return;
        }

        prayer.contentBlocks.push({
            ...createContentBlock('static', prayer.dayCount),
            title: 'Imported image text',
            body: text,
        });
    } catch (error) {
        clearOcrStatus();
        console.error({ error });
    }
}

function serializeContentBlocks() {
    return prayer.contentBlocks
        .filter((block) => prayer.isMultiDay || block.type !== 'dynamic')
        .map((block) => {
        if (block.type === 'dynamic') {
            return {
                id: block.id,
                type: 'dynamic',
                name: block.name,
                days: block.days.map((day) => ({
                    dayNumber: day.dayNumber,
                    title: day.title,
                    body: day.body,
                })),
            };
        }

        if (block.type === 'image') {
            return {
                id: block.id,
                type: 'image',
                title: block.title,
                imageUrl: block.imageUrl,
                alt: block.alt,
            };
        }

        return {
            id: block.id,
            type: 'static',
            title: block.title,
            body: block.body,
        };
    });
}

function buildPrayerPayload() {
    if (!prayer.isMultiDay) {
        return {
            title: prayer.title,
            body: '',
            visibility: prayer.isPublic ? 'public' : 'private',
            contentBlocks: serializeContentBlocks(),
        };
    }

    syncDays();

    const days = prayer.days.map((day) => ({
        dayNumber: day.dayNumber,
        title: day.title,
        body: getDynamicDayBody(day.dayNumber),
        imageUrl: day.imageUrl,
        thumbnailImageUrl: day.thumbnailImageUrl,
        contentMode: 'dynamic',
    }));

    return {
        title: prayer.title,
        visibility: prayer.isPublic ? 'public' : 'private',
        contentBlocks: serializeContentBlocks(),
        days,
    };
}

function onMultiDayToggle() {
    if (prayer.isMultiDay && !prayer.contentBlocks.some((block) => block.type === 'dynamic')) {
        prayer.contentBlocks.push(createContentBlock('dynamic', prayer.dayCount));
    }

    if (!prayer.isMultiDay) {
        prayer.contentBlocks = prayer.contentBlocks.map((block) =>
            block.type === 'dynamic'
                ? {
                      ...createContentBlock('static', prayer.dayCount),
                      title: block.name || block.title || '',
                      body: block.days?.[0]?.body || '',
                  }
                : block,
        );
    }

    syncDays();
}
</script>

<style scoped>
.v-prayers {
    overflow-x: clip;

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
            justify-items: end;
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

            .library-link {
                display: inline-flex;
                align-items: center;
                min-height: 4rem;
                padding: 0.8rem 1rem;
                border: 1px solid var(--color-border);
                border-radius: 0.8rem;
                color: var(--color-text);
                font-size: 1.4rem;
                font-weight: 800;
                text-decoration: none;
            }
        }

        .login {
            display: grid;
            place-items: center;
            font-weight: 600;
            }
        }

        .home-page {
            display: grid;
            gap: 8rem;
            padding: 2rem 0 7rem;
        }

        .eyebrow {
            color: #9f3429;
            font-size: 1.3rem;
            font-weight: 800;
            letter-spacing: 0;
            text-transform: uppercase;
        }

        .home-hero {
            position: relative;
            display: grid;
            grid-template-columns: minmax(0, 1.02fr) minmax(34rem, 0.98fr);
            align-items: center;
            gap: 5rem;
            min-height: min(76rem, calc(100vh - 13rem));
            padding: 5rem 0 7rem;
            border-bottom: 1px solid var(--color-border);
            overflow: hidden;
        }

        .hero-copy {
            display: grid;
            gap: 2rem;
            max-width: 78rem;
            animation: rise-in 700ms ease both;

            h2 {
                max-width: 12ch;
                font-size: clamp(5rem, 9vw, 12rem);
                line-height: 0.88;
                letter-spacing: 0;
            }

            p:not(.eyebrow) {
                max-width: 68rem;
                color: var(--color-text-muted);
                font-size: clamp(1.8rem, 2vw, 2.3rem);
                line-height: 1.45;
            }
        }

        .hero-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 1.2rem;
            margin-top: 1rem;
        }

        .primary-action,
        .secondary-action {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 5.4rem;
            padding: 1.3rem 2rem;
            border-radius: 0.8rem;
            font-weight: 800;
            transition:
                transform 180ms ease,
                box-shadow 180ms ease,
                background-color 180ms ease;

            &:hover {
                transform: translateY(-2px);
            }
        }

        .primary-action {
            background: #b63b31;
            color: #fff;
            box-shadow: 0 1.8rem 4rem rgba(91, 24, 18, 0.24);
        }

        .secondary-action {
            border: 1px solid var(--color-border-2);
            background: var(--color-surface);
            color: var(--color-text);
        }

        .hero-visual {
            position: relative;
            min-height: 54rem;
            overflow: clip;
            animation: float-in 900ms 120ms ease both;
        }

        .hero-visual::before {
            content: '';
            position: absolute;
            inset: 7rem 4rem 5rem;
            border: 1px solid color-mix(in srgb, var(--color-text) 12%, transparent);
            border-radius: 50%;
            transform: rotate(-14deg);
            animation: slow-turn 18s linear infinite;
        }

        .orbital-ring {
            position: absolute;
            inset: 2rem 7rem;
            border: 0.2rem solid color-mix(in srgb, #b63b31 36%, transparent);
            border-radius: 50%;
            transform: rotate(19deg);
            animation: slow-turn 24s linear infinite reverse;
        }

        .prayer-preview {
            position: absolute;
            display: grid;
            gap: 1rem;
            width: min(34rem, 82%);
            padding: 2rem;
            border: 1px solid var(--color-border);
            border-radius: 0.8rem;
            background:
                linear-gradient(135deg, color-mix(in srgb, var(--color-surface) 92%, #ffffff), var(--color-surface)),
                var(--color-surface);
            box-shadow: 0 2.2rem 6rem rgba(0, 0, 0, 0.16);

            span {
                color: #2f7464;
                font-size: 1.2rem;
                font-weight: 800;
                text-transform: uppercase;
            }

            h3 {
                font-size: 2.6rem;
                line-height: 1.05;
            }

            p {
                color: var(--color-text-muted);
                font-size: 1.5rem;
                line-height: 1.45;
            }
        }

        .main-preview {
            top: 10rem;
            left: 8%;
            z-index: 2;
            animation: card-drift 6s ease-in-out infinite;
        }

        .intention-preview,
        .season-preview {
            width: min(26rem, 68%);
            z-index: 3;

            strong {
                font-size: 1.8rem;
            }
        }

        .intention-preview {
            right: 0;
            top: 4rem;
            animation: card-drift 7s 300ms ease-in-out infinite;
        }

        .season-preview {
            right: 8%;
            bottom: 8rem;
            animation: card-drift 8s 600ms ease-in-out infinite;
        }

        .day-dots {
            display: grid;
            grid-template-columns: repeat(9, 1fr);
            gap: 0.5rem;
            margin-top: 0.6rem;

            span {
                display: block;
                height: 0.8rem;
                border-radius: 999px;
                background: var(--color-surface-2);
            }

            .complete {
                background: #2f7464;
            }

            .active {
                background: #b63b31;
                box-shadow: 0 0 0 0.4rem color-mix(in srgb, #b63b31 16%, transparent);
            }
        }

        .feature-section,
        .rhythm-section,
        .closing-cta {
            animation: rise-in 700ms 160ms ease both;
        }

        .section-heading,
        .rhythm-copy,
        .closing-cta {
            display: grid;
            gap: 1rem;

            h2 {
                max-width: 72rem;
                font-size: clamp(3.4rem, 5vw, 6.8rem);
                line-height: 0.95;
                letter-spacing: 0;
            }

            p:not(.eyebrow) {
                color: var(--color-text-muted);
                line-height: 1.5;
            }
        }

        .feature-section {
            display: grid;
            gap: 3rem;
        }

        .feature-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 1.5rem;
        }

        .feature-card {
            display: grid;
            align-content: start;
            gap: 1.2rem;
            min-height: 28rem;
            padding: 2rem;
            border: 1px solid var(--color-border);
            border-radius: 0.8rem;
            background: var(--color-surface);
            transition:
                transform 180ms ease,
                border-color 180ms ease,
                box-shadow 180ms ease;

            &:hover {
                transform: translateY(-0.4rem);
                border-color: color-mix(in srgb, #b63b31 44%, var(--color-border));
                box-shadow: 0 1.6rem 4rem rgba(0, 0, 0, 0.12);
            }

            .feature-icon {
                display: grid;
                place-items: center;
                width: 4.4rem;
                height: 4.4rem;
                border: 1px solid var(--color-border-2);
                border-radius: 999px;
                color: #b63b31;
                background: var(--color-bg);
                font-size: 2.2rem;
                line-height: 1;
            }

            h3 {
                font-size: 2.2rem;
                line-height: 1.05;
            }

            p {
                color: var(--color-text-muted);
                font-size: 1.55rem;
                line-height: 1.45;
            }
        }

        .rhythm-section {
            display: grid;
            grid-template-columns: minmax(0, 0.9fr) minmax(32rem, 1.1fr);
            gap: 4rem;
            align-items: start;
            padding-block: 2rem;
        }

        .rhythm-list {
            display: grid;
            gap: 1rem;

            article {
                display: grid;
                grid-template-columns: 10rem minmax(0, 1fr);
                gap: 1.6rem;
                padding: 1.7rem;
                border: 1px solid var(--color-border);
                border-radius: 0.8rem;
                background: var(--color-surface);
                transition:
                    transform 180ms ease,
                    background-color 180ms ease;

                &:hover {
                    transform: translateX(0.4rem);
                    background: color-mix(in srgb, var(--color-surface) 88%, #2f7464);
                }

                > span {
                    color: #2f7464;
                    font-size: 1.3rem;
                    font-weight: 800;
                    text-transform: uppercase;
                }

                h3 {
                    font-size: 2.1rem;
                }

                p {
                    color: var(--color-text-muted);
                    font-size: 1.5rem;
                    line-height: 1.45;
                }
            }
        }

        .closing-cta {
            align-items: start;
            padding: 4rem;
            border: 1px solid var(--color-border);
            border-radius: 0.8rem;
            background:
                linear-gradient(135deg, color-mix(in srgb, var(--color-surface) 92%, #b63b31), var(--color-surface)),
                var(--color-surface);

            .primary-action {
                justify-self: start;
                width: fit-content;
                min-width: 18rem;
            }
        }

        @media (width < 980px) {
            .home-hero,
            .rhythm-section {
                grid-template-columns: 1fr;
            }

            .home-hero {
                min-height: unset;
                padding-top: 2rem;
            }

            .hero-copy h2 {
                max-width: 11ch;
            }

            .hero-visual {
                min-height: 44rem;
            }

            .feature-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
        }

        @media (width < 640px) {
            .home-page {
                gap: 5rem;
            }

            .top-bar {
                align-items: flex-start;
                gap: 1.5rem;
            }

            .home-hero {
                gap: 2rem;
                padding-bottom: 5rem;
            }

            .hero-copy h2 {
                font-size: 5.2rem;
            }

            .hero-actions,
            .hero-actions .primary-action,
            .hero-actions .secondary-action {
                width: 100%;
            }

            .hero-visual {
                display: grid;
                gap: 1rem;
                min-height: unset;
                padding: 3rem 0;
            }

            .hero-visual::before {
                inset: 1rem 2rem;
            }

            .orbital-ring {
                inset: 0 4.5rem;
            }

            .prayer-preview,
            .main-preview,
            .intention-preview,
            .season-preview {
                position: relative;
                inset: unset;
                width: 100%;
                max-width: 100%;
                animation: none;
            }

            .feature-grid {
                grid-template-columns: 1fr;
            }

            .feature-card {
                min-height: unset;
            }

            .rhythm-list article {
                grid-template-columns: 1fr;
            }

            .closing-cta {
                padding: 2.2rem;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .hero-copy,
            .hero-visual,
            .main-preview,
            .intention-preview,
            .season-preview,
            .feature-section,
            .rhythm-section,
            .closing-cta,
            .orbital-ring,
            .hero-visual::before {
                animation: none;
            }

            .primary-action,
            .secondary-action,
            .feature-card,
            .rhythm-list article {
                transition: none;
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

        .image-import-actions,
        .content-add-actions {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 1rem;
        }

        .image-drop,
        .content-add-actions button,
        .content-add-actions label {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 4.8rem;
            padding: 1rem 1.4rem;
            border: 1px dashed var(--color-border-2);
            border-radius: 0.8rem;
            background: var(--color-surface);
            color: var(--color-text);
            cursor: pointer;
            font-size: 1.4rem;
            font-weight: 800;
        }

        .image-drop.compact {
            width: 100%;
            min-height: 5.6rem;
        }

        .image-drop input,
        .content-add-actions input {
            position: absolute;
            width: 1px;
            height: 1px;
            opacity: 0;
            pointer-events: none;
        }

        .import-status {
            color: var(--color-text-muted);
            font-size: 1.4rem;
            font-weight: 700;
        }

        .image-block-editor {
            display: grid;
            gap: 1rem;
        }

        .image-block-preview {
            display: block;
            width: 100%;
            max-height: 28rem;
            border-radius: 0.8rem;
            object-fit: contain;
            background: var(--color-surface-2);
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

@keyframes rise-in {
    from {
        opacity: 0;
        transform: translateY(2rem);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes float-in {
    from {
        opacity: 0;
        transform: translateY(2rem) scale(0.98);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes slow-turn {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

@keyframes card-drift {
    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-1rem);
    }
}
</style>
