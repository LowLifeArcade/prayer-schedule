<template>
    <div class="v-prayers container">
        <div class="top-bar">
            <h1>Prayer List</h1>
            <div
                v-if="loggedIn"
                class="user"
            >
                <div class="name">
                    <span>{{ user.given_name }}</span>
                    <div class="log-out">
                        <button @click="clear">Log Out</button>
                    </div>
                </div>
                <img
                    :src="user.picture"
                    alt=""
                    height="50"
                    width="50"
                />
            </div>
            <a
                v-else
                class="login"
                href="/auth/google"
                >Login with Google</a
            >
        </div>
        <ul class="prayers">
            <li v-for="{ title, body } in data">
                <div class="prayer">
                    <h3>{{ title }}</h3>
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
                class="btn cancel "
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
const { data, pending, refresh } = useFetch('/api/prayers');
const { loggedIn, user, fetch: refreshSession, clear } = useUserSession();

const showAddPrayerForm = ref(false);
const prayer = reactive({
    title: null,
    body: null,
});

async function onAddPrayer() {
    const resp = await $fetch('/api/prayer', {
        method: 'post',
        body: prayer,
    });
    console.log(`🚀 | onAddPrayer | resp:`, resp)
    refresh();
}
</script>

<style scoped>
.v-prayers {
    .top-bar {
        padding-block: 1rem;
        display: flex;
        justify-content: space-between;

        /* h1 {
            margin-bottom: 2rem;
        } */

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
            border: 1px solid lightgray;

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

        .add-prayer {
            width: 100%;
            display: grid;
            place-items: center;
            height: 100%;
            background-color: hsl(0, 0%, 89%);
            transition: background-color 200ms ease-in-out;

            &:hover {
                background-color: hsl(0, 0%, 81%);
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
