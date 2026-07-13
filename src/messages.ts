import type { Message, ToolCall } from '@ag-ui/client'

export type AssistantMessage = Extract<Message, { role: 'assistant' }>
export type ToolMessage = Extract<Message, { role: 'tool' }>

/** Type guard for assistant messages. */
export function isAssistant(m: Message): m is AssistantMessage {
  return m.role === 'assistant'
}

/** Type guard for tool-result messages. */
export function isToolMessage(m: Message): m is ToolMessage {
  return m.role === 'tool'
}

/** The tool calls on a message (empty for non-assistant messages). */
export function toolCallsOf(m: Message): ToolCall[] {
  return isAssistant(m) && Array.isArray(m.toolCalls) ? m.toolCalls : []
}

/** True when an approval tool has been called but has no tool result yet. */
export function hasPendingApproval(
  messages: readonly Message[],
  approvalNames: readonly string[],
): boolean {
  const resolvedIds = new Set<string>()
  for (const m of messages) {
    if (isToolMessage(m) && typeof m.toolCallId === 'string') resolvedIds.add(m.toolCallId)
  }
  for (const m of messages) {
    for (const call of toolCallsOf(m)) {
      if (
        approvalNames.includes(call.function.name) &&
        typeof call.id === 'string' &&
        !resolvedIds.has(call.id)
      ) {
        return true
      }
    }
  }
  return false
}

/** Map each tool result message by the toolCallId it answers. */
export function pairToolResults(messages: readonly Message[]): Map<string, ToolMessage> {
  const byCallId = new Map<string, ToolMessage>()
  for (const m of messages) {
    if (isToolMessage(m) && typeof m.toolCallId === 'string') byCallId.set(m.toolCallId, m)
  }
  return byCallId
}

/** Parsed arguments of the most recent approval tool call, or null. */
export function lastApprovalArgs(
  messages: readonly Message[],
  approvalNames: readonly string[],
): Record<string, unknown> | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (!m) continue
    for (const call of toolCallsOf(m)) {
      if (approvalNames.includes(call.function.name)) {
        try {
          return JSON.parse(call.function.arguments)
        } catch {
          return null
        }
      }
    }
  }
  return null
}

/** How many approval tool calls have a matching tool result. */
export function resolvedApprovalCount(
  messages: readonly Message[],
  approvalNames: readonly string[],
): number {
  const approvalCallIds = new Set<string>()
  for (const m of messages) {
    for (const call of toolCallsOf(m)) {
      if (approvalNames.includes(call.function.name) && typeof call.id === 'string') {
        approvalCallIds.add(call.id)
      }
    }
  }
  const resolved = new Set<string>()
  for (const m of messages) {
    if (isToolMessage(m) && typeof m.toolCallId === 'string' && approvalCallIds.has(m.toolCallId)) {
      resolved.add(m.toolCallId)
    }
  }
  return resolved.size
}

/** True when at least one approval call has resolved. */
export function approvalResolved(
  messages: readonly Message[],
  approvalNames: readonly string[],
): boolean {
  return resolvedApprovalCount(messages, approvalNames) > 0
}
