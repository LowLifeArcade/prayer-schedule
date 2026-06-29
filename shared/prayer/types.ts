export type PrayerVisibility = 'private' | 'public';
export type PrayerContentMode = 'static' | 'dynamic';

export interface PrayerDynamicContentDay {
    dayNumber: number;
    title: string;
    body: string;
}

export interface PrayerStaticContentBlock {
    id: string;
    type: 'static';
    title: string;
    body: string;
}

export interface PrayerDynamicContentBlock {
    id: string;
    type: 'dynamic';
    name: string;
    days: PrayerDynamicContentDay[];
}

export interface PrayerImageContentBlock {
    id: string;
    type: 'image';
    title: string;
    imageUrl: string;
    alt: string;
}

export type PrayerContentBlock = PrayerStaticContentBlock | PrayerDynamicContentBlock | PrayerImageContentBlock;

export interface PrayerDayInput {
    dayNumber: number;
    title: string | null;
    body: string;
    imageUrl: string | null;
    thumbnailImageUrl: string | null;
    contentMode: PrayerContentMode;
}

export interface PrayerWritePayload {
    title: string;
    body?: string;
    days?: unknown;
    contentBlocks?: unknown;
    listName?: string;
    visibility?: PrayerVisibility;
    showTitleInThumbnail?: boolean;
}

export interface NormalizedPrayerWritePayload {
    title: string;
    body: string;
    serializedBody: string;
    preview: string;
    days: PrayerDayInput[];
    contentBlocks: PrayerContentBlock[];
    listName: string;
    visibility: PrayerVisibility;
    showTitleInThumbnail: boolean;
}

export interface PrayerEditorDay {
    dayNumber: number;
    title: string;
    body?: string;
    imageUrl: string;
    thumbnailImageUrl: string;
}

export interface PrayerEditorContentBlock {
    id: string;
    type: PrayerContentBlock['type'];
    name: string;
    title: string;
    body: string;
    imageUrl: string;
    alt: string;
    days: PrayerDynamicContentDay[];
}

export interface PrayerEditorState {
    title: string;
    body: string;
    isPublic: boolean;
    showTitleInThumbnail: boolean;
    isMultiDay: boolean;
    dayCount: number;
    contentBlocks: PrayerEditorContentBlock[];
    days: PrayerEditorDay[];
}

export interface PrayerEditorLoadInput {
    id: string;
    title?: string;
    visibility?: PrayerVisibility;
    showTitleInThumbnail?: boolean;
    body?: string;
    editBody?: string;
    days?: PrayerEditorDay[];
    contentBlocks?: PrayerContentBlock[];
}

export interface SelectedPrayerContentBlock {
    id: string;
    type: PrayerContentBlock['type'];
    title: string;
    body: string;
    name?: string;
    imageUrl?: string;
    alt?: string;
}

export interface PrayerListDay {
    dayNumber: number;
    isComplete: boolean;
}

export interface PrayerSummary {
    id: string;
    title: string;
    user_id: string;
    visibility: PrayerVisibility;
    showTitleInThumbnail: boolean;
    preview: string;
    pos: number;
    isOwner: boolean;
    days: PrayerListDay[];
    totalDays: number;
    completedDays: number;
    isPrayed: boolean;
    currentDayNumber: number;
    currentDayPreview: string;
    currentDayImageUrl: string | null;
    hasDynamicContent: boolean;
}

export interface PublicPrayerSummary {
    id: string;
    title: string;
    showTitleInThumbnail: boolean;
    preview: string;
    creatorName: string | null;
    totalDays: number;
    isAdded: boolean;
    isOwner: boolean;
    readPreview: string;
}

export interface PrayerContentEnvelope {
    kind: 'prayer-content-blocks';
    version: 1;
    blocks: PrayerContentBlock[];
}
