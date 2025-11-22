#!/bin/bash
set -e

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd /workspace/agents-ide-build/vscode-custom

# Use the exact Node version VS Code expects
nvm use 22.20.0

echo ">>> Testing preinstall script..."
node build/npm/preinstall.js
