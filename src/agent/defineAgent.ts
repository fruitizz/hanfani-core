import { z } from 'zod'

/**
 * The agent contract. `superRefine` enforces the framework's structural rules:
 * approvals/renders/dispatches must be declared tools, and every effect must be
 * an approval (so a side effect can never fire without a human gate).
 */
export const AgentDefinitionSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    provider: z.string(),
    instructions: z.string(),
    tools: z.array(z.string()),
    approvals: z.array(z.string()),
    renders: z.record(z.string()),
    handoffs: z.array(z.string()).optional(),
    maxInstances: z.number().int().positive().default(1),
    effects: z.array(z.string()).default([]),
    readonly: z.array(z.string()).default([]),
    dispatches: z.array(z.string()).default([]),
  })
  .superRefine((def, ctx) => {
    for (const approval of def.approvals) {
      if (!def.tools.includes(approval)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `approval "${approval}" is not declared in tools`,
        })
      }
    }
    for (const renderKey of Object.keys(def.renders)) {
      if (!def.tools.includes(renderKey)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `render key "${renderKey}" is not declared in tools`,
        })
      }
    }
    for (const effect of def.effects) {
      if (!def.approvals.includes(effect)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `effect "${effect}" is not an approval`,
        })
      }
    }
    for (const dispatch of def.dispatches) {
      if (!def.tools.includes(dispatch)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `dispatch "${dispatch}" is not declared in tools`,
        })
      }
    }
  })

export type AgentDefinition = z.infer<typeof AgentDefinitionSchema>
export type AgentDefinitionInput = z.input<typeof AgentDefinitionSchema>

/** Validate and construct an agent definition; throws on a tool/approval/effect rule violation. */
export function defineAgent(def: AgentDefinitionInput): AgentDefinition {
  return AgentDefinitionSchema.parse(def)
}
