import { prisma } from '../agents-core/db/prisma';

export interface GlobalStats {
	totalRuns: number;
	totalCost: number;
	avgLatencyMs: number;
	successRate: number;
}

export interface AgentPerformance {
	agentName: string;
	runs: number;
	successRate: number;
	avgCost: number;
	avgDurationMs: number;
}

export interface ToolStats {
	toolName: string;
	count: number;
	errorCount: number;
	errorRate: number;
}

export class ObservabilityService {

	async getGlobalStats(): Promise<GlobalStats> {
		const runs = await prisma.run.findMany({
			select: {
				status: true,
				cost: true,
				startedAt: true,
				completedAt: true
			}
		});

		const totalRuns = runs.length;
		if (totalRuns === 0) {
			return { totalRuns: 0, totalCost: 0, avgLatencyMs: 0, successRate: 0 };
		}

		const totalCost = runs.reduce((sum, r) => sum + r.cost, 0);
		const successful = runs.filter(r => r.status === 'completed').length;

		let totalDuration = 0;
		let durationCount = 0;
		for (const r of runs) {
			if (r.completedAt) {
				totalDuration += (r.completedAt.getTime() - r.startedAt.getTime());
				durationCount++;
			}
		}

		return {
			totalRuns,
			totalCost,
			avgLatencyMs: durationCount > 0 ? totalDuration / durationCount : 0,
			successRate: (successful / totalRuns) * 100
		};
	}

	async getAgentPerformance(): Promise<AgentPerformance[]> {
		const agents = await prisma.agent.findMany({
			include: {
				runs: {
					select: {
						status: true,
						cost: true,
						startedAt: true,
						completedAt: true
					}
				}
			}
		});

		return agents.map(agent => {
			const total = agent.runs.length;
			if (total === 0) {
				return { agentName: agent.name, runs: 0, successRate: 0, avgCost: 0, avgDurationMs: 0 };
			}

			const success = agent.runs.filter(r => r.status === 'completed').length;
			const cost = agent.runs.reduce((sum, r) => sum + r.cost, 0);

			let duration = 0;
			let dCount = 0;
			agent.runs.forEach(r => {
				if (r.completedAt) {
					duration += (r.completedAt.getTime() - r.startedAt.getTime());
					dCount++;
				}
			});

			return {
				agentName: agent.name,
				runs: total,
				successRate: (success / total) * 100,
				avgCost: cost / total,
				avgDurationMs: dCount > 0 ? duration / dCount : 0
			};
		}).sort((a, b) => b.runs - a.runs);
	}

	async getToolStats(): Promise<ToolStats[]> {
		const tools = await prisma.toolCall.groupBy({
			by: ['toolName'],
			_count: {
				toolName: true
			}
		});

		// We need error counts too. groupBy doesn't support conditional count easily in one go with SQLite provider limitations sometimes,
		// but let's try to fetch errors separately or just fetch all tool calls if dataset is small.
		// For scalability, separate queries are better.

		const stats: ToolStats[] = [];

		for (const t of tools) {
			const errorCount = await prisma.toolCall.count({
				where: {
					toolName: t.toolName,
					status: 'error'
				}
			});

			stats.push({
				toolName: t.toolName,
				count: t._count.toolName,
				errorCount,
				errorRate: (errorCount / t._count.toolName) * 100
			});
		}

		return stats.sort((a, b) => b.count - a.count);
	}
}
