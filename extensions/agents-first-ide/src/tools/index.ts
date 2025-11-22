import { z } from 'zod';

export interface AgentTool {
	name: string;
	description: string;
	schema: z.ZodObject<any>;
	execute: (args: any) => Promise<any>;
}

export class ToolRegistry {
	private static tools: Map<string, AgentTool> = new Map();

	public static register(tool: AgentTool) {
		this.tools.set(tool.name, tool);
	}

	public static getTool(name: string): AgentTool | undefined {
		return this.tools.get(name);
	}

	public static getAllDefinitions() {
		return Array.from(this.tools.values()).map(tool => ({
			type: 'function',
			function: {
				name: tool.name,
				description: tool.description,
				parameters: zodToOpenAISchema(tool.schema)
			}
		}));
	}
}

// Helper to convert Zod to JSON Schema (Simplified)
function zodToOpenAISchema(zodSchema: z.ZodObject<any>): any {
	// In a real impl, use zod-to-json-schema package
	// This is a placeholder to allow compilation
	return {
		type: 'object',
		properties: {},
		required: []
	};
}
