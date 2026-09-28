# Manus Skill — Sober Living Outreach

## Skill name
tti-sober-living-outreach

## Trigger
"Run sober living outreach" or "contact property owners for sober living"

## Steps
1. Read repo files:
   - sober-living/OUTREACH_PACK.md
   - sober-living/property_targets.csv
   - sober-living/CHATGPT_AGENT_PROMPT.md
2. For each target with status "Not yet contacted", draft one personalized email using the call script (Drive 183og7...). Subject: "Partnership idea for {propertyAddress} — $3,500/mo net guaranteed".
3. Batch into Instantly.ai campaign, 20/day per inbox, 3 inboxes max = 60/day safe.
4. Update property_targets.csv status to "Emailed YYYY-MM-DD".
5. Poll inboxes for replies. On any positive reply, create a task for Aaron: "Owner interested — {property} — review terms".
6. Daily digest: sent count, reply count, pending government responses, next actions.

## Stop conditions
- Owner says yes → pause, notify Aaron, no further automated negotiation.
- Government portal requires identity verification → queue for Aaron.
- Any request to sign or pay → queue for Aaron.

## Secrets
Instantly API key, Gmail OAuth, Stripe key — stored in provider secret storage only. Never in repo.
