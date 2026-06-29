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
            @click="bsodRef?.focus()"
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
                        <span>{{ user?.given_name }}</span>
                        <div class="log-out">
                            <button @click="onLogout">Log Out</button>
                        </div>
                    </div>
                    <img
                        :src="user?.picture"
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
        <HomeGuestView v-if="!loggedIn" />
        <PrayerList
            v-show="loggedIn && !showAddPrayerForm"
            v-model="displayedPrayers"
            v-model:open-menu-id="openMenuId"
            :active-prayer-transition-id="activePrayerTransitionId"
            :actions="prayerListActions"
        />
        <button
            v-show="loggedIn && !showAddPrayerForm"
            class="add-prayer"
            type="button"
            @click="openPrayerEditor"
        >
            <SvgPlus />
        </button>
        <form
            v-show="loggedIn && showAddPrayerForm"
            class="prayer-form"
            @submit.prevent
        >
            <PrayerEditorFields :editor="editor" />
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
                    @click="showCancelConfirm = true"
                >
                    Cancel
                </button>
            </div>
        </form>
        <ConfirmModal
            :open="showCancelConfirm"
            title="Discard this prayer?"
            message="The prayer you are creating has not been saved."
            confirm-label="Discard"
            cancel-label="Keep editing"
            @confirm="confirmCancelCreate"
            @cancel="showCancelConfirm = false"
        />
        <ConfirmModal
            :open="Boolean(restartPrayer)"
            title="Restart this prayer?"
            :message="`This clears all prayed days for ${restartPrayer?.title || 'this prayer'} and puts it back on day 1.`"
            confirm-label="Restart"
            cancel-label="Keep progress"
            @confirm="confirmRestartPrayer"
            @cancel="restartPrayer = null"
        />
    </div>
</template>

<script setup lang="ts">
import type { PrayerSummary } from '~~/shared/prayer';

const { loggedIn, user, fetch: refreshSession, clear, ready, openInPopup, session } = useUserSession();
const router = useRouter();
const { ocrStatus, clearOcrStatus, imageFileToDataUrl, imageFileToText } = usePrayerImageTools();
const { activePrayerTransitionId, prefetchPrayerDetail, prefetchPrayerDetails, toPrayerTransitionName } = usePrayerDetailCache();

const { data: prayers, pending, refresh, execute } = await useFetch<PrayerSummary[]>('/api/prayers');
const displayedPrayers = ref<PrayerSummary[]>([]);
const sortPrayers = (items: PrayerSummary[] = []) => [...items].sort((a, b) => a.pos - b.pos);

watch(
    prayers,
    (items) => {
        displayedPrayers.value = sortPrayers(items || []);
    },
    { immediate: true },
);

watch(
    displayedPrayers,
    (items) => {
        if (loggedIn.value) {
            prefetchPrayerDetails(items);
        }
    },
    { immediate: true },
);

