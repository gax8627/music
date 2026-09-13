// Share token utilities
// Converts sequential song IDs into short, unguessable tokens for share URLs.
// Uses SHA-256 via SubtleCrypto (async) for token generation.
// Token format: 12-char base64url (URL-safe, no padding).

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
  const raw = SHARE_SALT + songId;
  return btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '').slice(0, TOKEN_LENGTH);
}

const isCryptoAvailable =
  typeof crypto !== 'undefined' &&
  typeof crypto.subtle !== 'undefined' &&
  typeof crypto.subtle.digest === 'function';

/**
 * Encode a song ID into a share token.
 * Returns a Promise<string> of a 12-char base64url token.
 */
export async function encodeShareToken(songId: string): Promise<string> {
  if (isCryptoAvailable) {
    return hashToken(songId);
  }
  return hashTokenSync(songId);
}

/**
 * Decode a share token back to a song ID by checking all known IDs.
 * Returns the matching song ID string, or null if not found.
 */
export async function decodeShareToken(
  token: string,
  allSongIds: string[]
): Promise<string | null> {
  for (const id of allSongIds) {
    const candidate = isCryptoAvailable ? await hashToken(id) : hashTokenSync(id);
    if (candidate === token) return id;
  }
  return null;
}

/**
 * Build a complete share URL for a song.
 */
export async function buildShareUrl(songId: string): Promise<string> {
  const token = await encodeShareToken(songId);
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}?s=${token}`;
}
