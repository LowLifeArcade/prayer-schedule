<template>
    <div>
        <h1>Prayer </h1>
        <ul>
            <li v-for="({ title, body }) in data">
                <h2>{{ title }}</h2>
                <p>{{ body }}</p>
            </li>
        </ul>
    </div>
</template>

<script setup>
const { data, pending } = await useFetch('/api/test'); 
</script>