async function onMoved(e: { data?: { id?: string }; newIndex?: number }) {
    const prayersArr = displayedPrayers.value;
    const movedPrayerId = e.data?.id ?? (e.newIndex == null ? undefined : prayersArr[e.newIndex]?.id);
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

    prayersArr[prayeridx]!.pos = newPos;

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
const showCancelConfirm = ref(false);
const openPrayerEditor = () => {
    showAddPrayerForm.value = true;
};
const editor = usePrayerEditor();
const {
    prayer,
    dynamicContentBlocks,
    reset: resetPrayerEditor,
    syncDays,
    changeDayCount,
    addDay,
    removeDay,
    addContentBlock,
    addImageContentBlock,
    syncBlockType,
    removeContentBlock,
    moveContentBlock,
    getDynamicDay,
    getDynamicBlockLabel,
    onImageDrop,
    onDisplayImageFile,
    onDayThumbnailImageFile,
    addDisplayImageFromFile,
    onTextImageFile,
    addTextFromImage,
    buildPrayerPayload,
    onMultiDayToggle,
} = editor;
const openMenuId = ref<string | null>(null);
const restartPrayer = ref<PrayerSummary | null>(null);
const showBSOD = ref(false);
const bsodRef = ref<HTMLInputElement | null>(null);

const toggleMenu = (id: string) => {
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

function getPrayerTileStyle(prayerId: string) {
    const id = String(prayerId);

    return {
        viewTransitionName: activePrayerTransitionId.value === id ? toPrayerTransitionName(id) : 'none',
    };
}

async function onPrayerClick(prayerId: string, dayNumber: number) {
    closeMenu();
    const routeLocation = {
        name: 'prayer-prayerId',
        params: {
            prayerId,
        },
        query: dayNumber ? { day: dayNumber } : undefined,
    };
    const navigate = () => router.push(routeLocation);

    activePrayerTransitionId.value = String(prayerId);
    prefetchPrayerDetail(prayerId, dayNumber).catch((error) => {
        console.warn('Could not prefetch prayer detail before navigation', { error, prayerId, dayNumber });
    });

    if (import.meta.client && document.startViewTransition) {
        try {
            await document.startViewTransition(navigate).finished;
            return;
        } finally {
            activePrayerTransitionId.value = null;
        }
    }

    try {
        await navigate();
    } finally {
        window.setTimeout(() => {
            activePrayerTransitionId.value = null;
        }, 420);
    }
}

function onDaySelect(prayerId: string, dayNumber: number) {
    onPrayerClick(prayerId, dayNumber);
}

function isCurrentDayComplete(item: PrayerSummary) {
    const currentDayNumber = Number(item.currentDayNumber || 1);
    const currentDay = item.days?.find((day) => Number(day.dayNumber) === currentDayNumber);

    return currentDay?.isComplete ?? item.isPrayed;
}

function getProgressMenuLabel(item: PrayerSummary) {
    return isCurrentDayComplete(item) ? 'Mark not prayed' : 'Mark prayed';
}

async function setPrayerCurrentDayProgress(item: PrayerSummary, isComplete: boolean) {
    await $fetch(`/api/prayer/${item.id}/progress`, {
        method: 'post',
        body: {
            dayNumber: item.currentDayNumber || 1,
            isComplete,
        },
    });
}

async function onTogglePrayerProgress(item: PrayerSummary) {
    const shouldComplete = !isCurrentDayComplete(item);

    closeMenu();
    await setPrayerCurrentDayProgress(item, shouldComplete);
    await refresh();
}

function openRestartPrayerConfirm(item: PrayerSummary) {
    restartPrayer.value = item;
    closeMenu();
}

async function confirmRestartPrayer() {
    const item = restartPrayer.value;
    restartPrayer.value = null;

    if (!item) {
        return;
    }

    await $fetch(`/api/prayer/${item.id}/progress`, {
        method: 'post',
        body: {
            reset: true,
        },
    });
    await refresh();
}

async function onMarkAllCurrentDaysNotPrayed() {
    const items = displayedPrayers.value || [];

    closeMenu();
    await Promise.all(items.map((item) => setPrayerCurrentDayProgress(item, false)));
    await refresh();
}

function onEdit(prayerId: string) {
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
        resetPrayerEditor();
        refresh();
    } catch (error) {
        console.error({ error });
    }
}

function confirmCancelCreate() {
    showCancelConfirm.value = false;
    showAddPrayerForm.value = false;
    resetPrayerEditor();
    clearOcrStatus();
}

async function onDelete(id: string) {
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

const prayerListActions = {
    onMoved,
    toggleMenu,
    markAllNotPrayed: onMarkAllCurrentDaysNotPrayed,
    getTileStyle: getPrayerTileStyle,
    openPrayer: onPrayerClick,
    restartPrayer: openRestartPrayerConfirm,
    toggleProgress: onTogglePrayerProgress,
    getProgressLabel: getProgressMenuLabel,
    editPrayer: onEdit,
    deletePrayer: onDelete,
    selectDay: onDaySelect,
};

</script>
