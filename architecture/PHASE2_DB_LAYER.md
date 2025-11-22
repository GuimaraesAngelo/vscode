# Phase 2: Database Layer Blueprint

This document defines the architecture for the `src/agents-core/db` module, responsible for all data persistence using Prisma.

## 1. Module Structure

```text
src/agents-core/db/
├── prisma.ts                # Singleton PrismaClient instance
├── index.ts                 # Exports
├── repositories/
│   ├── agents-repository.ts
│   ├── sessions-repository.ts
│   ├── messages-repository.ts
│   ├── runs-repository.ts
│   └── tool-calls-repository.ts
```

## 2. Repository Specifications

### 2.1. `AgentsRepository`
*   **Purpose**: Manage agent definitions and their enabled tools.
*   **Methods**:
    *   `create(data: CreateAgentDTO): Promise<Agent>`
    *   `findByName(name: string): Promise<Agent | null>`
    *   `updateInstructions(id: string, instructions: string): Promise<Agent>`
    *   `enableTool(agentId: string, toolName: string): Promise<void>`
    *   `getTools(agentId: string): Promise<string[]>`

### 2.2. `SessionsRepository`
*   **Purpose**: Manage conversation lifecycle.
*   **Methods**:
    *   `create(title?: string): Promise<Session>`
    *   `findById(id: string): Promise<SessionWithMessages>`
    *   `setActiveAgent(sessionId: string, agentId: string): Promise<Session>`
    *   `listActive(): Promise<Session[]>`

### 2.3. `MessagesRepository`
*   **Purpose**: Append and retrieve chat history.
*   **Methods**:
    *   `create(sessionId: string, role: string, content: string): Promise<Message>`
    *   `findBySession(sessionId: string, limit: number): Promise<Message[]>`
    *   `getLastMessage(sessionId: string): Promise<Message | null>`

### 2.4. `RunsRepository`
*   **Purpose**: Track execution runs (tracing).
*   **Methods**:
    *   `create(sessionId: string, agentId: string): Promise<Run>`
    *   `complete(runId: string, status: 'completed'|'failed', error?: string): Promise<Run>`
    *   `updateUsage(runId: string, tokens: number, cost: float): Promise<Run>`

### 2.5. `ToolCallsRepository`
*   **Purpose**: Log every tool execution for audit/replay.
*   **Methods**:
    *   `create(runId: string, toolName: string, input: string): Promise<ToolCall>`
    *   `complete(id: string, output: string, status: 'success'|'error', durationMs: number): Promise<ToolCall>`

## 3. Integration Strategy

The `AgentRunner` will inject these repositories.

```typescript
class AgentRunner {
  constructor(
    private runsRepo: RunsRepository,
    private toolsRepo: ToolCallsRepository,
    // ...
  ) {}

  async run(...) {
    const run = await this.runsRepo.create(sessionId, agentId);
    try {
       // ... execution ...
       await this.runsRepo.complete(run.id, 'completed');
    } catch (e) {
       await this.runsRepo.complete(run.id, 'failed', e.message);
    }
  }
}
```
