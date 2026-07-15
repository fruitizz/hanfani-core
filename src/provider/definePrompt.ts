import type { RunAgentInput } from '@ag-ui/client'
import type { z } from 'zod'
import { decodeHandoff } from '../handoff/handoff.js'
import type { PromptStrategy, ResumeOutcome } from '../types/index.js'

export interface PromptSpec<T> {
  input?: z.ZodType<T>
  onInput?: (payload: T) => string
  onStart: () => string
  onResume?: (result: Record<string, unknown>) => ResumeOutcome
}

/**
 * Build a prompt strategy: on the first turn, decode any handoff payload and
 * route it through `onInput`, else `onStart`; on resume, hand the executed
 * result to `onResume`.
 */
export function definePrompt<T>(spec: PromptSpec<T>): PromptStrategy {
  const { onResume } = spec
  return {
    buildFirst(input: RunAgentInput): string {
      if (spec.input && spec.onInput) {
        const payload = decodeHandoff(input, spec.input)
        if (payload) return spec.onInput(payload)
      }
      return spec.onStart()
    },
    buildResume: onResume
      ? (_args: Record<string, unknown>, executedResult?: Record<string, unknown>) =>
          onResume(executedResult ?? {})
      : undefined,
  }
}
