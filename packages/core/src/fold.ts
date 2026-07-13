import { EventType } from '@ag-ui/client'
import type { BaseEvent, Message } from '@ag-ui/client'
import type { Outcome } from './types.js'
import { LIFECYCLE_NOTE_TEXT } from './lifecycleNote.js'

type FoldToolCall = {
  id: string
  type: 'function'
  function: { name: string; arguments: string }
}

type FoldMessage = {
  id: string
  role: string
  content?: string
  toolCalls?: FoldToolCall[]
  toolCallId?: string
  targetAgentId?: string
  childWorkItemId?: string
  deduped?: boolean
}

type StreamEvent = BaseEvent & {
  messageId?: string
  delta?: string
  toolCallId?: string
  parentMessageId?: string
  toolCallName?: string
  content?: string
  name?: string
  value?: {
    outcome?: Outcome
    at?: number
    targetAgentId?: string
    childWorkItemId?: string
    deduped?: boolean
  }
}

/**
 * Fold an ag-ui event stream into a flat list of messages: text chunks merge by
 * messageId, tool calls attach to their parent assistant message, tool results
 * become tool messages, and lifecycle/handoff custom events become notes.
 */
export function foldEventsToMessages(events: readonly BaseEvent[]): Message[] {
  const messages = new Map<string, FoldMessage>()
  const parentByToolCall = new Map<string, string>()

  for (const raw of events) {
    const e = raw as StreamEvent
    switch (e.type) {
      case EventType.TEXT_MESSAGE_CHUNK: {
        const id = e.messageId
        if (!id) break
        const existing = messages.get(id)
        if (existing && existing.role === 'assistant') {
          existing.content = (existing.content ?? '') + (e.delta ?? '')
        } else {
          messages.set(id, { id, role: 'assistant', content: e.delta ?? '' })
        }
        break
      }
      case EventType.TOOL_CALL_START: {
        const id = e.toolCallId
        if (!id) break
        const parentId = e.parentMessageId ?? `tc-${id}`
        let parent = messages.get(parentId)
        if (!parent || parent.role !== 'assistant') {
          parent = { id: parentId, role: 'assistant', content: '', toolCalls: [] }
          messages.set(parentId, parent)
        }
        parent.toolCalls ||= []
        parent.toolCalls.push({
          id,
          type: 'function',
          function: { name: e.toolCallName ?? '', arguments: '' },
        })
        parentByToolCall.set(id, parentId)
        break
      }
      case EventType.TOOL_CALL_ARGS: {
        const id = e.toolCallId
        if (!id) break
        const parentId = parentByToolCall.get(id)
        if (!parentId) break
        const call = messages.get(parentId)?.toolCalls?.find((c) => c.id === id)
        if (call) call.function.arguments += e.delta ?? ''
        break
      }
      case EventType.TOOL_CALL_END:
        break
      case EventType.TOOL_CALL_RESULT: {
        const id = e.toolCallId
        const msgId = e.messageId ?? (id ? `result-${id}` : undefined)
        if (!msgId || !id) break
        messages.set(msgId, { id: msgId, role: 'tool', toolCallId: id, content: e.content ?? '' })
        break
      }
      case EventType.CUSTOM: {
        if (e.name === 'lifecycle') {
          const v = e.value
          if (v && v.outcome !== undefined) {
            const text = LIFECYCLE_NOTE_TEXT[v.outcome] || v.outcome
            const id = `lifecycle-${v.at}`
            messages.set(id, { id, role: 'system', content: text })
          }
          break
        }
        if (e.name === 'handoff' && e.value) {
          const v = e.value
          const id = `handoff-${v.childWorkItemId}`
          messages.set(id, {
            id,
            role: 'handoff',
            targetAgentId: v.targetAgentId,
            childWorkItemId: v.childWorkItemId,
            deduped: v.deduped,
          })
          break
        }
        break
      }
      default:
        break
    }
  }

  return [...messages.values()] as unknown as Message[]
}
