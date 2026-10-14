"""CLI entrypoint for scraping conference deadlines.

Only conferences listed in config/conferences.yml are ever updated. For each track the sources are
tried in priority order and the first one that yields a submission date wins:

  1. the track's / conference's official page            (WebScraper)
  2. se-deadlines.github.io feed                          (software engineering venues)
  3. hci-deadlines.github.io feed                         (HCI / VR / AR / games venues)
  4. WikiCFP search                                       (last resort, main tracks only)

A confirmed date clears the track's ``estimated`` flag. Dates that no source can confirm are left
exactly as they are (safe fallback).

Options:
  --all / --conf <NAME>   which conferences to check
  --year <YYYY>           only conferences whose configured year matches
  --dry-run               print what would change, write nothing
  --no-fallback           report tracks whose dates could not be confirmed online
  --sources a,b,c         restrict sources: web,se,hci,wikicfp (default: all)
  --discover              also list *untracked* feed entries that match our research topics
  --validate              cross-check year/location of tracked SIGCHI venues against sigchi.org
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

from scrapers import (  # noqa: E402
    CommunityFeedScraper,
    HciDeadlinesScraper,
    SigchiScraper,
    WebScraper,
    WikiCfpScraper,
)
from scrapers.relevance import (  # noqa: E402
    is_main_suffix,
    is_main_track,
    is_topic_relevant,
    subtrack_matches,
)
import build_static_data  # noqa: E402

CONFIG_PATH = os.path.join(ROOT, "config", "conferences.yml")
ALL_SOURCES = ("web", "se", "hci", "wikicfp")


def _track_label(track: dict) -> str:
    return track.get("track_name") or track.get("workshop_name") or "Main Track"


def _workshop_acronym(track: dict) -> str:
    """'LLM4Code Workshop (LLMs for Code)' -> 'LLM4Code'."""
    return (track.get("workshop_name") or "").split()[0] if track.get("workshop_name") else ""


def pick_feed_candidate(track: dict, candidates: list, feed) -> dict:
    """Choose the feed entry that really describes ``track`` (never apply main-track dates to a workshop)."""
    label = _track_label(track)

    if track.get("workshop_name"):
        # Co-located workshops are separate feed entries named by their acronym (e.g. 'LLM4Code').
        acronym = _workshop_acronym(track)
        return feed.get_entry_by_name(acronym, candidates[0]["year"] if candidates else None) if acronym else None

    # The main research track must get the conference-level entry; checking sub-tracks first would let
    # e.g. 'RR' (registered reports) match "Research paper track" by keyword.
    if is_main_track(track):
        for cand in candidates:
            if is_main_suffix(cand["subtrack"]):
                return cand
        return None
    for cand in candidates:
        if cand["subtrack"] and not is_main_suffix(cand["subtrack"]) and subtrack_matches(cand["subtrack"], label):
            return cand
    return None


def scrape_deadlines(
    conf_filter: str = None,
    year_filter: int = None,
    dry_run: bool = False,
    no_fallback: bool = False,
    config_path: str = CONFIG_PATH,
    sources=ALL_SOURCES,
    discover: bool = False,
    validate: bool = False,
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

    web_scraper = WebScraper() if "web" in sources else None
    se_feed = CommunityFeedScraper() if "se" in sources or discover else None
    hci_feed = HciDeadlinesScraper() if "hci" in sources or discover else None
    wikicfp = WikiCfpScraper() if "wikicfp" in sources else None
    # Co-located workshops we already follow count as tracked too (so discovery does not re-suggest them)
    tracked = list(conferences) + [
        _workshop_acronym(t) for c in conferences.values() for t in c.get("tracks", []) if t.get("workshop_name")
    ]

    total_checked = total_confirmed = total_changed = total_unconfirmed = 0
    changes = []

    print("=" * 60)
    print("Starting Conference Deadline Scraper")
    print(f"Filter: conf={conf_filter or 'ALL'}, year={year_filter or 'ALL'}, dry_run={dry_run}, sources={','.join(sources)}")
    print("=" * 60)

    for conf_name, conf_data in conferences.items():
        if conf_filter and conf_name.upper() != conf_filter.upper():
            continue

        conf_year = int(conf_data.get("year", 2027))
        if year_filter and conf_year != year_filter:
            continue

        print(f"\n▶ Checking {conf_name} ({conf_year})...")

        # Feed candidates per conference (feeds are cached, so this is one download per run)
        feed_sources = []
        if se_feed and "se" in sources:
            feed_sources.append(("se-deadlines", se_feed, se_feed.get_deadlines_for_conference(conf_name, year=conf_year)))
        if hci_feed and "hci" in sources:
            feed_sources.append(("hci-deadlines", hci_feed, hci_feed.get_deadlines_for_conference(conf_name, year=conf_year)))
        wiki_candidates = None  # fetched lazily: WikiCFP is rate limited

        for track in conf_data.get("tracks", []):
            total_checked += 1
            label = _track_label(track)
            track_url = track.get("website_url") or conf_data.get("website")

            baseline_sub = track.get("paper_submission_date")
            found = None
            source_used = None

            # 1. Official page
            if web_scraper and track_url and track_url != "#":
                scraped = web_scraper.scrape_conference_page(track_url, default_year=conf_year)
                if scraped.get("paper_submission_date"):
                    found, source_used = scraped, "official site"

            # 2/3. Community feeds
            if not found:
                for source_name, feed, candidates in feed_sources:
                    if not candidates and not track.get("workshop_name"):
                        continue
                    cand = pick_feed_candidate(track, candidates, feed)
                    if cand and cand.get("paper_submission_date"):
                        found, source_used = cand, source_name
                        break

            # 4. WikiCFP, main tracks only
            if not found and wikicfp and is_main_track(track):
                if wiki_candidates is None:
                    wiki_candidates = wikicfp.get_deadlines_for_conference(conf_name, year=conf_year)
                if wiki_candidates:
                    found, source_used = wiki_candidates[0], "wikicfp"

            if not found:
                total_unconfirmed += 1
                if no_fallback:
                    print(f"  ✗ [Unconfirmed] No online source has dates for {label}")
                else:
                    print(f"  ↻ [Kept] {label}: Sub={baseline_sub}{' (estimated)' if track.get('estimated') else ''}")
                continue

            new_sub = found["paper_submission_date"]
            new_abs = found.get("abstract_deadline")
            new_notif = found.get("intimation_date")
            was_estimated = bool(track.get("estimated"))

            if new_sub != baseline_sub:
                total_changed += 1
                changes.append((conf_name, label, baseline_sub, new_sub, source_used))
                print(f"  ✓ [{source_used}] {label}: Sub {baseline_sub} -> {new_sub}, Abs={new_abs or '-'}")
            else:
                total_confirmed += 1
                print(f"  ✓ [{source_used}] {label}: Sub={new_sub} confirmed{' (was estimated)' if was_estimated else ''}")

            track["paper_submission_date"] = new_sub
            track.pop("estimated", None)  # date now confirmed online
            if new_abs:
                track["abstract_deadline"] = new_abs
            if new_notif:
                track["intimation_date"] = new_notif

    print("\n" + "=" * 60)
    print(
        f"Scrape Summary: Checked: {total_checked} | Changed: {total_changed} | "
        f"Confirmed unchanged: {total_confirmed} | Unconfirmed (kept): {total_unconfirmed}"
    )
    print("=" * 60)

    if discover:
        report_discoveries(tracked, [f for f in (se_feed, hci_feed) if f], conferences)
    if validate:
        report_validation(conferences)

    if not dry_run:
        with open(config_path, "w", encoding="utf-8") as f:
            yaml.dump(data, f, default_flow_style=False, sort_keys=False, allow_unicode=True)
        print(f"✓ Configuration saved to {config_path}")
        print("Rebuilding static assets...")
        build_static_data.main()

    return True


def report_discoveries(tracked: list, feeds: list, conferences: dict = None) -> None:
    """List untracked feed entries about our topics whose deadline is still ahead.

    Sub-tracks of a venue that is itself in the feed (FORGE-DB, CHASE-DS, ...) are skipped, and
    workshops co-located with a tracked conference are summarised in one line instead of listed.
    """
    print("\nDiscovery: upcoming venues NOT tracked yet that match our topics")
    print("-" * 60)
    conferences = conferences or {}
    tracked_places = {
        (c.get("location") or "").split(",")[0].strip().lower(): name for name, c in conferences.items()
    }
    feed_names = {
        (i.get("name") or i.get("title") or "").upper() for f in feeds for i in f.fetch_feed()
    }
    seen, standalone, colocated = set(), [], {}
    for feed in feeds:
        for item, cand in feed.iter_upcoming(tracked):
            name = cand["feed_name"]
            key = (name.upper(), cand["year"])
            if key in seen or not is_topic_relevant(f"{name} {cand['description']}"):
                continue
            seen.add(key)
            if "-" in name and name.split("-")[0].upper() in feed_names:
                continue  # sub-track of a venue already listed
            city = (cand["place"] or "").split(",")[0].strip().lower()
            if city in tracked_places:
                colocated.setdefault(tracked_places[city], []).append(name)
                continue
            standalone.append((cand["paper_submission_date"], name, cand["year"], cand["place"], cand["source"]))
    for due, name, year, place, source in sorted(standalone):
        print(f"  {due}  {name} {year}  [{place or 'n/a'}]  ({source})")
    for conf, names in sorted(colocated.items()):
        print(f"  + {len(names)} untracked workshops co-located with {conf}: {', '.join(sorted(names)[:8])}{' ...' if len(names) > 8 else ''}")
    if not standalone and not colocated:
        print("  (none)")


def report_validation(conferences: dict) -> None:
    print("\nSIGCHI cross-check")
    print("-" * 60)
    issues = SigchiScraper().validate_conferences(conferences)
    for line in issues:
        print(f"  ! {line}")
    if not issues:
        print("  No year/location mismatches for tracked SIGCHI venues.")


def main():
    parser = argparse.ArgumentParser(description="Scrape conference deadline information.")
    parser.add_argument("--all", action="store_true", help="Scrape all tracked conferences")
    parser.add_argument("--conf", type=str, default=None, help="Scrape a specific conference (e.g. ICSE)")
    parser.add_argument("--year", type=int, default=None, help="Filter by conference year")
    parser.add_argument("--dry-run", action="store_true", help="Perform scrape without modifying configuration")
    parser.add_argument("--no-fallback", action="store_true", help="Report tracks whose dates cannot be confirmed online")
    parser.add_argument("--sources", type=str, default=",".join(ALL_SOURCES), help="Comma list of: web,se,hci,wikicfp")
    parser.add_argument("--discover", action="store_true", help="List untracked venues matching our research topics")
    parser.add_argument("--validate", action="store_true", help="Cross-check tracked SIGCHI venues against sigchi.org")

    args = parser.parse_args()

    if not args.all and not args.conf:
        args.all = True

    sources = tuple(s.strip() for s in args.sources.split(",") if s.strip() in ALL_SOURCES)
    scrape_deadlines(
        conf_filter=args.conf,
        year_filter=args.year,
        dry_run=args.dry_run,
        no_fallback=args.no_fallback,
        sources=sources or ALL_SOURCES,
        discover=args.discover,
        validate=args.validate,
    )


if __name__ == "__main__":
    main()
