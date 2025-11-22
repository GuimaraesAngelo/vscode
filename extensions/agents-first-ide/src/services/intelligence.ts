import * as vscode from 'vscode';

export interface ProjectStats {
	fileCount: number;
	languages: Record<string, number>;
	dependencies: string[];
	frameworks: string[];
	topFiles: string[];
}

export class IntelligenceService {

	async analyzeWorkspace(): Promise<ProjectStats> {
		const files = await vscode.workspace.findFiles('**/*.*', '**/node_modules/**');

		const stats: ProjectStats = {
			fileCount: files.length,
			languages: {},
			dependencies: [],
			frameworks: [],
			topFiles: []
		};

		// 1. Language Stats
		for (const file of files) {
			const ext = file.path.split('.').pop() || 'unknown';
			stats.languages[ext] = (stats.languages[ext] || 0) + 1;
		}

		// 2. Dependencies (Node.js specific for now)
		const packageJson = await vscode.workspace.findFiles('package.json', '**/node_modules/**');
		if (packageJson.length > 0) {
			try {
				const content = await vscode.workspace.fs.readFile(packageJson[0]);
				const json = JSON.parse(new TextDecoder().decode(content));

				if (json.dependencies) {
					stats.dependencies = Object.keys(json.dependencies);
				}

				// Simple framework detection
				if (stats.dependencies.includes('react')) stats.frameworks.push('React');
				if (stats.dependencies.includes('next')) stats.frameworks.push('Next.js');
				if (stats.dependencies.includes('express')) stats.frameworks.push('Express');
				if (stats.dependencies.includes('@angular/core')) stats.frameworks.push('Angular');
				if (stats.dependencies.includes('vue')) stats.frameworks.push('Vue');
			} catch (e) {
				console.error('Failed to parse package.json', e);
			}
		}

		// 3. Top Files (Mocking "hot" files based on size or just listing src files)
		// In a real scenario, we'd use git history. Here we just list some key files.
		stats.topFiles = files.slice(0, 5).map(f => vscode.workspace.asRelativePath(f));

		return stats;
	}
}
