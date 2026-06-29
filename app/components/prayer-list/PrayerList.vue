<template>
<div
    class="prayer-list-shell"
>
    <div class="prayer-list-actions">
        <button
            class="ctx-menu-btn"
            type="button"
            aria-label="Prayer list actions"
            :aria-expanded="openMenuId === listMenuId"
            @click.stop="toggleMenu(listMenuId)"
        >
            <SvgDots
                alt=""
                height="27"
                width="27"
            />
        </button>
        <div
            v-if="openMenuId === listMenuId"
            class="ctx-menu"
            role="menu"
            @click.stop
        >
            <ul>
                <li
                    role="menuitem"
                    tabindex="0"
                    @click.stop="onMarkAllCurrentDaysNotPrayed"
                    @keydown.enter.prevent.stop="onMarkAllCurrentDaysNotPrayed"
                >
                    Mark all not prayed
                </li>
            </ul>
        </div>
    </div>
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
            <div
                class="prayer"
                :class="{ 'is-opening': activePrayerTransitionId === String(item.id) }"
                :style="getPrayerTileStyle(item.id)"
            >
                <span
                    v-if="item.isPrayed"
                    class="prayed-badge"
                    aria-label="Prayed"
                    title="Prayed"
                >
                    ✓
                </span>
                <img
                    v-if="item.currentDayImageUrl"
                    class="prayer-image"
                    :src="item.currentDayImageUrl"
                    :alt="item.title"
                    @click="onPrayerClick(item.id, item.currentDayNumber)"
                />
                <div
                    class="title"
                    :class="{ 'title-hidden': item.showTitleInThumbnail === false }"
                >
                    <h3
                        v-if="item.showTitleInThumbnail !== false"
                        @click="onPrayerClick(item.id, item.currentDayNumber)"
                    >
                        {{ item.title }}
                    </h3>
                    <span class="ctx-menu-section">
                        <button
                            class="ctx-menu-btn"
                            type="button"
                            aria-label="Prayer actions"
                            :aria-expanded="openMenuId === item.id"
                            @click.stop="toggleMenu(item.id)"
                        >
                            <SvgDots
                                alt=""
                                height="27"
                                width="27"
                            />
                        </button>
                        <div
                            v-if="openMenuId === item.id"
                            class="ctx-menu"
                            role="menu"
                            @click.stop
                        >
                            <ul>
                                <li
                                    role="menuitem"
                                    tabindex="0"
                                    @click.stop="onPrayerClick(item.id, item.currentDayNumber)"
                                    @keydown.enter.prevent.stop="onPrayerClick(item.id, item.currentDayNumber)"
                                >
                                    Open
                                </li>
                                <li
                                    v-if="item.totalDays > 1"
                                    role="menuitem"
                                    tabindex="0"
                                    @click.stop="openRestartPrayerConfirm(item)"
                                    @keydown.enter.prevent.stop="openRestartPrayerConfirm(item)"
                                >
                                    Restart prayer
                                </li>
                                <li
                                    role="menuitem"
                                    tabindex="0"
                                    @click.stop="onTogglePrayerProgress(item)"
                                    @keydown.enter.prevent.stop="onTogglePrayerProgress(item)"
                                >
                                    {{ getProgressMenuLabel(item) }}
                                </li>
                                <li
                                    v-if="item.isOwner"
                                    role="menuitem"
                                    tabindex="0"
                                    @click.stop="onEdit(item.id)"
                                    @keydown.enter.prevent.stop="onEdit(item.id)"
                                >
                                    Edit
                                </li>
                                <li
                                    class="delete danger"
                                    role="menuitem"
                                    tabindex="0"
                                    @click.stop="onDelete(item.id)"
                                    @keydown.enter.prevent.stop="onDelete(item.id)"
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
    </VueDraggable>
</div>
</template>

<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus';
import type { PrayerSummary } from '~~/shared/prayer';

interface PrayerListActions {
    onMoved: (event: { data?: { id?: string }; newIndex?: number }) => void | Promise<void>;
    toggleMenu: (id: string) => void;
    markAllNotPrayed: () => void | Promise<void>;
    getTileStyle: (id: string) => Record<string, string>;
    openPrayer: (id: string, dayNumber: number) => void | Promise<void>;
    restartPrayer: (prayer: PrayerSummary) => void;
    toggleProgress: (prayer: PrayerSummary) => void | Promise<void>;
    getProgressLabel: (prayer: PrayerSummary) => string;
    editPrayer: (id: string) => void;
    deletePrayer: (id: string) => void | Promise<void>;
    selectDay: (id: string, dayNumber: number) => void;
}

const { activePrayerTransitionId, actions } = defineProps<{
    activePrayerTransitionId?: string | null;
    actions: PrayerListActions;
}>();
const displayedPrayers = defineModel<PrayerSummary[]>({ required: true });
const openMenuId = defineModel<string | null>('openMenuId', { default: null });
const listMenuId = 'prayer-list';
const {
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
} = actions;
</script>
