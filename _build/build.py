#!/usr/bin/env python3
"""TTI ebook builder: Markdown (+ simple custom blocks) -> professional 6x9in PDF via WeasyPrint.

Usage:  python3 _build/build.py path/to/book.md path/to/output.pdf
Deps:   pip install weasyprint markdown

Book file format
----------------
First lines = front matter until a line containing only '---':
    title: The AI Company Blueprint
    subtitle: Designing a Small Business Run by Single-Job AI Agents
    edition: First Edition, 2026
    ---
Then Markdown. Rules:
  # Heading 1      -> starts a new chapter on a new page, listed in TOC.
                      Use "# Chapter 3: Title" or "# Appendix A: Title" or "# References".
  ## Heading 2     -> section (listed in TOC, indented)
  ### Heading 3    -> subsection (not in TOC)
  Tables: standard pipe tables.
Custom blocks (open with ':::kind Optional Title', close with ':::' on its own line):
  :::objectives        Learning objectives box (put a bullet list inside)
  :::callout Title     Shaded callout / key idea
  :::case Title        Case study box (real, cited businesses only)
  :::example Title     Worked example
  :::warning Title     Caution / risk box
  :::summary           Chapter summary
  :::review            Review questions (numbered list inside)
  :::checklist Title   Checklist; list items render as tick boxes
  :::worksheet Title   Worksheet; a line 'Field label: ___' renders a labelled
                       write-in line; a line '___' alone renders a blank line;
                       a line '[[box N]]' renders an empty writing box N lines tall.
  [[pagebreak]]        forced page break
"""
import re, sys, html, datetime
import markdown
from weasyprint import HTML

KINDS = {"objectives": "Learning Objectives", "callout": "Key Idea", "case": "Case Study",
         "example": "Worked Example", "warning": "Caution", "summary": "Chapter Summary",
         "review": "Review Questions", "checklist": "Checklist", "worksheet": "Worksheet"}

def slug(s, used):
    b = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:60] or "s"
    s2, i = b, 2
    while s2 in used: s2 = f"{b}-{i}"; i += 1
    used.add(s2); return s2

def md(text):
    return markdown.markdown(text, extensions=["tables", "sane_lists", "attr_list"])

def render_block(kind, title, body):
    label = KINDS.get(kind, kind.title())
    if kind == "worksheet":
        out = []
        buf = []
        def flush():
            if buf: out.append(md("\n".join(buf))); buf.clear()
        for ln in body.split("\n"):
            m = re.match(r"^\s*(.+?):\s*_{3,}\s*$", ln)
            mb = re.match(r"^\s*\[\[box\s+(\d+)\]\]\s*$", ln)
            if m:
                flush(); out.append(f'<div class="field"><span class="fl">{html.escape(m.group(1))}</span><span class="line"></span></div>')
            elif re.match(r"^\s*_{3,}\s*$", ln):
                flush(); out.append('<div class="field"><span class="line full"></span></div>')
            elif mb:
                flush(); out.append(f'<div class="wbox" style="height:{int(mb.group(1))*0.32}in"></div>')
            else:
                buf.append(ln)
        flush(); inner = "\n".join(out)
    else:
        inner = md(body)
        if kind == "checklist":
            inner = inner.replace("<ul>", '<ul class="ticks">')
    t = f'<div class="bt"><span class="bl">{label}</span>{(" · " + html.escape(title)) if title else ""}</div>'
    return f'<div class="box {kind}">{t}{inner}</div>'

def parse(src):
    fm, body = {}, src
    if "\n---\n" in src:
        head, body = src.split("\n---\n", 1)
        for ln in head.strip().split("\n"):
            if ":" in ln:
                k, v = ln.split(":", 1); fm[k.strip()] = v.strip()
    return fm, body

