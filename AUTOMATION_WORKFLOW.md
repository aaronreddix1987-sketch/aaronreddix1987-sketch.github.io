# TTI automated revenue workflow

## Objective
Automate routine lead capture, qualification, checkout, onboarding, and follow-up around one offer: **AI Front Desk — $497 setup + $297/month**.

This is an automation-first workflow, not a promise of zero human involvement. Humans remain the escalation path for payment disputes, regulated or clinical matters, emergencies, account permissions, legal requests, and unusual cases.

## Customer path

1. **Traffic** — website, approved social posts, or compliant outreach.
2. **Capture** — form, chat, or phone agent collects name, business, phone, email, industry, need, and preferred next step.
3. **Qualify** — the agent checks fit and intent; it does not invent results, testimonials, or guarantees.
4. **Route** — send a Stripe product link, offer the booking calendar, or place the lead in the escalation queue.
5. **Payment** — Stripe is the source of truth. Never collect card details in chat or by phone.
6. **Onboarding** — after a verified payment event, send the onboarding form, access checklist, and implementation expectations.
7. **Delivery** — configure the agreed workflow, test five call paths, and send a completion notice.
8. **Retention** — monthly health check, failed-payment alert, usage summary, and renewal reminder.

## Autonomous boundaries

The system may automatically handle routine FAQs, reminders, lead tagging, scheduling, product-link delivery, receipts, and status notifications. It must stop and escalate when a person requests medical, legal, financial, emergency, credential, refund, or account-permission help.

## Required provider connections

These cannot be safely faked or completed from a static GitHub Pages repository:

- Stripe merchant account and Payment Links
- Calendar provider
- CRM or database
- SMS/voice provider
- Email sender/domain authentication
- Social accounts and publishing permissions

Store all secrets in the provider or automation platform. Never commit keys, OAuth authorization URLs, webhook secrets, or customer data to this repository.

## Live now (24 Sep 2026)

- [x] Homepage sell page: https://aaronreddix1987-sketch.github.io/
- [x] Offer page: https://aaronreddix1987-sketch.github.io/offer.html
- [x] Lead capture (opens SMS/email): https://aaronreddix1987-sketch.github.io/lead.html
- [x] Onboarding checklist: https://aaronreddix1987-sketch.github.io/onboard.html
- [x] Inbound agent prompt: /agents/inbound-system-prompt.txt (identifies as AI; approved claims only)
- [x] Stripe live account connected for *existing* ebook Payment Links
- [x] Hourly Stripe charge poll + Stripe email watcher (Grok Automations)
- [ ] $497 setup Payment Link — BLOCKED: connected Stripe key cannot create products
- [ ] $297/mo recurring Price — BLOCKED: same key permission
- [ ] Calendar provider — not connected
- [ ] SMS/voice provider (Vapi/Twilio) — prompt only, no live number routing
- [ ] CRM / database — not connected
- [ ] Direct Stripe → Grok webhook — signature mismatch; poll used instead

## Launch checklist

- [x] Correct Stripe account visible (`acct_1TI5o4AZJj5080Vf`) — ebook links work
- [ ] Setup Payment Link created and tested with a controlled purchase
- [x] Success/onboarding page published (`onboard.html`)
- [x] Inbound agent identifies itself as AI and uses approved claims only
- [ ] Calendar and SMS permissions connected
- [ ] Failed payment and escalation paths tested against a real $497 invoice
- [ ] One approved campaign scheduled
- [ ] Funnel metrics tracked: visit → click → checkout → paid → onboarded

No revenue, conversion, or performance outcome is guaranteed by this workflow.
