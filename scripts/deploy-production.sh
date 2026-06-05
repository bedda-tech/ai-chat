#!/usr/bin/env bash
# deploy-production.sh — one-shot Stripe + Vercel production setup
#
# Usage:
#   export STRIPE_SECRET_KEY=sk_live_xxx
#   export STRIPE_PUBLISHABLE_KEY=pk_live_xxx
#   export VERCEL_TOKEN=<your-vercel-personal-access-token>
#   bash scripts/deploy-production.sh
#
# Optional flags (env vars):
#   SKIP_PRODUCTS=1   — skip product/price creation (use if already created)
#                       Set STRIPE_PLUS_PRICE_ID etc. manually before running
#   SKIP_WEBHOOK=1    — skip webhook creation (use if already registered)
#                       Set STRIPE_WEBHOOK_SECRET=whsec_... before running
#
# What this does:
#   1. Creates Stripe products + prices (Plus $12, Pro $25, Max $50 / monthly + annual)
#   2. Creates the production Stripe webhook endpoint with all required events
#   3. Sets all env vars in Vercel (production environment) — upserts safely
#   4. Triggers a Vercel production deploy
#   5. Prints a reminder to activate the billing portal

set -euo pipefail

LIVE_DOMAIN="https://www.bedda.tech"
WEBHOOK_URL="${LIVE_DOMAIN}/api/webhooks/stripe"
VERCEL_PROJECT_ID="prj_1cMxwEGpknNL7fqQE03VXhEC8gZL"
VERCEL_TEAM_ID="team_lOS8hq9NLFn0ll5qbvsA51bQ"

# ─── Validate inputs ──────────────────────────────────────────────────────────
: "${STRIPE_SECRET_KEY:?Set STRIPE_SECRET_KEY=sk_live_...}"
: "${STRIPE_PUBLISHABLE_KEY:?Set STRIPE_PUBLISHABLE_KEY=pk_live_...}"
: "${VERCEL_TOKEN:?Set VERCEL_TOKEN=<vercel personal access token>}"

if [[ "$STRIPE_SECRET_KEY" != sk_live_* ]]; then
  echo "ERROR: STRIPE_SECRET_KEY must be a live key (sk_live_...)"
  exit 1
fi

echo "=== Bedda Production Setup ==="
echo "Domain: $LIVE_DOMAIN"
echo "Stripe mode: LIVE"
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"

# ─── Step 1: Create Stripe products + prices ──────────────────────────────────
if [[ "${SKIP_PRODUCTS:-}" == "1" ]]; then
  echo "Step 1: Skipping product creation (SKIP_PRODUCTS=1)"
  # Verify all required price IDs are provided
  : "${STRIPE_PLUS_PRICE_ID:?SKIP_PRODUCTS=1 requires STRIPE_PLUS_PRICE_ID to be set}"
  : "${STRIPE_PRO_PRICE_ID:?SKIP_PRODUCTS=1 requires STRIPE_PRO_PRICE_ID to be set}"
  : "${STRIPE_MAX_PRICE_ID:?SKIP_PRODUCTS=1 requires STRIPE_MAX_PRICE_ID to be set}"
  STRIPE_PLUS_ANNUAL_PRICE_ID="${STRIPE_PLUS_ANNUAL_PRICE_ID:-}"
  STRIPE_PRO_ANNUAL_PRICE_ID="${STRIPE_PRO_ANNUAL_PRICE_ID:-}"
  STRIPE_MAX_ANNUAL_PRICE_ID="${STRIPE_MAX_ANNUAL_PRICE_ID:-}"
