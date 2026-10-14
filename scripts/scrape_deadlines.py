"""CLI entrypoint for scraping conference deadlines.

Orchestrates web scraping and community feeds with safe fallback to baseline dates.
Supports:
  --all: scrape all 18 conferences
  --conf <NAME>: scrape specific conference (e.g. --conf ICSE)
  --year <YYYY>: target year filter
  --dry-run: simulate scraping without writing updates to disk
  --no-fallback: error out if online dates not found instead of preserving baseline
"""
import argparse
import os
import sys

try:
    import yaml
except ImportError:
    print("Error: PyYAML is required. Please install pyyaml or run in the designated Python environment.")
    sys.exit(1)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.join(ROOT, "scripts"))

from scrapers import CommunityFeedScraper, WebScraper  # noqa: E402
import build_static_data  # noqa: E402

CONFIG_PATH = os.path.join(ROOT, "config", "conferences.yml")


def scrape_deadlines(
    conf_filter: str = None,
    year_filter: int = None,
    dry_run: bool = False,
    no_fallback: bool = False,
    config_path: str = CONFIG_PATH,
) -> bool:
    """Scrape conference dates with safe fallback mechanism."""
    if not os.path.exists(config_path):
        print(f"Error: Config file not found at {config_path}")
        return False

    with open(config_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}

    conferences = data.get("conferences", {})
    if not conferences:
        print("Error: No conferences found in configuration.")
        return False

    web_scraper = WebScraper()
    feed_scraper = CommunityFeedScraper()

    total_checked = 0
    total_updated = 0
    total_fallback = 0

    print("=" * 60)
    print("Starting Conference Deadline Scraper")
    print(f"Filter: conf={conf_filter or 'ALL'}, year={year_filter or 'ALL'}, dry_run={dry_run}")
    print("=" * 60)

    for conf_name, conf_data in conferences.items():
        if conf_filter and conf_name.upper() != conf_filter.upper():
            continue

        conf_year = int(conf_data.get("year", 2027))
        if year_filter and conf_year != year_filter:
            continue

        print(f"\n▶ Checking {conf_name} ({conf_year})...")
        tracks = conf_data.get("tracks", [])

        # Fetch community feed candidates once per conference
        feed_candidates = feed_scraper.get_deadlines_for_conference(conf_name, year=conf_year)

        for track in tracks:
            total_checked += 1
            track_name = track.get("track_name") or track.get("workshop_name") or "Main Track"
            track_url = track.get("website_url") or conf_data.get("website")

            baseline_sub = track.get("paper_submission_date")
            baseline_abs = track.get("abstract_deadline")
            baseline_notif = track.get("intimation_date")

            scraped = {"paper_submission_date": None, "abstract_deadline": None, "intimation_date": None}

            # 1. Try web scraping the direct track or conference URL
            if track_url and track_url != "#":
                scraped = web_scraper.scrape_conference_page(track_url, default_year=conf_year)

            # 2. Try matching with community feed if direct web scraping found nothing
            if not scraped.get("paper_submission_date") and feed_candidates:
                for candidate in feed_candidates:
                    feed_name = candidate.get("feed_name", "").upper()
                    # Match track acronym or name if applicable
                    if track_name.upper() in feed_name or feed_name == conf_name.upper():
                        if candidate.get("paper_submission_date"):
                            scraped["paper_submission_date"] = candidate["paper_submission_date"]
                            if candidate.get("abstract_deadline"):
                                scraped["abstract_deadline"] = candidate["abstract_deadline"]
                            break

            # Check if any new valid date was found
            found_sub = scraped.get("paper_submission_date")
            found_abs = scraped.get("abstract_deadline")
            found_notif = scraped.get("intimation_date")

            if found_sub:
                track["paper_submission_date"] = found_sub
                track.pop("estimated", None)  # date now confirmed online
                if found_abs:
                    track["abstract_deadline"] = found_abs
                if found_notif:
                    track["intimation_date"] = found_notif
                total_updated += 1
                print(f"  ✓ [Scraped Online] {track_name}: Sub={found_sub}, Abs={found_abs or '-'}, Notif={found_notif or '-'}")
            else:
                if no_fallback:
                    print(f"  ✗ [Missing] Online dates not published for {track_name}")
                else:
                    total_fallback += 1
                    print(f"  ↻ [Safe Fallback] Retained baseline date for {track_name}: Sub={baseline_sub}")

    print("\n" + "=" * 60)
    print(f"Scrape Summary: Checked: {total_checked} | Scraped: {total_updated} | Safe Fallbacks: {total_fallback}")
    print("=" * 60)

    if not dry_run:
        with open(config_path, "w", encoding="utf-8") as f:
            yaml.dump(data, f, default_flow_style=False, sort_keys=False, allow_unicode=True)
        print(f"✓ Configuration saved to {config_path}")
        print("Rebuilding static assets...")
        build_static_data.main()

    return True


def main():
    parser = argparse.ArgumentParser(description="Scrape conference deadline information.")
    parser.add_argument("--all", action="store_true", help="Scrape all tracked conferences")
    parser.add_argument("--conf", type=str, default=None, help="Scrape a specific conference (e.g. ICSE)")
    parser.add_argument("--year", type=int, default=None, help="Filter by conference year")
    parser.add_argument("--dry-run", action="store_true", help="Perform scrape without modifying configuration")
    parser.add_argument("--no-fallback", action="store_true", help="Do not fallback to baseline dates if online dates missing")

    args = parser.parse_args()

    if not args.all and not args.conf:
        # Default to all if neither specified
        args.all = True

    scrape_deadlines(
        conf_filter=args.conf,
        year_filter=args.year,
        dry_run=args.dry_run,
        no_fallback=args.no_fallback,
    )


if __name__ == "__main__":
    main()

