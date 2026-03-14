<template>
    <div
        v-if="type === 'vr'"
        class="v-right"
    >
        <svg
            :width="size"
            :height="size"
            viewBox="0 0 40 40"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle
                cx="32"
                cy="10"
                r="3"
                fill="currentColor"
            />
            <circle
                cx="32"
                cy="20"
                r="3"
                fill="currentColor"
            />
            <circle
                cx="32"
                cy="30"
                r="3"
                fill="currentColor"
            />
        </svg>
    </div>
    <div
        v-else-if="type === 'v'"
        class="v"
    >
        <svg
            :width="size"
            :height="size"
            viewBox="0 0 40 40"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle
                cx="20"
                cy="8"
                r="3"
                fill="currentColor"
            />
            <circle
                cx="20"
                cy="20"
                r="3"
                fill="currentColor"
            />
            <circle
                cx="20"
                cy="32"
                r="3"
                fill="currentColor"
            />
        </svg>
    </div>
    <div
        v-else
        class="horizontal"
    >
        <svg
            :width="size"
            :height="size"
            viewBox="0 0 40 40"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle
                cx="8"
                cy="20"
                r="3"
                fill="currentColor"
            />
            <circle
                cx="20"
                cy="20"
                r="3"
                fill="currentColor"
            />
            <circle
                cx="32"
                cy="20"
                r="3"
                fill="currentColor"
            />
        </svg>
    </div>
</template>

<script>
export default {
    props: {
        type: {
            type: String,
            default: 'vr',
        },
        size: {
            type: String,
            default: '27',
        },
    },
};
</script>

<style scoped>
svg {
    color: var(--color-text);
}
</style>
