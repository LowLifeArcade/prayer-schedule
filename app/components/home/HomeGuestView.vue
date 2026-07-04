<template>
    <main class="home-page home-v2">
        <section class="home-v2__hero">
            <div class="home-v2__hero-copy">
                <div class="home-v2__kicker">
                    <span class="home-v2__kicker-mark">P</span>
                    <span>Catholic prayer, carried faithfully</span>
                </div>
                <p class="home-v2__invocation">Ad Iesum per Mariam</p>
                <h2>Stay close to Christ<br /><em>in daily prayer.</em></h2>
                <p class="home-v2__lede">
                    Keep novenas, the Rosary, chaplets, lectio divina, and the intentions entrusted to you
                    in one place. Walk with Our Lady and the saints as they lead every prayer back to Jesus.
                </p>
                <div class="home-v2__actions">
                    <a class="home-v2__button home-v2__button--primary" href="/auth/google">
                        Start your prayer list
                        <span aria-hidden="true">→</span>
                    </a>
                    <a class="home-v2__button home-v2__button--quiet" href="/prayers/public">
                        Explore public prayers
                    </a>
                </div>
                <div class="home-v2__promise">
                    <span><i aria-hidden="true">✠</i> Rooted in Catholic devotion</span>
                    <span><i aria-hidden="true">✠</i> Ordered toward Christ</span>
                    <span><i aria-hidden="true">✠</i> No streak pressure</span>
                </div>
            </div>

            <div class="home-v2__devotional-note">
                <span class="home-v2__chi-rho" aria-hidden="true">☧</span>
                <p>“I am the way, and the truth, and the life.”</p>
                <small>John 14:6</small>
            </div>
        </section>

        <section class="home-v2__saints" aria-labelledby="saints-heading">
            <div class="home-v2__saints-intro">
                <p class="eyebrow">The communion of saints</p>
                <h2 id="saints-heading">We do not pray alone.</h2>
                <p>Keep the devotions that have formed generations of Catholics, and ask the saints to intercede as you follow Christ.</p>
            </div>
            <div class="home-v2__saint-list">
                <article v-for="saint in saints" :key="saint.name">
                    <span aria-hidden="true">{{ saint.mark }}</span>
                    <div><strong>{{ saint.name }}</strong><small>{{ saint.patronage }}</small></div>
                </article>
            </div>
        </section>

        <section class="home-v2__angel-interlude" aria-label="Angelic prayer">
            <img
                src="/images/adoring-angels-reliquary.png"
                alt="Gilded angels kneeling in adoration around an ornate reliquary frame"
            />
            <div class="home-v2__angel-prayer">
                <span aria-hidden="true">☧</span>
                <p>Sursum corda</p>
                <strong>Lift up your hearts.</strong>
            </div>
        </section>

        <section id="features" class="home-v2__features">
            <div class="home-v2__section-heading">
                <p class="eyebrow">An oratory for the ordinary day</p>
                <h2>Devotions close at hand. Christ at the center.</h2>
                <p>Prayer List gives Catholic prayer a faithful home—from a novena before a feast to the names you carry to Mass.</p>
            </div>
            <div class="home-v2__feature-grid">
                <article v-for="(feature, index) in homeFeatures" :key="feature.title" :class="`feature-${index + 1}`">
                    <img
                        v-if="index === 0 || index === 3"
                        class="home-v2__reliquary-frame"
                        src="/images/angelic-reliquary-frame.png"
                        alt=""
                        aria-hidden="true"
                    />
                    <div class="home-v2__feature-top">
                        <span class="home-v2__feature-symbol">{{ feature.icon }}</span>
                        <span class="home-v2__feature-number">0{{ index + 1 }}</span>
                    </div>
                    <h3>{{ feature.title }}</h3>
                    <p>{{ feature.body }}</p>
                    <div v-if="feature.meta" class="home-v2__feature-meta">{{ feature.meta }}</div>
                </article>
            </div>
        </section>

        <section class="home-v2__flow">
            <div class="home-v2__flow-card">
                <p class="eyebrow">From intention to amen</p>
                <h2>A quiet structure for returning to prayer.</h2>
                <div class="home-v2__steps">
                    <article v-for="(step, index) in prayerSteps" :key="step.title">
                        <span>{{ index + 1 }}</span>
                        <div>
                            <h3>{{ step.title }}</h3>
                            <p>{{ step.body }}</p>
                        </div>
                    </article>
                </div>
            </div>
            <blockquote>
                <span aria-hidden="true">“</span>
                <p>Prayer is the raising of one’s mind and heart to God.</p>
                <footer>— St. John Damascene, cited in the Catechism of the Catholic Church, 2559</footer>
            </blockquote>
        </section>

        <section class="home-v2__closing">
            <div>
                <p class="eyebrow">Begin simply</p>
                <h2>Your next prayer can begin here.</h2>
                <p>Gather what you already pray. Discover something new. Return tomorrow without guilt or noise.</p>
            </div>
            <a class="home-v2__button home-v2__button--light" href="/auth/google">
                Create my prayer list <span aria-hidden="true">→</span>
            </a>
        </section>
    </main>
</template>

<script setup lang="ts">
const homeFeatures = [
    { icon: 'IX', title: 'Novenas that know your place', body: 'Move through multi-day prayer one day at a time, with the right text and image waiting when you return.', meta: 'Day-by-day progress' },
    { icon: '✦', title: 'A library ready to pray', body: 'Discover public prayers, add them to your own list, and keep cherished devotions close at hand.', meta: 'Public prayer library' },
    { icon: '☩', title: 'Every intention held with care', body: 'Keep the names and needs entrusted to you alongside the prayers you offer for them.', meta: 'Personal and private' },
    { icon: '◐', title: 'Progress without pressure', body: 'Remember where you left off without streaks, scores, or the suggestion that grace can be measured.', meta: 'Gentle by design' },
];

const prayerSteps = [
    { title: 'Gather', body: 'Create a devotion or choose one from the public prayer library.' },
    { title: 'Return', body: 'Open the exact day and place you left, whenever you are ready.' },
    { title: 'Pray', body: 'Give your attention to God; Prayer List quietly keeps the rest in order.' },
];

const saints = [
    { mark: '⚜', name: 'Our Lady', patronage: 'Mother and intercessor' },
    { mark: '⚒', name: 'St. Joseph', patronage: 'Patron of the Church' },
    { mark: '⚿', name: 'St. Peter', patronage: 'Prince of the Apostles' },
    { mark: '✿', name: 'St. Thérèse', patronage: 'The Little Way' },
];
</script>
