import { OpenAIService } from '../services/openai';
import { ToolRegistry } from '../tools/index';
import {
	RunsRepository,
	ToolCallsRepository,
	MessagesRepository
} from './db';

export interface AgentConfig {
	id: string;
	name: string;
	instructions: string;
	model: string;
	dbId: string; // Database ID of the agent
}

export class AgentRunner {
	private openai = OpenAIService.getInstance().client;
	private runsRepo = new RunsRepository();
	private toolsRepo = new ToolCallsRepository();
	private messagesRepo = new MessagesRepository();

	constructor(
		private agent: AgentConfig,
		private threadId: string,
		private sessionId: string
	) { }

	public async run(userMessage: string, onEvent: (event: any) => void): Promise<void> {
		// 1. Persist User Message
		await this.messagesRepo.create({
			sessionId: this.sessionId,
			role: 'user',
			content: userMessage
		});

		// 2. Add to OpenAI Thread
		await this.openai.beta.threads.messages.create(this.threadId, {
			role: 'user',
			content: userMessage
		});

		// 3. Create Run Record in DB
		const dbRun = await this.runsRepo.create({
			sessionId: this.sessionId,
			agentId: this.agent.dbId
		});

		// Emit Run Start
		onEvent({ type: 'runStart', agent: this.agent.name, runId: dbRun.id });

		try {
			// 4. Create OpenAI Run
			const stream = await this.openai.beta.threads.runs.createAndStream(this.threadId, {
				assistant_id: this.agent.id,
			});

			// 5. Handle Stream
			await this.handleStream(stream, onEvent, dbRun.id);

			// 6. Complete Run Record
			await this.runsRepo.complete(dbRun.id, 'completed');

		} catch (error: any) {
			await this.runsRepo.complete(dbRun.id, 'failed', error.message);
			onEvent({ type: 'error', message: error.message });
			throw error;
		}
	}

	private async handleStream(stream: any, onEvent: (event: any) => void, runId: string) {
		let assistantResponse = "";

		for await (const event of stream) {
			if (event.event === 'thread.message.delta') {
				const content = event.data.delta.content?.[0];
				if (content && content.type === 'text') {
					const text = content.text?.value || '';
					assistantResponse += text;
					onEvent({ type: 'text', content: text });
				}
			} else if (event.event === 'thread.run.requires_action') {
				const openAiRunId = event.data.id;
				const toolCalls = event.data.required_action?.submit_tool_outputs.tool_calls || [];

				const toolOutputs = [];

				for (const toolCall of toolCalls) {
					// Log Tool Call Start
					const dbToolCall = await this.toolsRepo.create({
						runId,
						toolName: toolCall.function.name,
						input: toolCall.function.arguments
					});

					onEvent({
						type: 'toolStart',
						tool: toolCall.function.name,
						input: toolCall.function.arguments
					});

					let output: any;
					let status: 'success' | 'error' = 'success';

					// --- HANDOFF LOGIC ---
					if (toolCall.function.name === 'handoff_to') {
						const args = JSON.parse(toolCall.function.arguments);
						console.log(`[AgentRunner] Handoff initiated to: ${args.target_agent}`);

						output = { status: 'handoff_initiated', target: args.target_agent };
						await this.toolsRepo.complete(dbToolCall.id, JSON.stringify(output), 'success');

						onEvent({
							type: 'handoff',
							from: this.agent.name,
							to: args.target_agent,
							reason: args.reason
						});

						toolOutputs.push({
							tool_call_id: toolCall.id,
							output: JSON.stringify(output)
						});

						await this.openai.beta.threads.runs.submitToolOutputsStream(
							this.threadId,
							openAiRunId,
							{ tool_outputs: toolOutputs }
						);

						// SWITCH AGENT
						const { prisma } = require('./db/prisma');
						const newAgentDb = await prisma.agent.findUnique({ where: { name: args.target_agent } });

						if (newAgentDb) {
							await this.openai.beta.threads.messages.create(this.threadId, {
								role: 'user',
								content: `[SYSTEM] Handoff to ${newAgentDb.name}. Context: ${args.context}. \n\n You are now acting as ${newAgentDb.name}. Instructions: ${newAgentDb.instructions}`
							});

							// Create DB Run for the new agent
							const subRun = await this.runsRepo.create({
								sessionId: this.sessionId,
								agentId: newAgentDb.id
							});

							// Emit Run Start for UI
							onEvent({ type: 'runStart', agent: newAgentDb.name, runId: subRun.id });

							const nextStream = await this.openai.beta.threads.runs.createAndStream(this.threadId, {
								assistant_id: this.agent.id,
								instructions: newAgentDb.instructions
							});

							// Recursive call with NEW runId
							const subRunner = new AgentRunner({
								id: this.agent.id,
								name: newAgentDb.name,
								instructions: newAgentDb.instructions,
								model: newAgentDb.model,
								dbId: newAgentDb.id
							}, this.threadId, this.sessionId);

							try {
								await subRunner.handleStream(nextStream, onEvent, subRun.id);
								await this.runsRepo.complete(subRun.id, 'completed');
							} catch (e: any) {
								await this.runsRepo.complete(subRun.id, 'failed', e.message);
								throw e;
							}

							return;
						}
					}
					// ---------------------

					try {
						output = await this.executeTool(toolCall);
					} catch (e: any) {
						output = { error: e.message };
						status = 'error';
					}

					await this.toolsRepo.complete(
						dbToolCall.id,
						JSON.stringify(output),
						status
					);

					onEvent({
						type: 'toolEnd',
						tool: toolCall.function.name,
						output: output,
						status: status
					});

					toolOutputs.push({
						tool_call_id: toolCall.id,
						output: JSON.stringify(output)
					});
				}

				const nextStream = await this.openai.beta.threads.runs.submitToolOutputsStream(
					this.threadId,
					openAiRunId,
					{ tool_outputs: toolOutputs }
				);

				await this.handleStream(nextStream, onEvent, runId);
			}
		}

		if (assistantResponse) {
			await this.messagesRepo.create({
				sessionId: this.sessionId,
				role: 'assistant',
				content: assistantResponse
			});
		}
	}

	private async executeTool(toolCall: any): Promise<any> {
		const functionName = toolCall.function.name;
		const args = JSON.parse(toolCall.function.arguments);

		console.log(`[AgentRunner] Executing tool: ${functionName}`, args);

		const tool = ToolRegistry.getTool(functionName);
		if (!tool) {
			return { error: `Tool ${functionName} not found.` };
		}

		return await tool.execute(args);
	}
}
