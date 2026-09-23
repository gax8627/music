// Share token utilities
// URL format: ?s=<slug>.<token>
// - slug: human-readable song title (cosmetic only, not used for validation)
// - token: 12-char SHA-256 derived base64url (used for security validation)
// Example: ?s=un-simple-te-extrano.aB3kP9xQr2

const SHARE_SALT = 'qp_2026_rg';
const TOKEN_LENGTH = 12;

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function hashToken(songId: string): Promise<string> {
  const data = new TextEncoder().encode(SHARE_SALT + songId);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  return toBase64Url(hashArray).slice(0, TOKEN_LENGTH);
}

function hashTokenSync(songId: string): string {
  console.warn('[shareToken] Subtle crypto unavailable; using fallback hash algorithm');
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  let h3 = 0x9e3779b9;
  const str = `${SHARE_SALT}:${songId}:${SHARE_SALT}`;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 0x01000193);
    h2 = Math.imul(h2 ^ (code + i), 0x5bd1e995);
    h3 = Math.imul(h3 ^ (code * 31), 0x27d4eb2d);
  }
  const u8 = new Uint8Array(9);
  const v1 = h1 >>> 0;
  const v2 = h2 >>> 0;
  const v3 = h3 >>> 0;
  u8[0] = (v1 >> 24) & 0xff;
  u8[1] = (v1 >> 16) & 0xff;
  u8[2] = (v1 >> 8) & 0xff;
  u8[3] = v1 & 0xff;
  u8[4] = (v2 >> 16) & 0xff;
  u8[5] = (v2 >> 8) & 0xff;
  u8[6] = v2 & 0xff;
  u8[7] = (v3 >> 8) & 0xff;
  u8[8] = v3 & 0xff;
  return toBase64Url(u8).slice(0, TOKEN_LENGTH);
}

const isCryptoAvailable =
  typeof crypto !== 'undefined' &&
  typeof crypto.subtle !== 'undefined' &&
  typeof crypto.subtle.digest === 'function';

/**
 * Converts a song title into a clean URL slug.
 * Strips diacritics, lowercases, replaces spaces with hyphens.
 * Max 45 chars so URLs stay readable.
 */
export function slugify(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics (é→e, ñ→n, etc.)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')   // keep alphanumeric, spaces, hyphens
    .trim()
    .replace(/\s+/g, '-')           // spaces → hyphens
    .replace(/-+/g, '-')            // collapse multiple hyphens
    .slice(0, 45);                  // max length
}

/**
 * Encode a song ID into a 12-char base64url token.
 */
export async function encodeShareToken(songId: string): Promise<string> {
  if (isCryptoAvailable) {
    return hashToken(songId);
  }
  return hashTokenSync(songId);
}

/**
 * Decode a share token back to a song ID.
 * The value may be a plain token or "slug.token" — only the token (last TOKEN_LENGTH chars after '.') is validated.
 * Returns the matching song ID string, or null if not found.
 */
export async function decodeShareToken(
  value: string,
  allSongIds: string[]
): Promise<string | null> {
  // Support both "slug.token" and plain "token" formats
  const dotIdx = value.lastIndexOf('.');
  const token = dotIdx !== -1 ? value.slice(dotIdx + 1) : value;
  if (!token || token.length !== TOKEN_LENGTH) {
    return null;
  }

  for (const id of allSongIds) {
    const candidate = isCryptoAvailable ? await hashToken(id) : hashTokenSync(id);
    if (candidate === token) return id;
  }
  return null;
}

/**
 * Build a complete share URL for a song, including a human-readable slug.
 * Format: https://example.com/?s=song-title-slug.aB3kP9xQr2
 */
export async function buildShareUrl(songId: string, title: string): Promise<string> {
  const token = await encodeShareToken(songId);
  const slug = encodeURIComponent(slugify(title));
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}?s=${slug}.${token}`;
}
