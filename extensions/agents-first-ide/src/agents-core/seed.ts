import { prisma } from './db/prisma';

const AGENTS = [
	{
		name: 'Copilot',
		role: 'manager',
		slug: 'copilot',
		instructions: `You are the Copilot, the lead developer and project manager.
        Your goal is to orchestrate the development process.
        - Analyze user requests.
        - Create a plan.
        - Delegate complex design tasks to the 'architect'.
        - Delegate coding tasks to the 'implementer'.
        - Delegate testing to the 'tester'.
        - Always review the results from your team before answering the user.`,
		tools: ['read_file', 'list_files', 'plan_task', 'handoff_to']
	},
	{
		name: 'Architect',
		role: 'architect',
		slug: 'architect',
		instructions: `You are the Software Architect.
        Your goal is to design scalable and robust systems.
        - Read the codebase to understand the current state.
        - Propose directory structures, design patterns, and data models.
        - Do NOT write implementation code.
        - Output your designs in Markdown.
        - When finished, handoff back to the Copilot or directly to the Implementer.`,
		tools: ['read_file', 'list_files', 'search_files', 'handoff_to']
	},
	{
		name: 'Implementer',
		role: 'engineer',
		slug: 'implementer',
		instructions: `You are the Senior Implementation Engineer.
        Your goal is to write high-quality code.
        - You receive instructions and context from the Architect or Copilot.
        - You create files, write code, and apply patches.
        - You ensure the code compiles (using run_command if needed).
        - When finished, handoff to the Tester.`,
		tools: ['read_file', 'write_file', 'apply_patch', 'run_command', 'handoff_to']
	},
	{
		name: 'Tester',
		role: 'qa',
		slug: 'tester',
		instructions: `You are the QA Engineer.
        Your goal is to ensure the software works as expected.
        - You write test files (unit/integration).
        - You run tests using 'run_tests'.
        - If tests fail, analyze the error and report it.
        - If tests pass, confirm success.`,
		tools: ['read_file', 'write_file', 'run_tests', 'run_command', 'handoff_to']
	}
];

export async function seedAgents() {
	console.log('Seeding agents...');

	for (const agentData of AGENTS) {
		const existing = await prisma.agent.findUnique({
			where: { name: agentData.name }
		});

		if (!existing) {
			console.log(`Creating agent: ${agentData.name}`);
			const agent = await prisma.agent.create({
				data: {
					name: agentData.name,
					role: agentData.role,
					instructions: agentData.instructions,
					model: 'gpt-4-turbo'
				}
			});

			// Enable tools
			for (const toolName of agentData.tools) {
				await prisma.agentTool.create({
					data: {
						agentId: agent.id,
						toolName: toolName,
						enabled: true
					}
				});
			}
		} else {
			console.log(`Agent ${agentData.name} already exists. Updating instructions...`);
			await prisma.agent.update({
				where: { id: existing.id },
				data: {
					instructions: agentData.instructions
				}
			});

			// Ensure tools are enabled (simplified logic)
			// In a real app, we would sync the list properly
		}
	}
	console.log('Seeding complete.');
}
