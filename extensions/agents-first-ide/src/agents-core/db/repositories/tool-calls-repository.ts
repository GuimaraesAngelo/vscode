import { prisma } from '../prisma';

export class ToolCallsRepository {
	async create(data: { runId: string; toolName: string; input: string }) {
		return prisma.toolCall.create({
			data: {
				...data,
				status: 'pending'
			}
		});
	}

	async complete(id: string, output: string, status: 'success' | 'error') {
		return prisma.toolCall.update({
			where: { id },
			data: {
				output,
				status,
				durationMs: 0 // TODO: Calculate duration
			}
		});
	}
}
