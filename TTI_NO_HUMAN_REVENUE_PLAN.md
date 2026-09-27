# TTI No-Human Revenue Plan — Deployed 2026-09-27

## Bottlenecks found (live audit)
1. Stripe connection is **read-only** — cannot create the $497 setup + $297/mo recurring price or update redirects.
2. 12 live Payment Links exist, but **zero succeeded charges** in the connected account.
3. Payment Links redirect straight to Drive download URLs — no webhook, no email delivery, no buyer confirmation. Fulfillment is fragile.
4. GitHub write access returns **403** from the connected integration — site updates must be done by Aaron or a token with write scope.
5. AI Front Desk offer page has **no public checkout link** — only SMS/email booking.
6. Voice/telephony (Vapi/Retell/Telnyx) not funded or connected — phone agent is prompt-only.
7. Bank balances are **$0** — no working capital for provider fees.

## What to do first (Aaron, ~15 min)
1. Open the Stripe reconnect link from the Gmail email titled "ACTION NEEDED: Reconnect Stripe with write access" and approve **write** scope.
2. In Stripe Dashboard → Developers → Webhooks, add endpoint:
   `https://aaronreddix1987-sketch.github.io/api/stripe-webhook`
   Events: `checkout.session.completed`, `payment_intent.succeeded`, `invoice.paid`, `invoice.payment_failed`.
3. Fund one voice provider (Retell or Telnyx pay-as-you-go) and connect the 747 number.
4. Push this repo with a write-capable token so the site can update.

## Agent-ready code

### A. Stripe webhook handler (Node/Express) — drop into a serverless function or small VPS
```js
// api/stripe-webhook.js  (Vercel / Netlify / Cloudflare Worker)
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook signature failed: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      const email = pi.customer_details?.email || pi.receipt_email;
      const product = pi.metadata?.product || 'digital-product';
      // 1) email the buyer their Drive download link
      // 2) log the sale to your CRM / Airtable / sheet
      // 3) trigger onboarding sequence for $497 setup clients
      await fetch(process.env.DELIVERY_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, product, amount: pi.amount_received, id: pi.id })
      });
      break;
    }
    case 'invoice.payment_failed':
      // alert Aaron + retry dunning
      break;
  }
  res.json({ received: true });
}
```

### B. Manus skill prompt — "TTI Revenue Watch"
```
You are TTI Revenue Watch. Every hour:
1. Read the Stripe account (acct_1TI5o4AZJj5080Vf) for new charges and failed payments.
2. If a new succeeded payment exists, email the buyer their product download link from the catalog and log it.
3. If a $497 setup payment lands, start the onboarding checklist and text Aaron.
4. Poll the Gmail inbox for replies to outreach; tag warm leads.
5. Never invent sales, clients, or approvals. Report only verified events.
6. If Stripe returns a permission error, stop and email Aaron the exact reconnect link.
```

### C. ChatGPT Agent mode instructions — "TTI End-to-End Executor"
```
Goal: close the loop from visitor → paid → delivered with zero human steps.
Tools you may use: Stripe (read + write once authorized), Gmail, Google Drive, GitHub (read; write only with token), the site at aaronreddix1987-sketch.github.io.
Rules:
- Never collect card data in chat.
- Never claim a sale unless Stripe shows status=succeeded.
- Never publish a checkout link that does not match a real Payment Link in the connected account.
- On any 403/permission error, pause and surface the exact fix to Aaron.
- Prefer the $47 ebook funnel first; the $497 setup funnel only after a live recurring price exists.
Loop: check Stripe → fulfill → log → report. Stop on external gates.
```

## Success criteria
- One test purchase completes and the buyer receives the file automatically.
- $497 + $297/mo price exists and is linked from offer.html.
- Webhook fires on every payment and logs it.
- Hourly poll reports "no new sales" only when Stripe truly shows none.
