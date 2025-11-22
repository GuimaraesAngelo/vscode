# Agents Core Blueprint

The `agents-core` is the runtime engine that powers the IDE. It is built on top of the OpenAI Agents SDK.

## 1. Core Concepts

### The Agent
An Agent is defined by:
*   **Name**: e.g., "Copilot", "Architect", "Tester".
*   **Model**: `gpt-4-turbo` or `gpt-4o`.
*   **Instructions**: System prompt defining behavior and persona.
*   **Tools**: A set of enabled capabilities.

### The Session
A continuous thread of interaction.
*   Persisted in DB.
*   Contains `messages` (User, Assistant, Tool).
*   Maintains `variables` (context).

### The Runner
The execution loop that processes a user request.
1.  Append User Message to Session.
2.  Call LLM with History + Tools.
3.  **Loop**:
    *   Receive `tool_calls`.
    *   Execute Tools (in `src/tools`).
    *   Append `tool_outputs`.
    *   Call LLM again.
4.  Receive Final Answer.
5.  Stream response to UI.

## 2. Implementation Details (TypeScript)

### `Agent` Interface
```typescript
interface AgentConfig {
  id: string;
  name: string;
  role: string;
  instructions: string;
  model: string;
  allowedTools: string[]; // List of tool names
}
```

### `AgentRunner` Class
```typescript
class AgentRunner {
  constructor(private session: Session, private agent: AgentConfig) {}

  async run(userMessage: string): Promise<void> {
    // 1. Save User Message
    await this.session.addMessage({ role: 'user', content: userMessage });

    // 2. Start OpenAI Run
    const stream = await openai.beta.threads.runs.createAndStream({
      assistant_id: this.agent.id,
      thread_id: this.session.threadId,
    });

    // 3. Handle Events
    for await (const event of stream) {
      if (event.event === 'thread.run.requires_action') {
        await this.handleToolCalls(event.data);
      }
      // ... handle text deltas for UI streaming
    }
  }

  private async handleToolCalls(runData: any) {
    // Execute tools and submit outputs
  }
}
```

## 3. Handoff Mechanism
The `handoff_to` tool allows an agent to transfer control.

*   **Tool Definition**:
    *   `name`: `handoff_to`
    *   `params`: `{ target_agent: string, context: string }`
*   **Logic**:
    1.  Current Agent calls `handoff_to("QA_Specialist", "Check these tests")`.
    2.  Runner pauses.
    3.  Runner switches active `AgentConfig` to "QA_Specialist".
    4.  Runner injects a "System Note" into the thread: *"Transferred to QA_Specialist. Context: Check these tests"*.
    5.  Runner resumes execution with the new Agent's instructions.

## 4. Guardrails
*   **Approval Mode**: Critical tools (e.g., `delete_file`, `git_push`) require User Approval via UI.
*   **Token Limits**: Hard caps on execution loops to prevent infinite spending.
*   **Timeout**: Auto-terminate runs taking longer than X minutes.
