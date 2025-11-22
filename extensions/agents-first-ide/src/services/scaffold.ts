import * as vscode from 'vscode';

export class ScaffoldService {

	async scaffold(template: 'node' | 'python' | 'react', destination: string) {
		const wsEdit = new vscode.WorkspaceEdit();
		const root = vscode.Uri.file(destination);

		if (template === 'node') {
			wsEdit.createFile(vscode.Uri.joinPath(root, 'package.json'), { ignoreIfExists: true });
			wsEdit.insert(vscode.Uri.joinPath(root, 'package.json'), new vscode.Position(0, 0), JSON.stringify({
				name: "my-app",
				version: "1.0.0",
				main: "index.js",
				scripts: { "start": "node index.js" }
			}, null, 2));

			wsEdit.createFile(vscode.Uri.joinPath(root, 'index.js'), { ignoreIfExists: true });
			wsEdit.insert(vscode.Uri.joinPath(root, 'index.js'), new vscode.Position(0, 0), "console.log('Hello World');");
		}
		else if (template === 'python') {
			wsEdit.createFile(vscode.Uri.joinPath(root, 'main.py'), { ignoreIfExists: true });
			wsEdit.insert(vscode.Uri.joinPath(root, 'main.py'), new vscode.Position(0, 0), "print('Hello World')");

			wsEdit.createFile(vscode.Uri.joinPath(root, 'requirements.txt'), { ignoreIfExists: true });
		}
		else if (template === 'react') {
			// Minimal React setup
			wsEdit.createFile(vscode.Uri.joinPath(root, 'package.json'), { ignoreIfExists: true });
			wsEdit.insert(vscode.Uri.joinPath(root, 'package.json'), new vscode.Position(0, 0), JSON.stringify({
				name: "react-app",
				version: "1.0.0",
				dependencies: { "react": "^18.2.0", "react-dom": "^18.2.0" }
			}, null, 2));

			wsEdit.createFile(vscode.Uri.joinPath(root, 'index.html'), { ignoreIfExists: true });
			wsEdit.insert(vscode.Uri.joinPath(root, 'index.html'), new vscode.Position(0, 0), "<html><body><div id='root'></div></body></html>");
		}

		await vscode.workspace.applyEdit(wsEdit);
	}
}
