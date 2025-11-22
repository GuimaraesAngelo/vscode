# Tools Blueprint

This document defines the standard library of tools available to agents. All tools map directly to VS Code APIs.

## 1. File System Tools (`src/tools/fs.ts`)
*   `read_file(path: string)`: Returns file content.
    *   *Impl*: `vscode.workspace.fs.readFile`
*   `write_file(path: string, content: string)`: Overwrites file content.
    *   *Impl*: `vscode.workspace.fs.writeFile`
*   `list_files(directory: string)`: Lists files in a folder.
    *   *Impl*: `vscode.workspace.fs.readDirectory`
*   `search_files(query: string)`: Finds files matching a pattern.
    *   *Impl*: `vscode.workspace.findFiles`
*   `delete_file(path: string)`: Deletes a file. **(Requires Approval)**
    *   *Impl*: `vscode.workspace.fs.delete`

## 2. Terminal Tools (`src/tools/terminal.ts`)
*   `run_command(command: string, cwd?: string)`: Executes a shell command.
    *   *Impl*: Creates a `vscode.Task` or uses `child_process` (carefully managed).
    *   *Output*: Returns stdout/stderr.
*   `install_dependencies(package_manager: 'npm'|'yarn'|'pip')`: Helper to run install.

## 3. Git Tools (`src/tools/git.ts`)
*   `git_status()`: Returns modified files.
    *   *Impl*: Uses VS Code Git Extension API.
*   `git_diff(file?: string)`: Returns diffs.
*   `git_commit(message: string)`: Commits changes.
*   `git_push()`: Pushes to remote. **(Requires Approval)**

## 4. Project Tools (`src/tools/project.ts`)
*   `run_tests(path?: string)`: Runs test runner.
*   `run_lint()`: Runs linter.
*   `get_problems()`: Returns active diagnostics (red squiggles) from VS Code.
    *   *Impl*: `vscode.languages.getDiagnostics`
    *   *Critical*: Allows agent to see compile errors it created.

## 5. Agent Management Tools (`src/tools/agent.ts`)
*   `create_agent(name: string, instructions: string)`: Spawns a new sub-agent.
*   `update_instructions(agent_id: string, new_instructions: string)`: Self-improvement.

## 6. Tool Implementation Pattern
Every tool follows this structure:

```typescript
import { z } from 'zod';

export const ReadFileTool = {
  name: 'read_file',
  description: 'Read the contents of a file at the given absolute path.',
  schema: z.object({
    path: z.string().describe('Absolute path to the file'),
  }),
  execute: async (args: { path: string }) => {
    const uri = vscode.Uri.file(args.path);
    const data = await vscode.workspace.fs.readFile(uri);
    return new TextDecoder().decode(data);
  }
};
```
