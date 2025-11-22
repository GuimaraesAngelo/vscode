import * as vscode from 'vscode';
import { IntelligenceService } from '../../services/intelligence';

export class ProjectIntelligencePanel implements vscode.WebviewViewProvider {
	public static readonly viewType = 'project-intelligence';
	private _view?: vscode.WebviewView;
	private _service = new IntelligenceService();

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
				await this.loadAnalysis();
			}
		});

		this.loadAnalysis();
	}

	private async loadAnalysis() {
		if (!this._view) return;
		const stats = await this._service.analyzeWorkspace();
		this._view.webview.postMessage({ type: 'setStats', stats });
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Project Intelligence</title>
            <style>
                body { font-family: var(--vscode-font-family); padding: 20px; color: var(--vscode-editor-foreground); background: var(--vscode-editor-background); }
                h2 { font-size: 14px; border-bottom: 1px solid var(--vscode-widget-border); padding-bottom: 5px; margin-top: 20px; }

                .tag { display: inline-block; padding: 2px 8px; border-radius: 12px; background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); font-size: 11px; margin-right: 5px; margin-bottom: 5px; }

                .stat-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid var(--vscode-widget-border); font-size: 12px; }
                .stat-label { opacity: 0.8; }
                .stat-value { font-weight: bold; }

                .refresh-btn { float: right; background: none; border: none; color: var(--vscode-textLink-foreground); cursor: pointer; }
            </style>
        </head>
        <body>
            <div>
                <button class="refresh-btn" onclick="refresh()">Refresh</button>
                <div style="clear:both"></div>
            </div>

            <h2>Overview</h2>
            <div class="stat-row">
                <span class="stat-label">Total Files</span>
                <span class="stat-value" id="file-count">-</span>
            </div>

            <h2>Frameworks</h2>
            <div id="frameworks-list"></div>

            <h2>Languages</h2>
            <div id="languages-list"></div>

            <h2>Dependencies</h2>
            <div id="dependencies-list"></div>

            <script>
                const vscode = acquireVsCodeApi();

                function refresh() {
                    vscode.postMessage({ type: 'refresh' });
                }

                window.addEventListener('message', event => {
                    const msg = event.data;
                    if (msg.type === 'setStats') {
                        render(msg.stats);
                    }
                });

                function render(stats) {
                    document.getElementById('file-count').innerText = stats.fileCount;

                    const frameworks = document.getElementById('frameworks-list');
                    frameworks.innerHTML = stats.frameworks.map(f => \`<span class="tag">\${f}</span>\`).join('') || 'None detected';

                    const languages = document.getElementById('languages-list');
                    languages.innerHTML = Object.entries(stats.languages)
                        .sort((a, b) => b[1] - a[1])
                        .map(([ext, count]) => \`
                            <div class="stat-row">
                                <span class="stat-label">.\${ext}</span>
                                <span class="stat-value">\${count}</span>
                            </div>
                        \`).join('');

                    const deps = document.getElementById('dependencies-list');
                    deps.innerHTML = stats.dependencies.map(d => \`<span class="tag">\${d}</span>\`).join('') || 'None detected';
                }
            </script>
        </body>
        </html>`;
	}
}
