"""Roll conference deadlines and cycles to the next year.

Reads config/conferences.yml, increments the target conference's year and
deadline dates by N years (default: +1), updates URLs with the new year,
saves the configuration, and automatically invokes scripts/build_static_data.py.
"""
import argparse
import calendar
import datetime
import os
import re
import sys

try:
    import yaml
except ImportError:
    print("Error: PyYAML is required. Please install pyyaml or run in the designated Python environment.")
    sys.exit(1)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_PATH = os.path.join(ROOT, "config", "conferences.yml")

# Import the builder
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import build_static_data  # noqa: E402


def roll_date_str(date_str: str, years: int) -> str:
    """Safely increment a YYYY-MM-DD string by N years, handling leap years."""
    if not date_str or not isinstance(date_str, str):
        return ""
    m = re.match(r"^(\d{4})-(\d{2})-(\d{2})(.*)$", date_str.strip())
    if not m:
        return date_str
    orig_year = int(m.group(1))
    orig_month = int(m.group(2))
    orig_day = int(m.group(3))
    suffix = m.group(4)

    target_year = orig_year + years
    # Handle Feb 29 on non-leap target years
    if orig_month == 2 and orig_day == 29:
        if not calendar.isleap(target_year):
            orig_day = 28

    return f"{target_year:04d}-{orig_month:02d}-{orig_day:02d}{suffix}"


def roll_url(url: str, old_year: int, new_year: int) -> str:
    """Update year in URL string."""
    if not url or not isinstance(url, str):
        return url
    return url.replace(str(old_year), str(new_year))


def roll_conference(conf_name: str, conf_data: dict, years: int = 1, target_year: int = None) -> dict:
    """Roll a single conference's year, dates, and URLs."""
    current_year = int(conf_data.get("year", 2027))
    if target_year is not None:
        delta = target_year - current_year
        new_year = target_year
    else:
        delta = years
        new_year = current_year + delta

    if delta == 0:
        return conf_data

    conf_data["year"] = new_year

    # Update main website URL
    if "website" in conf_data:
        pattern = conf_data.get("url_pattern")
        if pattern and "{year}" in pattern:
            conf_data["website"] = pattern.format(year=new_year)
        else:
            conf_data["website"] = roll_url(conf_data["website"], current_year, new_year)

    # Roll tracks and workshops
    for track in conf_data.get("tracks", []):
        for date_key in ["paper_submission_date", "abstract_deadline", "intimation_date", "camera_ready_deadline"]:
            if track.get(date_key):
                track[date_key] = roll_date_str(track[date_key], delta)

        # Rolled dates are projections copied from the previous cycle, not confirmed
        track["estimated"] = True

        if track.get("website_url"):
            track_pattern = track.get("url_pattern")
            if track_pattern and "{year}" in track_pattern:
                track["website_url"] = track_pattern.format(year=new_year)
            else:
                track["website_url"] = roll_url(track["website_url"], current_year, new_year)

    return conf_data


def roll_year(
    config_path: str = CONFIG_PATH,
    conf_filter: str = None,
    years: int = 1,
    from_year: int = None,
    to_year: int = None,
    dry_run: bool = False,
    rebuild: bool = True,
):
    """Main year rolling function."""
    with open(config_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}

    conferences = data.get("conferences", {})
    if not conferences:
        print("Error: No conferences found in configuration.")
        return False

    rolled_count = 0
    for name, cdata in conferences.items():
        if conf_filter and name.upper() != conf_filter.upper():
            continue

        c_year = int(cdata.get("year", 2027))
        if from_year is not None and c_year != from_year:
            continue

        target = to_year if to_year is not None else (c_year + years)
        old_year = c_year
        conferences[name] = roll_conference(name, cdata, years=years, target_year=target)
        rolled_count += 1
        print(f"  • Rolled {name}: {old_year} ➔ {conferences[name]['year']}")

    if rolled_count == 0:
        print("No conferences matched the specified criteria.")
        return False

    if dry_run:
        print(f"Dry run complete. {rolled_count} conference(s) would be updated.")
        return True

    # Save updated YAML
    with open(config_path, "w", encoding="utf-8") as f:
        yaml.dump(data, f, default_flow_style=False, sort_keys=False, allow_unicode=True)
    print(f"✓ Saved updated {config_path}")

    if rebuild:
        print("Rebuilding static data and conference pages...")
        build_static_data.main()

    return True


def main():
    parser = argparse.ArgumentParser(description="Roll conference deadlines to a new year.")
    parser.add_argument("--conf", type=str, default=None, help="Specific conference to roll (e.g. ICSE)")
    parser.add_argument("--by", type=int, default=1, help="Number of years to advance (default: 1)")
    parser.add_argument("--from", dest="from_year", type=int, default=None, help="Filter conferences by current year (e.g. 2026)")
    parser.add_argument("--to", dest="to_year", type=int, default=None, help="Target year to roll to (e.g. 2028)")
    parser.add_argument("--dry-run", action="store_true", help="Print changes without saving to disk")
    parser.add_argument("--no-rebuild", action="store_true", help="Skip running build_static_data.py")

    args = parser.parse_args()

    roll_year(
        conf_filter=args.conf,
        years=args.by,
        from_year=args.from_year,
        to_year=args.to_year,
        dry_run=args.dry_run,
        rebuild=not args.no_rebuild,
    )


if __name__ == "__main__":
    main()

