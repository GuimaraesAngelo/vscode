import * as vscode from 'vscode';
import { z } from 'zod';
import { AgentTool } from './index';
import { ConfigService } from '../services/config';

export const RunCommandTool: AgentTool = {
	name: 'run_command',
	description: 'Execute a shell command in the integrated terminal. Returns the output.',
	schema: z.object({
		command: z.string().describe('The shell command to execute'),
		cwd: z.string().optional().describe('Current working directory'),
	}),
	execute: async (args: { command: string; cwd?: string }) => {
		const security = await ConfigService.getInstance().getSecurityConfig();

		// Simple check: command must start with one of the allowed prefixes
		const isAllowed = security.allow_terminal.some((allowed: string) => args.command.startsWith(allowed));

		if (!isAllowed) {
			return {
				error: `Command "${args.command}" is not allowed by workspace security policy. Allowed: ${security.allow_terminal.join(', ')}`
			};
		}

		const terminal = vscode.window.createTerminal('Agent Command');
		terminal.show();
		terminal.sendText(args.command);

		return {
			status: 'executed',
			command: args.command,
			message: 'Command sent to terminal. Check output.'
		};
	}
};
