# Stripe Pricing Mismatch Resolution Proposal

## Problem Summary

There is a mismatch between the code/site pricing and the Stripe catalog:

| Plan | Code/Site | Stripe Env Var | Stripe Amount | Status |
|------|-----------|---|---|---|
| Plus | $12/mo | STRIPE_PLUS_PRICE_ID | ❌ Missing | Plus checkout broken |
| Pro | $25/mo | STRIPE_PRO_PRICE_ID | $20/mo (legacy) | Shows $25, charges $20 ❌ |
| Max | $50/mo | STRIPE_MAX_PRICE_ID | ❌ Missing | Falls back to STRIPE_PREMIUM_PRICE_ID |
| *Annual | 20% off | *_ANNUAL_PRICE_ID | ❌ All Missing | Annual billing broken |

### Current Production Environment
- **STRIPE_PRO_PRICE_ID**: price_... ($20/mo) — legacy "Bedda Chat Pro" product
- **STRIPE_PREMIUM_PRICE_ID**: price_... ($50/mo) — legacy "Bedda Chat Premium" product
- **Missing**: STRIPE_PLUS_PRICE_ID, STRIPE_MAX_PRICE_ID, all annual price IDs

### Impact
1. **Plus tier completely broken** — no checkout path exists
2. **Pro tier shows $25, charges $20** — billing mismatch and angry customers
3. **Annual billing completely broken** — missing all *_ANNUAL_PRICE_IDs
4. **Max tier only works via fallback** — fragile, depends on unmapped env var

### Existing Customer at Risk
- One paying customer (2026-10-01) upgraded to $50/mo via billing portal
- Mapped via STRIPE_PREMIUM_PRICE_ID fallback (commit 2c1afc7)
- If we delete STRIPE_PREMIUM_PRICE_ID without migration, this customer breaks

---

## Proposed Solution

### Phase 1: Create New Stripe Products/Prices (TODAY)

Use the existing `scripts/setup-stripe.ts` to create three new products with all variants:

**New Products (to be created in Stripe test mode first):**
- **Bedda Plus**: $12/mo or $115.20/yr (20% off)
- **Bedda Pro**: $25/mo or $240/yr (20% off)
- **Bedda Max**: $50/mo or $480/yr (20% off)

This creates 6 price IDs (3 products × 2 billing periods).

### Phase 2: Set Environment Variables (AFTER APPROVAL)

Update Vercel environment (Settings → Environment Variables):
```
STRIPE_PLUS_PRICE_ID=price_...
STRIPE_PLUS_ANNUAL_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_PRO_ANNUAL_PRICE_ID=price_...
STRIPE_MAX_PRICE_ID=price_...
STRIPE_MAX_ANNUAL_PRICE_ID=price_...
```

**Keep for now (backwards compat):**
- STRIPE_PREMIUM_PRICE_ID — fallback for existing $50 customers
- STRIPE_PRO_PRICE_ID (old $20) — may be referenced by existing customers

### Phase 3: Test Checkout (AFTER ENV VARS SET)

1. Test Plus checkout (monthly + annual) → should use new STRIPE_PLUS_PRICE_ID
2. Test Pro checkout (monthly + annual) → should use new STRIPE_PRO_PRICE_ID ($25/mo)
3. Test Max checkout (monthly + annual) → should use new STRIPE_MAX_PRICE_ID
4. Verify billing portal shows correct amounts

### Phase 4: Cleanup (AFTER ALL NEW CUSTOMERS ARE ON NEW PRICES)

- Monitor customer migrations
- Once legacy STRIPE_PREMIUM_PRICE_ID customers are migrated, remove the fallback in code
- Deactivate or rename old Stripe products to avoid confusion

---

## Recommendations

### Price Points (For Approval)
- **Plus: $12/mo** ($9.60/mo annual) — Current free tier upsell ✓
- **Pro: $25/mo** ($20/mo annual) — Power user tier ✓
- **Max: $50/mo** ($40/mo annual) — Enterprise tier ✓

These match the current site and code, and are reasonable given the feature set.

### Stripe Test Mode First
Test all checkouts in Stripe test mode before going live. The script creates in test or live based on the key prefix (sk_test_* vs sk_live_*).

### Migration Strategy for Existing Customer
The customer on STRIPE_PREMIUM_PRICE_ID ($50) should:
1. Keep current subscription unchanged (do not force migration)
2. Allow future upgrades to use new STRIPE_MAX_PRICE_ID
3. If they downgrade, offer choice between new prices
4. Monitor this customer specifically during the transition

---

## Next Steps (Pending Your Approval)

1. **Approve these price points**: Plus $12, Pro $25, Max $50 (+ 20% annual discount)
2. **Approve migration strategy**: Keep STRIPE_PREMIUM_PRICE_ID as fallback during transition
3. Run `scripts/setup-stripe.ts` in test mode to verify
4. Update Vercel env vars with the new price IDs
5. Test each checkout path in Stripe test mode
6. Deploy changes to main
7. Monitor for issues

---

## Questions for Matt

1. **Price points**: Are you happy with Plus $12 / Pro $25 / Max $50? Any changes?
2. **Customer communication**: Should we email the one existing customer about the pricing mismatch and clarify what they're being charged?
3. **Stripe test vs live**: Should I create prices in test mode first, or go straight to live?
