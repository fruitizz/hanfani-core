import { z } from 'zod'
import type { Message, RunAgentInput } from '@ag-ui/client'

export const HandoffPayloadSchema = z.object({
  threadId: z.string(),
  from: z.string(),
  subject: z.string(),
  summary: z.string(),
  category: z.string(),
  priority: z.string(),
})
export type HandoffPayload = z.infer<typeof HandoffPayloadSchema>

export const TicketHandoffPayloadSchema = z.object({
  repo: z.string(),
  number: z.number(),
  title: z.string(),
  status: z.string(),
  priority: z.string(),
  body: z.string(),
  lastComment: z
    .object({
      author: z.string(),
      body: z.string(),
    })
    .nullable(),
  recommendation: z.string(),
  url: z.string(),
})
export type TicketHandoffPayload = z.infer<typeof TicketHandoffPayloadSchema>

const HANDOFF_PREFIX = '[handoff]'

/** Encode a payload as a user message that downstream agents can decode. */
export function encodeHandoff(payload: unknown): Message {
  return {
    id: crypto.randomUUID(),
    role: 'user',
    content: `${HANDOFF_PREFIX} ${JSON.stringify(payload)}`,
  }
}

/** Decode the most recent handoff payload in the run input, validated by `schema`. */
export function decodeHandoff<T>(input: RunAgentInput, schema: z.ZodType<T>): T | null {
  const messages = input?.messages ?? []
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (m && m.role === 'user' && typeof m.content === 'string' && m.content.startsWith(HANDOFF_PREFIX)) {
      try {
        const parsed = schema.safeParse(JSON.parse(m.content.slice(HANDOFF_PREFIX.length).trim()))
        return parsed.success ? parsed.data : null
      } catch {
        return null
      }
    }
  }
  return null
}
