"""Release a reviewed item at most once. Keep the full editorial history."""

import argparse
from datetime import datetime, timezone
from email.utils import format_datetime
from html import escape
import json
from pathlib import Path
from urllib.parse import urlencode, urlsplit, urlunsplit


ROOT = Path(__file__).resolve().parent.parent
SITE = "https://aaronreddix1987-sketch.github.io"


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def post_url(page, item):
    parsed = urlsplit(page)
    if parsed.scheme or parsed.netloc or parsed.query or parsed.path.startswith("/"):
        raise ValueError(f"Expected a local page without query: {page}")
    query = urlencode(
        {"utm_source": "social", "utm_medium": "autopost", "utm_campaign": item["id"], "n": item["n"]}
    )
    return urlunsplit(("https", urlsplit(SITE).netloc, f"/{parsed.path}", query, parsed.fragment))


def render(root, queue, released, hidden, stamp):
    items = []
    visible = [r for r in released if r["id"] in queue and r["id"] not in hidden]
    for r in reversed(visible[-10:]):
        p = queue[r["id"]]
        link = escape(post_url(p["page"], r))
        image_name = f'{p["id"]}.jpg'
        img = escape(f"{SITE}/social/img/{image_name}")
        image_path = root / "social" / "img" / image_name
        media = ""
        if image_path.is_file():
            size = image_path.stat().st_size
            media = f'''
   <enclosure url="{img}" length="{size}" type="image/jpeg"/>
   <media:content url="{img}" medium="image" type="image/jpeg" width="1080" height="1350"/>'''
        items.append(f'''  <item>
   <title>{escape(p["hook"])}</title>
   <link>{link}</link>
   <guid isPermaLink="false">tti-social-{r["n"]}-{escape(p["id"])}</guid>
   <pubDate>{escape(r["at"])}</pubDate>
   <description>{escape(p["body"])}</description>{media}
  </item>''')
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">
 <channel>
  <title>Total Transformation Inc. - Business Resources</title>
  <link>{SITE}/ebooks.html#tools</link>
  <atom:link href="{SITE}/feed.xml" rel="self" type="application/rss+xml"/>
  <description>Practical tools for local service owners to track missed calls and follow-up.</description>
  <language>en-us</language>
  <lastBuildDate>{stamp}</lastBuildDate>
{chr(10).join(items)}
 </channel>
</rss>
'''


def run(root=ROOT, rebuild_only=False, now=None):
    source = root / "social"
    queue_entries = read_json(source / "queue.json")
    queue = {p["id"]: p for p in queue_entries}
    if len(queue) != len(queue_entries):
        raise ValueError("Duplicate queue IDs")
    policy = read_json(source / "review.json")
    approved = policy["approved_ids"]
    hidden = set(policy["hidden_ids"])
    if len(approved) != len(set(approved)) or (set(approved) | hidden) - queue.keys():
        raise ValueError("Invalid review IDs")
    if set(approved) & hidden:
        raise ValueError("An item cannot be both approved and hidden")

    path = source / "state.json"
    state = read_json(path)
    released = state["released"]
    stamp = format_datetime(now or datetime.now(timezone.utc))
    next_post = None
    if not rebuild_only:
        seen = {r["id"] for r in released}
        next_post = next((post_id for post_id in approved if post_id not in seen), None)
        if next_post is None:
            return "held: no reviewed unreleased item"
        released.append(
            {"n": max((r["n"] for r in released), default=0) + 1, "id": next_post, "cycle": 1, "at": stamp}
        )

    feed = render(root, queue, released, hidden, stamp)
    (root / "feed.xml").write_text(feed, encoding="utf-8")
    if next_post is None:
        return "rebuilt: no new release"
    path.write_text(json.dumps(state, indent=1) + "\n", encoding="utf-8")
    return f"released #{released[-1]['n']}: {next_post}"


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--rebuild-only", action="store_true", help="Refresh the feed without releasing an item.")
    print(run(rebuild_only=parser.parse_args().rebuild_only))
