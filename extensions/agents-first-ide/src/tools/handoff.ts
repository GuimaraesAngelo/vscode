import { z } from 'zod';
import { AgentTool } from './index';

// This tool is special: it doesn't "execute" in the traditional sense.
// It signals the Runner to switch agents.
// The Runner intercepts this tool call.

export const HandoffTool: AgentTool = {
	name: 'handoff_to',
	description: 'Delegate the current task to a specialized agent (architect, implementer, tester).',
	schema: z.object({
		target_agent: z.enum(['architect', 'implementer', 'tester', 'copilot']).describe('The agent to handoff to'),
		reason: z.string().describe('Why you are handing off'),
		context: z.string().describe('Instructions and context for the target agent')
	}),
	execute: async (args: any) => {
		// This return value is what gets logged to the DB as the tool output.
		// The actual switching logic happens in the Runner.
		return {
			status: 'handoff_initiated',
			target: args.target_agent,
			message: `Handing off to ${args.target_agent}: ${args.reason}`
		};
	}
};
