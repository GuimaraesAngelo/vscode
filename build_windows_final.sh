#!/bin/bash
set -e

echo "=== BUILD WINDOWS BINARY ==="

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 22.20.0

cd /workspace/agents-ide-build/vscode-custom

# Increase memory
export NODE_OPTIONS="--max-old-space-size=8192"

echo "Node version: $(node -v)"
echo "Starting Windows build..."
echo "This will take 15-30 minutes..."

npx gulp vscode-win32-x64-min

echo ""
echo "=== BUILD COMPLETE ==="
echo "Checking output..."

if [ -d "../VSCode-win32-x64" ]; then
    echo "SUCCESS: VSCode-win32-x64 folder created"
    ls -lh ../VSCode-win32-x64/Code.exe 2>/dev/null && echo "Code.exe found!" || echo "WARNING: Code.exe not found"
else
    echo "ERROR: Build folder not created"
    exit 1
fi
