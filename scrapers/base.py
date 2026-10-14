"""Base scraper class with robust HTTP fetching and date parsing."""
import datetime
import re
from zoneinfo import ZoneInfo
from typing import Dict, List, Optional

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

try:
    from bs4 import BeautifulSoup
    HAS_BS4 = True
except ImportError:
    HAS_BS4 = False

try:
    from playwright.sync_api import sync_playwright
    from playwright_stealth.stealth import Stealth
    HAS_PLAYWRIGHT = True
except ImportError:
    HAS_PLAYWRIGHT = False


class BaseScraper:
    """Base class for resilient web scraping with error handling and date normalization."""

    DEFAULT_TIMEOUT = 20
    DEFAULT_HEADERS = {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }

    MONTH_MAP = {
        "jan": 1, "january": 1,
        "feb": 2, "february": 2,
        "mar": 3, "march": 3,
        "apr": 4, "april": 4,
        "may": 5,
        "jun": 6, "june": 6,
        "jul": 7, "july": 7,
        "aug": 8, "august": 8,
        "sep": 9, "sept": 9, "september": 9,
        "oct": 10, "october": 10,
        "nov": 11, "november": 11,
        "dec": 12, "december": 12,
    }

    def __init__(self, timeout: int = DEFAULT_TIMEOUT, verify_ssl: bool = True):
        self.timeout = timeout
        self.verify_ssl = verify_ssl
        self.session = None
        if HAS_REQUESTS:
            self.session = requests.Session()
            self.session.headers.update(self.DEFAULT_HEADERS)

    # Hosts that failed repeatedly in this process; skipped so one dead site cannot stall a whole run.
    _HOST_FAILURES: Dict[str, int] = {}
    HOST_FAILURE_LIMIT = 2
    # Only these statuses suggest bot protection; timeouts / DNS errors will not be fixed by a browser.
    BROWSER_FALLBACK_STATUSES = (403, 429, 503)

    @classmethod
    def _host(cls, url: str) -> str:
        return re.sub(r"^https?://([^/]+).*$", r"\1", url)

    @classmethod
    def host_is_dead(cls, url: str) -> bool:
        return cls._HOST_FAILURES.get(cls._host(url), 0) >= cls.HOST_FAILURE_LIMIT

    @classmethod
    def _record_host_failure(cls, url: str) -> None:
        host = cls._host(url)
        cls._HOST_FAILURES[host] = cls._HOST_FAILURES.get(host, 0) + 1
        if cls._HOST_FAILURES[host] == cls.HOST_FAILURE_LIMIT:
            print(f"[Host skipped] {host} failed {cls.HOST_FAILURE_LIMIT} times; skipping it for the rest of this run.")

    def fetch_url(self, url: str, use_browser: bool = False) -> Optional[str]:
        """Fetch URL content with timeout; use Playwright Stealth only when the site blocks plain requests."""
        if not url or url == "#" or not url.startswith(("http://", "https://")):
            return None
        if self.host_is_dead(url):
            return None

        needs_browser = use_browser
        if not use_browser and HAS_REQUESTS:
            try:
                resp = self.session.get(url, timeout=self.timeout, verify=self.verify_ssl)
                if resp.status_code == 200:
                    self._HOST_FAILURES.pop(self._host(url), None)
                    return resp.text
                if resp.status_code in self.BROWSER_FALLBACK_STATUSES:
                    print(f"[Requests notice] Status {resp.status_code} for {url}, falling back to Playwright Stealth...")
                    needs_browser = True
                else:
                    # 404 etc: the page simply is not there; a browser will not change that
                    return None
            except Exception as exc:
                print(f"[Requests notice] {type(exc).__name__} for {url}")
                self._record_host_failure(url)
                return None

        if needs_browser and HAS_PLAYWRIGHT:
            try:
                with sync_playwright() as p:
                    browser = p.chromium.launch(headless=True)
                    context = browser.new_context(user_agent=self.DEFAULT_HEADERS["User-Agent"])
                    page = context.new_page()
                    Stealth().apply_stealth_sync(page)
                    page.goto(url, wait_until="domcontentloaded", timeout=self.timeout * 1000)
                    content = page.content()
                    browser.close()
                    self._HOST_FAILURES.pop(self._host(url), None)
                    return content
            except Exception as exc:
                print(f"[Playwright Stealth Error] Fetching {url}: {str(exc).splitlines()[0]}")
                self._record_host_failure(url)
                return None

        return None

    @classmethod
    def parse_date_string(cls, text: Optional[str], default_year: Optional[int] = None) -> Optional[str]:
        """Parse arbitrary date string into normalized YYYY-MM-DD format.

        Handles:
          - ISO: 2026-06-30, 2026/06/30
          - Text: June 30, 2026 / 30 June 2026 / 30 Jun 2026 / Jun 30 2026
          - With day name: Fri 25 Sep 2026 / Friday, September 25, 2026
          - With time or AoE: October 20, 2026 23:59 AoE
        """
        if not text or not isinstance(text, str):
            return None

        clean = text.strip()

        # 1. Check for standard ISO format: YYYY-MM-DD or YYYY/MM/DD
        iso_match = re.search(r"\b(20\d{2})[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12][0-9]|3[01])\b", clean)
        if iso_match:
            year, month, day = iso_match.group(1), iso_match.group(2), iso_match.group(3)
            return f"{year}-{month}-{day}"

        # 2. Check for DD-MM-YYYY
        dmy_match = re.search(r"\b(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[0-2])[-/](20\d{2})\b", clean)
        if dmy_match:
            day, month, year = dmy_match.group(1), dmy_match.group(2), dmy_match.group(3)
            return f"{year}-{month}-{day}"

        # 3. Check for pattern: Day Month Year (e.g., 25 September 2026, 20-25 Sep 2026, 25 Sep. 2026)
        pattern_dmy = re.search(
            r"\b(?:[0-3]?[0-9]\s*[-–]\s*)?([0-3]?[0-9])(?:st|nd|rd|th)?\s+([A-Za-z]+)\.?\s+(20\d{2})\b",
            clean,
            re.IGNORECASE,
        )
        if pattern_dmy:
            day = int(pattern_dmy.group(1))
            m_str = pattern_dmy.group(2).lower()
            year = int(pattern_dmy.group(3))
            if m_str in cls.MONTH_MAP and 1 <= day <= 31:
                month = cls.MONTH_MAP[m_str]
                return f"{year:04d}-{month:02d}-{day:02d}"

        # 4. Check for pattern: Month Day[-Day], Year (e.g., September 25, 2026 / September 20-25, 2026 / Sep. 25, 2026)
        pattern_mdy = re.search(
            r"\b([A-Za-z]+)\.?\s+(?:[0-3]?[0-9]\s*[-–]\s*)?([0-3]?[0-9])(?:st|nd|rd|th)?,?\s+(20\d{2})\b",
            clean,
            re.IGNORECASE,
        )
        if pattern_mdy:
            m_str = pattern_mdy.group(1).lower()
            day = int(pattern_mdy.group(2))
            year = int(pattern_mdy.group(3))
            if m_str in cls.MONTH_MAP and 1 <= day <= 31:
                month = cls.MONTH_MAP[m_str]
                return f"{year:04d}-{month:02d}-{day:02d}"

        # 5. Check if year is omitted but default_year is provided
        if default_year:
            # Pattern 5a: Month Day (e.g., June 30 / June 30th)
            pattern_md = re.search(
                r"\b([A-Za-z]+)\.?\s+(?:[0-3]?[0-9]\s*[-–]\s*)?([0-3]?[0-9])(?:st|nd|rd|th)?\b",
                clean,
                re.IGNORECASE,
            )
            if pattern_md:
                m_str = pattern_md.group(1).lower()
                day = int(pattern_md.group(2))
                if m_str in cls.MONTH_MAP and 1 <= day <= 31:
                    month = cls.MONTH_MAP[m_str]
                    return f"{default_year:04d}-{month:02d}-{day:02d}"

            # Pattern 5b: Day Month (e.g., 30 June / 20-25 June)
            pattern_dm = re.search(
                r"\b(?:[0-3]?[0-9]\s*[-–]\s*)?([0-3]?[0-9])(?:st|nd|rd|th)?\s+([A-Za-z]+)\.?\b",
                clean,
                re.IGNORECASE,
            )
            if pattern_dm:
                day = int(pattern_dm.group(1))
                m_str = pattern_dm.group(2).lower()
                if m_str in cls.MONTH_MAP and 1 <= day <= 31:
                    month = cls.MONTH_MAP[m_str]
                    return f"{default_year:04d}-{month:02d}-{day:02d}"

        return None



    @staticmethod
    def _tz_offset_hours(tz: Optional[str]):
        """Return a datetime.tzinfo for strings like 'UTC-12', 'UTC+5:30', 'AoE' or an IANA name; None if unknown."""
        if not tz or not isinstance(tz, str):
            return None
        tz = tz.strip()
        if tz.lower() in ("aoe", "anywhere on earth"):
            return datetime.timezone(datetime.timedelta(hours=-12))
        m = re.fullmatch(r"(?:UTC|GMT)\s*([+-])\s*(\d{1,2})(?::?(\d{2}))?", tz, re.IGNORECASE)
        if m:
            delta = datetime.timedelta(hours=int(m.group(2)), minutes=int(m.group(3) or 0))
            return datetime.timezone(delta if m.group(1) == "+" else -delta)
        if tz.upper() in ("UTC", "GMT", "Z"):
            return datetime.timezone.utc
        try:
            return ZoneInfo(tz)
        except Exception:
            return None

    @classmethod
    def normalize_deadline(cls, value, tz: Optional[str] = None) -> Optional[str]:
        """Return the deadline as a YYYY-MM-DD date in Anywhere-on-Earth (UTC-12), the site's convention.

        Feeds publish '2026-04-01 23:59:59' plus a timezone; a 23:59 deadline in UTC+2 is still the
        previous calendar day in AoE terms. With no timezone the date is assumed to already be AoE.
        """
        if value is None:
            return None
        if isinstance(value, (datetime.datetime, datetime.date)):
            value = value.isoformat(sep=" ") if isinstance(value, datetime.datetime) else value.isoformat()
        text = str(value).strip()
        m = re.match(r"^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?", text)
        if not m:
            return cls.parse_date_string(text)
        year, month, day = int(m.group(1)), int(m.group(2)), int(m.group(3))
        tzinfo = cls._tz_offset_hours(tz)
        if tzinfo is None or m.group(4) is None:
            return f"{year:04d}-{month:02d}-{day:02d}"
        local = datetime.datetime(year, month, day, int(m.group(4)), int(m.group(5)), int(m.group(6) or 0), tzinfo=tzinfo)
        aoe = local.astimezone(datetime.timezone(datetime.timedelta(hours=-12)))
        return aoe.strftime("%Y-%m-%d")
