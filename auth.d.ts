// types/auth.d.ts
declare module '#auth-utils' {
    interface User {
        sub: string; // '1111111111111111111111';
        name: string;
        given_name: string;
        family_name: string;
        picture: string;
        email: string;
        email_verified: true;
    }

    interface UserSession {
        user: User;
    }
}

export {};
