import { instanceId } from './defineWorkflow.js'
import type { DeliveryResult, Destination, WorkflowDescriptor } from './types.js'

/**
 * Resolve where a payload should be delivered. Agent destinations resolve
 * directly; contract destinations validate the payload against the target
 * workflow's published input schema before resolving.
 */
export function resolveDelivery(
  workflows: WorkflowDescriptor[],
  origin: string,
  dest: Destination,
  payload: unknown,
): DeliveryResult {
  if (dest.kind === 'agent') {
    return { ok: true, instanceId: instanceId(origin, dest.agentId) }
  }

  const workflow = workflows.find((w) => w.id === dest.workflow)
  if (!workflow) return { ok: false, error: `unknown workflow "${dest.workflow}"` }

  const input = workflow.inputs.find((i) => i.name === dest.input)
  if (!input) return { ok: false, error: `workflow "${dest.workflow}" has no input "${dest.input}"` }

  return input.schema.safeParse(payload).success
    ? { ok: true, instanceId: instanceId(workflow.id, input.agentId), targetWorkflow: workflow.id }
    : { ok: false, error: `payload does not match contract "${dest.workflow}.${dest.input}"` }
}
