#!/bin/bash
set -e

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 22.20.0

cd /workspace/agents-ide-build

if [ -d "VSCode-win32-x64" ] && [ "$(ls -A VSCode-win32-x64)" ]; then
    echo ">>> Windows build directory exists and is not empty."
    ls -F VSCode-win32-x64
else
    echo ">>> Windows build directory MISSING or EMPTY. Starting build..."
    cd vscode-custom
    export NODE_OPTIONS="--max-old-space-size=8192"
    npx gulp vscode-win32-x64-min
fi
