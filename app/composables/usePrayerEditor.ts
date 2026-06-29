import { computed, reactive } from 'vue';
import type { PrayerEditorContentBlock, PrayerEditorDay, PrayerEditorLoadInput, PrayerEditorState } from '~~/shared/prayer';

type ContentBlockType = PrayerEditorContentBlock['type'];

export function createDynamicDays(dayCount: number) {
    return Array.from({ length: dayCount }, (_, index) => ({ dayNumber: index + 1, title: '', body: '' }));
}

export function createEditorContentBlock(type: ContentBlockType = 'static', dayCount = 2): PrayerEditorContentBlock {
    return {
        id: `${Date.now()}-${Math.random()}`,
        type,
        name: '',
        title: '',
        body: '',
        imageUrl: '',
        alt: '',
        days: type === 'dynamic' ? createDynamicDays(dayCount) : [],
    };
}

export function createPrayerEditorState(): PrayerEditorState {
    return {
        title: '',
        body: '',
        isPublic: false,
        showTitleInThumbnail: true,
        isMultiDay: false,
        dayCount: 2,
        contentBlocks: [createEditorContentBlock()],
        days: [
            { dayNumber: 1, title: '', imageUrl: '', thumbnailImageUrl: '' },
            { dayNumber: 2, title: '', imageUrl: '', thumbnailImageUrl: '' },
        ],
    };
}

export function syncPrayerEditorDays(prayer: PrayerEditorState) {
    const dayCount = Math.max(Number(prayer.dayCount) || 2, 2);
    prayer.dayCount = dayCount;
    while (prayer.days.length < dayCount) {
        prayer.days.push({ dayNumber: prayer.days.length + 1, title: '', imageUrl: '', thumbnailImageUrl: '' });
    }
    prayer.days.splice(dayCount);
    prayer.days.forEach((day, index) => (day.dayNumber = index + 1));

    prayer.contentBlocks.forEach((block) => {
        if (block.type !== 'dynamic') return;
        while (block.days.length < dayCount) block.days.push({ dayNumber: block.days.length + 1, title: '', body: '' });
        block.days.splice(dayCount);
        block.days.forEach((day, index) => (day.dayNumber = index + 1));
    });
}

export function serializeEditorContentBlocks(prayer: PrayerEditorState) {
    return prayer.contentBlocks
        .filter((block) => prayer.isMultiDay || block.type !== 'dynamic')
        .map((block) => {
            if (block.type === 'dynamic') return { id: block.id, type: block.type, name: block.name, days: block.days };
            if (block.type === 'image') {
                return { id: block.id, type: block.type, title: block.title, imageUrl: block.imageUrl, alt: block.alt };
            }
            return { id: block.id, type: block.type, title: block.title, body: block.body };
        });
}

export function buildEditorPrayerPayload(prayer: PrayerEditorState) {
    if (!prayer.isMultiDay) {
        return {
            title: prayer.title,
            body: '',
            visibility: prayer.isPublic ? ('public' as const) : ('private' as const),
            showTitleInThumbnail: prayer.showTitleInThumbnail,
            contentBlocks: serializeEditorContentBlocks(prayer),
        };
    }

    syncPrayerEditorDays(prayer);
    return {
        title: prayer.title,
        visibility: prayer.isPublic ? ('public' as const) : ('private' as const),
        showTitleInThumbnail: prayer.showTitleInThumbnail,
        contentBlocks: serializeEditorContentBlocks(prayer),
        days: prayer.days.map((day) => ({
            dayNumber: day.dayNumber,
            title: day.title,
            body: prayer.contentBlocks
                .filter((block) => block.type === 'dynamic')
                .map((block) => block.days.find((item) => item.dayNumber === day.dayNumber)?.body.trim() || '')
                .filter(Boolean)
                .join('\n\n'),
            imageUrl: day.imageUrl,
            thumbnailImageUrl: day.thumbnailImageUrl,
            contentMode: 'dynamic' as const,
        })),
    };
}

