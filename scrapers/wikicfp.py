"""WikiCFP (http://www.wikicfp.com) search scraper.

WikiCFP has no machine-readable feed, so we query its search page once per tracked conference and
read the result table. It is the last-resort source: community feeds and the official site win.
Be polite - WikiCFP is a free volunteer service - so queries are throttled and cached.
"""
import re
import time
from typing import List, Optional
from urllib.parse import quote_plus

try:
    from bs4 import BeautifulSoup
    HAS_BS4 = True
except ImportError:
    HAS_BS4 = False

from .base import BaseScraper

SEARCH_URL = "http://www.wikicfp.com/cfp/servlet/tool.search?q={query}&year=f"
EVENT_BASE = "http://www.wikicfp.com"


class WikiCfpScraper(BaseScraper):
    SOURCE = "wikicfp"
    MIN_INTERVAL_SECONDS = 1.5

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._cache = {}
        self._last_request = 0.0

    def _throttle(self):
        wait = self.MIN_INTERVAL_SECONDS - (time.monotonic() - self._last_request)
        if wait > 0:
            time.sleep(wait)
        self._last_request = time.monotonic()

    @classmethod
    def parse_deadline_cell(cls, text: str, default_year: Optional[int] = None):
        """'Jun 30, 2026 (Jun 23, 2026)' -> ('2026-06-30', '2026-06-23'); parentheses hold the abstract date."""
        text = (text or "").strip()
        m = re.match(r"^(.*?)\s*(?:\((.*?)\))?\s*$", text)
        main = cls.parse_date_string(m.group(1), default_year=default_year) if m else None
        abstract = cls.parse_date_string(m.group(2), default_year=default_year) if m and m.group(2) else None
        return main, abstract

    def parse_results(self, html: str) -> List[dict]:
        """Parse the search-results table into [{title, name, when, where, paper_submission_date, ...}]."""
        if not html or not HAS_BS4:
            return []
        soup = BeautifulSoup(html, "html.parser")
        events = []
        for link in soup.select('a[href*="eventid="]'):
            row = link.find_parent("tr")
            if row is None:
                continue
            title = link.get_text(strip=True)
            href = link.get("href", "")
            # The description sits in the first cell, the metadata cells in the *next* row.
            meta_row = row.find_next_sibling("tr")
            cells = [c.get_text(" ", strip=True) for c in (meta_row.find_all("td") if meta_row else [])]
            desc_cells = [c.get_text(" ", strip=True) for c in row.find_all("td")]
            if len(cells) < 3:
                continue
            when, where, deadline = cells[0], cells[1], cells[2]
            year_match = re.search(r"\b(20\d{2})\b", title)
            event_year = int(year_match.group(1)) if year_match else None
            main, abstract = self.parse_deadline_cell(deadline, default_year=event_year)
            events.append({
                "title": title,
                "name": desc_cells[-1] if len(desc_cells) > 1 else "",
                "when": when,
                "where": where,
                "year": event_year,
                "paper_submission_date": main,
                "abstract_deadline": abstract,
                "website_url": EVENT_BASE + href if href.startswith("/") else href,
            })
        return events

    def search(self, query: str) -> List[dict]:
        if query in self._cache:
            return self._cache[query]
        self._throttle()
        html = self.fetch_url(SEARCH_URL.format(query=quote_plus(query)))
        events = self.parse_results(html) if html else []
        self._cache[query] = events
        return events

    def get_deadlines_for_conference(self, conf_name: str, year: Optional[int] = None) -> List[dict]:
        """Events whose acronym equals ``conf_name`` (e.g. 'ICSE 2027') in the requested year."""
        results = []
        norm = re.sub(r"[^A-Z0-9]", "", conf_name.upper())
        for ev in self.search(conf_name):
            acronym = re.sub(r"\b20\d{2}\b", "", ev["title"])
            if re.sub(r"[^A-Z0-9]", "", acronym.upper()) != norm:
                continue
            if year and ev["year"] and ev["year"] != int(year):
                continue
            if not ev["paper_submission_date"]:
                continue
            results.append({
                "source": self.SOURCE,
                "feed_name": ev["title"],
                "conference_name": conf_name,
                "subtrack": "",
                "description": ev["name"],
                "year": ev["year"],
                "paper_submission_date": ev["paper_submission_date"],
                "abstract_deadline": ev["abstract_deadline"],
                "website_url": ev["website_url"],
                "place": ev["where"],
                "start": None,
                "end": None,
            })
        return results
