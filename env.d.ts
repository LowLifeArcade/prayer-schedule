/// <reference types="./worker-configuration.d.ts" />

declare module 'h3' {
    interface H3EventContext {
        cf: CfProperties;
        cloudflare: {
            request: Request;
            env: Env;
            context: ExecutionContext;
        };
    }
}

declare global {
    interface Window {
        __PRAYER_TEST_OCR_TEXT__?: string;
    }
}

export {};
