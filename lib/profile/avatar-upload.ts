/**
 * Avatar upload client (Sprint 2 / Epic E1.2).
 *
 * Keeps network + validation logic out of the React component (SRP).
 * Errors surface as thrown Error instances so callers can toast them.
 *
 * Mirror of the backend `AvatarStorageService` contract: same limits,
 * same allowed MIME types. Any client-side rejection is a UX optimization
 * — the backend remains the source of truth.
 */

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_ALLOWED_MIME = ['image/png', 'image/jpeg'] as const;

export interface AvatarUploadResult {
  success: boolean;
  message: string;
  avatar_url: string | null;
}

export function validateAvatarLocally(file: File): void {
  if (!AVATAR_ALLOWED_MIME.includes(file.type as (typeof AVATAR_ALLOWED_MIME)[number])) {
    throw new Error(
      `Unsupported image type '${file.type}'. Allowed: PNG, JPEG.`
    );
  }
  if (file.size > AVATAR_MAX_BYTES) {
    throw new Error(
      `Image is too large (${Math.round(file.size / 1024)} KB; max ${Math.round(
        AVATAR_MAX_BYTES / 1024
      )} KB).`
    );
  }
}

function graphqlHttpBase(): string {
  // Derive base from the GraphQL URL so dev / prod point at the same host.
  const gql = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8000/graphql';
  return gql.replace(/\/graphql\/?$/, '');
}

export async function uploadAvatar(
  file: File,
  accessToken: string
): Promise<AvatarUploadResult> {
  validateAvatarLocally(file);

  const form = new FormData();
  form.append('file', file);

  const resp = await fetch(`${graphqlHttpBase()}/api/profile/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });

  let payload: AvatarUploadResult;
  try {
    payload = (await resp.json()) as AvatarUploadResult;
  } catch {
    throw new Error(`Upload failed (HTTP ${resp.status})`);
  }

  if (!resp.ok || !payload.success) {
    throw new Error(payload.message || `Upload failed (HTTP ${resp.status})`);
  }
  return payload;
}
