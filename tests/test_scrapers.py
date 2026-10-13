"""Unit tests for WebScraper and CommunityFeedScraper."""
import os
import sys
import unittest
from unittest.mock import MagicMock

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

from scrapers.base import BaseScraper
from scrapers.community_feeds import CommunityFeedScraper
from scrapers.web_scraper import WebScraper


class TestScrapersMocked(unittest.TestCase):
    """Test scrapers parsing logic with simulated HTML and YAML responses."""

    def test_researchr_sidebar_parsing(self):
        scraper = WebScraper()
        mock_html = """
        <html>
        <body>
            <table class="table important-dates-in-sidebar">
                <tr>
                    <td>
                        Fri 25 Sep 2026<br>
                        Paper Submission
                    </td>
                </tr>
                <tr>
                    <td>
                        Mon 21 Sep 2026<br>
                        Abstract Deadline (Mandatory)
                    </td>
                </tr>
                <tr>
                    <td>
                        Tue 1 Dec 2026<br>
                        Author Notification
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
        scraper.fetch_url = MagicMock(return_value=mock_html)
        res = scraper.scrape_conference_page("https://conf.researchr.org/track/saner-2027/saner-2027-papers")

        self.assertEqual(res["paper_submission_date"], "2026-09-25")
        self.assertEqual(res["abstract_deadline"], "2026-09-21")
        self.assertEqual(res["intimation_date"], "2026-12-01")

    def test_generic_table_parsing(self):
        scraper = WebScraper()
        mock_html = """
        <html>
        <body>
            <table>
                <tr><th>Event</th><th>Date</th></tr>
                <tr><td>Full Paper Submission</td><td>August 31, 2026</td></tr>
                <tr><td>Abstract Registration</td><td>August 24, 2026</td></tr>
                <tr><td>Notification to Authors</td><td>November 18, 2026</td></tr>
            </table>
        </body>
        </html>
        """
        scraper.fetch_url = MagicMock(return_value=mock_html)
        res = scraper.scrape_conference_page("https://ieeevr.org/2027/")

        self.assertEqual(res["paper_submission_date"], "2026-08-31")
        self.assertEqual(res["abstract_deadline"], "2026-08-24")
        self.assertEqual(res["intimation_date"], "2026-11-18")

    def test_unstructured_text_parsing(self):
        scraper = WebScraper()
        mock_html = """
        <html>
        <body>
            <div class="cfp-dates">
                <h3>Important Dates</h3>
                <p>Paper Submission Deadline: June 15, 2026 (23:59 AoE)</p>
                <p>Notification of Acceptance: August 14, 2026</p>
            </div>
        </body>
        </html>
        """
        scraper.fetch_url = MagicMock(return_value=mock_html)
        res = scraper.scrape_conference_page("https://chiplay.acm.org/2026/")

        self.assertEqual(res["paper_submission_date"], "2026-06-15")
        self.assertEqual(res["intimation_date"], "2026-08-14")

    def test_table_parsing_with_numbers_in_labels(self):
        """Verify labels containing digits (e.g. Round 1, Track 2) don't confuse cell classification."""
        scraper = WebScraper()
        mock_html = """
        <html>
        <body>
            <table>
                <tr><td>Full Paper Submission (Round 1)</td><td>October 15, 2026</td></tr>
                <tr><td>Notification to Authors (Phase 2)</td><td>December 20, 2026</td></tr>
            </table>
        </body>
        </html>
        """
        scraper.fetch_url = MagicMock(return_value=mock_html)
        res = scraper.scrape_conference_page("https://example.org/conf/")

        self.assertEqual(res["paper_submission_date"], "2026-10-15")
        self.assertEqual(res["intimation_date"], "2026-12-20")

    def test_section_parsing_with_misleading_headings(self):
        """Verify headings like 'Updates' or 'Candidates' don't hijack date section parsing."""
        scraper = WebScraper()
        mock_html = """
        <html>
        <body>
            <div class="news">
                <h2>Latest Updates</h2>
                <p>Welcome to the conference website!</p>
            </div>
            <div class="dates">
                <h2>Important Dates</h2>
                <p>Paper Submission: September 25, 2026</p>
                <p>Author Notification: November 30, 2026</p>
            </div>
        </body>
        </html>
        """
        scraper.fetch_url = MagicMock(return_value=mock_html)
        res = scraper.scrape_conference_page("https://example.org/conf/")

        self.assertEqual(res["paper_submission_date"], "2026-09-25")
        self.assertEqual(res["intimation_date"], "2026-11-30")

    def test_community_feed_parser(self):
        feed_scraper = CommunityFeedScraper()
        mock_yaml = """
        - name: ICSE
          year: 2027
          deadline:
            - "2026-06-30 23:59"
          note: "Mandatory abstract deadline on June 23 2026."
          link: "https://conf.researchr.org/track/icse-2027/icse-2027-research-track"
        - name: ICSE-SEIP
          year: 2027
          deadline:
            - "2026-10-23 23:59"
          link: "https://conf.researchr.org/track/icse-2027/icse-2027-seip"
        """
        feed_scraper.fetch_url = MagicMock(return_value=mock_yaml)
        results = feed_scraper.get_deadlines_for_conference("ICSE", year=2027)

        self.assertEqual(len(results), 2)
        icse_main = next(r for r in results if r["feed_name"] == "ICSE")
        self.assertEqual(icse_main["paper_submission_date"], "2026-06-30")
        self.assertEqual(icse_main["abstract_deadline"], "2026-06-23")

        icse_seip = next(r for r in results if r["feed_name"] == "ICSE-SEIP")
        self.assertEqual(icse_seip["paper_submission_date"], "2026-10-23")


if __name__ == "__main__":
    unittest.main()

