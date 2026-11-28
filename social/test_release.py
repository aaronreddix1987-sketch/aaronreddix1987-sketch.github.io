import json
from datetime import datetime, timezone
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
import xml.etree.ElementTree as ET

from social.release import run


NOW = datetime(2026, 11, 28, 6, 0, tzinfo=timezone.utc)
PAST = "Sat, 21 Nov 2026 05:32:14 +0000"


class ReleaseTest(unittest.TestCase):
    def setUp(self):
        self.temp = TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.social = self.root / "social"
        self.social.mkdir()
        self.state = self.social / "state.json"
        self.feed = self.root / "feed.xml"
        self.write(
            "queue.json",
            [
                {"id": "old", "page": "front-office.html", "hook": "Old", "body": "Old campaign"},
                {"id": "first", "page": "ebooks.html#tools", "hook": "First", "body": "First reviewed draft"},
                {"id": "not-reviewed", "page": "ebooks.html", "hook": "Hold", "body": "Should never appear"},
            ],
        )
        self.write("state.json", {"released": [{"id": "old", "n": 4, "cycle": 1, "at": PAST}]})
        self.write("review.json", {"approved_ids": [], "hidden_ids": ["old"]})

    def write(self, filename, value):
        (self.social / filename).write_text(json.dumps(value), encoding="utf-8")

    def items(self):
        return ET.parse(self.feed).findall("./channel/item")

    def test_held_schedule_leaves_files_untouched(self):
        before = self.state.read_bytes()
        self.feed.write_text("prior feed", encoding="utf-8")
        self.assertIn("held", run(self.root, now=NOW))
        self.assertEqual(self.state.read_bytes(), before)
        self.assertEqual(self.feed.read_text(encoding="utf-8"), "prior feed")

    def test_rebuild_hides_old_items_without_releasing_or_erasing_history(self):
        before = self.state.read_bytes()
        self.write("review.json", {"approved_ids": ["first"], "hidden_ids": ["old"]})
        self.assertIn("no new release", run(self.root, rebuild_only=True, now=NOW))
        self.assertEqual(self.state.read_bytes(), before)
        self.assertEqual(self.items(), [])

    def test_reviewed_item_is_released_once_with_working_anchor_and_stable_guid(self):
        self.write("review.json", {"approved_ids": ["old", "first"], "hidden_ids": []})
        self.assertEqual(run(self.root, now=NOW), "released #5: first")
        first, old = self.items()
        self.assertEqual(first.findtext("guid"), "tti-social-5-first")
        self.assertTrue(first.findtext("link").endswith("&n=5#tools"))
        self.assertEqual(old.findtext("guid"), "tti-social-4-old")
        self.assertEqual(old.findtext("pubDate"), PAST)
        before = self.feed.read_bytes()
        self.assertIn("held", run(self.root, now=NOW))
        self.assertEqual(self.feed.read_bytes(), before)

    def test_invalid_approval_fails_without_a_new_feed(self):
        self.write("review.json", {"approved_ids": ["missing"], "hidden_ids": []})
        with self.assertRaisesRegex(ValueError, "Invalid review IDs"):
            run(self.root, now=NOW)
        self.assertFalse(self.feed.exists())


if __name__ == "__main__":
    unittest.main()
