<template>
    <Teleport to="body">
        <div
            v-if="open"
            class="confirm-backdrop"
            @click.self="$emit('cancel')"
        >
            <section
                class="confirm-dialog"
                role="dialog"
                aria-modal="true"
                :aria-labelledby="titleId"
            >
                <h2 :id="titleId">{{ title }}</h2>
                <p>{{ message }}</p>
                <div class="confirm-actions">
                    <button
                        type="button"
                        class="confirm-secondary"
                        @click="$emit('cancel')"
                    >
                        {{ cancelLabel }}
                    </button>
                    <button
                        type="button"
                        class="confirm-primary"
                        @click="$emit('confirm')"
                    >
                        {{ confirmLabel }}
                    </button>
                </div>
            </section>
        </div>
    </Teleport>
</template>

<script setup>
const props = defineProps({
    open: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
        default: 'Discard changes?',
    },
    message: {
        type: String,
        default: 'Any unsaved changes will be lost.',
    },
    confirmLabel: {
        type: String,
        default: 'Discard',
    },
    cancelLabel: {
        type: String,
        default: 'Keep editing',
    },
});

defineEmits(['confirm', 'cancel']);

const titleId = useId();
</script>

<style scoped>
.confirm-backdrop {
    position: fixed;
    inset: 0;
    z-index: 20;
    display: grid;
    place-items: center;
    padding: 2rem;
    background: rgba(0, 0, 0, 0.46);
}

.confirm-dialog {
    display: grid;
    gap: 1.4rem;
    width: min(100%, 42rem);
    padding: 2rem;
    border: 1px solid var(--color-border);
    border-radius: 0.8rem;
    background: var(--color-surface);
    box-shadow: 0 2rem 5rem rgba(0, 0, 0, 0.28);
}

.confirm-dialog h2 {
    font-size: 2.6rem;
    line-height: 1.1;
}

.confirm-dialog p {
    color: var(--color-text-muted);
    font-size: 1.6rem;
    line-height: 1.45;
}

.confirm-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 0.6rem;
}

.confirm-primary,
.confirm-secondary {
    min-height: 4.8rem;
    padding: 1rem 1.4rem;
    border-radius: 0.8rem;
    cursor: pointer;
    font-weight: 800;
}

.confirm-primary {
    border: 1px solid var(--danger-border);
    background: var(--danger-bg);
    color: var(--danger-text);
}

.confirm-secondary {
    border: 1px solid var(--color-border-2);
    background: var(--color-surface-2);
    color: var(--color-text);
}

@media (width < 460px) {
    .confirm-actions {
        flex-direction: column-reverse;
    }

    .confirm-primary,
    .confirm-secondary {
        width: 100%;
    }
}
</style>
