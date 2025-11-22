import { PrismaClient } from '@prisma/client';

// Singleton instance of PrismaClient
// In a real VS Code extension, we need to be careful about spawning too many connections.
// Since we are using SQLite for now, it's file-based.

class DatabaseService {
	private static instance: DatabaseService;
	public prisma: PrismaClient;

	private constructor() {
		this.prisma = new PrismaClient();
	}

	public static getInstance(): DatabaseService {
		if (!DatabaseService.instance) {
			DatabaseService.instance = new DatabaseService();
		}
		return DatabaseService.instance;
	}
}

export const prisma = DatabaseService.getInstance().prisma;
