#!/usr/bin/env bash
# deploy-production.sh — one-shot Stripe + Vercel production setup
#
# Usage:
#   export STRIPE_SECRET_KEY=sk_live_xxx
#   export STRIPE_PUBLISHABLE_KEY=pk_live_xxx
#   export VERCEL_TOKEN=<your-vercel-personal-access-token>
#   bash scripts/deploy-production.sh
#
# What this does:
#   1. Creates Stripe products + prices (Plus $12, Pro $25, Max $50 / monthly + annual)
#   2. Creates the production Stripe webhook endpoint with all required events
#   3. Sets all env vars in Vercel (production environment)
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
echo "Step 1: Creating Stripe products and prices..."
cd "$REPO_DIR"
SETUP_OUTPUT=$(STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" npx tsx scripts/setup-stripe.ts 2>&1)
echo "$SETUP_OUTPUT"

# Extract price IDs from output
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

# ─── Step 2: Create Stripe webhook endpoint ───────────────────────────────────
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

WEBHOOK_SECRET=$(echo "$WEBHOOK_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('secret',''))" 2>/dev/null)
WEBHOOK_ID=$(echo "$WEBHOOK_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null)

if [[ -z "$WEBHOOK_SECRET" || "$WEBHOOK_SECRET" == "None" ]]; then
  echo "ERROR: Failed to create Stripe webhook. Response:"
  echo "$WEBHOOK_RESPONSE"
  echo ""
  echo "The webhook may already exist. Check: https://dashboard.stripe.com/webhooks"
  echo ""
  echo "If it exists, get the signing secret from the webhook details page and set:"
  echo "  STRIPE_WEBHOOK_SECRET=whsec_..."
  echo "Then re-run this script with SKIP_WEBHOOK=1 to skip webhook creation."
  exit 1
fi

STRIPE_WEBHOOK_SECRET="$WEBHOOK_SECRET"
echo "Created webhook: $WEBHOOK_ID"
echo "Signing secret: $STRIPE_WEBHOOK_SECRET"

# ─── Step 3: Set Vercel production env vars ───────────────────────────────────
echo ""
echo "Step 3: Setting Vercel production environment variables..."

vercel_env_set() {
  local key="$1"
  local value="$2"
  echo "  Setting $key..."
  # Remove existing var if present (ignore errors), then add
  curl -s -X DELETE "https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/env/${key}?teamId=${VERCEL_TEAM_ID}" \
    -H "Authorization: Bearer ${VERCEL_TOKEN}" > /dev/null 2>&1 || true

  RESULT=$(curl -s -X POST "https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env?teamId=${VERCEL_TEAM_ID}" \
    -H "Authorization: Bearer ${VERCEL_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"key\":\"${key}\",\"value\":\"${value}\",\"type\":\"encrypted\",\"target\":[\"production\"]}")

  if echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if 'id' in d or 'created' in d else 1)" 2>/dev/null; then
    echo "    OK"
  else
    echo "    WARN: $RESULT"
  fi
}

vercel_env_set "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY"
vercel_env_set "STRIPE_PUBLISHABLE_KEY" "$STRIPE_PUBLISHABLE_KEY"
vercel_env_set "STRIPE_WEBHOOK_SECRET" "$STRIPE_WEBHOOK_SECRET"
vercel_env_set "STRIPE_PLUS_PRICE_ID" "$STRIPE_PLUS_PRICE_ID"
vercel_env_set "STRIPE_PLUS_ANNUAL_PRICE_ID" "$STRIPE_PLUS_ANNUAL_PRICE_ID"
vercel_env_set "STRIPE_PRO_PRICE_ID" "$STRIPE_PRO_PRICE_ID"
vercel_env_set "STRIPE_PRO_ANNUAL_PRICE_ID" "$STRIPE_PRO_ANNUAL_PRICE_ID"
vercel_env_set "STRIPE_MAX_PRICE_ID" "$STRIPE_MAX_PRICE_ID"
vercel_env_set "STRIPE_MAX_ANNUAL_PRICE_ID" "$STRIPE_MAX_ANNUAL_PRICE_ID"

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
  echo "Could not trigger deploy via API. Push a commit to main to trigger auto-deploy:"
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
echo "2. Send a test webhook to verify the integration:"
echo "   In Stripe Dashboard → Webhooks → $WEBHOOK_ID → Send test event"
echo "   Event: checkout.session.completed"
echo "   Then check: psql \$POSTGRES_URL -c 'SELECT userId, tier FROM \"UserTier\" ORDER BY \"updatedAt\" DESC LIMIT 5;'"
echo ""
echo "=== DONE ==="
echo "Stripe live billing is now active at $LIVE_DOMAIN"
