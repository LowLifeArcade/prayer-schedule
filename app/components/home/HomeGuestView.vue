<template>
<main
    class="home-page"
>
    <section class="home-hero">
        <div class="hero-copy">
            <p class="eyebrow">Catholic prayer, ordered for ordinary days</p>
            <h2>Keep your devotions close to the rhythm of grace.</h2>
            <p>
                Prayer List helps you carry novenas, chaplets, intentions, and daily devotions without
                turning prayer into another productivity score. Make a quiet plan, return faithfully, and
                let the Church's seasons shape your day.
            </p>
            <div class="hero-actions">
                <a
                    class="primary-action"
                    href="/auth/google"
                    >Begin with prayer</a
                >
                <a
                    class="secondary-action"
                    href="#features"
                    >See features</a
                >
            </div>
        </div>
        <div
            class="hero-visual"
            aria-label="Preview of Catholic prayer planning features"
        >
            <div class="orbital-ring"></div>
            <article class="prayer-preview main-preview">
                <span>Today</span>
                <h3>St. Joseph Novena</h3>
                <p>Day 4: For steadfast work, family life, and a heart obedient to God.</p>
                <div class="day-dots">
                    <span
                        v-for="day in 9"
                        :key="day"
                        :class="{ active: day === 4, complete: day < 4 }"
                    ></span>
                </div>
            </article>
            <article class="prayer-preview intention-preview">
                <span>Intentions</span>
                <strong>For Anna's surgery</strong>
            </article>
            <article class="prayer-preview season-preview">
                <span>Liturgical time</span>
                <strong>Ordinary Time</strong>
            </article>
        </div>
    </section>

    <section
        id="features"
        class="feature-section"
    >
        <div class="section-heading">
            <p class="eyebrow">Features</p>
            <h2>Built for real Catholic prayer habits.</h2>
        </div>
        <div class="feature-grid">
            <article
                v-for="feature in homeFeatures"
                :key="feature.title"
                class="feature-card"
            >
                <span class="feature-icon">{{ feature.icon }}</span>
                <h3>{{ feature.title }}</h3>
                <p>{{ feature.body }}</p>
            </article>
        </div>
    </section>

    <section class="rhythm-section">
        <div class="rhythm-copy">
            <p class="eyebrow">A gentler structure</p>
            <h2>Reminders that serve recollection, not anxiety.</h2>
            <p>
                Keep a simple list for the prayers you mean to return to: the Rosary, Divine Mercy Chaplet,
                a novena before a feast, lectio divina, or intercessions entrusted to you by friends.
            </p>
        </div>
        <div class="rhythm-list">
            <article
                v-for="item in prayerRhythms"
                :key="item.label"
            >
                <span>{{ item.time }}</span>
                <div>
                    <h3>{{ item.label }}</h3>
                    <p>{{ item.body }}</p>
                </div>
            </article>
        </div>
    </section>

    <section class="closing-cta">
        <p class="eyebrow">Ora et labora</p>
        <h2>Make space for prayer before the day fills itself.</h2>
        <a
            class="primary-action"
            href="/auth/google"
            >Log in to start</a
        >
    </section>
</main>
</template>

<script setup lang="ts">
const homeFeatures = [
    { icon: '✚', title: 'Novenas and multi-day prayers', body: 'Create a prayer once, then move day by day with the right text, image, and intention ready when you return.' },
    { icon: '☩', title: 'Intentions kept with care', body: 'Hold names, needs, and entrusted petitions in one place without making them feel like tasks to clear.' },
    { icon: '✦', title: 'Liturgical awareness', body: 'Shape personal devotion around seasons, feasts, solemnities, and the ordinary fidelity of daily prayer.' },
    { icon: '◐', title: 'Quiet progress', body: 'See where you are in a devotion without streak pressure, badges, or pretending grace can be measured.' },
];

const prayerRhythms = [
    { time: 'Morning', label: 'Offer the day', body: 'Begin with a prayer, a saint, or a simple intention before work starts pulling at you.' },
    { time: 'Midday', label: 'Return briefly', body: 'Open the devotion you are carrying and recollect yourself in the middle of ordinary duties.' },
    { time: 'Evening', label: 'Close in gratitude', body: 'Pray an examen, finish a novena day, or entrust tomorrow to the Lord with peace.' },
];
</script>
