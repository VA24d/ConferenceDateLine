"""Scraper for online community conference deadline feeds (e.g. se-deadlines)."""
import re
from typing import Dict, List, Optional

try:
    import yaml
    HAS_YAML = True
except ImportError:
    HAS_YAML = False

from .base import BaseScraper


class CommunityFeedScraper(BaseScraper):
    """Fetches deadlines from community YAML repositories."""

    SE_DEADLINES_URL = (
        "https://raw.githubusercontent.com/se-deadlines/se-deadlines.github.io/main/_data/conferences.yml"
    )

    def __init__(self, feed_url: str = SE_DEADLINES_URL, **kwargs):
        super().__init__(**kwargs)
        self.feed_url = feed_url
        self._cached_feed = None

    def fetch_feed(self) -> List[dict]:
        """Download and parse remote YAML feed."""
        if self._cached_feed is not None:
            return self._cached_feed

        if not HAS_YAML:
            print("[Warning] PyYAML not installed. Cannot parse community feed.")
            return []

        content = self.fetch_url(self.feed_url)
        if not content:
            return []

        try:
            feed = yaml.safe_load(content) or []
            self._cached_feed = feed
            print(f"✓ Downloaded community feed with {len(feed)} entries.")
            return feed
        except Exception as exc:
            print(f"[Error] Failed to parse community feed YAML: {exc}")
            return []

    def get_deadlines_for_conference(self, conf_name: str, year: Optional[int] = None) -> List[dict]:
        """Extract matching deadlines for a given conference name and year."""
        feed = self.fetch_feed()
        matched = []

        norm_name = conf_name.strip().upper()

        for item in feed:
            name = (item.get("name") or "").strip()
            item_year = item.get("year")
            if year and item_year and int(item_year) != int(year):
                continue

            # Check if name starts with conference name (e.g. "ICSE", "ICSE-SEIP", "FSE")
            name_upper = name.upper()
            if name_upper == norm_name or name_upper.startswith(norm_name + "-") or name_upper.startswith(norm_name + " "):
                deadlines_list = item.get("deadline", [])
                if isinstance(deadlines_list, str):
                    deadlines_list = [deadlines_list]

                main_deadline = deadlines_list[0] if deadlines_list else None
                parsed_deadline = self.parse_date_string(main_deadline, default_year=year or item_year)

                # Abstract deadline often in note
                note = item.get("note") or ""
                abstract_date = None
                if "abstract" in note.lower():
                    abstract_date = self.parse_date_string(note, default_year=year or item_year)

                matched.append({
                    "feed_name": name,
                    "conference_name": conf_name,
                    "description": item.get("description", ""),
                    "year": item_year,
                    "paper_submission_date": parsed_deadline,
                    "abstract_deadline": abstract_date,
                    "website_url": item.get("link"),
                    "place": item.get("place"),
                })

        return matched

