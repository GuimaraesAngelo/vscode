#!/bin/bash
set -e
export DEBIAN_FRONTEND=noninteractive

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo ">>> CHECK NODE/YARN"
node -v
yarn -v

cd /workspace/agents-ide-build/vscode-custom

# Switch to Yarn Classic for VS Code
echo ">>> SWITCH TO YARN CLASSIC"
corepack disable
npm install -g yarn
yarn -v

echo ">>> INSTALL VS CODE DEPS"
set -x
yarn cache clean
yarn install --verbose

echo ">>> COPY EXTENSION"
rm -rf extensions/agents-first-ide
mkdir -p extensions/agents-first-ide
cp -R /workspace/vscode/vscode/extensions/agents-first-ide/* extensions/agents-first-ide/

echo ">>> INSTALL EXTENSION DEPS"
cd extensions/agents-first-ide
npm install
if grep -q "\"build\":" package.json; then
    npm run build
elif grep -q "\"compile\":" package.json; then
    npm run compile
fi
cd ../..

echo ">>> BRANDING"
sed -i 's/"nameShort": "Code - OSS"/"nameShort": "Agents IDE"/' product.json
sed -i 's/"nameLong": "Code - OSS"/"nameLong": "Agents First IDE"/' product.json
sed -i 's/"applicationName": "code-oss"/"applicationName": "agents-ide"/' product.json
sed -i 's/"dataFolderName": ".vscode-oss"/"dataFolderName": ".agents-ide"/' product.json

echo ">>> BUILD LINUX"
yarn gulp vscode-linux-x64-min

echo ">>> BUILD WINDOWS"
yarn gulp vscode-win32-x64-min

echo ">>> DONE"
ls -la ..
