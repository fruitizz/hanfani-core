import type { AuthSpec } from '../types/index.js'

/** Narrow an AuthSpec to its oauth2 variant. */
export function isOAuth2(
  auth: AuthSpec,
): auth is { kind: 'oauth2'; provider: string; scopes: string[] } {
  return auth.kind === 'oauth2'
}
