import * as vscode from 'vscode';
import { AdminService } from '../../services/admin';

export class AgentsManagerPanel implements vscode.WebviewViewProvider {
	public static readonly viewType = 'agents-manager';
	private _view?: vscode.WebviewView;
	private _adminService = new AdminService();

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
				case 'refresh':
					await this.loadAgents();
					break;
				case 'updateAgent':
					await this._adminService.updateAgent(data.id, {
						model: data.model,
						instructions: data.instructions
					});
					await this.loadAgents();
					break;
				case 'toggleTool':
					await this._adminService.toggleTool(data.agentId, data.toolName, data.enabled);
					await this.loadAgents();
					break;
			}
		});

		this.loadAgents();
	}

	private async loadAgents() {
		if (!this._view) return;
		const agents = await this._adminService.getAllAgents();
		this._view.webview.postMessage({ type: 'setAgents', agents });
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Agents Manager</title>
            <style>
                body { font-family: var(--vscode-font-family); padding: 20px; color: var(--vscode-editor-foreground); background: var(--vscode-editor-background); }
                .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                h1 { margin: 0; font-size: 18px; font-weight: 600; }
                .refresh-btn { background: none; border: none; color: var(--vscode-textLink-foreground); cursor: pointer; }

                .agent-card {
                    background: var(--vscode-editor-inactiveSelectionBackground);
                    border: 1px solid var(--vscode-widget-border);
                    border-radius: 6px;
                    padding: 15px;
                    margin-bottom: 15px;
                }
                .agent-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
                .agent-name { font-weight: bold; font-size: 14px; }
                .agent-role { font-size: 11px; opacity: 0.7; text-transform: uppercase; background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); padding: 2px 6px; border-radius: 4px; }

                .form-group { margin-bottom: 10px; }
                label { display: block; font-size: 11px; margin-bottom: 4px; opacity: 0.8; }
                select, textarea { width: 100%; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); padding: 6px; border-radius: 4px; font-family: inherit; }
                textarea { height: 80px; resize: vertical; }

                .tools-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
                .tool-chip {
                    font-size: 11px; padding: 4px 8px; border-radius: 12px;
                    background: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                    cursor: pointer; border: 1px solid transparent;
                    display: flex; align-items: center; gap: 4px;
                }
                .tool-chip.enabled {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                }
                .tool-chip:hover { opacity: 0.9; }

                .stats { font-size: 11px; opacity: 0.6; margin-top: 10px; display: flex; gap: 15px; }

                .actions { margin-top: 10px; text-align: right; }
                button.save { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Agents Manager</h1>
                <button class="refresh-btn" onclick="refresh()">Refresh</button>
            </div>
            <div id="agents-list"></div>

            <script>
                const vscode = acquireVsCodeApi();

                function refresh() {
                    vscode.postMessage({ type: 'refresh' });
                }

                function toggleTool(agentId, toolName, currentEnabled) {
                    vscode.postMessage({
                        type: 'toggleTool',
                        agentId,
                        toolName,
                        enabled: !currentEnabled
                    });
                }

                function saveAgent(id) {
                    const model = document.getElementById('model-' + id).value;
                    const instructions = document.getElementById('instr-' + id).value;
                    vscode.postMessage({
                        type: 'updateAgent',
                        id,
                        model,
                        instructions
                    });
                }

                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.type === 'setAgents') {
                        renderAgents(message.agents);
                    }
                });

                function renderAgents(agents) {
                    const container = document.getElementById('agents-list');
                    container.innerHTML = agents.map(agent => \`
                        <div class="agent-card">
                            <div class="agent-header">
                                <span class="agent-name">\${agent.name}</span>
                                <span class="agent-role">\${agent.role}</span>
                            </div>

                            <div class="form-group">
                                <label>Model</label>
                                <select id="model-\${agent.id}">
                                    <option value="gpt-4-turbo" \${agent.model === 'gpt-4-turbo' ? 'selected' : ''}>GPT-4 Turbo</option>
                                    <option value="gpt-4o" \${agent.model === 'gpt-4o' ? 'selected' : ''}>GPT-4o</option>
                                    <option value="o1-preview" \${agent.model === 'o1-preview' ? 'selected' : ''}>o1 Preview</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Instructions</label>
                                <textarea id="instr-\${agent.id}">\${agent.instructions}</textarea>
                            </div>

                            <div class="form-group">
                                <label>Tools</label>
                                <div class="tools-list">
                                    \${agent.tools.map(t => \`
                                        <div class="tool-chip \${t.enabled ? 'enabled' : ''}"
                                             onclick="toggleTool('\${agent.id}', '\${t.name}', \${t.enabled})">
                                            \${t.name}
                                        </div>
                                    \`).join('')}
                                </div>
                            </div>

                            <div class="stats">
                                <span>Runs: \${agent.stats.totalRuns}</span>
                                <span>Success: \${agent.stats.successRate}%</span>
                            </div>

                            <div class="actions">
                                <button class="save" onclick="saveAgent('\${agent.id}')">Save Changes</button>
                            </div>
                        </div>
                    \`).join('');
                }
            </script>
        </body>
        </html>`;
	}
}
