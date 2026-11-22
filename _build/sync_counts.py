#!/usr/bin/env python3
"""Sync 'PDF, N pages' on dl/<hash>/index.html and listing cards to the real PDF page counts.
Run from repo root: python3 _build/sync_counts.py [hash ...]"""
import json, re, subprocess, sys, glob, os
links = json.load(open("_build/links.json"))["acct_1TMAPOExiZYmegFs"]
urls = {}
for l in links:
    r = ((l.get("after") or {}).get("redirect") or {}).get("url", "")
    if "/dl/" in r: urls.setdefault(r.split("/dl/")[1].strip("/"), []).append(l["url"])
dl_only = "--dl-only" in sys.argv
only = set(a for a in sys.argv[1:] if not a.startswith("--"))
listing = [f for f in ["ebooks.html","platform.html","store.html","shop.html","catalog.html","products.html"] + glob.glob("vault/*.html") if os.path.exists(f)]
texts = {} if dl_only else {f: open(f).read() for f in listing}
for d in sorted(glob.glob("dl/*/")):
    h = d.split("/")[1]
    if only and h not in only: continue
    pdf = glob.glob(d + "*.pdf")[0]
    n = int(re.search(r"Pages:\s+(\d+)", subprocess.run(["pdfinfo", pdf], capture_output=True, text=True).stdout).group(1))
    ip = d + "index.html"; s = open(ip).read()
    s2 = re.sub(r"PDF, \d+ pages", f"PDF, {n} pages", s)
    if s2 != s: open(ip, "w").write(s2)
    for f, t in texts.items():
        for u in urls.get(h, []):
            for m in list(re.finditer(re.escape(u), t)):
                # card = nearest enclosing <article ...> ... </article>
                a = t.rfind("<article", 0, m.start()); b = t.find("</article>", m.start())
                if a < 0 or b < 0: continue
                card = t[a:b]
                nc = re.sub(r"PDF, \d+ pages", f"PDF, {n} pages", card)
                if nc != card: t = t[:a] + nc + t[b:]
        texts[f] = t
    print(h, n, pdf)
for f, t in texts.items(): open(f, "w").write(t)
