#!/bin/bash
set -e

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd /workspace/agents-ide-build/vscode-custom

# Install and use the exact Node version VS Code expects
nvm install 22.20.0
nvm use 22.20.0

echo "Node version:"
node -v

echo "NPM version:"
npm -v

echo "Installing Yarn Classic..."
npm install -g yarn

echo "Yarn version:"
yarn -v
