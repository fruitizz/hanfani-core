import { EventType } from '@ag-ui/client'
import type { BaseEvent, CustomEvent as AguiCustomEvent } from '@ag-ui/client'
import { z } from 'zod'

export const GATE_OPENED = 'GATE_OPENED' as const

export const GateOpenedValueSchema = z.object({
  gateKind: z.literal('approval'),
  toolName: z.string(),
  toolCallId: z.string(),
  proposedArtifact: z.record(z.unknown()),
})
export type GateOpenedValue = z.infer<typeof GateOpenedValueSchema>

/** Emit the custom event that opens a human-approval gate. */
export function gateOpened(value: GateOpenedValue): AguiCustomEvent {
  return { type: EventType.CUSTOM, name: GATE_OPENED, value } as AguiCustomEvent
}

/** Read a GATE_OPENED value off an event, or null if it isn't one. */
export function readGateOpened(event: BaseEvent): GateOpenedValue | null {
  const e = event as AguiCustomEvent
  if (e.type !== EventType.CUSTOM || e.name !== GATE_OPENED) return null
  const parsed = GateOpenedValueSchema.safeParse(e.value)
  return parsed.success ? parsed.data : null
}
