"""Comprehensive test suite for Conference DateLine."""
import os
import sys
import unittest
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.join(ROOT, "scripts"))

from scrapers.base import BaseScraper
from scrapers.community_feeds import CommunityFeedScraper
from scrapers.web_scraper import WebScraper
from roll_year import roll_date_str, roll_url, roll_conference
import build_static_data


class TestConfigConferences(unittest.TestCase):
    """Test configuration integrity and coverage of all 18 tracked venues."""

    EXPECTED_VENUES = [
        "ICSE", "FSE", "ISSTA", "SANER", "EASE", "IEEE VR", "ISMAR",
        "VRST", "CHI PLAY", "ICSA", "SEAMS", "AGENT", "CAIN", "MODELS",
        "ISEC", "ECSA", "MSR", "ICPC"
    ]

    def setUp(self):
        self.config_path = os.path.join(ROOT, "config", "conferences.yml")
        self.assertTrue(os.path.exists(self.config_path), "config/conferences.yml must exist")
        with open(self.config_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        self.conferences = data.get("conferences", {})

    def test_all_18_venues_present(self):
        """Verify all 18 venues are present in config."""
        for venue in self.EXPECTED_VENUES:
            self.assertIn(venue, self.conferences, f"Venue {venue} missing from config")

    def test_venue_metadata_fields(self):
        """Verify required metadata fields are non-empty for every venue."""
        for name, meta in self.conferences.items():
            self.assertTrue(meta.get("full_name"), f"{name} missing full_name")
            self.assertTrue(meta.get("core_rating"), f"{name} missing core_rating")
            self.assertTrue(meta.get("location"), f"{name} missing location")
            self.assertTrue(meta.get("country"), f"{name} missing country")
            self.assertTrue(meta.get("flag"), f"{name} missing flag")
            self.assertTrue(meta.get("year"), f"{name} missing year")
            self.assertTrue(meta.get("website"), f"{name} missing website")
            self.assertIsInstance(meta.get("cohosted"), list, f"{name} cohosted must be a list")
            tracks = meta.get("tracks", [])
            self.assertGreater(len(tracks), 0, f"{name} has no tracks or workshops defined")


class TestDateParsing(unittest.TestCase):
    """Test date parsing in BaseScraper."""

    def test_iso_dates(self):
        self.assertEqual(BaseScraper.parse_date_string("2026-06-30"), "2026-06-30")
        self.assertEqual(BaseScraper.parse_date_string("2027/01/22"), "2027-01-22")

    def test_dmy_dates(self):
        self.assertEqual(BaseScraper.parse_date_string("25-09-2026"), "2026-09-25")
        self.assertEqual(BaseScraper.parse_date_string("25 September 2026"), "2026-09-25")
        self.assertEqual(BaseScraper.parse_date_string("30 Jun 2026"), "2026-06-30")

    def test_mdy_dates(self):
        self.assertEqual(BaseScraper.parse_date_string("June 30, 2026"), "2026-06-30")
        self.assertEqual(BaseScraper.parse_date_string("October 23, 2026 23:59 AoE"), "2026-10-23")
        self.assertEqual(BaseScraper.parse_date_string("March 2nd, 2026"), "2026-03-02")

    def test_default_year_fallback(self):
        self.assertEqual(BaseScraper.parse_date_string("June 30", default_year=2026), "2026-06-30")
        self.assertEqual(BaseScraper.parse_date_string("30 June", default_year=2026), "2026-06-30")

    def test_date_ranges(self):
        self.assertEqual(BaseScraper.parse_date_string("September 20-25, 2026"), "2026-09-25")
        self.assertEqual(BaseScraper.parse_date_string("20-25 September 2026"), "2026-09-25")

    def test_future_decade_years(self):
        self.assertEqual(BaseScraper.parse_date_string("June 30, 2030"), "2030-06-30")
        self.assertEqual(BaseScraper.parse_date_string("2032-05-15"), "2032-05-15")

    def test_month_with_dot(self):
        self.assertEqual(BaseScraper.parse_date_string("Oct. 23, 2026"), "2026-10-23")
        self.assertEqual(BaseScraper.parse_date_string("25 Sept. 2026"), "2026-09-25")

    def test_invalid_dates(self):
        self.assertIsNone(BaseScraper.parse_date_string(""))
        self.assertIsNone(BaseScraper.parse_date_string(None))
        self.assertIsNone(BaseScraper.parse_date_string("TBA"))


class TestYearRolling(unittest.TestCase):
    """Test date rolling and URL rolling logic."""

    def test_roll_date_regular(self):
        self.assertEqual(roll_date_str("2026-06-30", 1), "2027-06-30")
        self.assertEqual(roll_date_str("2026-10-23", 2), "2028-10-23")

    def test_roll_date_leap_year(self):
        # 2024 is a leap year; rolling to 2025 should clamp Feb 29 to Feb 28
        self.assertEqual(roll_date_str("2024-02-29", 1), "2025-02-28")
        # Rolling from 2024 to 2028 (both leap years) preserves Feb 29
        self.assertEqual(roll_date_str("2024-02-29", 4), "2028-02-29")

    def test_roll_url(self):
        self.assertEqual(
            roll_url("https://conf.researchr.org/home/icse-2027", 2027, 2028),
            "https://conf.researchr.org/home/icse-2028"
        )

    def test_roll_conference_structure(self):
        dummy = {
            "year": 2027,
            "website": "https://ieeevr.org/2027/",
            "tracks": [
                {
                    "track_name": "Research",
                    "paper_submission_date": "2026-08-31",
                    "website_url": "https://ieeevr.org/2027/cfp"
                }
            ]
        }
        rolled = roll_conference("IEEE VR", dummy, years=1)
        self.assertEqual(rolled["year"], 2028)
        self.assertEqual(rolled["website"], "https://ieeevr.org/2028/")
        self.assertEqual(rolled["tracks"][0]["paper_submission_date"], "2027-08-31")
        self.assertEqual(rolled["tracks"][0]["website_url"], "https://ieeevr.org/2028/cfp")


class TestBuildStaticData(unittest.TestCase):
    """Test build_static_data execution and output files."""

    def test_build_run_and_artifacts(self):
        build_static_data.main()

        csv_path = os.path.join(ROOT, "data", "conferences.csv")
        json_path = os.path.join(ROOT, "data", "deadlines.json")
        conf_dir = os.path.join(ROOT, "conferences")

        self.assertTrue(os.path.exists(csv_path), "conferences.csv must exist")
        self.assertTrue(os.path.exists(json_path), "deadlines.json must exist")
        self.assertTrue(os.path.isdir(conf_dir), "conferences directory must exist")

        # Check all 18 HTML pages generated in conferences/
        for venue in TestConfigConferences.EXPECTED_VENUES:
            slug = build_static_data.conf_slug(venue)
            page_path = os.path.join(conf_dir, f"{slug}.html")
            self.assertTrue(os.path.exists(page_path), f"Page {slug}.html must exist in conferences/")

            with open(page_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Ensure relative paths for subfolder
            self.assertIn('href="../styles.css"', content)
            self.assertIn('src="../app.js"', content)
            self.assertIn('href="../index.html"', content)
            self.assertIn(f'data-conf="{venue}"', content)


if __name__ == "__main__":
    unittest.main()

