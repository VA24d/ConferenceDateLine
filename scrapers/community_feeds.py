"""Scrapers for community-maintained conference deadline feeds.

* se-deadlines  (https://se-deadlines.github.io)   - software engineering venues
* hci-deadlines (https://hci-deadlines.github.io)  - HCI, VR/AR and games venues

Both publish a YAML list on GitHub. Each entry becomes a normalised candidate dict::

    {source, feed_name, conference, subtrack, year, paper_submission_date, abstract_deadline,
     website_url, place, start, end, description}

Dates are converted to Anywhere-on-Earth calendar dates, the convention used across this project.
"""
import datetime
import re
from typing import List, Optional

try:
    import yaml
    HAS_YAML = True
except ImportError:
    HAS_YAML = False

from .base import BaseScraper
from .relevance import match_conference


def _as_list(value) -> list:
    if value is None:
        return []
    return list(value) if isinstance(value, (list, tuple)) else [value]


class CommunityFeedScraper(BaseScraper):
    """Fetches deadlines from a community YAML repository (se-deadlines by default)."""

    SE_DEADLINES_URL = (
        "https://raw.githubusercontent.com/se-deadlines/se-deadlines.github.io/main/_data/conferences.yml"
    )
    SOURCE = "se-deadlines"

    def __init__(self, feed_url: str = SE_DEADLINES_URL, **kwargs):
        super().__init__(**kwargs)
        self.feed_url = feed_url
        self._cached_feed = None

    # ------------------------------------------------------------------ fetching
    def fetch_feed(self) -> List[dict]:
        """Download and parse the remote YAML feed (cached per scraper instance)."""
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
            if not isinstance(feed, list):
                raise ValueError("feed root is not a list")
            self._cached_feed = [e for e in feed if isinstance(e, dict)]
            print(f"✓ Downloaded {self.SOURCE} feed with {len(self._cached_feed)} entries.")
            return self._cached_feed
        except Exception as exc:
            print(f"[Error] Failed to parse {self.SOURCE} feed YAML: {exc}")
            return []

    # ------------------------------------------------------------------ parsing
    @staticmethod
    def _today_aoe() -> str:
        now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-12)))
        return now.strftime("%Y-%m-%d")

    def _pick_deadline(self, dates: List[str]) -> Optional[str]:
        """Entries with several cycles list several deadlines: take the next upcoming one, else the last."""
        dates = sorted(d for d in dates if d)
        if not dates:
            return None
        today = self._today_aoe()
        upcoming = [d for d in dates if d >= today]
        return upcoming[0] if upcoming else dates[-1]

    def _abstract_from_note(self, note: str, deadline: Optional[str]) -> Optional[str]:
        """Pull 'Mandatory abstract deadline on June 23 2026' style dates out of the free-text note."""
        if not note or "abstract" not in note.lower():
            return None
        default_year = int(deadline[:4]) if deadline else None
        idx = note.lower().index("abstract")
        parsed = self.parse_date_string(note[idx:], default_year=default_year)
        if parsed and deadline and parsed > deadline:
            return None
        return parsed

    def _entry_dates(self, item: dict):
        """Return (submission, abstract) AoE dates for one feed entry."""
        tz = item.get("timezone")
        dates = [self.normalize_deadline(d, tz) for d in _as_list(item.get("deadline"))]
        submission = self._pick_deadline(dates)
        abstract = self.normalize_deadline(item.get("abstract_deadline"), tz) if item.get("abstract_deadline") else None
        if not abstract:
            abstract = self._abstract_from_note(item.get("note") or "", submission)
        return submission, abstract

    def _candidate(self, item: dict, conf_name: str, subtrack: str, year) -> dict:
        submission, abstract = self._entry_dates(item)
        return {
            "source": self.SOURCE,
            "feed_name": (item.get("name") or item.get("title") or "").strip(),
            "conference_name": conf_name,
            "subtrack": subtrack,
            "description": item.get("description") or item.get("full_name") or "",
            "year": year,
            "paper_submission_date": submission,
            "abstract_deadline": abstract,
            "website_url": item.get("link"),
            "place": item.get("place"),
            "start": str(item.get("start") or "") or None,
            "end": str(item.get("end") or "") or None,
        }

    def get_deadlines_for_conference(self, conf_name: str, year: Optional[int] = None) -> List[dict]:
        """Candidates for one tracked conference (and its sub-tracks) in the given year."""
        results = []
        for item in self.fetch_feed():
            name = (item.get("name") or item.get("title") or "").strip()
            item_year = item.get("year")
            if year and item_year and int(item_year) != int(year):
                continue
            matched, suffix = match_conference(name, [conf_name])
            if matched != conf_name:
                continue
            results.append(self._candidate(item, conf_name, suffix, item_year))
        return results

    def get_entry_by_name(self, name: str, year: Optional[int] = None) -> Optional[dict]:
        """Look up a single named entry (e.g. a co-located workshop such as 'LLM4Code') for a year."""
        from .relevance import normalize
        want = normalize(name)
        best = None
        for item in self.fetch_feed():
            if normalize(item.get("name") or item.get("title") or "") != want:
                continue
            if year and item.get("year") and int(item["year"]) != int(year):
                continue
            best = self._candidate(item, name, "", item.get("year"))
        return best

    def iter_upcoming(self, tracked, horizon_days: int = 400):
        """Yield (item, candidate) for feed entries NOT tracked by us whose deadline is still ahead."""
        today = self._today_aoe()
        limit = (datetime.date.fromisoformat(today) + datetime.timedelta(days=horizon_days)).isoformat()
        for item in self.fetch_feed():
            name = (item.get("name") or item.get("title") or "").strip()
            matched, _ = match_conference(name, tracked)
            if matched:
                continue
            candidate = self._candidate(item, name, "", item.get("year"))
            due = candidate["paper_submission_date"]
            if due and today <= due <= limit:
                yield item, candidate


class HciDeadlinesScraper(CommunityFeedScraper):
    """hci-deadlines.github.io feed: same shape, scalar ``deadline`` plus ``timezone`` and ``abstract_deadline``."""

    HCI_DEADLINES_URL = (
        "https://raw.githubusercontent.com/hci-deadlines/hci-deadlines.github.io/master/_data/conferences.yml"
    )
    SOURCE = "hci-deadlines"

    def __init__(self, feed_url: str = HCI_DEADLINES_URL, **kwargs):
        super().__init__(feed_url=feed_url, **kwargs)
