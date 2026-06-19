# Prayer Schedule

Prayer Schedule is a Nuxt app for keeping Catholic prayers, novenas, chaplets, intentions, and daily devotions organized in one place. Users can sign in, build a personal prayer list, create single-day or multi-day prayers, track progress, and add public prayer templates to their own list.

## Features

- Google login with persisted user records.
- Personal prayer list with drag-and-drop ordering.
- Single-day and multi-day prayer creation.
- Structured prayer content blocks for text, images, and day-specific content.
- Prayer progress tracking for multi-day prayers.
- Public prayer library for sharing reusable prayer templates.
- Image support for prayer content and thumbnails.
- Local D1 development workflow with migrations and seed data.

## Tech Stack

- Nuxt 4
- Vue 3
- Cloudflare Workers
- Cloudflare D1
- Nitro Cloudflare preset
- `nuxt-auth-utils`
- `vue-draggable-plus`
- `tesseract.js` for image-to-text import helpers

## Project Structure

- `app/pages` - Nuxt pages for the home/prayer list, prayer detail, editing, and public prayers.
- `app/components` - Shared Vue components.
- `app/composables` - Client-side helpers such as theme and prayer image tooling.
- `server/api` - API endpoints for prayers, public prayers, progress, and list actions.
- `server/routes/auth` - Auth routes, including Google OAuth.
- `db/migrations` - D1 migration files used for local and remote databases.
- `db/dev` - Local reset, schema reference, and seed files.
- `ROADMAP.md` - Product direction and future planning notes.
- `TASKS.md` - Current implementation task list.

## Setup

Install dependencies:

```bash
npm install
```

Create a local environment file with the auth values required by `nuxt-auth-utils`:

```bash
NUXT_SESSION_PASSWORD=
NUXT_OAUTH_GOOGLE_CLIENT_ID=
NUXT_PUBLIC_OAUTH_GOOGLE_CLIENT_ID=
NUXT_OAUTH_GOOGLE_CLIENT_SECRET=
```

The session password should be a long secret value. The Google OAuth values should match the OAuth client configured for the app.

## Development

Start the Nuxt development server:

```bash
npm run dev
```

The dev command runs with `CLOUDFLARE_ENV=dev` so local Cloudflare/D1 bindings are used through the Nitro Cloudflare development setup.

## Database

Database structure is managed through D1 migrations in `db/migrations`.

Apply migrations locally:

```bash
npm run db:migrate:local
```

Rebuild the local database with seed data:

```bash
npm run db:fresh
```

Apply migrations remotely:

```bash
npm run db:migrate:remote
```

Useful database commands:

```bash
npm run db:list
npm run db:info
npm run db:migrate:status
npm run db:query:local -- "SELECT * FROM prayers LIMIT 5"
npm run db:shell
```

`db/dev/schema.sql` is kept as a local reference/reset schema only. Use migrations to evolve the database.

## Build And Preview

Build the app:

```bash
npm run build
```

Preview the Cloudflare Worker locally:

```bash
npm run preview
```

## Deploy

Deploy to Cloudflare:

```bash
npm run deploy
```

The Worker configuration lives in `wrangler.jsonc`. The app expects the `PRAYERS` D1 binding to be available.

## Planning Docs

Current planning lives in:

- `ROADMAP.md` for larger product direction.
- `TASKS.md` for near-term implementation work.
