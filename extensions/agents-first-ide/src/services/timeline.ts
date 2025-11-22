import { prisma } from '../agents-core/db/prisma';

export type TimelineEventType = 'message' | 'run' | 'tool_call' | 'handoff';

export interface TimelineEvent {
	id: string;
	type: TimelineEventType;
	timestamp: Date;
	data: any;
}

export class TimelineService {

	public async getSessionTimeline(sessionId: string): Promise<TimelineEvent[]> {
		const events: TimelineEvent[] = [];

		// 1. Fetch Messages
		const messages = await prisma.message.findMany({
			where: { sessionId },
			orderBy: { createdAt: 'asc' }
		});

		for (const msg of messages) {
			events.push({
				id: msg.id,
				type: 'message',
				timestamp: msg.createdAt,
				data: {
					role: msg.role,
					content: msg.content
				}
			});
		}

		// 2. Fetch Runs & Tool Calls
		const runs = await prisma.run.findMany({
			where: { sessionId },
			include: {
				agent: true,
				toolCalls: true
			},
			orderBy: { startedAt: 'asc' }
		});

		for (const run of runs) {
			// Run Start Event (Implicitly acting as a "Agent Active" marker)
			events.push({
				id: run.id,
				type: 'run',
				timestamp: run.startedAt,
				data: {
					agent: run.agent.name,
					status: run.status
				}
			});

			// Tool Calls
			for (const tc of run.toolCalls) {
				// Check if it's a handoff
				if (tc.toolName === 'handoff_to') {
					const args = JSON.parse(tc.input);
					events.push({
						id: tc.id,
						type: 'handoff',
						timestamp: tc.createdAt,
						data: {
							from: run.agent.name,
							to: args.target_agent,
							reason: args.reason
						}
					});
				} else {
					events.push({
						id: tc.id,
						type: 'tool_call',
						timestamp: tc.createdAt,
						data: {
							tool: tc.toolName,
							input: tc.input,
							output: tc.output,
							status: tc.status,
							duration: tc.durationMs
						}
					});
				}
			}
		}

		// Sort by timestamp
		return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
	}
}
