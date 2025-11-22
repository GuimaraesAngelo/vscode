#!/bin/bash
set -e

echo ">>> COPY EXTENSION"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 22.20.0
# Ensure destination exists and is clean
rm -rf /workspace/agents-ide-build/vscode-custom/extensions/agents-first-ide
mkdir -p /workspace/agents-ide-build/vscode-custom/extensions/agents-first-ide

# Copy from source
cp -R /workspace/vscode/vscode/extensions/agents-first-ide/* /workspace/agents-ide-build/vscode-custom/extensions/agents-first-ide/

echo ">>> INSTALL EXTENSION DEPS"
cd /workspace/agents-ide-build/vscode-custom/extensions/agents-first-ide
npm install
npm run compile

echo ">>> VERIFY EXTENSION"
ls -la dist/ || ls -la out/

echo ">>> EXTENSION SETUP COMPLETE"
