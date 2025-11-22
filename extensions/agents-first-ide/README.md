# Agents First IDE (Extension)

This is the core extension for the "Agents First" VS Code distribution.

## Setup

1.  Navigate to this folder: `cd extensions/agents-first-ide`
2.  Install dependencies: `npm install`
3.  Generate Prisma Client: `npx prisma generate`
4.  Compile: `npm run compile`

## Running

1.  Open the project in VS Code.
2.  Press `F5` to launch the Extension Host.
3.  Open the "Copilot" view in the Activity Bar or Panel.
4.  Set your OpenAI API Key in Settings (`agents-first.openaiApiKey`) for real AI, or use the mock mode.

## Architecture

See the `../../architecture` folder for detailed design documents.
