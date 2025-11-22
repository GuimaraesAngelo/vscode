# Directory Structure & Modules

The project will be implemented as a **Built-in Extension** within the VS Code repository, located at `extensions/agents-first-ide`. This allows deep integration while maintaining a clean separation from the core VS Code source code (`src/vs`).

## Root Directory: `extensions/agents-first-ide`

```text
extensions/agents-first-ide/
├── .vscode/                # Debug configurations
├── assets/                 # Icons, media
├── prisma/                 # Database Schema
│   └── schema.prisma
├── src/
│   ├── agents-core/        # THE BRAIN (OpenAI SDK Wrapper)
│   │   ├── runner.ts       # Main execution loop
│   │   ├── session.ts      # Session management
│   │   ├── registry.ts     # Agent registration
│   │   ├── handoffs.ts     # Handoff logic
│   │   └── guardrails.ts   # Safety checks
│   │
│   ├── tools/              # TOOL IMPLEMENTATIONS
│   │   ├── index.ts        # Tool definitions generator
│   │   ├── fs.ts           # File System tools
│   │   ├── terminal.ts     # Terminal tools
│   │   ├── git.ts          # Git tools
│   │   ├── project.ts      # Build/Test tools
│   │   └── agent.ts        # Meta-tools (create_agent, etc.)
│   │
│   ├── ui/                 # USER INTERFACE (React + Webviews)
│   │   ├── CopilotPanel/   # The Main Chat Interface
│   │   ├── AgentManager/   # Activity Bar View
│   │   └── RunViewer/      # Tracing/Debugging View
│   │
│   ├── services/           # INFRASTRUCTURE
│   │   ├── database.ts     # Prisma Client instance
│   │   ├── logger.ts       # Structured logging
│   │   └── config.ts       # Configuration manager
│   │
│   ├── extension.ts        # Entry point (activate/deactivate)
│   └── types.ts            # Shared TypeScript types
│
├── package.json            # Extension manifest
├── tsconfig.json           # TypeScript config
└── README.md
```

## Module Responsibilities

### 1. `src/agents-core`
This module encapsulates the **OpenAI Agents SDK**. It abstracts the complexity of managing API calls, streaming responses, and handling tool outputs.
*   **Key Class**: `AgentRunner` - Manages the lifecycle of a run.
*   **Key Class**: `SessionManager` - Handles conversation history and context windowing.

### 2. `src/tools`
This module bridges the **VS Code API** (`vscode.*`) to **Agent Tools**.
*   Example: `fs.ts` exports a `ReadFileTool` that calls `vscode.workspace.fs.readFile`.
*   All tools must return JSON-serializable outputs.
*   All tools must have strict Zod schemas for validation.

### 3. `src/ui`
Contains the frontend code for the Webviews.
*   Uses **React** for component-based UI.
*   Uses **VS Code Webview UI Toolkit** for native look and feel.
*   Communicates with `extension.ts` via `postMessage`.

### 4. `src/services`
Singleton services for the extension.
*   `DatabaseService`: Manages the connection to SQL.
*   `LoggerService`: Records all agent actions for the "Run Viewer".
