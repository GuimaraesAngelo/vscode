import * as vscode from 'vscode';
import { z } from 'zod';
import { AgentTool } from './index';
import * as cp from 'child_process';

export const RunTestsTool: AgentTool = {
	name: 'run_tests',
	description: 'Run project tests. Defaults to "npm test" if no command provided.',
	schema: z.object({
		command: z.string().optional().describe('The test command to run (e.g., "npm test", "pytest")'),
		cwd: z.string().optional().describe('Working directory for the test run'),
	}),
	execute: async (args: { command?: string; cwd?: string }) => {
		const command = args.command || 'npm test';
		const cwd = args.cwd || vscode.workspace.rootPath || '';

		if (!cwd) {
			return { error: 'No workspace open to run tests in.' };
		}

		return new Promise((resolve) => {
			cp.exec(command, { cwd }, (error, stdout, stderr) => {
				resolve({
					command,
					exit_code: error ? error.code : 0,
					stdout: stdout,
					stderr: stderr,
					passed: !error
				});
			});
		});
	}
};
