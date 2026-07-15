import type { Lifecycle, Outcome, Phase } from '../types/index.js'

const LIVE_PHASES = new Set<Phase>(['queued', 'active', 'awaiting_human'])
const SILENT_OUTCOMES = new Set<Outcome>(['superseded', 'reset', 'dismissed'])
const FAILED_OUTCOMES = new Set<Outcome>(['stopped', 'rejected', 'error'])
const COVERING_OUTCOMES = new Set<Outcome>(['done', 'stopped', 'rejected'])

/**
 * Derive display lifecycle from a work item's phase/outcome plus whether it has
 * a render card and whether it has a live descendant.
 */
export function lifecycle(
  phase: Phase,
  outcome: Outcome,
  hasCard: boolean,
  hasLiveDescendant: boolean,
): Lifecycle {
  const isLive = LIVE_PHASES.has(phase)
  let isVisible: boolean
  if (phase === 'queued') isVisible = false
  else if (isLive) isVisible = true
  else if (SILENT_OUTCOMES.has(outcome)) isVisible = false
  else isVisible = hasCard || FAILED_OUTCOMES.has(outcome) || hasLiveDescendant
  const covers = isLive || COVERING_OUTCOMES.has(outcome)
  return { phase, outcome, isLive, isVisible, covers }
}

/**
 * Given flat parent/child rows, return the set of ids that have at least one
 * live descendant (a queued/active/awaiting_human node somewhere below them).
 */
export function hasLiveDescendant<T extends { id: string; parentId: string | null; phase: Phase }>(
  rows: readonly T[],
): Set<string> {
  const childrenByParent = new Map<string, T[]>()
  for (const row of rows) {
    if (!row.parentId) continue
    const siblings = childrenByParent.get(row.parentId) ?? []
    siblings.push(row)
    childrenByParent.set(row.parentId, siblings)
  }

  const memo = new Map<string, boolean>()
  const visit = (id: string): boolean => {
    const cached = memo.get(id)
    if (cached !== undefined) return cached
    memo.set(id, false) // guard against cycles
    let live = false
    for (const child of childrenByParent.get(id) ?? []) {
      if (LIVE_PHASES.has(child.phase) || visit(child.id)) live = true
    }
    memo.set(id, live)
    return live
  }

  const result = new Set<string>()
  for (const row of rows) {
    if (visit(row.id)) result.add(row.id)
  }
  return result
}
