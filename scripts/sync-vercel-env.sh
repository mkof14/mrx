#!/usr/bin/env bash
# Copy secrets from .env.local to Vercel (Production + Preview + Development).
# Run from repo root: ./scripts/sync-vercel-env.sh
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f .env.local ]]; then
  echo "Missing .env.local — copy from .env.example and fill in values."
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env.local
set +a

add_var() {
  local name="$1"
  local value="$2"
  if [[ -z "$value" ]]; then
    echo "skip $name (empty)"
    return
  fi
  for env in production preview development; do
    printf '%s' "$value" | npx vercel env add "$name" "$env" --yes --sensitive --force 2>&1 | tail -1
  done
  echo "ok $name"
}

add_var GOOGLE_CLIENT_ID "${GOOGLE_CLIENT_ID:-}"
add_var VITE_GOOGLE_CLIENT_ID "${VITE_GOOGLE_CLIENT_ID:-${GOOGLE_CLIENT_ID:-}}"
add_var GEMINI_API_KEY "${GEMINI_API_KEY:-}"
add_var JWT_SECRET "${JWT_SECRET:-}"
add_var ELEVENLABS_API_KEY "${ELEVENLABS_API_KEY:-}"
add_var ELEVENLABS_MODEL_ID "${ELEVENLABS_MODEL_ID:-}"
for env in production preview development; do
  printf '%s' 'https://mrx-lemon.vercel.app' | npx vercel env add CLIENT_ORIGIN "$env" --yes --force 2>&1 | tail -1
done
echo "ok CLIENT_ORIGIN"

echo ""
echo "Done. Redeploy on Vercel: Deployments → latest → Redeploy"
