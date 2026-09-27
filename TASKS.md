# TTI tasks — routed to one URL

Canonical: https://aaronreddix1987-sketch.github.io/

- [x] Single customer domain (GitHub Pages)
- [x] Flagship $47 Stripe checkout wired on home
- [x] Verified library with title-matched Stripe links
- [x] 10X Recovery page live (not a dead redirect)
- [x] Capacity / workforce project brief published at /project.html
- [x] Thank-you vault is self-serve (no email, no Chime)
- [x] Public mailto removed from store surfaces
- [x] Phone no longer used as the primary CTA
- [x] Satellite repos instructed to send traffic here
- [x] Card-only rule documented

Not claimed as finished from this commit (needs operator systems outside GitHub Pages):

- [ ] Stripe success URL on every product explicitly set to /thank-you.html?product=...
- [ ] Grant portal upload of corporate docs (funder system, not this site)
- [ ] Live AI phone agent telephony (separate product infra)

## 27 Sep 2026 — Stripe redirect fix attempted

Tried to update all 10 active Payment Links via API to redirect to thank-you.html?product=SLUG. API key lacks write permission on payment links (read-only). Manual dashboard edit still required:

1. Open https://dashboard.stripe.com/payment-links
2. For each link, set After payment → Redirect to:
   https://aaronreddix1987-sketch.github.io/thank-you.html?product=SLUG
3. Slugs: credit-repair-609, automotive-nemt, real-estate, cybersecurity, medical-data, medical-billing, buy-back-your-time-ai, cold-call-code, money-mindset, 10m-blueprint
