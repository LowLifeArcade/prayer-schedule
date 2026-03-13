<template>
    <div class="v-prayers container">
        <div
            v-if="openMenuIndex"
            class="overlay"
            @click="openMenuIndex = null"
        ></div>
        <div class="top-bar">
            <div class="logo">
                <h1>Prayer List</h1>
            </div>
            <div
                v-if="loggedIn"
                class="user"
            >
                <div class="name">
                    <span>{{ user.given_name }}</span>
                    <div class="log-out">
                        <button @click="onLogout">Log Out</button>
                    </div>
                </div>
                <img
                    :src="user.picture"
                    alt=""
                    height="50"
                    width="50"
                />
            </div>
            <div
                v-else
                class="login"
            >
                <a
                    class="login"
                    href="/auth/google"
                    >Login with Google</a
                >
            </div>
        </div>
        <ul
            v-if="loggedIn"
            class="prayers"
        >
            <li v-for="({ title, body, id }, i) in data">
                <div class="prayer">
                    <div class="title">
                        <h3>{{ title }}</h3>
                        <span class="ctx-menu-section">
                            <Dots
                                class="ctx-menu-btn"
                                alt=""
                                height="27"
                                width="27"
                                @click="toggleMenu(i)"
                                @drag="(e) => console.log('drag', e)"
                                @dragend="(e) => console.log('drag ended', e)"
                                @dragenter="console.log('has entered a droppable location')"
                                @dragleave="console.log('has left a droppable location')"
                                @dragover="console.log('is over a droppable location')"
                                @drop="(e) => console.log('droped', e)"
                            />
                            <div
                                v-if="openMenuIndex === i"
                                class="ctx-menu"
                            >
                                <ul>
                                    <li>Remove</li>
                                    <li
                                        class="danger"
                                        @click="onDelete(id)"
                                    >
                                        Delete
                                    </li>
                                </ul>
                            </div>
                        </span>
                    </div>
                    <p>{{ body }}</p>
                </div>
            </li>
            <li v-if="!showAddPrayerForm">
                <button
                    class="add-prayer"
                    @click="showAddPrayerForm = true"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        x="0px"
                        y="0px"
                        width="30"
                        height="30"
                        viewBox="0 0 50 50"
                        fill="currentColor"
                    >
                        <path
                            d="M 25 2 C 12.309295 2 2 12.309295 2 25 C 2 37.690705 12.309295 48 25 48 C 37.690705 48 48 37.690705 48 25 C 48 12.309295 37.690705 2 25 2 z M 25 4 C 36.609824 4 46 13.390176 46 25 C 46 36.609824 36.609824 46 25 46 C 13.390176 46 4 36.609824 4 25 C 4 13.390176 13.390176 4 25 4 z M 24 13 L 24 24 L 13 24 L 13 26 L 24 26 L 24 37 L 26 37 L 26 26 L 37 26 L 37 24 L 26 24 L 26 13 L 24 13 z"
                        ></path>
                    </svg>
                </button>
            </li>
        </ul>

        <form
            v-if="showAddPrayerForm"
            class="prayer-form"
            @submit.prevent
        >
            <label
                for="title"
                class="title"
            >
                <h4>Title</h4>
                <input
                    v-model="prayer.title"
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
                    v-model="prayer.body"
                    type="text"
                    name="body"
                />
            </label>
            <button
                class="btn cancel"
                @click="showAddPrayerForm = false"
            >
                Cancel
            </button>
            <button
                class="btn"
                @click="onAddPrayer"
            >
                Add
            </button>
        </form>
    </div>
</template>

<script setup>
import Dots from '~/components/Dots.vue';

const { data, pending, refresh } = useFetch('/api/prayers');
const { loggedIn, user, fetch: refreshSession, clear, ready, openInPopup, session } = useUserSession();

const showAddPrayerForm = ref(false);
const initialState = () => ({
    title: null,
    body: null,
});
const prayer = reactive(initialState());
const openMenuIndex = ref();

const toggleMenu = (i) => {
    openMenuIndex.value = openMenuIndex.value === i ? null : i;
};

const closeMenu = () => (openMenuIndex.value = null);

async function onLogout() {
    await clear();
    refresh();
}

async function onAddPrayer() {
    try {
        await $fetch('/api/prayer', {
            method: 'post',
            body: prayer,
        });
        showAddPrayerForm.value = false;
        Object.assign(prayer, initialState());
        refresh();
    } catch (error) {
        console.error({ error });
    }
}

async function onDelete(id) {
    try {
        const resp = await $fetch('/api/prayer', {
            method: 'delete',
            body: {
                id,
            },
        });
    } catch (error) {
        console.log({ error });
    }

    closeMenu();
}
</script>

<style scoped>
.v-prayers {
    .overlay {
        position: absolute;
        background-color: var(--color-bg-2);
        opacity: 0.2;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1;
    }

    .top-bar {
        padding-block: 2rem;
        display: flex;
        justify-content: space-between;

        .user {
            display: flex;
            align-items: center;
            gap: 2rem;

            .name {
                display: grid;
                gap: 0.5rem;

                .log-out {
                    font-size: 1.4rem;
                }
            }

            img {
                border-radius: 10rem;
            }
        }

        .login {
            display: grid;
            place-items: center;
            font-weight: 600;
        }
    }

    .prayers {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 2rem;
        margin-bottom: 3rem;

        @media (width < 1100px) {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        }

        @media (width < 800px) {
            grid-template-columns: repeat(2, 1fr);
        }

        .prayer,
        .add-prayer {
            padding: 2rem;
            min-height: 200px;
            border-radius: 1.3rem;
        }

        .prayer {
            border: 1px solid var(--color-border-2);
            background-color: var(--color-surface);

            .title {
                margin-bottom: 1rem;
                display: flex;
                align-items: center;
                justify-content: space-between;

                .ctx-menu-section {
                    position: relative;

                    .ctx-menu-btn {
                        cursor: pointer;
                    }

                    .ctx-menu {
                        border-radius: 0.8rem;
                        position: absolute;
                        top: 0;
                        right: 0;
                        box-shadow: 0.1rem 0.1rem 0.4rem rgba(0 0 0 / 0.3);
                        padding: 1rem;
                        z-index: 1;
                        background: var(--color-surface-2);

                        ul {
                            display: grid;
                            gap: 1rem;

                            li {
                                cursor: pointer;
                            }
                        }
                    }
                }
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

        .add-prayer {
            width: 100%;
            display: grid;
            place-items: center;
            height: 100%;
            background-color: var(--color-surface-2);
            transition: filter 200ms ease-in-out;

            &:hover {
                filter: brightness(1.5);
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
