import * as vscode from 'vscode';
import { z } from 'zod';
import { AgentTool } from './index';
import * as Diff from 'diff';

export const ApplyPatchTool: AgentTool = {
	name: 'apply_patch',
	description: 'Apply a unified diff patch to a file. Use this to modify code safely.',
	schema: z.object({
		path: z.string().describe('Absolute path to the file to patch'),
		patch: z.string().describe('The unified diff content to apply'),
	}),
	execute: async (args: { path: string; patch: string }) => {
		try {
			const uri = vscode.Uri.file(args.path);

			// 1. Read original content
			let originalContent = '';
			try {
				const data = await vscode.workspace.fs.readFile(uri);
				originalContent = new TextDecoder().decode(data);
			} catch (e) {
				return `Error reading file ${args.path}: File not found or unreadable.`;
			}

			// 2. Apply Patch
			// The 'diff' package expects the patch to be a standard unified diff string.
			// We might need to be lenient with the format if the LLM generates it slightly off.
			// For robustness, we assume the LLM sends a patch that 'diff' can parse.

			const patchedContent = Diff.applyPatch(originalContent, args.patch);

			if (patchedContent === false) {
				return `Failed to apply patch. The patch might be malformed or does not match the current file content.`;
			}

			// 3. Write back
			const data = new TextEncoder().encode(patchedContent);
			await vscode.workspace.fs.writeFile(uri, data);

			return `Successfully applied patch to ${args.path}`;

		} catch (e: any) {
			return `Error applying patch: ${e.message}`;
		}
	}
};
