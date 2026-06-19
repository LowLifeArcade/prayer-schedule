<template>
    <header class="prayer-top-bar container">
        <nav class="nav-section">
            <button
                class="back-btn"
                type="button"
                @click="$emit('back')"
            >
                <span aria-hidden="true">&lt;</span>
                <span>Back</span>
            </button>
            <NuxtLink
                class="home-btn"
                to="/"
            >
                Prayer List
            </NuxtLink>
        </nav>
        <div class="right-section">
            <div class="utility-group">
                <NuxtLink
                    class="public-btn"
                    to="/prayers/public"
                >
                    Public prayers
                </NuxtLink>
                <ThemeToggle />
            </div>
            <div
                v-if="user"
                class="user-menu"
            >
                <img
                    v-if="user.picture"
                    :src="user.picture"
                    alt=""
                    height="40"
                    width="40"
                />
                <span>{{ user.given_name || user.name }}</span>
                <button
                    type="button"
                    class="logout-btn"
                    @click="onLogout"
                >
                    Log Out
                </button>
            </div>
        </div>
    </header>
</template>

<script setup>
defineEmits(['back']);

const router = useRouter();
const { user, clear } = useUserSession();

async function onLogout() {
    await clear();
    await router.push('/');
}
</script>

<style scoped>
.prayer-top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    padding-block: 2rem 0;

    @media (width < 780px) {
        align-items: stretch;
        flex-direction: column;
    }
}

.nav-section,
.right-section,
.utility-group,
.user-menu {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.nav-section {
    flex-wrap: wrap;
}

.right-section {
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 1.2rem;
    margin-left: auto;

    @media (width < 780px) {
        justify-content: flex-start;
        margin-left: 0;
    }
}

.utility-group,
.user-menu {
    border: 1px solid var(--color-border);
    border-radius: 0.8rem;
    background: color-mix(in srgb, var(--color-surface) 72%, transparent);
}

.utility-group {
    min-height: 5.2rem;
    padding: 0.5rem;
}

.utility-group :deep(.theme-toggle) {
    align-self: center;
    background: transparent;
    border-color: var(--color-border);
}

.utility-group :deep(.theme-toggle button) {
    min-height: 3.4rem;
    font-size: 1.1rem;
}

.user-menu {
    min-height: 5.2rem;
    padding: 0.4rem 0.6rem 0.4rem 0.4rem;
    font-size: 1.4rem;
    font-weight: 700;
}

.user-menu img {
    border-radius: 999px;
}

.back-btn,
.home-btn,
.public-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    min-height: 4rem;
    padding: 0.8rem 1rem;
    border: 1px solid var(--color-border);
    border-radius: 0.8rem;
    background: color-mix(in srgb, var(--color-surface) 72%, transparent);
    color: var(--color-text-muted);
    cursor: pointer;
    font-size: 1.5rem;
    font-weight: 700;
    text-decoration: none;
    transition:
        background-color 160ms ease,
        border-color 160ms ease,
        color 160ms ease,
        transform 160ms ease;
}

.back-btn:hover,
.public-btn:hover {
    border-color: var(--color-border-2);
    color: var(--color-text);
    transform: translateY(-1px);
}

.home-btn {
    border-color: var(--color-text);
    background: var(--color-text);
    color: var(--color-text-alt);
}

.home-btn:hover {
    border-color: var(--color-text);
    background: color-mix(in srgb, var(--color-text) 88%, var(--color-surface));
    color: var(--color-text-alt);
    transform: translateY(-1px);
}

.public-btn {
    color: var(--color-text);
}

.logout-btn {
    min-height: 3.4rem;
    padding: 0.6rem 0.8rem;
    border: 1px solid var(--color-border-2);
    border-radius: 0.6rem;
    background: var(--color-surface);
    color: var(--color-text);
    cursor: pointer;
    font-size: 1.3rem;
    font-weight: 800;
}
</style>
