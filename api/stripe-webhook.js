// api/stripe-webhook.js
// Deploy to Vercel/Netlify/Cloudflare. Set env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, DELIVERY_WEBHOOK
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
    case 'payment_intent.succeeded': {
      const obj = event.data.object;
      const email = obj.customer_details?.email || obj.receipt_email || '';
      const product = obj.metadata?.product || 'digital-product';
      const amount = obj.amount_received || obj.amount || 0;
      // Fire-and-forget delivery + logging. Replace DELIVERY_WEBHOOK with your Make/Zapier/Grok endpoint.
      try {
        await fetch(process.env.DELIVERY_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, product, amount, id: obj.id, type: event.type })
        });
      } catch (e) {
        console.error('Delivery webhook failed', e);
      }
      break;
    }
    case 'invoice.payment_failed':
      // TODO: alert Aaron + start dunning retry
      break;
  }
  res.json({ received: true });
}
