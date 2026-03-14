<template>
    <div class="v-prayers container">
        <div
            v-if="openMenuIndex"
            class="overlay"
            @click="openMenuIndex = null"
        ></div>
        <div
            v-if="showBSOD"
            class="description"
            @click="bsodRef.focus()"
        >
            <pre>
C:\WINDOWS>
C:\Documents and Settings\{{ user?.given_name || 'anonymous' }}>

A fatal exception 0E has occurred at 0028:C0011E36 in VXD VMM(01) +
00010E36. The current application will be terminated.

*  Press any key to terminate the current application.
*  Press CTRL+ALT+DEL again to restart your computer. You will
   lose any unsaved information in all applications.

Press any key to continue _
            </pre>
            <input
                name=""
                ref="bsodRef"
                @keydown="e => showBSOD = e.key !== 'Escape'"
            ></input>
        </div>
        <div class="top-bar">
            <div
                class="logo"
                @click="onLogoClick"
            >
                <h1>Prayer List</h1>
            </div>
            <div class="right-section">
                <div
                    v-if="loggedIn"
                    class="user"
                >
                    <div class="name-section">
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
                        >Login</a
                    >
                </div>
                <ThemeToggle />
            </div>
        </div>
        <ul
            v-if="loggedIn && !showAddPrayerForm"
            class="prayers"
        >
            <li v-for="({ title, body, id }, i) in data">
                <div class="prayer">
                    <div class="title">
                        <h3>{{ title }}</h3>
                        <span class="ctx-menu-section">
                            <SvgDots
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
                    <SvgPlus />
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
            <div class="btns">
                <button
                    class="btn form"
                    @click="onAddPrayer"
                >
                    Create
                </button>
                <button
                    class="btn cancel"
                    @click="showAddPrayerForm = false"
                >
                    Cancel
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
const { data, pending, refresh } = useFetch('/api/prayers');
const { loggedIn, user, fetch: refreshSession, clear, ready, openInPopup, session } = useUserSession();

const showAddPrayerForm = ref(false);
const initialState = () => ({
    title: null,
    body: null,
});
const prayer = reactive(initialState());
const openMenuIndex = ref();
const showBSOD = ref();
const bsodRef = ref(null);

const toggleMenu = (i) => {
    openMenuIndex.value = openMenuIndex.value === i ? null : i;
};

const closeMenu = () => (openMenuIndex.value = null);

async function onLogout() {
    await clear();
    refresh();
}

async function onLogoClick() {
    showBSOD.value = true;
    await nextTick()
    bsodRef.value?.focus();
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

    .description {
        position: absolute;
        z-index: 100;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        /* background-color: #0000AA; */
        color: white;
        background: blue;

        input {
            background: blue;
            border: unset;
            color: white;
            width: 100%;

            &:focus {
                border: unset;
                outline: unset;
            }
        }
    }

    .top-bar {
        padding-block: 2rem;
        display: flex;
        justify-content: space-between;

        .right-section {
            display: grid;
            gap: 2rem;
        }

        .user {
            display: flex;
            align-items: center;
            gap: 2rem;

            .name-section {
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

    .prayer-form {
        display: flex;
        flex-direction: column;
        gap: 3rem;
        width: 800px;
        margin-inline: auto;

        label {
            h4 {
                margin-bottom: 1rem;
            }
        }

        textarea {
            field-sizing: content;
            min-height: 50rem;
            resize: none;
        }

        .btns {
            display: grid;
            gap: 2rem;
        }
    }
}
</style>
