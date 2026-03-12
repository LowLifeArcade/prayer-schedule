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
                <h4>Title</h4>
                <input
                    type="text"
                    name="title"
                />
            </label>
            <label
                for="body"
                class="title"
            >
                <h4>Prayer</h4>
                <textarea
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
        grid-template-columns: repeat(6, 1fr);
        gap: 2rem;
        margin-bottom: 3rem;

        @media (width < 1100px) {
            grid-template-columns: repeat(4, 1fr);
        }

        @media (width < 800px) {
            grid-template-columns: repeat(2, 1fr);
        }

        .prayer {
            h3 {
                margin-bottom: 1rem;
            }

            p {
                text-overflow: ellipsis;
                max-width: 200px;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
        }
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        label {
            h4 {
                margin-bottom: 1rem;
            }
        }
    }
}
</style>
