"""Base scraper class with robust HTTP fetching and date parsing."""
import datetime
import re
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

    def fetch_url(self, url: str, use_browser: bool = False) -> Optional[str]:
        """Fetch URL content with timeout, falling back gracefully to Playwright Stealth when needed."""
        if not url or url == "#" or not url.startswith(("http://", "https://")):
            return None

        if not use_browser and HAS_REQUESTS:
            try:
                resp = self.session.get(url, timeout=self.timeout, verify=self.verify_ssl)
                if resp.status_code == 200:
                    return resp.text
                print(f"[Requests notice] Status {resp.status_code} for {url}, falling back to Playwright Stealth...")
            except Exception as exc:
                print(f"[Requests notice] Error {exc} for {url}, falling back to Playwright Stealth...")

        # Browser fallback using Playwright Stealth
        if HAS_PLAYWRIGHT:
            try:
                with sync_playwright() as p:
                    browser = p.chromium.launch(headless=True)
                    context = browser.new_context(
                        user_agent=(
                            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                            "AppleWebKit/537.36 (KHTML, like Gecko) "
                            "Chrome/124.0.0.0 Safari/537.36"
                        )
                    )
                    page = context.new_page()
                    Stealth().apply_stealth_sync(page)
                    page.goto(url, wait_until="domcontentloaded", timeout=self.timeout * 1000)
                    content = page.content()
                    browser.close()
                    return content
            except Exception as exc:
                print(f"[Playwright Stealth Error] Fetching {url}: {exc}")
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

