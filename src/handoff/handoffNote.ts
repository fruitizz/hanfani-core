import { EventType } from '@ag-ui/client'
import type { BaseEvent } from '@ag-ui/client'

export interface HandoffNoteValue {
  kind: 'handoff'
  targetAgentId: string
  childWorkItemId: string
  deduped: boolean
  at: number
}

/** Emit a handoff note event. */
export function handoffNote(value: HandoffNoteValue): BaseEvent {
  return { type: EventType.CUSTOM, name: 'handoff', value } as unknown as BaseEvent
}
