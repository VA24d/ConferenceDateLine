"""Resilient web scraper for conference homepages and CFP pages."""
import re
from typing import Dict, Optional

try:
    from bs4 import BeautifulSoup
    HAS_BS4 = True
except ImportError:
    HAS_BS4 = False

from .base import BaseScraper


class WebScraper(BaseScraper):
    """Scrapes conference websites for submission, abstract, and notification dates."""

    def scrape_conference_page(self, url: str, default_year: Optional[int] = None) -> Dict[str, Optional[str]]:
        """Scrape given conference URL for key deadline dates."""
        result = {
            "paper_submission_date": None,
            "abstract_deadline": None,
            "intimation_date": None,
            "camera_ready_deadline": None,
        }

        html = self.fetch_url(url)
        if not html:
            return result

        if not HAS_BS4:
            print("[Warning] BeautifulSoup4 not installed. Cannot parse conference HTML.")
            return result

        soup = BeautifulSoup(html, "html.parser")

        # 1. Specialized handling for conf.researchr.org
        if "conf.researchr.org" in url:
            res_researchr = self._scrape_researchr(soup, default_year)
            if any(res_researchr.values()):
                return res_researchr

        # 2. General table scanning
        res_tables = self._scrape_tables(soup, default_year)
        if any(res_tables.values()):
            return res_tables

        # 3. Unstructured Important Dates section text scanning
        res_sections = self._scrape_sections(soup, default_year)
        return res_sections

    def _scrape_researchr(self, soup: BeautifulSoup, default_year: Optional[int]) -> Dict[str, Optional[str]]:
        """Extract dates from researchr.org sidebar or tables."""
        result = {
            "paper_submission_date": None,
            "abstract_deadline": None,
            "intimation_date": None,
            "camera_ready_deadline": None,
        }

        # Check sidebar table
        sidebar = soup.find("table", class_=lambda c: c and "important-dates-in-sidebar" in c)
        if sidebar:
            for tr in sidebar.find_all("tr"):
                td = tr.find("td")
                if not td:
                    continue
                parts = list(td.stripped_strings)
                if len(parts) >= 2:
                    p0 = self.parse_date_string(parts[0], default_year=default_year)
                    p1 = self.parse_date_string(parts[1], default_year=default_year)

                    if p0:
                        parsed = p0
                        label = parts[1].lower()
                    elif p1:
                        parsed = p1
                        label = parts[0].lower()
                    else:
                        continue

                    if ("camera" in label or "camera-ready" in label) and not result["camera_ready_deadline"]:
                        result["camera_ready_deadline"] = parsed
                    elif "abstract" in label and not result["abstract_deadline"]:
                        result["abstract_deadline"] = parsed
                    elif ("submission" in label or "paper" in label) and not result["paper_submission_date"]:
                        result["paper_submission_date"] = parsed
                    elif ("notification" in label or "acceptance" in label) and not result["intimation_date"]:
                        result["intimation_date"] = parsed

        return result

    def _scrape_tables(self, soup: BeautifulSoup, default_year: Optional[int]) -> Dict[str, Optional[str]]:
        """Scan general tables for Important Dates."""
        result = {
            "paper_submission_date": None,
            "abstract_deadline": None,
            "intimation_date": None,
            "camera_ready_deadline": None,
        }

        for table in soup.find_all("table"):
            for row in table.find_all("tr"):
                cells = row.find_all(["td", "th"])
                if len(cells) >= 2:
                    c1 = cells[0].get_text().strip()
                    c2 = cells[1].get_text().strip()

                    p1 = self.parse_date_string(c1, default_year=default_year)
                    p2 = self.parse_date_string(c2, default_year=default_year)

                    if p2 and not p1:
                        parsed = p2
                        label = c1.lower()
                    elif p1 and not p2:
                        parsed = p1
                        label = c2.lower()
                    elif p2 and p1:
                        # If both parse, choose the one with more text as label
                        if len(c1) > len(c2):
                            parsed = p2
                            label = c1.lower()
                        else:
                            parsed = p1
                            label = c2.lower()
                    else:
                        continue

                    if ("camera" in label or "final version" in label or "final paper" in label) and not result["camera_ready_deadline"]:
                        result["camera_ready_deadline"] = parsed
                    elif "abstract" in label and not result["abstract_deadline"]:
                        result["abstract_deadline"] = parsed
                    elif ("submission" in label or "paper" in label or "deadline" in label) and not result["paper_submission_date"]:
                        result["paper_submission_date"] = parsed
                    elif ("notification" in label or "acceptance" in label or "author" in label) and not result["intimation_date"]:
                        result["intimation_date"] = parsed

        return result

    def _scrape_sections(self, soup: BeautifulSoup, default_year: Optional[int]) -> Dict[str, Optional[str]]:
        """Scan text in sections near 'Important Dates' or 'Call for Papers' headings."""
        result = {
            "paper_submission_date": None,
            "abstract_deadline": None,
            "intimation_date": None,
            "camera_ready_deadline": None,
        }

        # Look for target headings
        target_container = None
        date_heading_re = re.compile(
            r"\b(important\s+dates?|key\s+dates?|deadlines?|critical\s+dates?|submission\s+dates?)\b",
            re.IGNORECASE,
        )
        for heading in soup.find_all(["h1", "h2", "h3", "h4", "h5"]):
            text = heading.get_text()
            if date_heading_re.search(text):
                target_container = heading.parent
                break

        # Search target container first, or full page if none found
        search_areas = [target_container] if target_container else []
        search_areas.append(soup)

        for search_area in search_areas:
            text = search_area.get_text("\n")
            for line in text.split("\n"):
                line_clean = line.strip()
                if not line_clean:
                    continue
                line_lower = line_clean.lower()

                if ("camera" in line_lower or "final version" in line_lower or "final paper" in line_lower) and not result["camera_ready_deadline"]:
                    parsed = self.parse_date_string(line_clean, default_year=default_year)
                    if parsed:
                        result["camera_ready_deadline"] = parsed
                elif "abstract" in line_lower and not result["abstract_deadline"]:
                    parsed = self.parse_date_string(line_clean, default_year=default_year)
                    if parsed:
                        result["abstract_deadline"] = parsed
                elif ("submission" in line_lower or "due date" in line_lower or "deadline" in line_lower) and not result["paper_submission_date"]:
                    parsed = self.parse_date_string(line_clean, default_year=default_year)
                    if parsed:
                        result["paper_submission_date"] = parsed
                elif ("notification" in line_lower or "acceptance" in line_lower) and not result["intimation_date"]:
                    parsed = self.parse_date_string(line_clean, default_year=default_year)
                    if parsed:
                        result["intimation_date"] = parsed

            if result["paper_submission_date"]:
                break

        return result

