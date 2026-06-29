#!/usr/bin/env bash
set -euo pipefail

echo "Installing dependencies for api-server..."
cd artifacts/api-server
npm install --legacy-peer-deps 2>&1

echo "Building api-server..."
npm run build 2>&1

# Move dist files to root artifacts directory for consistent start command
cp dist/*.mjs ../dist/ 2>/dev/null || true
cp dist/*.map ../dist/ 2>/dev/null || true

echo "Build complete!"
