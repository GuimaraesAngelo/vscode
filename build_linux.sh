#!/bin/bash
set -e

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 22.20.0

cd /workspace/agents-ide-build/vscode-custom

echo ">>> BUILDING LINUX BINARY"
export NODE_OPTIONS="--max-old-space-size=8192"
npx gulp vscode-linux-x64-min

echo ">>> CHECKING ARTIFACTS"
ls -la ../VSCode-linux-x64
