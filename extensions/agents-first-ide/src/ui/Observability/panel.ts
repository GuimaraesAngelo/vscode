import * as vscode from 'vscode';
import { ObservabilityService } from '../../services/observability';

export class ObservabilityPanel implements vscode.WebviewViewProvider {
	public static readonly viewType = 'observability';
	private _view?: vscode.WebviewView;
	private _service = new ObservabilityService();

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
			if (data.type === 'refresh') {
				await this.loadStats();
			}
		});

		this.loadStats();
	}

	private async loadStats() {
		if (!this._view) return;
		const global = await this._service.getGlobalStats();
		const agents = await this._service.getAgentPerformance();
		const tools = await this._service.getToolStats();

		this._view.webview.postMessage({ type: 'setStats', global, agents, tools });
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Observability</title>
            <style>
                body { font-family: var(--vscode-font-family); padding: 20px; color: var(--vscode-editor-foreground); background: var(--vscode-editor-background); }
                h2 { font-size: 14px; border-bottom: 1px solid var(--vscode-widget-border); padding-bottom: 5px; margin-top: 20px; }

                .kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
                .kpi-card { background: var(--vscode-editor-inactiveSelectionBackground); padding: 10px; border-radius: 4px; text-align: center; }
                .kpi-value { font-size: 20px; font-weight: bold; display: block; }
                .kpi-label { font-size: 10px; opacity: 0.7; text-transform: uppercase; }

                table { width: 100%; border-collapse: collapse; font-size: 11px; }
                th, td { text-align: left; padding: 6px; border-bottom: 1px solid var(--vscode-widget-border); }
                th { opacity: 0.7; }

                .bar-container { width: 100%; background: var(--vscode-widget-border); height: 4px; border-radius: 2px; overflow: hidden; margin-top: 4px; }
                .bar { height: 100%; background: var(--vscode-button-background); }
                .bar.error { background: var(--vscode-errorForeground); }

                .refresh-btn { float: right; background: none; border: none; color: var(--vscode-textLink-foreground); cursor: pointer; }
            </style>
        </head>
        <body>
            <div>
                <button class="refresh-btn" onclick="refresh()">Refresh</button>
                <div style="clear:both"></div>
            </div>

            <div class="kpi-grid">
                <div class="kpi-card">
                    <span class="kpi-value" id="total-runs">-</span>
                    <span class="kpi-label">Total Runs</span>
                </div>
                <div class="kpi-card">
                    <span class="kpi-value" id="success-rate">-</span>
                    <span class="kpi-label">Success Rate</span>
                </div>
                <div class="kpi-card">
                    <span class="kpi-value" id="avg-latency">-</span>
                    <span class="kpi-label">Avg Latency (ms)</span>
                </div>
                <div class="kpi-card">
                    <span class="kpi-value" id="total-cost">-</span>
                    <span class="kpi-label">Est. Cost ($)</span>
                </div>
            </div>

            <h2>Agent Performance</h2>
            <table id="agents-table">
                <thead><tr><th>Agent</th><th>Runs</th><th>Success</th><th>Avg Cost</th></tr></thead>
                <tbody></tbody>
            </table>

            <h2>Tool Usage</h2>
            <table id="tools-table">
                <thead><tr><th>Tool</th><th>Count</th><th>Error Rate</th></tr></thead>
                <tbody></tbody>
            </table>

            <script>
                const vscode = acquireVsCodeApi();

                function refresh() {
                    vscode.postMessage({ type: 'refresh' });
                }

                window.addEventListener('message', event => {
                    const msg = event.data;
                    if (msg.type === 'setStats') {
                        render(msg.global, msg.agents, msg.tools);
                    }
                });

                function render(global, agents, tools) {
                    document.getElementById('total-runs').innerText = global.totalRuns;
                    document.getElementById('success-rate').innerText = Math.round(global.successRate) + '%';
                    document.getElementById('avg-latency').innerText = Math.round(global.avgLatencyMs);
                    document.getElementById('total-cost').innerText = '$' + global.totalCost.toFixed(4);

                    const agentsBody = document.querySelector('#agents-table tbody');
                    agentsBody.innerHTML = agents.map(a => \`
                        <tr>
                            <td>\${a.agentName}</td>
                            <td>\${a.runs}</td>
                            <td>
                                \${Math.round(a.successRate)}%
                                <div class="bar-container"><div class="bar" style="width: \${a.successRate}%"></div></div>
                            </td>
                            <td>$\${a.avgCost.toFixed(4)}</td>
                        </tr>
                    \`).join('');

                    const toolsBody = document.querySelector('#tools-table tbody');
                    toolsBody.innerHTML = tools.map(t => \`
                        <tr>
                            <td>\${t.toolName}</td>
                            <td>\${t.count}</td>
                            <td>
                                \${Math.round(t.errorRate)}%
                                <div class="bar-container"><div class="bar error" style="width: \${t.errorRate}%"></div></div>
                            </td>
                        </tr>
                    \`).join('');
                }
            </script>
        </body>
        </html>`;
	}
}
