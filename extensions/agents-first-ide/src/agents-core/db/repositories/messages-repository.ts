import { prisma } from '../prisma';

export class MessagesRepository {
	async create(data: { sessionId: string; role: string; content: string }) {
		return prisma.message.create({
			data
		});
	}

	async findBySession(sessionId: string) {
		return prisma.message.findMany({
			where: { sessionId },
			orderBy: { createdAt: 'asc' }
		});
	}
}