else
  echo "Step 1: Creating Stripe products and prices..."
  cd "$REPO_DIR"
  SETUP_OUTPUT=$(STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" npx tsx scripts/setup-stripe.ts 2>&1)
  echo "$SETUP_OUTPUT"

  # Extract price IDs from setup-stripe.ts output
  STRIPE_PLUS_PRICE_ID=$(echo "$SETUP_OUTPUT" | grep "STRIPE_PLUS_PRICE_ID=" | grep -v "ANNUAL" | head -1 | cut -d= -f2)
  STRIPE_PLUS_ANNUAL_PRICE_ID=$(echo "$SETUP_OUTPUT" | grep "STRIPE_PLUS_ANNUAL_PRICE_ID=" | head -1 | cut -d= -f2)
  STRIPE_PRO_PRICE_ID=$(echo "$SETUP_OUTPUT" | grep "STRIPE_PRO_PRICE_ID=" | grep -v "ANNUAL" | head -1 | cut -d= -f2)
  STRIPE_PRO_ANNUAL_PRICE_ID=$(echo "$SETUP_OUTPUT" | grep "STRIPE_PRO_ANNUAL_PRICE_ID=" | head -1 | cut -d= -f2)
  STRIPE_MAX_PRICE_ID=$(echo "$SETUP_OUTPUT" | grep "STRIPE_MAX_PRICE_ID=" | grep -v "ANNUAL" | head -1 | cut -d= -f2)
  STRIPE_MAX_ANNUAL_PRICE_ID=$(echo "$SETUP_OUTPUT" | grep "STRIPE_MAX_ANNUAL_PRICE_ID=" | head -1 | cut -d= -f2)

  if [[ -z "$STRIPE_PLUS_PRICE_ID" ]]; then
    echo "ERROR: Failed to extract price IDs from setup-stripe.ts output."
    exit 1
  fi

  echo ""
  echo "Extracted price IDs:"
  echo "  STRIPE_PLUS_PRICE_ID=$STRIPE_PLUS_PRICE_ID"
  echo "  STRIPE_PLUS_ANNUAL_PRICE_ID=$STRIPE_PLUS_ANNUAL_PRICE_ID"
  echo "  STRIPE_PRO_PRICE_ID=$STRIPE_PRO_PRICE_ID"
  echo "  STRIPE_PRO_ANNUAL_PRICE_ID=$STRIPE_PRO_ANNUAL_PRICE_ID"
  echo "  STRIPE_MAX_PRICE_ID=$STRIPE_MAX_PRICE_ID"
  echo "  STRIPE_MAX_ANNUAL_PRICE_ID=$STRIPE_MAX_ANNUAL_PRICE_ID"
fi

# ─── Step 2: Create Stripe webhook endpoint ───────────────────────────────────
if [[ "${SKIP_WEBHOOK:-}" == "1" ]]; then
  echo ""
  echo "Step 2: Skipping webhook creation (SKIP_WEBHOOK=1)"
  : "${STRIPE_WEBHOOK_SECRET:?SKIP_WEBHOOK=1 requires STRIPE_WEBHOOK_SECRET=whsec_... to be set}"
  WEBHOOK_ID="(existing)"
else
  echo ""
  echo "Step 2: Creating Stripe webhook endpoint at $WEBHOOK_URL..."

  WEBHOOK_RESPONSE=$(curl -s -X POST "https://api.stripe.com/v1/webhook_endpoints" \
    -u "${STRIPE_SECRET_KEY}:" \
    -d "url=${WEBHOOK_URL}" \
    -d "enabled_events[]=checkout.session.completed" \
    -d "enabled_events[]=customer.subscription.created" \
    -d "enabled_events[]=customer.subscription.updated" \
    -d "enabled_events[]=customer.subscription.deleted" \
    -d "enabled_events[]=invoice.payment_succeeded" \
    -d "enabled_events[]=invoice.payment_failed" \
    -d "description=Bedda Chat production webhook")

  STRIPE_WEBHOOK_SECRET=$(echo "$WEBHOOK_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('secret',''))" 2>/dev/null)
  WEBHOOK_ID=$(echo "$WEBHOOK_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null)

  if [[ -z "$STRIPE_WEBHOOK_SECRET" || "$STRIPE_WEBHOOK_SECRET" == "None" ]]; then
    echo "ERROR: Failed to create Stripe webhook. Response:"
    echo "$WEBHOOK_RESPONSE"
    echo ""
    echo "The webhook may already exist. Check: https://dashboard.stripe.com/webhooks"
    echo ""
    echo "If it exists, get the signing secret from the webhook details page and set:"
    echo "  STRIPE_WEBHOOK_SECRET=whsec_..."
    echo "Then re-run with SKIP_WEBHOOK=1 to skip webhook creation:"
    echo "  SKIP_WEBHOOK=1 STRIPE_WEBHOOK_SECRET=whsec_... bash scripts/deploy-production.sh"
    exit 1
  fi

  echo "Created webhook: $WEBHOOK_ID"
  echo "Signing secret: $STRIPE_WEBHOOK_SECRET"
fi

# ─── Step 3: Set Vercel production env vars ───────────────────────────────────
echo ""
echo "Step 3: Setting Vercel production environment variables..."

# Fetch all existing production env var IDs once, then look up by key.
# Using a single API call is much faster than one call per var.
echo "  Fetching existing env vars..."
EXISTING_ENVS=$(curl -s \
  "https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/env?teamId=${VERCEL_TEAM_ID}&limit=100" \
  -H "Authorization: Bearer ${VERCEL_TOKEN}")

vercel_env_set() {
  local key="$1"
  local value="$2"
  echo "  Setting $key..."

  # Look up the ID of any existing production env var with this key.
  local existing_id
  existing_id=$(echo "$EXISTING_ENVS" | python3 -c "
import sys, json
data = json.load(sys.stdin)
envs = data.get('envs', [])
match = [e['id'] for e in envs if e.get('key') == '${key}' and 'production' in e.get('target', [])]
print(match[0] if match else '')
" 2>/dev/null)

  if [[ -n "$existing_id" ]]; then
    # PATCH the existing var in-place (preserves other environments untouched)
    RESULT=$(curl -s -X PATCH \
      "https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/env/${existing_id}?teamId=${VERCEL_TEAM_ID}" \
      -H "Authorization: Bearer ${VERCEL_TOKEN}" \
      -H "Content-Type: application/json" \
      -d "{\"value\":\"${value}\",\"type\":\"encrypted\",\"target\":[\"production\"]}")
  else
    # Create a new env var
    RESULT=$(curl -s -X POST \
      "https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env?teamId=${VERCEL_TEAM_ID}" \
      -H "Authorization: Bearer ${VERCEL_TOKEN}" \
      -H "Content-Type: application/json" \
      -d "{\"key\":\"${key}\",\"value\":\"${value}\",\"type\":\"encrypted\",\"target\":[\"production\"]}")
  fi

  if echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if 'id' in d or 'created' in d else 1)" 2>/dev/null; then
    echo "    OK"
  else
    echo "    WARN: $RESULT"
  fi
}

vercel_env_set "STRIPE_SECRET_KEY"            "$STRIPE_SECRET_KEY"
vercel_env_set "STRIPE_PUBLISHABLE_KEY"       "$STRIPE_PUBLISHABLE_KEY"
vercel_env_set "STRIPE_WEBHOOK_SECRET"        "$STRIPE_WEBHOOK_SECRET"
vercel_env_set "STRIPE_PLUS_PRICE_ID"         "$STRIPE_PLUS_PRICE_ID"
vercel_env_set "STRIPE_PLUS_ANNUAL_PRICE_ID"  "$STRIPE_PLUS_ANNUAL_PRICE_ID"
vercel_env_set "STRIPE_PRO_PRICE_ID"          "$STRIPE_PRO_PRICE_ID"
vercel_env_set "STRIPE_PRO_ANNUAL_PRICE_ID"   "$STRIPE_PRO_ANNUAL_PRICE_ID"
vercel_env_set "STRIPE_MAX_PRICE_ID"          "$STRIPE_MAX_PRICE_ID"
vercel_env_set "STRIPE_MAX_ANNUAL_PRICE_ID"   "$STRIPE_MAX_ANNUAL_PRICE_ID"
vercel_env_set "NEXT_PUBLIC_APP_URL"          "$LIVE_DOMAIN"

# ─── Step 4: Trigger Vercel production deploy ─────────────────────────────────
echo ""
echo "Step 4: Triggering Vercel production redeploy..."
DEPLOY_RESULT=$(curl -s -X POST "https://api.vercel.com/v13/deployments?teamId=${VERCEL_TEAM_ID}" \
  -H "Authorization: Bearer ${VERCEL_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"bedda-chat\",\"gitSource\":{\"type\":\"github\",\"repoId\":\"bedda-tech/ai-chat\",\"ref\":\"main\"},\"target\":\"production\"}" 2>/dev/null)

DEPLOY_URL=$(echo "$DEPLOY_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('url',''))" 2>/dev/null)
if [[ -n "$DEPLOY_URL" ]]; then
  echo "Deploy triggered: https://$DEPLOY_URL"
else
  echo "Could not trigger deploy via API — push a commit to trigger auto-deploy:"
  echo "  git commit --allow-empty -m 'chore: trigger production redeploy with live Stripe keys'"
  echo "  GIT_SSH_COMMAND=\"ssh -i ~/.ssh/matt-bedda -o StrictHostKeyChecking=no\" git push git@github.com:bedda-tech/ai-chat.git main"
fi

# ─── Step 5: Final checklist ──────────────────────────────────────────────────
echo ""
echo "=== MANUAL STEPS REMAINING ==="
echo ""
echo "1. Activate Stripe Billing Portal (REQUIRED for subscription management):"
echo "   https://dashboard.stripe.com/settings/billing/portal"
echo "   - Click Activate"
echo "   - Check: Cancel subscriptions, Update payment methods, View invoices"
echo "   - Cancellation: 'Cancel at period end' (recommended)"
echo ""
echo "2. Verify the webhook is wired up after deploy:"
echo "   a. In Stripe Dashboard → Webhooks → $WEBHOOK_ID → Send test event"
echo "      Event: checkout.session.completed"
echo "   b. Check DB was updated:"
echo "      psql \$POSTGRES_URL -c 'SELECT \"userId\", tier, \"updatedAt\" FROM \"UserTier\" ORDER BY \"updatedAt\" DESC LIMIT 5;'"
echo ""
echo "3. Smoke-test a real checkout (use Stripe test card 4242 4242 4242 4242):"
echo "   - Log in to www.bedda.tech as a free user"
echo "   - Go to Settings → Subscription → Upgrade to Plus"
echo "   - Complete checkout with the test card"
echo "   - Verify tier changes to 'pro' (Plus) in DB"
echo ""
echo "=== DONE ==="
echo "Stripe live billing is now active at $LIVE_DOMAIN"
