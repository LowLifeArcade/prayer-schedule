<template>
    <div>
        <h1>Prayer {{ data.msg }}</h1>
    </div>
</template>

<script setup>
const { data, pending } = await useFetch('/api/test'); 
</script>
