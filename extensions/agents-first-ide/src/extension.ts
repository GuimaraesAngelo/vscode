import * as vscode from 'vscode';
import { CopilotPanel } from './ui/CopilotPanel/panel';
import { AgentsManagerPanel } from './ui/AgentsManager/panel';
import { ObservabilityPanel } from './ui/Observability/panel';
import { ProjectIntelligencePanel } from './ui/ProjectIntelligence/panel';
import { registerAllTools } from './tools/register';

export function activate(context: vscode.ExtensionContext) {
	console.log('Agents First IDE is now active!');

	// 1. Initialize Database & Services
	const { seedAgents } = require('./agents-core/seed');
	seedAgents().catch(console.error);

	// 2. Register Tools
	registerAllTools();

	// 3. Register UI Providers
	const copilotProvider = new CopilotPanel(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(CopilotPanel.viewType, copilotProvider)
	);

	const agentsManagerProvider = new AgentsManagerPanel(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(AgentsManagerPanel.viewType, agentsManagerProvider)
	);

	const observabilityProvider = new ObservabilityPanel(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ObservabilityPanel.viewType, observabilityProvider)
	);

	const intelligenceProvider = new ProjectIntelligencePanel(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ProjectIntelligencePanel.viewType, intelligenceProvider)
	);

	// 4. Register Commands
	context.subscriptions.push(
		vscode.commands.registerCommand('agents-first.createAgent', () => {
			vscode.window.showInformationMessage('Create Agent Command Triggered');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('agents-first.openCopilot', () => {
			vscode.commands.executeCommand('workbench.view.extension.copilot-panel');
		})
	);
}

export function deactivate() { }
