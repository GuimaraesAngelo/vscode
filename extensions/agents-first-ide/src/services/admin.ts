import { prisma } from '../agents-core/db/prisma';

export interface AgentDTO {
	id: string;
	name: string;
	role: string;
	model: string;
	instructions: string;
	tools: {
		name: string;
		enabled: boolean;
	}[];
	stats: {
		totalRuns: number;
		successRate: number;
	};
}

export class AdminService {

	async getAllAgents(): Promise<AgentDTO[]> {
		const agents = await prisma.agent.findMany({
			include: {
				tools: true,
				runs: {
					select: { status: true }
				}
			}
		});

		return agents.map(agent => {
			const totalRuns = agent.runs.length;
			const successfulRuns = agent.runs.filter(r => r.status === 'completed').length;
			const successRate = totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0;

			return {
				id: agent.id,
				name: agent.name,
				role: agent.role,
				model: agent.model,
				instructions: agent.instructions,
				tools: agent.tools.map(t => ({ name: t.toolName, enabled: t.enabled })),
				stats: {
					totalRuns,
					successRate: Math.round(successRate)
				}
			};
		});
	}

	async updateAgent(id: string, data: { model?: string; instructions?: string }) {
		return prisma.agent.update({
			where: { id },
			data
		});
	}

	async toggleTool(agentId: string, toolName: string, enabled: boolean) {
		return prisma.agentTool.upsert({
			where: {
				agentId_toolName: {
					agentId,
					toolName
				}
			},
			update: { enabled },
			create: {
				agentId,
				toolName,
				enabled
			}
		});
	}
}
