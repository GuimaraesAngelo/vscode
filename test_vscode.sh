#!/bin/bash
set -e

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 22.20.0

cd /workspace/agents-ide-build/vscode-custom

echo ">>> STARTING VS CODE (HEADLESS TEST)"
# We use --list-extensions to verify it starts and sees our extension
# We need to point to the extensions dir explicitly if it's not in the default location,
# but since we put it in the built-in extensions folder, it should be picked up or listed as built-in.

# Note: built-in extensions might not show up in --list-extensions unless we use --builtin
./scripts/code.sh --list-extensions --builtin

echo ">>> CHECKING FOR AGENTS IDE"
# We can also check product.json to see if branding worked
grep "nameShort" product.json
