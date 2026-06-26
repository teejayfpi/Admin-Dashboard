#!/usr/bin/env bash
set -euo pipefail

echo "Installing pnpm..."
npm install --prefix .pnpm_bin pnpm@9.15.4
export PATH="$PWD/.pnpm_bin/node_modules/.bin:$PATH"
pnpm --version

echo "Installing dependencies..."
pnpm install --no-frozen-lockfile 2>&1 || pnpm install 2>&1

echo "Building api-server..."
pnpm --filter @workspace/api-server run build 2>&1

echo "Build complete!"
