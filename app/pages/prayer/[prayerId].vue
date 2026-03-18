<template>
    <div
        v-if="loggedIn"
        class="v-prayer"
    >
        <div class="top container">
            <button
                class="back-btn"
                @click="router.back()"
            >
                < Go back
            </button>
        </div>
        <h1 class="container">{{ data.title }}</h1>
        <p class="container">
            {{ data.body }}
        </p>
    </div>
</template>

<script setup>
const route = useRoute();
const prayerId = route.params.prayerId;
const { data, pending, refresh } = useFetch(`/api/prayer/${prayerId}`);

const { loggedIn, user, fetch: refreshSession, clear, ready, openInPopup, session } = useUserSession();
const router = useRouter();
</script>

<style>
.v-prayer {
    h1 {
        margin-bottom: 1rem;
    }

    .back-btn {
        cursor: pointer;
    }
}
</style>