export function usePrayerEditor() {
    const { clearOcrStatus, imageFileToDataUrl, imageFileToText } = usePrayerImageTools();
    const prayer = reactive(createPrayerEditorState());
    const dynamicContentBlocks = computed(() => prayer.contentBlocks.filter((block) => block.type === 'dynamic'));
    const syncDays = () => syncPrayerEditorDays(prayer);

    function reset() {
        Object.assign(prayer, createPrayerEditorState());
    }

    function load(value: PrayerEditorLoadInput) {
        const dayCount = Math.max(value.days?.length || 0, 2);
        prayer.title = value.title || '';
        prayer.isPublic = value.visibility === 'public';
        prayer.showTitleInThumbnail = value.showTitleInThumbnail !== false;
        prayer.isMultiDay = Boolean(value.days?.length);
        prayer.body = '';
        prayer.dayCount = dayCount;
        prayer.days = value.days?.length
            ? value.days.map((day) => ({
                  dayNumber: day.dayNumber,
                  title: day.title || '',
                  imageUrl: day.imageUrl || '',
                  thumbnailImageUrl: day.thumbnailImageUrl || '',
                  body: day.body || '',
              }))
            : createPrayerEditorState().days;

        if (value.contentBlocks?.length) {
            prayer.contentBlocks = value.contentBlocks.map((block) => {
                const type = prayer.isMultiDay && block.type === 'dynamic' ? 'dynamic' : block.type === 'image' ? 'image' : 'static';
                const editorBlock = createEditorContentBlock(type, dayCount);
                editorBlock.id = block.id;
                if (block.type === 'dynamic') {
                    editorBlock.name = block.name;
                    editorBlock.days = block.days.map((day, index) => ({
                        dayNumber: day.dayNumber || index + 1,
                        title: day.title,
                        body: day.body,
                    }));
                } else {
                    editorBlock.title = block.title;
                    if (block.type === 'image') {
                        editorBlock.imageUrl = block.imageUrl;
                        editorBlock.alt = block.alt;
                    } else {
                        editorBlock.body = block.body;
                    }
                }
                return editorBlock;
            });
        } else if (value.days?.length) {
            const block = createEditorContentBlock('dynamic', dayCount);
            block.days = value.days.map((day) => ({ dayNumber: day.dayNumber, title: '', body: day.body || '' }));
            prayer.contentBlocks = [block];
        } else {
            const block = createEditorContentBlock('static', dayCount);
            block.body = value.body || value.editBody || '';
            prayer.contentBlocks = [block];
        }
        syncDays();
    }

    function changeDayCount(amount: number) {
        prayer.dayCount = Math.max(Number(prayer.dayCount) + amount || 2, 2);
        syncDays();
    }
    function addDay() {
        prayer.dayCount = prayer.days.length + 1;
        syncDays();
    }
    function removeDay(dayNumber: number) {
        if (prayer.days.length <= 2) return;
        const index = prayer.days.findIndex((day) => day.dayNumber === dayNumber);
        if (index < 0) return;
        prayer.days.splice(index, 1);
        prayer.dayCount = prayer.days.length;
        syncDays();
    }
    function addContentBlock(type: ContentBlockType) {
        syncDays();
        prayer.contentBlocks.push(createEditorContentBlock(prayer.isMultiDay ? type : type === 'image' ? 'image' : 'static', prayer.dayCount));
    }
    const addImageContentBlock = () => addContentBlock('image');
    function syncBlockType(block: PrayerEditorContentBlock) {
        if (!prayer.isMultiDay && block.type === 'dynamic') block.type = 'static';
        if (block.type === 'dynamic' && !block.days.length) block.days = createDynamicDays(prayer.dayCount);
        if (block.type !== 'dynamic') block.days = [];
        syncDays();
    }
    function removeContentBlock(id: string) {
        if (prayer.contentBlocks.length > 1) prayer.contentBlocks = prayer.contentBlocks.filter((block) => block.id !== id);
    }
    function moveContentBlock(index: number, direction: number) {
        const next = index + direction;
        if (next < 0 || next >= prayer.contentBlocks.length) return;
        const [block] = prayer.contentBlocks.splice(index, 1);
        if (block) prayer.contentBlocks.splice(next, 0, block);
    }
    function getDynamicDay(block: PrayerEditorContentBlock, dayNumber: number) {
        let day = block.days.find((item) => item.dayNumber === dayNumber);
        if (!day) {
            day = { dayNumber, title: '', body: '' };
            block.days.push(day);
            block.days.sort((a, b) => a.dayNumber - b.dayNumber);
        }
        return day;
    }
    function getDynamicBlockLabel(block: PrayerEditorContentBlock) {
        return block.name.trim() || `dynamic section ${dynamicContentBlocks.value.findIndex((item) => item.id === block.id) + 1}`;
    }
    async function onImageDrop(event: DragEvent, handler: (file: File) => Promise<void>) {
        const file = event.dataTransfer?.files?.[0];
        if (file) await handler(file);
    }
    async function setDisplayImage(block: PrayerEditorContentBlock, file: File) {
        try {
            block.type = 'image';
            block.imageUrl = await imageFileToDataUrl(file);
            block.alt ||= file.name.replace(/\.[^.]+$/, '');
            clearOcrStatus();
        } catch (error) {
            console.error({ error });
        }
    }
    async function setDayThumbnailImage(day: PrayerEditorDay, file: File) {
        try {
            day.thumbnailImageUrl = await imageFileToDataUrl(file);
            clearOcrStatus();
        } catch (error) {
            console.error({ error });
        }
    }
    async function onDisplayImageFile(block: PrayerEditorContentBlock, event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file) await setDisplayImage(block, file);
        input.value = '';
    }
    async function onDayThumbnailImageFile(day: PrayerEditorDay, event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file) await setDayThumbnailImage(day, file);
        input.value = '';
    }
    async function addDisplayImageFromFile(file?: File) {
        if (!file) return;
        const block = createEditorContentBlock('image', prayer.dayCount);
        await setDisplayImage(block, file);
        if (block.imageUrl) prayer.contentBlocks.push(block);
    }
    async function addTextFromImage(file?: File, targetDay: PrayerEditorDay | null = null, block: PrayerEditorContentBlock | null = null) {
        if (!file) return;
        try {
            const importedText = await imageFileToText(file);
            if (targetDay && block) {
                const day = getDynamicDay(block, targetDay.dayNumber);
                day.body = [day.body, importedText].filter(Boolean).join('\n\n');
            } else {
                const imported = createEditorContentBlock('static', prayer.dayCount);
                imported.title = 'Imported image text';
                imported.body = importedText;
                prayer.contentBlocks.push(imported);
            }
        } catch (error) {
            clearOcrStatus();
            console.error({ error });
        }
    }
    async function onTextImageFile(event: Event) {
        const input = event.target as HTMLInputElement;
        await addTextFromImage(input.files?.[0]);
        input.value = '';
    }
    async function onDynamicTextImageFile(event: Event, day: PrayerEditorDay, block: PrayerEditorContentBlock) {
        const input = event.target as HTMLInputElement;
        await addTextFromImage(input.files?.[0], day, block);
        input.value = '';
    }
    function onMultiDayToggle() {
        if (prayer.isMultiDay && !prayer.contentBlocks.some((block) => block.type === 'dynamic')) {
            prayer.contentBlocks.push(createEditorContentBlock('dynamic', prayer.dayCount));
        } else if (!prayer.isMultiDay) {
            prayer.contentBlocks = prayer.contentBlocks.map((block) => {
                if (block.type !== 'dynamic') return block;
                const replacement = createEditorContentBlock('static', prayer.dayCount);
                replacement.title = block.name || block.title;
                replacement.body = block.days[0]?.body || '';
                return replacement;
            });
        }
        syncDays();
    }

    return {
        prayer,
        dynamicContentBlocks,
        reset,
        load,
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
        setDisplayImage,
        setDayThumbnailImage,
        onDisplayImageFile,
        onDayThumbnailImageFile,
        addDisplayImageFromFile,
        onTextImageFile,
        onDynamicTextImageFile,
        addTextFromImage,
        buildPrayerPayload: () => buildEditorPrayerPayload(prayer),
        onMultiDayToggle,
    };
}
