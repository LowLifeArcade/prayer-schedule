export function uuidv7() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    // Set timestamp (6 bytes)
    const now = Date.now();
    bytes[0] = now >> 40;
    bytes[1] = now >> 32;
    bytes[2] = now >> 24;
    bytes[3] = now >> 16;
    bytes[4] = now >> 8;
    bytes[5] = now;

    // Set version (7) and variant (10)
    bytes[6] = (bytes[6] & 0x0f) | 0x70;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    // Convert to hex
    return Array.from(bytes)
        .map((b, i) => (i === 4 || i === 6 || i === 8 || i === 10 ? '-' : '') + b.toString(16).padStart(2, '0'))
        .join('');
}
