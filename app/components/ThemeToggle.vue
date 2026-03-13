<script setup>
const { theme, setTheme } = useTheme();
</script>

<template>
    <div class="theme-toggle">
        <button
            :class="{ active: theme === 'light' }"
            @click="setTheme('light')"
        >
            Light
        </button>
        <button
            :class="{ active: theme === 'dark' }"
            @click="setTheme('dark')"
        >
            Dark
        </button>
        <button
            :class="{ active: theme === 'system' }"
            @click="setTheme('system')"
        >
            System
        </button>
    </div>
</template>

<style scoped>
.theme-toggle {
    display: flex;
    gap: 0.25rem;
    padding: 0.25rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
}

button {
    padding: 0.25rem 0.75rem;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
    font-size: 1rem;
}

button.active {
    background: var(--color-bg);
    color: var(--color-text);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
