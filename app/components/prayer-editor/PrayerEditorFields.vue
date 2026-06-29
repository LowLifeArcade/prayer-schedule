<template>
    <div class="prayer-editor-fields">
        <label
            for="title"
            class="title"
        >
            <h4>Title</h4>
            <input
                id="title"
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
                aria-label="Public prayer"
            />
            <span class="toggle-track"></span>
        </label>
        <label class="toggle-row">
            <span>Show title in thumbnail</span>
            <input
                v-model="prayer.showTitleInThumbnail"
                type="checkbox"
                role="switch"
                aria-label="Show title in thumbnail"
            />
            <span class="toggle-track"></span>
        </label>
        <label class="toggle-row">
            <span>Multi day prayer</span>
            <input
                v-model="prayer.isMultiDay"
                type="checkbox"
                role="switch"
                aria-label="Multi day prayer"
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
                                    @change="onDynamicTextImageFile($event, day, block)"
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
            </div>
</template>

<script setup lang="ts">
const { editor } = defineProps<{ editor: ReturnType<typeof usePrayerEditor> }>();
const { ocrStatus } = usePrayerImageTools();
const {
    prayer,
    dynamicContentBlocks,
    syncDays,
    changeDayCount,
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
    onTextImageFile,
    onDynamicTextImageFile,
    addTextFromImage,
    onMultiDayToggle,
} = editor;
</script>

<style scoped>
.prayer-editor-fields {
    display: contents;

    .prayer-form {
        display: flex;
        flex-direction: column;
        gap: 3rem;
        max-width: 800px;
        padding-top: 2.8rem;
        padding-inline: 1rem;
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
        .edit-mode h2 {
            font-size: 2rem;
        }

        .btns {
            flex-direction: column;
        }
    }
}
</style>
