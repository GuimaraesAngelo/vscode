import { ToolRegistry } from './index';
import { ReadFileTool, WriteFileTool, ListFilesTool } from './fs';
import { RunCommandTool } from './terminal';
import { ApplyPatchTool } from './patch';
import { RunTestsTool } from './test';
import { HandoffTool } from './handoff';
import { ScaffoldProjectTool } from './scaffold';

export function registerAllTools() {
	ToolRegistry.register(ReadFileTool);
	ToolRegistry.register(WriteFileTool);
	ToolRegistry.register(ListFilesTool);
	ToolRegistry.register(RunCommandTool);
	ToolRegistry.register(ApplyPatchTool);
	ToolRegistry.register(RunTestsTool);
	ToolRegistry.register(HandoffTool);
	ToolRegistry.register(ScaffoldProjectTool);

	console.log('All tools registered.');
}
