/** Prepend the workflow-level prompt (if any) to an agent's own instructions. */
export function composeInstructions(
  workflowPrompt: string | undefined,
  agentInstructions: string,
): string {
  const prefix = workflowPrompt?.trim()
  return prefix ? `${prefix}\n\n${agentInstructions}` : agentInstructions
}
