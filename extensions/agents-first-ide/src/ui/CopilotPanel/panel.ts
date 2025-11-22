import * as vscode from 'vscode';
import { AgentRunner } from '../../agents-core/runner';
import { ensureDefaultAgent } from '../../agents-core/setup';
import { SessionsRepository } from '../../agents-core/db';
import { TimelineService } from '../../services/timeline';

export class CopilotPanel implements vscode.WebviewViewProvider {
    public static readonly viewType = 'copilot-chat';
    private _view?: vscode.WebviewView;
    private _timelineService = new TimelineService();

    constructor(private readonly _extensionUri: vscode.Uri) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'sendMessage': {
                    await this.handleUserMessage(data.text);
                    break;
                }
                case 'refreshTimeline': {
                    await this.loadHistory();
                    break;
                }
            }
        });

        // Initial load
        this.loadHistory();
    }

    private async loadHistory() {
        if (!this._view) return;

        const sessionsRepo = new SessionsRepository();
        const sessions = await sessionsRepo.listActive();
        if (sessions.length > 0) {
            const session = sessions[0];
            const timeline = await this._timelineService.getSessionTimeline(session.id);
            this._view.webview.postMessage({ type: 'setTimeline', events: timeline });
        }
    }

    private async handleUserMessage(text: string) {
        if (!this._view) return;

        // 1. Echo user message immediately
        this._view.webview.postMessage({
            type: 'newEvent',
            event: {
                type: 'message',
                timestamp: new Date(),
                data: { role: 'user', content: text }
            }
        });

        try {
            // 2. Ensure Agent & Session
            const agent = await ensureDefaultAgent();
            const sessionsRepo = new SessionsRepository();

            let session = (await sessionsRepo.listActive())[0];
            if (!session) {
                session = await sessionsRepo.create({ title: 'New Chat', agentId: agent.id });
            }

            // 3. Initialize Runner
            const runner = new AgentRunner({
                id: 'asst_demo',
                name: agent.name,
                instructions: agent.instructions,
                model: agent.model,
                dbId: agent.id
            }, 'thread_demo', session.id);

            // 4. Run Agent with Event Callback
            await runner.run(text, (event) => {
                this._view?.webview.postMessage({
                    type: 'newEvent',
                    event: {
                        ...event,
                        timestamp: new Date() // Add timestamp if missing
                    }
                });
            });
        } catch (e: any) {
            this._view.webview.postMessage({
                type: 'newEvent',
                event: {
                    type: 'error',
                    timestamp: new Date(),
                    data: { message: e.message }
                }
            });
            console.error(e);
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Copilot</title>
            <style>
                :root {
                    --agent-copilot: #007acc;
                    --agent-architect: #6b5b95;
                    --agent-implementer: #d65076;
                    --agent-tester: #45b8ac;
                }
                body { font-family: var(--vscode-font-family); padding: 0; margin: 0; display: flex; flex-direction: column; height: 100vh; background: var(--vscode-editor-background); color: var(--vscode-editor-foreground); }
                .chat-container { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px; }

                /* Message Styles */
                .message { display: flex; flex-direction: column; gap: 5px; max-width: 90%; }
                .message.user { align-self: flex-end; align-items: flex-end; }
                .message.agent { align-self: flex-start; align-items: flex-start; }

                .bubble { padding: 10px 14px; border-radius: 8px; line-height: 1.4; font-size: 13px; }
                .user .bubble { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
                .agent .bubble { background: var(--vscode-editor-inactiveSelectionBackground); color: var(--vscode-editor-foreground); border: 1px solid var(--vscode-widget-border); }

                .meta { font-size: 11px; opacity: 0.7; display: flex; gap: 8px; align-items: center; }
                .avatar { width: 16px; height: 16px; border-radius: 50%; display: inline-block; }

                /* Agent Colors */
                .agent-copilot .avatar { background: var(--agent-copilot); }
                .agent-architect .avatar { background: var(--agent-architect); }
                .agent-implementer .avatar { background: var(--agent-implementer); }
                .agent-tester .avatar { background: var(--agent-tester); }

                /* Handoff Block */
                .handoff {
                    align-self: center; width: 100%; text-align: center;
                    margin: 10px 0; padding: 10px;
                    border-top: 1px dashed var(--vscode-widget-border);
                    border-bottom: 1px dashed var(--vscode-widget-border);
                    font-size: 12px; color: var(--vscode-descriptionForeground);
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                }
                .handoff-arrow { font-weight: bold; font-size: 16px; }

                /* Tool Card */
                .tool-card {
                    background: var(--vscode-textBlockQuote-background);
                    border-left: 3px solid var(--vscode-textLink-activeForeground);
                    padding: 8px 12px;
                    border-radius: 4px;
                    font-size: 12px;
                    margin-top: 5px;
                    width: 100%;
                    box-sizing: border-box;
                }
                .tool-header { font-weight: bold; display: flex; justify-content: space-between; margin-bottom: 4px; }
                .tool-status { font-size: 10px; text-transform: uppercase; }
                .tool-status.success { color: #4caf50; }
                .tool-status.error { color: #f44336; }
                .tool-content { white-space: pre-wrap; font-family: monospace; opacity: 0.9; max-height: 150px; overflow-y: auto; }

                /* Input Area */
                .input-area { padding: 15px; border-top: 1px solid var(--vscode-widget-border); display: flex; gap: 10px; background: var(--vscode-editor-background); }
                textarea { flex: 1; padding: 8px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); resize: none; height: 40px; border-radius: 4px; font-family: inherit; }
                button { padding: 0 16px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; cursor: pointer; border-radius: 4px; font-weight: 600; }
                button:hover { opacity: 0.9; }

            </style>
        </head>
        <body>
            <div class="chat-container" id="chat"></div>
            <div class="input-area">
                <textarea id="input" placeholder="Ask Copilot... (Shift+Enter for new line)"></textarea>
                <button id="send">Send</button>
            </div>
            <script>
                const vscode = acquireVsCodeApi();
                const chat = document.getElementById('chat');
                const input = document.getElementById('input');
                const sendBtn = document.getElementById('send');

                let currentAgentMessageDiv = null;
                let currentAgentContent = "";

                // Renderers
                function renderMessage(role, content, agentName = 'Copilot') {
                    const div = document.createElement('div');
                    div.className = 'message ' + role + ' agent-' + agentName.toLowerCase();

                    let metaHtml = '';
                    if (role === 'agent') {
                        metaHtml = \`<div class="meta"><span class="avatar"></span><span>\${agentName}</span></div>\`;
                    }

                    div.innerHTML = \`\${metaHtml}<div class="bubble">\${content}</div>\`;
                    chat.appendChild(div);
                    chat.scrollTop = chat.scrollHeight;
                    return div;
                }

                function renderHandoff(from, to, reason) {
                    const div = document.createElement('div');
                    div.className = 'handoff';
                    div.innerHTML = \`<span>\${from}</span> <span class="handoff-arrow">➔</span> <span>\${to}</span> <span>(\${reason})</span>\`;
                    chat.appendChild(div);
                    chat.scrollTop = chat.scrollHeight;
                }

                function renderTool(toolName, input, output, status) {
                    const div = document.createElement('div');
                    div.className = 'tool-card';

                    let content = '';
                    if (toolName === 'apply_patch') {
                        const args = JSON.parse(input);
                        content = \`Applying patch to: \${args.path}\`;
                    } else if (toolName === 'run_tests') {
                        content = \`Running tests...\`;
                        if (output) {
                            const res = JSON.parse(output);
                            content += res.passed ? ' PASS' : ' FAIL';
                        }
                    } else {
                        content = \`Input: \${input}\`;
                    }

                    div.innerHTML = \`
                        <div class="tool-header">
                            <span>Running: \${toolName}</span>
                            <span class="tool-status \${status}">\${status || 'Running...'}</span>
                        </div>
                        <div class="tool-content">\${content}</div>
                    \`;

                    // If inside an agent message, append to it, otherwise append to chat
                    if (currentAgentMessageDiv) {
                        currentAgentMessageDiv.querySelector('.bubble').appendChild(div);
                    } else {
                        chat.appendChild(div);
                    }
                    chat.scrollTop = chat.scrollHeight;
                }

                // Event Handling
                window.addEventListener('message', event => {
                    const msg = event.data;

                    if (msg.type === 'setTimeline') {
                        chat.innerHTML = '';
                        msg.events.forEach(processEvent);
                    } else if (msg.type === 'newEvent') {
                        processEvent(msg.event);
                    }
                });

                function processEvent(e) {
                    // Normalize event types from backend vs timeline service
                    // TimelineService: type='message' | 'run' | 'tool_call' | 'handoff'
                    // Runner: type='text' | 'toolStart' | 'toolEnd' | 'handoff' | 'runStart'

                    if (e.type === 'message') {
                        renderMessage(e.data.role, e.data.content);
                    }
                    else if (e.type === 'text') {
                        // Streaming text
                        if (!currentAgentMessageDiv) {
                            currentAgentMessageDiv = renderMessage('agent', '', 'Copilot'); // Default to Copilot, updated by runStart?
                            currentAgentContent = "";
                        }
                        currentAgentContent += e.content;
                        currentAgentMessageDiv.querySelector('.bubble').innerText = currentAgentContent; // Simple text for now, markdown later
                    }
                    else if (e.type === 'runStart') {
                        // New agent taking over
                        currentAgentMessageDiv = null; // Reset current message
                        // Optional: render a small "Agent Active" indicator
                    }
                    else if (e.type === 'handoff') {
                        renderHandoff(e.from || e.data.from, e.to || e.data.to, e.reason || e.data.reason);
                        currentAgentMessageDiv = null;
                    }
                    else if (e.type === 'toolStart' || e.type === 'tool_call') {
                        // For timeline events (tool_call), we have full data. For runner (toolStart), we have partial.
                        const data = e.data || e;
                        renderTool(data.tool || data.toolName, data.input, data.output, data.status);
                    }
                }

                // Input Handling
                sendBtn.addEventListener('click', () => {
                    const text = input.value.trim();
                    if (!text) return;
                    vscode.postMessage({ type: 'sendMessage', text });
                    input.value = '';
                    currentAgentMessageDiv = null;
                });

                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendBtn.click();
                    }
                });
            </script>
        </body>
        </html>`;
    }
}