def convert(body):
    # extract custom blocks first
    blocks = []
    def rep(m):
        blocks.append(render_block(m.group(1), (m.group(2) or "").strip(), m.group(3)))
        return f"\n\nBLOCKPLACEHOLDER{len(blocks)-1}X\n\n"
    body = re.sub(r"^:::(\w+)[ \t]*(.*?)\n(.*?)\n:::[ \t]*$", rep, body, flags=re.S | re.M)
    body = body.replace("[[pagebreak]]", '\n\n<div class="pb"></div>\n\n')
    h = md(body)
    for i, b in enumerate(blocks):
        h = h.replace(f"<p>BLOCKPLACEHOLDER{i}X</p>", b).replace(f"BLOCKPLACEHOLDER{i}X", b)
    # chapters / TOC
    used, toc = set(), []
    def hrep(m):
        lvl, txt = int(m.group(1)), m.group(2)
        plain = re.sub(r"<[^>]+>", "", txt)
        sid = slug(plain, used)
        if lvl in (1, 2): toc.append((lvl, plain, sid))
        if lvl == 1:
            mm = re.match(r"^((?:Chapter|Part|Appendix)\s+[\w\d]+)\s*[:.\u2014-]\s*(.+)$", plain)
            if mm:
                return (f'<h1 id="{sid}" class="chap"><span class="cn">{html.escape(mm.group(1))}</span>'
                        f'<span class="ct">{html.escape(mm.group(2))}</span></h1>')
            return f'<h1 id="{sid}" class="chap"><span class="ct">{txt}</span></h1>'
        return f'<h{lvl} id="{sid}">{txt}</h{lvl}>'
    h = re.sub(r"<h([123])>(.*?)</h\1>", hrep, h)
    # wrap chapters in sections for page breaks
    parts = re.split(r'(?=<h1 id=)', h)
    h = "".join(f'<section class="chapter">{p}</section>' if p.startswith("<h1") else p for p in parts)
    return h, toc

