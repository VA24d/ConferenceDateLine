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



class TestNewSources(unittest.TestCase):
    """Offline tests for the se/hci feeds, WikiCFP, SIGCHI and relevance filtering."""

    def test_normalize_deadline_converts_to_aoe(self):
        n = BaseScraper.normalize_deadline
        self.assertEqual(n("2026-04-01 23:59:59", "UTC-12"), "2026-04-01")
        self.assertEqual(n("2026-04-01 23:59", None), "2026-04-01")
        self.assertEqual(n("2026-04-01 01:00", "UTC+5:30"), "2026-03-31")
        self.assertEqual(n("2026-04-01 23:59", "America/New_York"), "2026-04-01")
        self.assertEqual(n("2026-04-01 23:59", "AoE"), "2026-04-01")

    def test_relevance_matching(self):
        from scrapers.relevance import match_conference, is_main_track, subtrack_matches
        tracked = ["ICSE", "RE", "IEEE VR", "CHI PLAY", "ISMAR"]
        self.assertEqual(match_conference("ICSE-SEIP", tracked), ("ICSE", "SEIP"))
        self.assertEqual(match_conference("CHI Play", tracked), ("CHI PLAY", ""))
        self.assertEqual(match_conference("ISMAR (Journal Papers)", tracked), ("ISMAR", "JOURNAL PAPERS"))
        self.assertEqual(match_conference("REFSQ-RT", tracked), (None, ""))  # must not match 'RE'
        self.assertEqual(match_conference("CHI", tracked), (None, ""))       # CHI is not CHI PLAY
        self.assertTrue(subtrack_matches("SEIP", "In practice track"))
        self.assertTrue(is_main_track({"track_name": "Research paper track"}))
        self.assertFalse(is_main_track({"track_name": "Research track", "workshop_name": "X Workshop"}))
        self.assertFalse(is_main_track({"track_name": "Short papers and demos track"}))

    def test_hci_feed_timezone_and_abstract(self):
        from scrapers.community_feeds import HciDeadlinesScraper
        feed = HciDeadlinesScraper()
        feed.fetch_url = MagicMock(return_value="""
        - title: IEEE VR
          year: 2027
          link: https://ieeevr.org/2027/
          deadline: '2026-08-31 23:59:59'
          abstract_deadline: '2026-08-24 23:59:59'
          timezone: UTC-12
          place: Melbourne, Australia
        - title: UIST
          year: 2026
          deadline: '2026-04-01 23:59:59'
          timezone: UTC-12
        """)
        res = feed.get_deadlines_for_conference("IEEE VR", year=2027)
        self.assertEqual(len(res), 1)
        self.assertEqual(res[0]["paper_submission_date"], "2026-08-31")
        self.assertEqual(res[0]["abstract_deadline"], "2026-08-24")
        self.assertEqual(res[0]["source"], "hci-deadlines")

    def test_feed_picks_upcoming_cycle_and_wrong_year_ignored(self):
        feed = CommunityFeedScraper()
        feed._today_aoe = staticmethod(lambda: "2026-05-01")
        feed.fetch_url = MagicMock(return_value="""
        - name: ICSE
          year: 2026
          deadline: ["2025-03-14 23:59", "2026-07-18 23:59"]
        - name: ICSE
          year: 2025
          deadline: ["2024-03-22 23:59"]
        """)
        res = feed.get_deadlines_for_conference("ICSE", year=2026)
        self.assertEqual(len(res), 1)
        self.assertEqual(res[0]["paper_submission_date"], "2026-07-18")

    def test_wikicfp_parsing(self):
        from scrapers.wikicfp import WikiCfpScraper
        html = """
        <table><tr><td><a href="/cfp/servlet/event.showcfp?eventid=1&copyownerid=2">ICSE 2027</a></td>
        <td>The 49th International Conference on Software Engineering</td></tr>
        <tr><td>Apr 27, 2027 - May 1, 2027</td><td>Dublin, Ireland</td><td>Jun 30, 2026 (Jun 23, 2026)</td></tr>
        <tr><td><a href="/cfp/servlet/event.showcfp?eventid=3">ICSE 2026</a></td><td>Old</td></tr>
        <tr><td>Apr 12, 2026</td><td>Rio</td><td>Jul 18, 2025</td></tr></table>
        """
        wiki = WikiCfpScraper()
        wiki.MIN_INTERVAL_SECONDS = 0
        wiki.fetch_url = MagicMock(return_value=html)
        res = wiki.get_deadlines_for_conference("ICSE", year=2027)
        self.assertEqual(len(res), 1)
        self.assertEqual(res[0]["paper_submission_date"], "2026-06-30")
        self.assertEqual(res[0]["abstract_deadline"], "2026-06-23")
        self.assertEqual(res[0]["place"], "Dublin, Ireland")

    def test_sigchi_listing_and_validation(self):
        from scrapers.sigchi import SigchiScraper
        html = """
        <a href="/events/chi-play-2026/">CHI Play 2026<br>York, United Kingdom<br>·<br>Nov 02, 2026<br>-<br>Nov 05, 2026<br>desc</a>
        <a href="/events/vrst-2026/">VRST 2026<br>Tohoku University, Sendai, Japan<br>·<br>Nov 16, 2026<br>-<br>Nov 18, 2026<br>desc</a>
        """
        events = SigchiScraper.parse_events(html)
        self.assertEqual([e["year"] for e in events], [2026, 2026])
        self.assertEqual(events[0]["start"], "2026-11-02")
        sc = SigchiScraper()
        sc._events = events
        good = {"CHI PLAY": {"year": 2026, "location": "York, United Kingdom"},
                "VRST": {"year": 2026, "location": "Sendai, Japan"}}
        self.assertEqual(sc.validate_conferences(good), [])
        bad = {"CHI PLAY": {"year": 2026, "location": "Zurich, Switzerland"}}
        self.assertEqual(len(sc.validate_conferences(bad)), 1)

    def test_pick_candidate_never_applies_main_dates_to_workshops(self):
        sys.path.insert(0, os.path.join(ROOT, "scripts"))
        from scrape_deadlines import pick_feed_candidate
        feed = MagicMock()
        feed.get_entry_by_name.return_value = None
        main = {"subtrack": "", "year": 2027, "paper_submission_date": "2026-06-30"}
        self.assertIsNone(pick_feed_candidate({"workshop_name": "LLM4Code Workshop (x)"}, [main], feed))
        self.assertIs(pick_feed_candidate({"track_name": "Research paper track"}, [main], feed), main)
        self.assertIsNone(pick_feed_candidate({"track_name": "Posters track"}, [main], feed))

    def test_main_track_prefers_conference_entry_over_subtracks(self):
        sys.path.insert(0, os.path.join(ROOT, "scripts"))
        from scrape_deadlines import pick_feed_candidate
        main = {"subtrack": "", "year": 2027, "paper_submission_date": "2026-10-23"}
        rr = {"subtrack": "RR", "year": 2027, "paper_submission_date": "2026-11-13"}
        feed = MagicMock()
        # sub-track listed first must not hijack the main research track
        self.assertIs(pick_feed_candidate({"track_name": "Research paper track"}, [rr, main], feed), main)
        self.assertIs(
            pick_feed_candidate({"track_name": "Reproducibility Studies and Negative Results Track"}, [main, rr], feed), rr
        )
