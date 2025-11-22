#!/bin/bash
set -e

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd /workspace/agents-ide-build/vscode-custom

# Use the exact Node version VS Code expects
nvm use 22.20.0

echo ">>> Node/NPM versions:"
node -v
npm -v

echo ">>> Installing VS Code dependencies with npm..."
npm install

echo ">>> COPY EXTENSION"
rm -rf extensions/agents-first-ide
mkdir -p extensions/agents-first-ide
cp -R /workspace/vscode/vscode/extensions/agents-first-ide/* extensions/agents-first-ide/

echo ">>> INSTALL EXTENSION DEPS"
cd extensions/agents-first-ide
npm install
if grep -q '"build":' package.json; then
    npm run build
elif grep -q '"compile":' package.json; then
    npm run compile
fi
cd ../..

echo ">>> BRANDING"
sed -i 's/"nameShort": "Code - OSS"/"nameShort": "Agents IDE"/' product.json
sed -i 's/"nameLong": "Code - OSS"/"nameLong": "Agents First IDE"/' product.json
sed -i 's/"applicationName": "code-oss"/"applicationName": "agents-ide"/' product.json
sed -i 's/"dataFolderName": ".vscode-oss"/"dataFolderName": ".agents-ide"/' product.json

echo ">>> COMPILE DEV BUILD"
npm run gulp -- compile

echo ">>> BUILD LINUX"
npm run gulp -- vscode-linux-x64-min

echo ">>> BUILD WINDOWS"
npm run gulp -- vscode-win32-x64-min

echo ">>> BUILD COMPLETE"
echo "Checking output directories..."
find /workspace/agents-ide-build -name "*linux-x64" -o -name "*win32-x64" 2>/dev/null | head -20