CSS = r"""
@page { size: 6in 9in; margin: 0.8in 0.7in 0.8in 0.75in;
  @top-left { content: "__BOOKTITLE__"; font: 7.5pt 'Lato'; color:#6b7280; letter-spacing:.06em; text-transform:uppercase; }
  @top-right { content: string(chap); font: 7.5pt 'Lato'; color:#6b7280; }
  @bottom-center { content: counter(page); font: 8.5pt 'Lato'; color:#374151; }
  @bottom-left { content: "Total Transformation Inc."; font: 6.5pt 'Lato'; color:#9ca3af; }
}
@page cover { margin: 0; @top-left{content:none} @top-right{content:none} @bottom-center{content:none} @bottom-left{content:none} }
@page front { @top-left{content:none} @top-right{content:none} @bottom-center{content:none} @bottom-left{content:none} }
@page chapfirst { @top-right{content:none} @top-left{content:none} }
html { font-family: 'Liberation Serif','DejaVu Serif',serif; font-size: 10.6pt; line-height: 1.45; color:#1f2937; }
body { margin:0; }
.cover h1.t { string-set: booktitle content(); }
p { margin: 0 0 .6em; text-align: justify; hyphens: auto; orphans:3; widows:3; }
a { color:#1e3a8a; text-decoration:none; word-break: break-all; }
h1,h2,h3 { font-family:'Lato',sans-serif; color:#0f2a4a; page-break-after: avoid; break-after: avoid; }
section.chapter { break-before: page; }
section.chapter > h1:first-child { page: chapfirst; }
h1.chap .ct { string-set: chap content(); }
h1.chap { margin: .9in 0 .35in; border-bottom: 2px solid #b45309; padding-bottom:.12in; }
h1.chap .cn { display:block; font-size:9pt; letter-spacing:.18em; text-transform:uppercase; color:#b45309; font-weight:700; margin-bottom:.06in; }
h1.chap .ct { display:block; font-size:21pt; line-height:1.15; font-weight:700; }
h2 { font-size: 13pt; margin: 1.1em 0 .4em; }
h3 { font-size: 11pt; margin: .9em 0 .3em; color:#1f3b63; }
ul, ol { margin: 0 0 .6em 1.1em; padding:0; } li { margin-bottom:.22em; }
table { width:100%; border-collapse: collapse; margin: .5em 0 .9em; font-family:'Lato',sans-serif; font-size: 8.3pt; line-height:1.3; page-break-inside:auto; }
th { background:#0f2a4a; color:#fff; text-align:left; padding:4px 5px; font-weight:700; }
td { border-bottom: 1px solid #d1d5db; padding:4px 5px; vertical-align: top; }
tr { page-break-inside: avoid; }
tr:nth-child(even) td { background:#f6f7f9; }
blockquote { margin:.6em 0 .8em; padding:.1em .9em; border-left:3px solid #b45309; color:#374151; font-style:italic; }
.box { margin: .7em 0 .9em; padding: .55em .75em .35em; border-radius:4px; font-size: 9.6pt; page-break-inside: avoid; }
.box p { text-align:left; }
.bt { font-family:'Lato',sans-serif; font-size:8pt; font-weight:700; text-transform:uppercase; letter-spacing:.08em; margin-bottom:.35em; }
.bl { }
.objectives { background:#eef3fa; border-left: 4px solid #0f2a4a; } .objectives .bt{color:#0f2a4a}
.callout { background:#fff7ed; border-left:4px solid #b45309; } .callout .bt{color:#b45309}
.case { background:#f3f6f4; border:1px solid #9cb7a5; page-break-inside:auto; } .case .bt{color:#285a3b}
.example { background:#f8fafc; border:1px dashed #64748b; page-break-inside:auto; } .example .bt{color:#334155}
.warning { background:#fef2f2; border-left:4px solid #b91c1c; } .warning .bt{color:#b91c1c}
.summary { background:#f1f5f9; border-top:2px solid #0f2a4a; page-break-inside:auto; } .summary .bt{color:#0f2a4a}
.review { background:#fff; border:1px solid #cbd5e1; page-break-inside:auto; } .review .bt{color:#0f2a4a}
.checklist { background:#fff; border:1px solid #0f2a4a; page-break-inside:auto; } .checklist .bt{color:#0f2a4a}
ul.ticks { list-style:none; margin-left:0; } ul.ticks li { padding-left:1.4em; position:relative; }
ul.ticks li:before { content:""; position:absolute; left:0; top:.18em; width:.8em; height:.8em; border:1.2px solid #0f2a4a; border-radius:2px; }
.worksheet { background:#fff; border:2px solid #0f2a4a; page-break-inside:auto; } .worksheet .bt{color:#0f2a4a}
.field { display:flex; align-items:flex-end; margin: .5em 0 .1em; font-family:'Lato',sans-serif; font-size:8.6pt; }
.field .fl { white-space:nowrap; margin-right:.5em; color:#374151; max-width:60%; white-space:normal; }
.field .line { flex:1; border-bottom: 1px solid #6b7280; height:1.1em; min-width:1in; }
.wbox { border:1px solid #9ca3af; border-radius:3px; margin:.3em 0 .6em; background: repeating-linear-gradient(#fff, #fff .31in, #e5e7eb .31in, #e5e7eb .32in); }
.pb { break-after: page; }
code { font-family:'DejaVu Sans Mono',monospace; font-size:8.3pt; background:#f3f4f6; padding:0 2px; }
pre { font-family:'DejaVu Sans Mono',monospace; font-size:7.8pt; background:#f3f4f6; padding:.5em; white-space:pre-wrap; border-radius:3px; }
/* cover */
.cover { page: cover; width:6in; height:9in; background:#0f2a4a; color:#fff; position:relative; font-family:'Lato',sans-serif; }
.cover .band { position:absolute; top:0; left:0; width:.32in; height:9in; background:#b45309; }
.cover .inner { position:absolute; left:.75in; right:.55in; top:1.5in; }
.cover .kicker { font-size:8.5pt; letter-spacing:.22em; text-transform:uppercase; color:#fbbf77; margin-bottom:.25in; }
.cover h1.t { font-size:30pt; line-height:1.08; margin:0 0 .25in; color:#fff; font-weight:900; }
.cover .st { font-family:'Liberation Serif',serif; font-size:13pt; line-height:1.35; color:#dbe4f0; font-style:italic; }
.cover .rule { width:1.2in; height:3px; background:#fbbf77; margin:.35in 0; }
.cover .pub { position:absolute; left:.75in; bottom:.8in; font-size:10pt; letter-spacing:.12em; text-transform:uppercase; color:#fff; }
.cover .pub small { display:block; font-size:7.5pt; color:#9fb3cc; letter-spacing:.06em; margin-top:.06in; text-transform:none; }
/* front matter */
.front { page: front; break-before: page; }
.copyright { font-size:8.3pt; line-height:1.45; color:#374151; padding-top:3.2in; }
.copyright p { text-align:left; margin-bottom:.55em; }
.toc { page: front; break-before: page; }
.toc h2 { font-size:18pt; margin:.5in 0 .25in; border-bottom:2px solid #b45309; padding-bottom:.08in; }
.toc ul { list-style:none; margin:0; padding:0; font-family:'Lato',sans-serif; }
.toc li { margin:0; }
.toc li.l1 { font-size:9.4pt; font-weight:700; margin-top:.5em; color:#0f2a4a; }
.toc li.l2 { font-size:8.3pt; margin-left:1.1em; color:#374151; }
.toc a { color:inherit; word-break: normal; }
.toc a::after { content: leader('.') target-counter(attr(href), page); font-weight:400; }
.firstpage { counter-reset: page 1; }
"""

