<template>
    <div class="v-base-layout">
        <slot />
    </div>
</template>

<script setup>
const { theme, applyTheme } = useTheme();

useHead({
    htmlAttrs: {
        'data-theme': theme.value,
    },
});

onMounted(() => applyTheme(theme.value));
</script>

<style>
.v-base-layout {
    font-size: 1.9rem;
}
</style>
