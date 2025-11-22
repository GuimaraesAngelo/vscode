#!/bin/bash
set -e

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd /workspace/agents-ide-build/vscode-custom

# Use the exact Node version VS Code expects
nvm use 22.20.0

echo ">>> Node/NPM/Yarn versions:"
node -v
npm -v
yarn -v

echo ">>> Installing VS Code dependencies..."
yarn install

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
yarn gulp compile

echo ">>> BUILD LINUX"
yarn gulp vscode-linux-x64-min

echo ">>> BUILD WINDOWS"
yarn gulp vscode-win32-x64-min

echo ">>> BUILD COMPLETE"
echo "Checking output directories..."
ls -lh ../ | grep -E "VSCode-linux|VSCode-win32" || echo "Build artifacts may be in different location"
find .. -maxdepth 2 -name "*linux*" -o -name "*win32*" | head -20
