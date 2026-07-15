import type { WorkflowDescriptor } from '../types/index.js'

/** Stable instance id for an agent within a workflow. */
export function instanceId(workflowId: string, agentId: string): string {
  return `${workflowId}__${agentId}`
}

/**
 * Validate a workflow descriptor's internal consistency: unique agent ids, a
 * role:input entry agent, handoffs that point inside the workflow, unique input
 * names, and inputs bound to input-role agents. Returns the descriptor as-is.
 */
export function defineWorkflow(def: WorkflowDescriptor): WorkflowDescriptor {
  const agentIds = def.agents.map((a) => a.agent.id)
  const dupAgent = agentIds.find((id, i) => agentIds.indexOf(id) !== i)
  if (dupAgent) throw new Error(`workflow "${def.id}": duplicate agent id "${dupAgent}"`)

  const inputAgentIds = new Set(
    def.agents.filter((a) => a.role === 'input').map((a) => a.agent.id),
  )
  const allAgentIds = new Set(agentIds)

  if (!inputAgentIds.has(def.entryAgentId)) {
    throw new Error(
      `workflow "${def.id}": entry agent "${def.entryAgentId}" is not a role:input agent`,
    )
  }

  for (const a of def.agents) {
    for (const target of a.agent.handoffs ?? []) {
      if (!allAgentIds.has(target)) {
        throw new Error(
          `workflow "${def.id}": agent "${a.agent.id}" hands off to "${target}" which is not in this workflow`,
        )
      }
    }
  }

  const inputNames = def.inputs.map((i) => i.name)
  const dupInput = inputNames.find((n, i) => inputNames.indexOf(n) !== i)
  if (dupInput) throw new Error(`workflow "${def.id}": duplicate published input name "${dupInput}"`)

  for (const input of def.inputs) {
    if (!inputAgentIds.has(input.agentId)) {
      throw new Error(
        `workflow "${def.id}": input "${input.name}" is bound to "${input.agentId}" which is not a role:input agent`,
      )
    }
  }

  return def
}
