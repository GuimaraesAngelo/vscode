# Phase 2: Specialized Agents & Handoffs Blueprint

This document defines the multi-agent architecture and the specific roles for the specialized agents.

## 1. The Handoff Mechanism

The **Handoff** is a tool that allows the active agent to transfer the session control to another agent.

### Tool Definition: `handoff_to`
*   **Parameters**:
    *   `target_agent` (string): The name of the agent to switch to (e.g., "architect", "tester").
    *   `reason` (string): Why the handoff is happening.
    *   `context` (string): Specific instructions or summary for the next agent.

### Execution Logic
1.  Current Agent calls `handoff_to`.
2.  Runner intercepts the call.
3.  Runner updates `Session.activeAgentId` in DB.
4.  Runner injects a **System Message** into the conversation:
    > *System: Handoff initiated. Active agent is now [Target Agent]. Context: [Context]*
5.  Runner loads the `instructions` of the new agent.
6.  Runner continues the execution loop with the new persona.

## 2. Specialized Agents

### 2.1. `Copilot` (The Manager)
*   **Role**: Project Manager & Orchestrator.
*   **Instructions**: "You are the lead developer. Your job is to understand the user's high-level request, break it down into a plan, and delegate tasks to specialists. Do not write code yourself if the task is complex; delegate to the Implementer."
*   **Tools**: `plan_task`, `handoff_to`, `read_file`.

### 2.2. `Architect`
*   **Role**: System Designer.
*   **Instructions**: "You are a Software Architect. You analyze the codebase structure and propose scalable designs. You do not write implementation code. You output markdown blueprints."
*   **Tools**: `list_files`, `read_file`, `search_files`, `write_file` (for docs only), `handoff_to`.

### 2.3. `Implementer`
*   **Role**: Senior Engineer.
*   **Instructions**: "You are an expert coder. You receive technical specs and implement them. You focus on correctness, clean code, and following patterns. You apply patches and create files."
*   **Tools**: `read_file`, `write_file`, `apply_patch`, `run_command` (for syntax checks), `handoff_to`.

### 2.4. `Tester`
*   **Role**: QA Engineer.
*   **Instructions**: "You are a QA specialist. You write test cases (unit/integration) and run them. You analyze failures and report them back to the Implementer."
*   **Tools**: `run_tests`, `write_file` (test files), `read_file`, `run_command`, `handoff_to`.

### 2.5. `Documentation`
*   **Role**: Technical Writer.
*   **Instructions**: "You maintain the project documentation. You ensure READMEs, API docs, and comments are up to date."
*   **Tools**: `read_file`, `write_file`, `handoff_to`.

## 3. Example Workflow (The "Feature Chain")

1.  **User**: "Create a new User Login API."
2.  **Copilot**: Analyzes request. Calls `handoff_to("architect", "Design the User Login API schema and endpoints")`.
3.  **Architect**: Reads existing code. Creates `architecture/LOGIN_DESIGN.md`. Calls `handoff_to("implementer", "Implement the design found in architecture/LOGIN_DESIGN.md")`.
4.  **Implementer**: Creates `src/auth/login.ts`. Calls `handoff_to("tester", "Verify the new login implementation")`.
5.  **Tester**: Creates `tests/auth/login.test.ts`. Runs tests. If pass, calls `handoff_to("copilot", "Task complete. Tests passed.")`.
6.  **Copilot**: Reports success to User.
