# UI/UX Blueprint (Agent-First)

The UI is designed to give Agents a "Seat at the Table". It consists of three main components.

## 1. Copilot Panel (The Command Center)
*   **Location**: Secondary Sidebar (Right) or Panel (Bottom).
*   **Technology**: Webview with React.
*   **Features**:
    *   **Chat Stream**: Markdown-rendered chat with the agent.
    *   **Plan Viewer**: A collapsible section showing the Agent's current "Plan" (Step 1, Step 2, ...).
    *   **Tool Output**: Collapsible blocks showing what tools were called and their raw output (for transparency).
    *   **Approval Requests**: Distinct UI cards for "Approve Command" or "Approve Delete".

## 2. Agent Manager (Activity Bar)
*   **Location**: Activity Bar (Left), Icon: 🤖.
*   **Views**:
    *   **"My Agents"**: List of available agents (Copilot, Architect, etc.).
        *   *Action*: Click to edit instructions or configure model.
    *   **"Active Sessions"**: List of past/current conversations.
    *   **"Capabilities"**: Toggle enabled tools for the selected agent.

## 3. Run Viewer (Tracing)
*   **Location**: Editor Tab (Custom Editor) or Panel.
*   **Purpose**: Deep debugging of agent logic.
*   **Visuals**:
    *   Timeline of the execution.
    *   Token usage per step.
    *   Latency per tool call.
    *   Full JSON dump of the context window.

## 4. Visual Feedback in Editor
*   **Decorations**: When an agent is "reading" a file, highlight the lines it is reading in the editor.
*   **Cursors**: (Advanced) Show a "Ghost Cursor" where the agent is planning to write.
*   **Diff View**: When `apply_patch` is called, automatically open a Diff Editor for the user to review before accepting.

## 5. Wireframe Description (Copilot Panel)

```text
+--------------------------------------------------+
|  🤖 Copilot  |  Plan: [Fixing Login Bug] (3/5)   |
+--------------------------------------------------+
| [User]: The login button is broken.              |
|                                                  |
| [Copilot]: I'll investigate.                     |
|                                                  |
| > [Tool: list_files] (src/auth)                  |
|   - login.ts                                     |
|   - auth.service.ts                              |
|                                                  |
| [Copilot]: I see the files. Reading login.ts...  |
|                                                  |
| > [Tool: read_file] (src/auth/login.ts)          |
|                                                  |
| [Copilot]: I found the issue. Missing onClick.   |
|            I will apply a patch.                 |
|                                                  |
| [APPROVAL REQUEST]                               |
|  File: src/auth/login.ts                         |
|  Change: + onClick={handleLogin}                 |
|  [Approve] [Reject]                              |
+--------------------------------------------------+
| [Input Box: Type instructions...]                |
+--------------------------------------------------+
```
