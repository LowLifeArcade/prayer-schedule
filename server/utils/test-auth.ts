export const TEST_USERS = {
    owner: {
        uid: 'test-owner-user',
        sub: 'test-owner-google-sub',
        name: 'Test Owner',
        given_name: 'Test',
        family_name: 'Owner',
        picture: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/%3E',
        email: 'test-owner@example.invalid',
        email_verified: true as const,
    },
    member: {
        uid: 'test-member-user',
        sub: 'test-member-google-sub',
        name: 'Test Member',
        given_name: 'Test',
        family_name: 'Member',
        picture: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/%3E',
        email: 'test-member@example.invalid',
        email_verified: true as const,
    },
};

export function assertTestAuthEnabled() {
    if (!import.meta.dev || process.env.TEST_AUTH_BYPASS !== 'true') {
        throw createError({ statusCode: 404, message: 'Not found' });
    }
}
