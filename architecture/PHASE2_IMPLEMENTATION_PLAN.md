# Phase 2: Specialized Agents & Handoff Implementation

This document outlines the implementation plan for specialized agents, handoffs, and advanced tools.

## 1. Specialized Agents Seed

We will create a `seed.ts` script to populate the database with the following agents:

| Agent | Slug | Role | Tools |
| :--- | :--- | :--- | :--- |
| **Copilot** | `copilot` | Manager | `plan_task`, `handoff_to`, `read_file`, `list_files` |
| **Architect** | `architect` | Architect | `read_file`, `list_files`, `search_files`, `handoff_to` |
| **Implementer** | `implementer` | Engineer | `read_file`, `write_file`, `apply_patch`, `run_command`, `handoff_to` |
| **Tester** | `tester` | QA | `run_tests`, `read_file`, `write_file`, `run_command`, `handoff_to` |

## 2. Handoff Mechanism

### 2.1. Tool Definition: `handoff_to`
```typescript
const HandoffTool = {
  name: 'handoff_to',
  description: 'Delegate the current task to a specialized agent.',
  schema: z.object({
    target_agent: z.enum(['architect', 'implementer', 'tester', 'copilot']),
    reason: z.string(),
    context: z.string().describe('Context/Instructions for the target agent')
  })
}
```

### 2.2. AgentRunner Adaptation
The `AgentRunner` will detect when `handoff_to` is called. Instead of just logging it, it will:
1.  **Pause** the current OpenAI Run.
2.  **Switch** the active `AgentConfig` to the target agent.
3.  **Inject** a system message: `[System] Handoff from {prev} to {next}: {context}`.
4.  **Resume** execution with the new agent's instructions.

## 3. Advanced Tools

### 3.1. `apply_patch`
*   **Input**: `path`, `diff` (Unified Diff format).
*   **Logic**:
    1.  Read file.
    2.  Apply diff using `diff` library (e.g., `diff` npm package).
    3.  Write back if successful.
    4.  Return success/failure message.

### 3.2. `run_tests`
*   **Input**: `command` (optional, defaults to project setting).
*   **Logic**:
    1.  Execute shell command.
    2.  Capture stdout/stderr.
    3.  Return exit code and output.

## 4. Implementation Order
1.  **Tools**: Implement `apply_patch` and `run_tests`.
2.  **Seed**: Create `src/agents-core/seed.ts`.
3.  **Handoff**: Update `AgentRunner` to handle `handoff_to`.
4.  **UI**: Update `CopilotPanel` to show agent switches.
