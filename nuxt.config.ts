// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    css: ['~/assets/css/main.css'],
    runtimeConfig: {
        public: {
            oauthGoogleClientId: '',
        },
    },
    nitro: {
        preset: 'cloudflare_module',
        experimental: {
            database: true,
        },
        devDatabase: {
            default: {
                connector: 'cloudflare-d1',
                options: { bindingName: 'PRAYERS' },
            },
        },
        database: {
            default: {
                connector: 'cloudflare-d1',
                options: { bindingName: 'PRAYERS' },
            },
            // users: {
            //     connector: 'cloudflare-d1',
            //     options: { bindingName: 'USERS' },
            // },
        },
        cloudflare: {
            deployConfig: true,
            // nodeCompat: true,
            wrangler: {
                name: 'prayerschedule',
                compatibility_date: '2026-03-10',
                compatibility_flags: ['nodejs_compat'],
                observability: { enabled: true },
                vars: { ENV: 'prod' },
                d1_databases: [
                    {
                        binding: 'PRAYERS',
                        database_name: 'prayers-db',
                        database_id: '0f888000-373c-422f-9920-526b2d20a406',
                        migrations_dir: 'db/migrations',
                    },
                ],
            },
            dev: {
                environment: 'dev',
            },
        },
        typescript: {
            tsConfig: {
                compilerOptions: {
                    types: ['@cloudflare/workers-types'],
                },
            },
        },
    },

    modules: ['nitro-cloudflare-dev', 'nuxt-auth-utils'],
});
