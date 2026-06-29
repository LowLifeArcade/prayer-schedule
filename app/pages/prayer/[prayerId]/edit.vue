<template>
    <div
        v-if="loggedIn"
        class="v-prayer-edit"
    >
        <PrayerTopBar @back="onBack" />

        <form
            class="prayer-form"
            @submit.prevent="onSave"
        >
            <header class="edit-mode">
                <p>Editing</p>
                <h2>{{ prayer.title || 'Untitled prayer' }}</h2>
            </header>

            <PrayerEditorFields :editor="editor" />
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
                    @click="showCancelConfirm = true"
                >
                    Cancel
                </button>
            </div>
        </form>
        <ConfirmModal
            :open="showCancelConfirm"
            title="Discard changes?"
            message="Your edits to this prayer have not been saved."
            confirm-label="Discard"
            cancel-label="Keep editing"
            @confirm="confirmCancelEdit"
            @cancel="showCancelConfirm = false"
        />
    </div>
</template>

<script setup>
definePageMeta({
    middleware: 'auth',
});

const route = useRoute();
const router = useRouter();
const prayerId = route.params.prayerId;
const { loggedIn } = useUserSession();
const { data } = await useFetch(`/api/prayer/${prayerId}`);
const { ocrStatus, clearOcrStatus, imageFileToDataUrl, imageFileToText } = usePrayerImageTools();
const saving = ref(false);
const errorMessage = ref('');
const showCancelConfirm = ref(false);

const editor = usePrayerEditor();
const {
    prayer,
    dynamicContentBlocks,
    load: loadPrayerEditor,
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
    onDisplayImageFile,
    onDayThumbnailImageFile,
    addDisplayImageFromFile,
    onTextImageFile,
    addTextFromImage,
    buildPrayerPayload,
    onMultiDayToggle,
} = editor;

watch(
    data,
    (value) => {
        if (value?.id) loadPrayerEditor(value);
    },
    { immediate: true },
);

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

function confirmCancelEdit() {
    showCancelConfirm.value = false;
    router.back();
}

function onBack() {
    router.back();
}
</script>

<style scoped>
.v-prayer-edit {
    min-height: 100vh;
    padding-bottom: 6rem;

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
