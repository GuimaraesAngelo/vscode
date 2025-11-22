import OpenAI from 'openai';
import * as vscode from 'vscode';

export class OpenAIService {
	private static instance: OpenAIService;
	public client: OpenAI;

	private constructor() {
		const config = vscode.workspace.getConfiguration('agents-first');
		const apiKey = config.get<string>('openaiApiKey');

		if (!apiKey) {
			// Fallback or error handling
			console.warn('OpenAI API Key not found in settings.');
		}

		this.client = new OpenAI({
			apiKey: apiKey || 'dummy-key-for-dev',
			dangerouslyAllowBrowser: true // Since we run in VS Code extension host (Node-like but sometimes restricted)
		});
	}

	public static getInstance(): OpenAIService {
		if (!OpenAIService.instance) {
			OpenAIService.instance = new OpenAIService();
		}
		return OpenAIService.instance;
	}
}
