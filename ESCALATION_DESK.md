# P0 escalation desk — 1 Oct 2026

Live site: https://aaronreddix1987-sketch.github.io/escalation.html

## What is live
- Library Stripe checkouts load on buy.stripe.com under Total Transformation Inc.
- Verified: $47 10M Blueprint and $19 Buy Back Your Time.
- Homepage and offer page now send buyers to those live links, not a dead button.
- Human escalation is one tap: text 747-301-8586, call, or email aaronreddix1987@gmail.com.

## What is blocked
Connected Stripe account `acct_1TMAPOExiZYmegFs` is read-only. PostPrices returned: API key does not have the required permissions.
That account has products and prices, zero payment links, and zero charges.
Issue #1 still open. High-ticket $497+$297 and $4,997+$997 Payment Links cannot be created until write access is granted.

## Owner action (only blocker left)
1. Open the Stripe reconnect / write-access card and grant Payment Links + Prices write.
2. After that, create the two package Payment Links and point after-payment to https://aaronreddix1987-sketch.github.io/thank-you.html
3. Do not send card numbers by text.

## Close script
Library: send https://buy.stripe.com/6oUaEW71Sfy2cXF22c43S0p
Front Office: text back, then Stripe invoice. Do not substitute the $47 book.
