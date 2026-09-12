# ONE-TIME STRIPE FIX (makes delivery zero-human)

Payment links currently redirect to Google Drive after pay.
Change each link so buyers land on the live vault automatically.

## Steps (phone or computer)
1. Open https://dashboard.stripe.com/payment-links
2. Open each active Payment Link
3. Find **After payment** / Confirmation → **Redirect to a page**
4. Set URL to:

```
https://aaronreddix1987-sketch.github.io/thank-you.html?product=PRODUCT_SLUG
```

## Product slugs
| Product | Slug |
|---|---|
| Buy Back Your Time AI | buy-back-your-time-ai |
| Digital Undercover Billionaire | digital-undercover-billionaire |
| Cold Call Code | cold-call-code |
| Money Mindset | money-mindset |
| 10X Recovery | 10x-recovery-bundle |
| $10M Blueprint | 10m-blueprint |
| 609 Credit | credit-repair-609 |

Example for flagship:
https://aaronreddix1987-sketch.github.io/thank-you.html?product=buy-back-your-time-ai

Save. Test with a $1 or free test if available.

Grok API key is **read-only** and cannot change this for you.
