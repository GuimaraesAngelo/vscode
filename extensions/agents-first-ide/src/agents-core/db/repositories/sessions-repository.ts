import { prisma } from '../prisma';

export class SessionsRepository {
	async create(data: { title?: string; agentId?: string }) {
		return prisma.session.create({
			data
		});
	}

	async findById(id: string) {
		return prisma.session.findUnique({
			where: { id },
			include: {
				activeAgent: true,
				messages: {
					orderBy: { createdAt: 'asc' }
				}
			}
		});
	}

	async setActiveAgent(sessionId: string, agentId: string) {
		return prisma.session.update({
			where: { id: sessionId },
			data: { agentId }
		});
	}

	async listActive() {
		return prisma.session.findMany({
			orderBy: { updatedAt: 'desc' },
			take: 10
		});
	}
}
