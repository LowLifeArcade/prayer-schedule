# Roadmap

This roadmap captures likely product directions for the prayer schedule app. It is intentionally lightweight and should evolve as the app's audience, usage patterns, and technical needs become clearer.

## Near Term

- Polish core prayer flows so creating, viewing, editing, and marking prayers as prayed feels reliable and calm.
- Improve prayer progress tracking for both multi-day prayers and ordinary prayers.
- Clean up thumbnail display states, especially when prayer images do not have titles.
- Refine mobile and desktop layout details in the prayer viewing experience.
- Keep the app fast, simple, and useful before adding monetization or platform complexity.

## Decentralized Auth

- Explore adding a dedicated auth service instead of keeping authentication tightly coupled to app logic.
- Preserve the option for multiple identity providers, including Google and future alternatives.
- Evaluate user-owned identity patterns where appropriate, while keeping onboarding simple for non-technical users.
- Design account linking and migration paths before changing the existing auth model.
- Ensure auth decisions support future mobile apps, subscriptions, and cross-device prayer history.

## Subscription Tiers

- Define a free tier that keeps the core prayer scheduling experience accessible.
- Consider paid tiers for features such as advanced prayer tracking, richer personalization, private collections, family or group prayer lists, and enhanced reminders.
- Keep subscription logic separate from core prayer logic so the product can change without making the codebase brittle.
- Plan for entitlement checks across the API, UI, and future mobile clients.
- Decide which payment platform best fits the web app and future app store distribution.

## Ads

- Treat ads as a possible future path, not a default assumption.
- Avoid placing ads inside focused prayer experiences unless there is a clear user-respecting design.
- Consider ads only for public discovery, free-tier support, or non-intrusive surfaces.
- Revisit this after the app has enough usage data to understand whether ads would help or harm the product.

## App Store Availability

- Plan for an iOS app and potentially Android once the web experience is stable.
- Evaluate whether to ship with a native wrapper, a cross-platform framework, or a dedicated native app.
- Ensure auth, subscriptions, notifications, and offline behavior are designed with app store rules in mind.
- Prepare for app store requirements around privacy, account deletion, payments, and content moderation.
- Keep the web app installable and mobile-friendly while native app plans mature.

## Long-Term Product Ideas

- Prayer reminders and quiet notification settings.
- Personal prayer history and streaks that feel encouraging rather than punitive.
- Shared prayer lists for families, small groups, or parishes.
- Public prayer templates and curated devotional sets.
- Liturgical calendar awareness for seasonal prayers, novenas, and feast days.
- Better image tools for prayer thumbnails and devotional artwork.