def build(src_path, out_path):
    fm, body = parse(open(src_path, encoding="utf-8").read())
    title = fm.get("title", "Untitled"); sub = fm.get("subtitle", "")
    edition = fm.get("edition", "First Edition, 2026")
    content, toc = convert(body)
    toc_html = "".join(f'<li class="l{l}"><a href="#{i}">{html.escape(t)}</a></li>' for l, t, i in toc)
    doc = f"""<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>{html.escape(title)}</title>
<meta name="author" content="Total Transformation Inc."><style>{CSS.replace("__BOOKTITLE__", title.replace(chr(34), chr(39)))}</style></head><body>
<div class="cover"><div class="band"></div><div class="inner"><div class="kicker">A Practitioner's Guide · {html.escape(edition)}</div>
<h1 class="t">{html.escape(title)}</h1><div class="rule"></div><div class="st">{html.escape(sub)}</div></div>
<div class="pub">Total Transformation Inc.<small>Los Angeles, California · aaronreddix1987-sketch.github.io</small></div></div>
<div class="front copyright"><p><strong>{html.escape(title)}</strong><br>{html.escape(sub)}</p>
<p>{html.escape(edition)}. Copyright © 2026 Total Transformation Inc. All rights reserved. No part of this publication may be reproduced or distributed without written permission, except brief quotations in reviews and the worksheets, which the purchaser may copy for use in their own business.</p>
<p><strong>Disclaimer.</strong> This book is educational material only. It is not legal, tax, financial, accounting, or medical advice; consult a licensed professional for your situation. No income, revenue, or business result is promised or implied. Case studies describe publicly reported facts about other people and companies; their results are their own and are not results of Total Transformation Inc. or its customers. Named companies and people are not affiliated with and do not endorse this book. Facts were checked against the cited public sources as of November 2026; details may change.</p>
<p>Published by Total Transformation Inc., Los Angeles, California. Contact: (747) 301-8586 · aaronreddix1987-sketch.github.io</p></div>
<div class="toc"><h2>Contents</h2><ul>{toc_html}</ul></div>
{content}
</body></html>"""
    HTML(string=doc, base_url=".").write_pdf(out_path, metadata={"title": title})
    open(out_path.rsplit(".", 1)[0] + ".debug.html", "w").write(doc) if "--html" in sys.argv else None

if __name__ == "__main__":
    build(sys.argv[1], sys.argv[2])
    print("built", sys.argv[2])
