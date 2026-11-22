#!/usr/bin/env python3
"""Adds one trade page to the website, built from plumbers.html.
Usage: python3 tools/new_trade.py SLUG "Name" "kind of" "Headline." "Card title|Card text" "Card title|Card text" "Card title|Card text"
Example: python3 tools/new_trade.py towing "Towing companies" "towing" "You're on a tow." "On the road|You are driving a truck and cannot pick up." ...
Only plain letters, digits, spaces and basic punctuation are allowed."""
import html, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://aaronreddix1987-sketch.github.io/"


def safe(s, n):
    s = re.sub(r"\s+", " ", s).strip()
    if not s or len(s) > n or not re.fullmatch(r"[A-Za-z0-9 .,'’\-&]+", s):
        sys.exit(f"Bad text: {s[:40]!r}")
    return html.escape(s, quote=True)


def main():
    if len(sys.argv) != 8:
        sys.exit(__doc__)
    slug, name, kind, h1 = sys.argv[1:5]
    if not re.fullmatch(r"[a-z][a-z0-9-]{2,30}", slug) or os.path.exists(f"{ROOT}/{slug}.html"):
        sys.exit("Bad or existing page name")
    name, kind, h1 = safe(name, 40), safe(kind, 40), safe(h1, 40)
    cards = [tuple(safe(x, 140) for x in c.split("|", 1)) for c in sys.argv[5:8]]
    if any(len(c) != 2 for c in cards):
        sys.exit("Each card needs 'Title|Text'")
    t = open(f"{ROOT}/plumbers.html").read()
    low = name[0].lower() + name[1:]
    swaps = [
        ("AI Front Desk for Plumbers", f"AI Front Desk for {name}"),
        ("An AI front desk for plumbers.", f"An AI front desk for {low}."),
        ("AI Front Office · Plumbers", f"AI Front Office · {name}"),
        ("You're under a sink.", h1),
        ("Where a plumbing business loses calls", f"Where a {kind} business loses calls"),
        (BASE + "plumbers.html", BASE + slug + ".html"),
    ]
    for a, b in swaps:
        if a not in t:
            sys.exit(f"Template changed, missing: {a}")
        t = t.replace(a, b)
    old = re.findall(r'      <article class="card"><h3>.*?</h3><p class="grow">.*?</p></article>\n', t)[:3]
    if len(old) != 3:
        sys.exit("Template changed, cards not found")
    for o, (a, b) in zip(old, cards):
        t = t.replace(o, f'      <article class="card"><h3>{a}</h3><p class="grow">{b}</p></article>\n', 1)
    open(f"{ROOT}/{slug}.html", "w").write(t)
    m = open(f"{ROOT}/sitemap.xml").read()
    m = m.replace("</urlset>", f"  <url><loc>{BASE}{slug}.html</loc><priority>0.8</priority></url>\n</urlset>")
    open(f"{ROOT}/sitemap.xml", "w").write(m)
    i = open(f"{ROOT}/index.html").read()
    mark = '<a class="card pick" href="/plumbers.html">'
    if mark not in i:
        sys.exit("Home page changed, trade list not found")
    card = f'<a class="card pick" href="/{slug}.html"><h3>{name}</h3><p>{h1} The phone still gets answered.</p><span class="more">See how it works →</span></a>\n      '
    open(f"{ROOT}/index.html", "w").write(i.replace(mark, card + mark, 1))
    print(f"Added {slug}.html")


if __name__ == "__main__":
    main()
