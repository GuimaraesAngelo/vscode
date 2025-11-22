#!/bin/bash
set -e
export DEBIAN_FRONTEND=noninteractive

echo ">>> 1. SYSTEM INFO"
uname -a
if command -v lsb_release &> /dev/null; then lsb_release -a; fi

echo ">>> 2. INSTALL SYSTEM DEPENDENCIES"
apt update -y
apt install -y libkrb5-dev libsecret-1-dev pkg-config gcc g++ make python3-dev

echo ">>> 3. SETUP NODE"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 22.20.0
node -v
npm -v

echo ">>> 4. CLEAN & INSTALL DEPS"
cd /workspace/agents-ide-build/vscode-custom

if [ -d "node_modules" ]; then
    echo "node_modules exists, skipping clean install to save time."
else
    echo "Installing dependencies (this may take a while)..."
    npm install --verbose > install.log 2>&1 || { echo "npm install failed. Last 50 lines:"; tail -n 50 install.log; exit 1; }
fi

echo ">>> 5. COMPILE"
export NODE_OPTIONS="--max-old-space-size=8192"
npx gulp compile

echo ">>> 6. CHECK EXTENSION"
if [ -d "extensions/agents-first-ide" ]; then
    echo "Extension found."
    ls -la extensions/agents-first-ide
else
    echo "WARNING: Extension NOT found in extensions/agents-first-ide"
fi

echo ">>> 7. BUILD LINUX BINARY"
npx gulp vscode-linux-x64-min

echo ">>> 8. BUILD WINDOWS BINARY"
npx gulp vscode-win32-x64-min

echo ">>> SUCCESS! BUILD COMPLETE"
