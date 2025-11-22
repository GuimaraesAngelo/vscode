import * as vscode from 'vscode';

export interface WorkspaceSecurity {
	allow_terminal: string[];
	max_patch_lines: number;
	require_confirmation: boolean;
}

export interface WorkspaceModels {
	copilot: string;
	architect: string;
	implementer: string;
	tester: string;
}

export class ConfigService {
	private static instance: ConfigService;

	private constructor() { }

	public static getInstance(): ConfigService {
		if (!ConfigService.instance) {
			ConfigService.instance = new ConfigService();
		}
		return ConfigService.instance;
	}

	async getSecurityConfig(): Promise<WorkspaceSecurity> {
		// Try to read .vscode/agents-first/security.json
		// Fallback to defaults
		const defaults: WorkspaceSecurity = {
			allow_terminal: ['npm test', 'ls', 'dir', 'echo'],
			max_patch_lines: 500,
			require_confirmation: true
		};

		try {
			const files = await vscode.workspace.findFiles('.vscode/agents-first/security.json');
			if (files.length > 0) {
				const content = await vscode.workspace.fs.readFile(files[0]);
				const json = JSON.parse(new TextDecoder().decode(content));
				return { ...defaults, ...json };
			}
		} catch (e) {
			console.warn('Failed to load security config', e);
		}
		return defaults;
	}

	async getModelConfig(): Promise<WorkspaceModels> {
		const defaults: WorkspaceModels = {
			copilot: 'gpt-4-turbo',
			architect: 'gpt-4-turbo',
			implementer: 'gpt-4-turbo',
			tester: 'gpt-4-turbo'
		};

		// Logic to read models.json would go here
		return defaults;
	}
}
