"""SIGCHI upcoming-conference listing (https://sigchi.org/conferences/upcoming/).

The page lists event *dates and venues*, not paper deadlines, so it is used to cross-check the
location / year / dates we hold for SIGCHI-sponsored venues (CHI PLAY, VRST, ...), not to set deadlines.
"""
import re
from typing import List

try:
    from bs4 import BeautifulSoup
    HAS_BS4 = True
except ImportError:
    HAS_BS4 = False

from .base import BaseScraper
from .relevance import match_conference

BASE = "https://sigchi.org"
PAGES = ("/conferences/upcoming/", "/conferences/upcoming/incoop/")


class SigchiScraper(BaseScraper):
    SOURCE = "sigchi"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._events = None

    @classmethod
    def parse_events(cls, html: str) -> List[dict]:
        if not html or not HAS_BS4:
            return []
        soup = BeautifulSoup(html, "html.parser")
        events = []
        for a in soup.select('a[href^="/events/"]'):
            parts = [p for p in a.get_text("\n", strip=True).split("\n") if p and p not in ("·", "-")]
            if len(parts) < 3:
                continue
            title, place = parts[0], parts[1]
            dates = [cls.parse_date_string(p) for p in parts[2:4]]
            ym = re.search(r"\b(20\d{2})\b", title)
            events.append({
                "source": cls.SOURCE,
                "title": title,
                "name": re.sub(r"\s*20\d{2}\s*$", "", title).strip(),
                "year": int(ym.group(1)) if ym else None,
                "place": place,
                "start": dates[0],
                "end": dates[1] if len(dates) > 1 else None,
                "url": BASE + a["href"],
            })
        return events

    def get_events(self) -> List[dict]:
        if self._events is not None:
            return self._events
        events = []
        for page in PAGES:
            html = self.fetch_url(BASE + page)
            events.extend(self.parse_events(html or ""))
        self._events = events
        print(f"✓ Downloaded SIGCHI listing with {len(events)} events.")
        return events

    def validate_conferences(self, conferences: dict) -> List[str]:
        """Compare tracked conferences against SIGCHI's listing and describe any disagreement."""
        issues = []
        tracked = list(conferences)
        for ev in self.get_events():
            name, _ = match_conference(ev["name"], tracked)
            if not name:
                continue
            cfg = conferences[name]
            cfg_year = int(cfg.get("year", 0) or 0)
            cfg_loc = (cfg.get("location") or "")
            # SIGCHI may lead with a venue ("Tohoku University, Sendai, Japan"): any matching place part is enough
            place_parts = [x.strip().lower() for x in ev["place"].split(",") if x.strip()]
            loc_parts = [x.strip().lower() for x in cfg_loc.split(",") if x.strip()]
            same_place = any(pp in cfg_loc.lower() for pp in place_parts) or any(lp in ev["place"].lower() for lp in loc_parts)
            if ev["year"] != cfg_year:
                issues.append(
                    f"{name}: SIGCHI lists {ev['year']} ({ev['place']}, {ev['start']}..{ev['end']}) "
                    f"but config is year {cfg_year} ({cfg_loc}) - check whether the {ev['year']} edition is still the target."
                )
            elif not same_place:
                issues.append(
                    f"{name} {cfg_year}: SIGCHI says {ev['place']} but config location is '{cfg_loc}'."
                )
        return issues
