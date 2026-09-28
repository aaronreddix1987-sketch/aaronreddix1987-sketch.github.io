# Stripe write-access request (owner action)

The connected Stripe key is read-only on Payment Links and Prices.
To unblock income:

1. Open the Stripe Dashboard → Developers → API keys, or use the reconnect link from the Gmail email titled "Request: write access for payment link redirects and webhook setup".
2. Grant write access to Payment Links and Prices (or rotate to a restricted key with payment_links:write and prices:write).
3. Then the agent can:
   - update all 15 Payment Link after_completion redirects to https://aaronreddix1987-sketch.github.io/thank-you.html?product=SLUG
   - create the $497 one-time + $297/month recurring Prices on prod_VCV4rNIQ3HGxOA
   - create the AI Front Desk Payment Link
   - register the webhook endpoint for checkout.session.completed + payment_intent.succeeded

Until then: manual dashboard edits work too. See STRIPE-REDIRECT-FIX.md.
