"""Releases the next post from queue.json into /feed.xml. Standard library only.
Run by .github/workflows/social-post.yml. An auto-posting app reads feed.xml and posts each new item."""
import json, os, datetime, html
from email.utils import format_datetime
H=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(H)
SITE="https://aaronreddix1987-sketch.github.io"
queue=json.load(open(os.path.join(H,"queue.json"),encoding="utf-8"))
sp=os.path.join(H,"state.json")
state=json.load(open(sp)) if os.path.exists(sp) else {"released":[]}
n=len(state["released"]); post=queue[n%len(queue)]; cycle=n//len(queue)+1
now=datetime.datetime.now(datetime.timezone.utc)
state["released"].append({"n":n+1,"id":post["id"],"cycle":cycle,"at":format_datetime(now)})
json.dump(state,open(sp,"w"),indent=1)
byid={p["id"]:p for p in queue}; items=[]
for r in reversed(state["released"][-10:]):
    p=byid.get(r["id"])
    if not p: continue
    link=f'{SITE}/{p["page"]}?utm_source=social&utm_medium=autopost&utm_campaign={p["id"]}&n={r["n"]}'
    img=f'{SITE}/social/img/{p["id"]}.jpg'
    size=os.path.getsize(os.path.join(H,"img",p["id"]+".jpg"))
    e=html.escape
    items.append(f'''  <item>
   <title>{e(p["hook"])}</title>
   <link>{e(link)}</link>
   <guid isPermaLink="false">tti-social-{r["n"]}-{p["id"]}</guid>
   <pubDate>{r["at"]}</pubDate>
   <description>{e(p["body"])}</description>
   <enclosure url="{img}" length="{size}" type="image/jpeg"/>
   <media:content url="{img}" medium="image" type="image/jpeg" width="1080" height="1350"/>
  </item>''')
feed=f'''<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">
 <channel>
  <title>Total Transformation Inc. - AI Front Office</title>
  <link>{SITE}/front-office.html</link>
  <atom:link href="{SITE}/feed.xml" rel="self" type="application/rss+xml"/>
  <description>Short posts for local service business owners about missed calls and the 7-day pilot.</description>
  <language>en-us</language>
  <lastBuildDate>{format_datetime(now)}</lastBuildDate>
{chr(10).join(items)}
 </channel>
</rss>
'''
open(os.path.join(ROOT,"feed.xml"),"w",encoding="utf-8").write(feed)
print(f'released #{n+1}: {post["id"]} (cycle {cycle})')
