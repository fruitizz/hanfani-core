import { EventType } from '@ag-ui/client'
import type { BaseEvent } from '@ag-ui/client'
import type { Outcome } from './types.js'

export interface LifecycleNoteValue {
  kind: 'lifecycle'
  outcome: Outcome
  actor: string | null
  at: number
}

/** Emit a lifecycle note event. */
export function lifecycleNote(value: LifecycleNoteValue): BaseEvent {
  return { type: EventType.CUSTOM, name: 'lifecycle', value } as unknown as BaseEvent
}

/** Human-readable label shown for each terminal outcome. */
export const LIFECYCLE_NOTE_TEXT: Record<Outcome, string> = {
  running: '',
  done: 'Done',
  stopped: 'Stopped — cancelled',
  rejected: 'Rejected',
  error: 'Error',
  superseded: 'Superseded by a re-run',
  reset: 'Cleared from board',
  dismissed: 'Error acknowledged — dismissed',
}
