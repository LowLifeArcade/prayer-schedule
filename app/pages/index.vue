<template>
    <div class="v-prayers container">
        <h1>Prayer</h1>
        <ul class="prayers">
            <li v-for="{ title, body } in data">
                <div class="prayer">
                    <h3>{{ title }}</h3>
                    <p>{{ body }}</p>
                </div>
            </li>
        </ul>
        <form
            class="prayer-form"
            @submit.prevent
        >
            <label
                for="title"
                class="title"
            >
                <input
                    type="text"
                    name="title"
                />
            </label>
            <label
                for="body"
                class="title"
            >
                <input
                    type="text"
                    name="body"
                />
            </label>
            <button class="btn">add</button>
        </form>
    </div>
</template>

<script setup>
const { data, pending } = useFetch('/api/prayers');
</script>

<style scoped>
.v-prayers {
    h1 {
        margin-bottom: 2rem;
    }

    .prayers {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 2rem;

        @media (width < 800px) {
            grid-template-columns: repeat(2, 1fr);
        }

        .prayer {
        }
    }

    form {
        display: flex;
        flex-direction: column;
    }
}
</style>
