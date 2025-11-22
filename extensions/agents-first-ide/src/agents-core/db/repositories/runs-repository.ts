import { prisma } from '../prisma';

export class RunsRepository {
	async create(data: { sessionId: string; agentId: string }) {
		return prisma.run.create({
			data: {
				...data,
				status: 'in_progress'
			}
		});
	}

	async complete(runId: string, status: 'completed' | 'failed', error?: string) {
		return prisma.run.update({
			where: { id: runId },
			data: {
				status,
				completedAt: new Date(),
				error
			}
		});
	}
}
