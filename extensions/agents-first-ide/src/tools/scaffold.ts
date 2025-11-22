import * as vscode from 'vscode';
import { z } from 'zod';
import { AgentTool } from './index';
import { ScaffoldService } from '../services/scaffold';

export const ScaffoldProjectTool: AgentTool = {
	name: 'scaffold_project',
	description: 'Scaffold a new project from a template (node, python, react).',
	schema: z.object({
		template: z.enum(['node', 'python', 'react']).describe('The template to use'),
		path: z.string().optional().describe('Destination path (default: root)'),
	}),
	execute: async (args: { template: 'node' | 'python' | 'react'; path?: string }) => {
		const service = new ScaffoldService();
		const root = args.path || vscode.workspace.rootPath || '';

		if (!root) {
			return { error: 'No workspace open or path provided.' };
		}

		try {
			await service.scaffold(args.template, root);
			return { status: 'success', message: `Scaffolded ${args.template} project at ${root}` };
		} catch (e: any) {
			return { error: e.message };
		}
	}
};
