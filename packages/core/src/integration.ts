import type { HealthCheck } from './types.js'

/** Narrow a HealthCheck to its ok variant. */
export function isOk(h: HealthCheck): h is { ok: true; detail?: string } {
  return h.ok
}

/** Return the first failing check, or an ok result if all pass. */
export function aggregateHealth(checks: HealthCheck[]): HealthCheck {
  for (const check of checks) {
    if (!check.ok) return check
  }
  return { ok: true }
}
