# TTI Ebook Rewrite — Rules for every writer (read fully before starting)

Client: Total Transformation Inc. (TTI), CEO Aaron T. Reddix. Goal: replace thin PDFs with professional,
college-textbook-quality practitioner books, worth their price. GitHub Pages repo (LIVE):
aaronreddix1987-sketch/aaronreddix1987-sketch.github.io. Stripe payment links redirect buyers to dl/<folder>/,
so the PDF FILENAME AND FOLDER MUST NEVER CHANGE. Do not touch Stripe, prices, or links.

## Setup (own clone per worker)
    pip install weasyprint markdown -q
    gh repo clone aaronreddix1987-sketch/aaronreddix1987-sketch.github.io /home/user/workspace/ebook-<yourbatch>
    cd /home/user/workspace/ebook-<yourbatch>
Your titles: _build/assignments.md (your batch section, work top to bottom). Build tool: _build/build.py
(read its docstring for the Markdown format and box types). Example source: _build/src/013252a88ce5.md (lead's book; once committed).

## Per title workflow
1. Read the old PDF for scope/topics: `pdftotext dl/<folder>/<file>.pdf - | less`. Keep the title (same as old PDF title).
   Do NOT carry over unverifiable claims or invented results.
2. Research with search_web / fetch_url: 3–6 real, publicly documented case studies relevant to the topic
   (e.g. Dan Martell — Buy Back Your Time, Camcorder Method, 1-3-1 Rule, Buyback Loop, SaaS Academy;
   Alex Hormozi — $100M Offers value equation, Grand Slam Offer; Basecamp/37signals; Stripe; Shopify;
   Mailchimp; Spanx; Gymshark; local-service firms; SBA/IRS/FTC/CFPB official guidance where relevant).
   Only state facts you verified in a source; cite each with full URL in the References chapter. Write
   "their results are their own, not TTI's" framing. Never invent TTI customers, testimonials, or results.
3. Write source to _build/src/<folder>.md. Structure:
   - Front matter: title (exact existing title), subtitle (descriptive, academic tone), edition: First Edition, 2026
   - "# How to Use This Book" (audience, outcomes, how chapters are built, disclaimer sentence)
   - 8–12 chapters "# Chapter N: Title". EACH chapter has: :::objectives (3–5 bullets); plain-language
     explanation with definitions; a step-by-step framework; at least one :::example worked example with
     real numbers (clearly hypothetical, labelled "illustrative"); a :::case where relevant (real, cited);
     a table; a :::checklist or :::worksheet; :::summary; :::review (4–6 questions).
   - Appendices: templates/worksheets/scripts that are genuinely usable (full-page worksheets OK; they must
     be real tools, not blank padding — at most ~15% of body pages may be write-in space).
   - "# Glossary" and "# References" (numbered, author/org, title, year, full URL).
   - Final short "# About Total Transformation Inc." (2–3 sentences, no result claims; may mention the
     AI Front Desk pilot at /front-office.html).
4. Tone: respected college professor + practitioner. Clear, precise, concrete, no hype, no filler, NO
   repeated paragraphs, no "In today's fast-paced world". US English. No income guarantees. Use ranges and
   "typically" with sources for statistics; if unsure, omit the number.
5. Length: targets are BODY pages (total minus cover, copyright, contents pages). Paid ($27–$47): 60–90 body pages
   (~13–20k words of prose plus tables/worksheets in this 6x9 layout ≈ 230–280 words/page). Free: 12–20.
   Reach length with substance (more chapters, worked examples, templates), never padding.
6. Build:  `python3 _build/build.py _build/src/<folder>.md dl/<folder>/<exact-same-filename>.pdf`
   Check: `pdfinfo` pages; render samples `pdftoppm -r 60 -png -f 1 -l 12 file.pdf /tmp/p` plus a few middle and
   last pages and LOOK at them (read the PNGs): no clipped/overflowing text, tables fit, TOC page numbers right,
   no empty orphan pages. Fix and rebuild.
7. Update download page count: `python3 _build/sync_counts.py --dl-only <folder>` (edits only dl/<folder>/index.html).
   Do NOT edit ebooks.html / listing pages — the lead syncs those at the end.
8. Commit only your files (dl/<folder>/*, _build/src/<folder>.md):
       git add dl/<folder> _build/src/<folder>.md
       git commit -m "Rewrite <Title> ebook: <old> -> <new> pages" -m "Co-authored-by: Perplexity <noreply@perplexity.ai>"
       git pull --rebase && git push
   Commit after each title (or every 2) so work goes live progressively.
9. Report to your parent: per title "title | old pages -> new pages | price | commit URL", skipped titles + why.
