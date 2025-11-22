# Phase 3: CopilotPanel UI & UX Specification

This document outlines the design and implementation plan for the enhanced CopilotPanel in Phase 3. The goal is to provide a rich, multi-agent visual experience.

## 1. Design Philosophy
- **Agent-First**: Every interaction clearly identifies *who* is speaking or acting.
- **Transparent**: Handoffs and tool executions are visible, not hidden.
- **State-Aware**: The UI reflects the current state of the system (planning, executing, testing).

## 2. Component Structure

The `CopilotPanel` webview will be structured as follows:

```html
<div class="app-container">
  <!-- Header: Session Title & Active Agent -->
  <header class="session-header">
    <span class="session-title">Feature Implementation</span>
    <span class="active-agent-badge">Copilot</span>
  </header>

  <!-- Main Chat Area -->
  <main class="chat-stream" id="chat-stream">
    <!-- Messages and Handoff Blocks go here -->
  </main>

  <!-- Input Area -->
  <footer class="input-area">
    <textarea id="input-box" placeholder="Ask Copilot..."></textarea>
    <button id="send-btn">Send</button>
  </footer>
</div>
```

## 3. Message Types & Visuals

### 3.1. User Message
- **Style**: Aligned right, distinct background color (VS Code button background).
- **Content**: Text.

### 3.2. Agent Message
- **Style**: Aligned left, background varies slightly or has a colored border based on agent role.
- **Header**: Avatar/Icon + Agent Name + Timestamp.
- **Content**: Markdown text.

### 3.3. Handoff Block
- **Style**: Full-width, centered or distinct separator style.
- **Content**: "Arrow" animation or icon showing flow.
- **Text**: `Copilot ➔ Architect: Designing solution...`

### 3.4. Tool Execution Card
- **Style**: Compact card inside the agent's stream.
- **Types**:
    - **Generic**: `Running tool: list_files` (Expandable details).
    - **Apply Patch**:
        - Header: `Applying Patch`
        - Body: List of files modified.
        - Action: `[View Diff]` button.
        - Status: Success/Error icon.
    - **Run Tests**:
        - Header: `Running Tests`
        - Body: `PASS` or `FAIL` badge.
        - Details: `2 passed, 1 failed`.
        - Action: `[View Output]` button.

## 4. Data Flow & Integration

### 4.1. Loading History
On load, the panel will request history from the extension.
The extension will fetch:
- `Session` -> `Messages`
- `Session` -> `Runs` -> `ToolCalls`

The data will be normalized into a linear timeline for rendering:
`[Message(User), Run(Copilot), ToolCall(read_file), Message(Copilot), Run(Architect)...]`

### 4.2. Real-time Updates
The `AgentRunner` will emit events via `webview.postMessage`:
- `onRunStart(agent)`
- `onMessageChunk(text)`
- `onToolCallStart(toolName, args)`
- `onToolCallEnd(toolName, result)`
- `onHandoff(from, to, context)`

## 5. Implementation Plan

1.  **Data Service**: Create `src/services/timeline.ts` to aggregate DB data into a timeline format.
2.  **Webview Update**:
    - Refactor `panel.ts` to handle complex message types.
    - Update HTML/CSS to support new components (Cards, Badges, Handoffs).
    - Implement `renderTimeline(events)` function in the webview script.
3.  **Runner Integration**:
    - Emit granular events from `AgentRunner` instead of just text chunks.

## 6. CSS Variables & Theming
Use VS Code webview CSS variables for native look and feel:
- `--vscode-editor-background`
- `--vscode-button-background`
- `--vscode-textBlockQuote-background`
- Custom colors for agents:
    - Copilot: Blue/Default
    - Architect: Purple
    - Implementer: Orange
    - Tester: Green

## 7. Example JSON Structure for UI
```json
{
  "type": "timeline-event",
  "kind": "handoff",
  "data": {
    "from": "Copilot",
    "to": "Architect",
    "reason": "Need system design"
  }
}
```
