# TTI STATUS — Zero-human delivery

## Instant download (buyer side)
- thank-you.html auto-opens the product file
- access.html = re-download help (no ticket)
- vault/* = product files

## REQUIRED (you, once)
Stripe Dashboard → Payment Links → After payment redirect → thank-you.html?product=SLUG
Guide: /STRIPE-REDIRECT-FIX.md

Until that is set, card buyers may still hit old Drive links.

## Automations on
- Daily sales engine 9am PT
- Buyer watch 12pm PT
- Chime money-in trigger
- Chime email payment trigger

## Do NOT mass-resend
Bounces to blocked gov addresses and fake domains will not be resent.

## Share
https://aaronreddix1987-sketch.github.io/ebooks.html
