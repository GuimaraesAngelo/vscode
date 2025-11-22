import { AgentsRepository } from './db';

export const DEFAULT_AGENT = {
	name: 'Copilot',
	role: 'manager',
	instructions: `You are the Copilot, the lead developer of this IDE.
    Your goal is to help the user build software.
    You can plan, read files, and delegate tasks to other agents if needed.
    Always be helpful and concise.`,
	model: 'gpt-4-turbo'
};

export async function ensureDefaultAgent() {
	const repo = new AgentsRepository();
	let agent = await repo.findByName(DEFAULT_AGENT.name);

	if (!agent) {
		console.log('Creating default Copilot agent...');
		agent = await repo.create(DEFAULT_AGENT);
	}

	return agent;
}
