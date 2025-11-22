import { prisma } from '../prisma';
import { Agent } from '@prisma/client';

export class AgentsRepository {
	async create(data: { name: string; role: string; instructions: string; model?: string }) {
		return prisma.agent.create({
			data
		});
	}

	async findByName(name: string): Promise<Agent | null> {
		return prisma.agent.findUnique({
			where: { name }
		});
	}

	async findById(id: string): Promise<Agent | null> {
		return prisma.agent.findUnique({
			where: { id }
		});
	}

	async updateInstructions(id: string, instructions: string) {
		return prisma.agent.update({
			where: { id },
			data: { instructions }
		});
	}

	async listAll() {
		return prisma.agent.findMany();
	}
}
