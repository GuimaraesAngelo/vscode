#!/bin/bash
set -e
export DEBIAN_FRONTEND=noninteractive

echo ">>> UPDATE & UPGRADE"
apt update -y && apt upgrade -y

echo ">>> INSTALL DEPENDENCIES"
apt install -y git curl wget build-essential python3 python3-pip python3-distutils gnupg2 libx11-dev libxkbfile-dev libsecret-1-dev libnss3 libgtk-3-dev libxss1 libasound2

echo ">>> INSTALL NVM & NODE"
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 22
nvm use 22
node -v
npm -v

echo ">>> INSTALL YARN"
corepack enable
corepack prepare yarn@stable --activate
yarn -v

echo ">>> PREPARE BUILD DIR"
mkdir -p /workspace/agents-ide-build
cd /workspace/agents-ide-build

echo ">>> CLONE VS CODE"
if [ ! -d "vscode-custom" ]; then
    git clone https://github.com/microsoft/vscode.git vscode-custom
else
    echo "vscode-custom already exists, skipping clone"
fi
cd vscode-custom

echo ">>> INSTALL VS CODE DEPS"
yarn install --frozen-lockfile

echo ">>> COPY EXTENSION"
# Ensure destination exists and is clean
rm -rf extensions/agents-first-ide
mkdir -p extensions/agents-first-ide

# Source: /workspace/vscode/vscode/extensions/agents-first-ide
# We use the mount point /workspace which maps to C:/Users/Micro
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

echo ">>> BUILD COMPLETE"
echo "Binaries should be in /workspace/agents-ide-build/vscode-custom/..."
