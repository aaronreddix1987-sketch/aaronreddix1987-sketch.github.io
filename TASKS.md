# TTI tasks — routed to one URL

Canonical: https://aaronreddix1987-sketch.github.io/

## Done
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
- [x] Mother's house address removed from public site (private consent packet in Drive)
- [x] Martell loop + Replacement Ladder baked into daily automation

## Human-only (Aaron)
- [ ] Call Argin 818-836-0124 — 7230 Case Ave owner-carry / live-in manager
- [ ] Call FTB 888-635-0494 — business entity unit, Form 2924 + 3557 revivor (C4861952 / 47-4907956)
- [ ] Call Advocate 800-883-5910 if dumped; fax 916-843-6022
- [ ] Live Scan for case numbers, then file CR-180 at courthouse of conviction
- [ ] Call A New Way of Life 323-563-3575 or LA PD 213-974-2811 or ReFresh 213-204-9904
- [ ] Ask VOA case manager for YOUR housing-nav / RBH referral
- [ ] Text 5 people https://aaronreddix1987-sketch.github.io/ebooks.html
- [ ] Stripe dashboard: set success URL on every Payment Link to /thank-you.html?product=SLUG (API key is read-only)
- [ ] Deathra signs owner-consent page (Drive) before any Planning letter
- [ ] 2 board names + ~$330 for nonprofit articles (SOS $30 + 1023-EZ $275 + AG $25)

## Not claimed finished (needs systems outside GitHub Pages)
- [ ] Stripe success URL on every product explicitly set to /thank-you.html?product=...
- [ ] Grant portal upload of corporate docs (funder system, not this site)
- [ ] Live AI phone agent telephony (separate product infra)
- [ ] FTB revival decision (external)
- [ ] Owner signature on any property (external)

## 27 Sep 2026 — Stripe redirect fix attempted
Tried to update all 10 active Payment Links via API to redirect to thank-you.html?product=SLUG. API key lacks write permission on payment links (read-only). Manual dashboard edit still required:
1. Open https://dashboard.stripe.com/payment-links
2. For each link, set After payment → Redirect to: https://aaronreddix1987-sketch.github.io/thank-you.html?product=SLUG
3. Slugs: credit-repair-609, automotive-nemt, real-estate, cybersecurity, medical-data, medical-billing, buy-back-your-time-ai, cold-call-code, money-mindset, 10m-blueprint
