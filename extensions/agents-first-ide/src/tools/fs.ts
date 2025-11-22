import * as vscode from 'vscode';
import { z } from 'zod';
import { AgentTool } from './index';

export const ReadFileTool: AgentTool = {
	name: 'read_file',
	description: 'Read the contents of a file at the given absolute path. Use this to inspect code.',
	schema: z.object({
		path: z.string().describe('Absolute path to the file'),
	}),
	execute: async (args: { path: string }) => {
		try {
			const uri = vscode.Uri.file(args.path);
			const data = await vscode.workspace.fs.readFile(uri);
			return new TextDecoder().decode(data);
		} catch (e: any) {
			return `Error reading file: ${e.message}`;
		}
	}
};

export const WriteFileTool: AgentTool = {
	name: 'write_file',
	description: 'Write content to a file. Overwrites existing content. Creates file if it does not exist.',
	schema: z.object({
		path: z.string().describe('Absolute path to the file'),
		content: z.string().describe('The full content to write'),
	}),
	execute: async (args: { path: string; content: string }) => {
		try {
			const uri = vscode.Uri.file(args.path);
			const data = new TextEncoder().encode(args.content);
			await vscode.workspace.fs.writeFile(uri, data);
			return `Successfully wrote to ${args.path}`;
		} catch (e: any) {
			return `Error writing file: ${e.message}`;
		}
	}
};

export const ListFilesTool: AgentTool = {
	name: 'list_files',
	description: 'List files and directories in a given folder path.',
	schema: z.object({
		path: z.string().describe('Absolute path to the directory'),
	}),
	execute: async (args: { path: string }) => {
		try {
			const uri = vscode.Uri.file(args.path);
			const entries = await vscode.workspace.fs.readDirectory(uri);
			return entries.map(([name, type]) => ({
				name,
				type: type === vscode.FileType.Directory ? 'directory' : 'file'
			}));
		} catch (e: any) {
			return `Error listing files: ${e.message}`;
		}
	}
};
