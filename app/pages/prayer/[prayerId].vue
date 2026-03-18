<template>
    <div
        v-if="loggedIn"
        class="v-prayer"
    >
        <h1>{{ data.title }}</h1>
        <p>
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
}
</style>
