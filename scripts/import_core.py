#!/usr/bin/env python3
"""Import CORE (ICORE) A*/A conferences for FoR 4612 (Software Engineering) and 4607 (Graphics, AR & Games).

The CORE portal rejects plain HTTP clients (403), so the scraper drives real Chrome
through Playwright with playwright-stealth.

    python3 scripts/import_core.py --fetch              # scrape portal -> data/core_se.json
    python3 scripts/import_core.py --csv export.csv     # or ingest a portal CSV export
    python3 scripts/import_core.py --sync               # add missing venues to config/conferences.yml

Steps can be combined. Existing hand-curated config entries are never overwritten, except that
a differing core_rating is reported (ISEC is deliberately 'Indian' and is skipped).
"""
import argparse
import csv
import datetime
import json
import os
import re
import sys

import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

CORE_URL = ("https://portal.core.edu.au/conf-ranks/"
            "?search={for_code}&by=for&source=all&sort=arank&page={page}")
# FoR code -> research domain used by the site's grouping
FOR_DOMAINS = {"4612": "se", "4607": "vr"}
# CORE acronym -> key already used in config/conferences.yml
ALIASES = {"VR": "IEEE VR"}
CORE_JSON = os.path.join(ROOT, "data", "core_se.json")
CONFIG_PATH = os.path.join(ROOT, "config", "conferences.yml")
KEEP_RANKS = {"A*", "A"}
# Acronyms whose rating is intentionally not the CORE one.
RATING_OVERRIDES = {"ISEC": "Indian"}


def clean(text):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", text or "")).strip()


def clean_title(title):
    """Drop CORE's editorial parentheticals, e.g. '(was ESEC/FSE, changed 2024; ...)'."""
    return re.sub(r"\s*\((?:was|formerly|renamed|duplicate)[^)]*\)", "", title).strip()


def parse_rows(html):
    """Parse one results page into dicts. Columns: title, acronym, source, rank, note, dblp, for, ..."""
    out = []
    for row in re.findall(r"<tr[^>]*>(.*?)</tr>", html, re.S):
        cells = [clean(c) for c in re.findall(r"<td[^>]*>(.*?)</td>", row, re.S)]
        if len(cells) < 7:
            continue
        out.append({
            "title": clean_title(cells[0]),
            "acronym": cells[1],
            "source": cells[2],
            "rank": cells[3],
            "primary_for": cells[6],
        })
    return out


def total_results(html):
    m = re.search(r"Showing results\s+\d+\s*-\s*\d+\s+of\s+(\d+)", html)
    return int(m.group(1)) if m else None


def fetch_all(for_codes=tuple(FOR_DOMAINS)):
    from playwright.sync_api import sync_playwright
    from playwright_stealth import Stealth

    rows = []
    with Stealth().use_sync(sync_playwright()) as p:
        browser = p.chromium.launch(channel="chrome", headless=False)
        page = browser.new_page()
        for code in for_codes:
            rows.extend(_fetch_for(page, code))
        browser.close()
    return rows


def _fetch_for(page, for_code):
    rows, page_no, total = [], 1, None
    if True:
        while True:
            resp = page.goto(CORE_URL.format(for_code=for_code, page=page_no), wait_until="domcontentloaded")
            if resp is None or resp.status != 200:
                raise SystemExit(f"CORE portal returned {resp.status if resp else 'no response'} "
                                 f"on page {page_no}; use --csv with a portal export instead")
            page.wait_for_timeout(1500)
            html = page.content()
            chunk = parse_rows(html)
            total = total or total_results(html)
            rows.extend(chunk)
            print(f"FoR {for_code} page {page_no}: {len(chunk)} rows (total reported: {total})")
            if not chunk or (total and len(rows) >= total):
                break
            page_no += 1
    return rows


def load_csv(path):
    rows = []
    with open(path, newline="", encoding="utf-8-sig") as f:
        for rec in csv.reader(f):
            # Portal export: id, title, acronym, source, rank, note, dblp, primary FoR, ...
            if len(rec) < 8 or not rec[0].strip().isdigit():
                continue
            rows.append({"title": clean_title(rec[1]), "acronym": rec[2].strip(),
                         "source": rec[3].strip(), "rank": rec[4].strip(),
                         "primary_for": rec[7].strip()})
    return rows


def select(rows, include_secondary=False):
    """Keep A*/A rows, one per acronym (latest source wins), primary FoR 4612 unless asked otherwise."""
    best = {}
    for r in rows:
        if r["rank"] not in KEEP_RANKS or not r["acronym"]:
            continue
        if not include_secondary and r["primary_for"] not in FOR_DOMAINS:
            continue
        cur = best.get(r["acronym"].upper())
        if cur is None or r["source"] > cur["source"]:
            best[r["acronym"].upper()] = r
    return sorted(best.values(), key=lambda r: (r["rank"] != "A*", r["acronym"]))


# (conference month, typical submission month) for new venues; used only to project an
# estimated deadline until a scraper or the maintainer confirms the real one.
TYPICAL_CYCLES = {
    "ICST": (4, 10), "ICSME": (9, 3), "ISSRE": (10, 4), "ESEM": (10, 5), "ECOOP": (7, 11),
    "OOPSLA": (10, 10), "PLDI": (6, 11), "POPL": (1, 7), "TACAS": (4, 10), "BPM": (9, 4),
    "CGO": (3, 9), "ESOP": (4, 10), "ICFP": (9, 3), "CAV": (7, 2), "ASPLOS": (4, 8),
    "SIGMETRICS": (6, 10),
}


def project_cycle(acronym, today=None):
    """Next estimated submission date (15th of the typical month) and the conference year it feeds."""
    today = today or datetime.date.today()
    conf_month, sub_month = TYPICAL_CYCLES.get(acronym.upper(), (6, 1))
    sub = datetime.date(today.year, sub_month, 15)
    if sub <= today:
        sub = datetime.date(today.year + 1, sub_month, 15)
    year = sub.year if conf_month > sub_month else sub.year + 1
    return conf_month, sub_month, sub, year


def stub_entry(rec):
    """Minimal config entry with an *estimated* deadline; scrapers/maintainer confirm it later."""
    conf_month, sub_month, sub, year = project_cycle(rec["acronym"])
    notif = sub + datetime.timedelta(days=75)
    return {
        "full_name": rec["title"],
        "core_rating": rec["rank"],
        "domain": FOR_DOMAINS.get(rec.get("primary_for"), "se"),
        "location": "TBA",
        "country": "",
        "flag": "",
        "year": year,
        "website": "",
        "url_pattern": "",
        "cohosted": [],
        "cycle": {"conference_month": conf_month, "typical_submission_month": sub_month},
        "tracks": [{
            "track_name": "Research paper track",
            "paper_submission_date": sub.isoformat(),
            "abstract_deadline": "",
            "intimation_date": notif.isoformat(),
            "website_url": "",
            "camera_ready_deadline": "",
            "estimated": True,
        }],
        "country_code": "un",
    }


def sync_config(selected, year=2027):
    with open(CONFIG_PATH, encoding="utf-8") as f:
        data = yaml.safe_load(f)
    confs = data["conferences"]
    by_upper = {k.upper(): k for k in confs}
    for core_name, key in ALIASES.items():
        if key.upper() in by_upper:
            by_upper[core_name.upper()] = by_upper[key.upper()]
    added, changed = [], []
    for rec in selected:
        key = by_upper.get(rec["acronym"].upper())
        if key is None:
            confs[rec["acronym"]] = stub_entry(rec)
            added.append(rec["acronym"])
        elif key not in RATING_OVERRIDES and confs[key].get("core_rating") != rec["rank"]:
            changed.append((key, confs[key].get("core_rating"), rec["rank"]))
            confs[key]["core_rating"] = rec["rank"]
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        yaml.safe_dump(data, f, sort_keys=False, allow_unicode=True, width=120)
    print(f"added {len(added)}: {', '.join(added)}")
    for k, old, new in changed:
        print(f"rating changed {k}: {old} -> {new}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--fetch", action="store_true", help="scrape the CORE portal with Playwright")
    ap.add_argument("--csv", help="ingest a CORE portal CSV export instead of scraping")
    ap.add_argument("--sync", action="store_true", help="add missing venues to config/conferences.yml")
    ap.add_argument("--include-secondary", action="store_true",
                    help="also keep rows whose primary FoR is not 4612")
    args = ap.parse_args()

    if args.fetch or args.csv:
        rows = fetch_all() if args.fetch else load_csv(args.csv)
        selected = select(rows, args.include_secondary)
        with open(CORE_JSON, "w", encoding="utf-8") as f:
            json.dump(selected, f, indent=2, ensure_ascii=False)
        print(f"wrote {len(selected)} A*/A venues to {CORE_JSON}")
    if args.sync:
        with open(CORE_JSON, encoding="utf-8") as f:
            sync_config(json.load(f))
    if not (args.fetch or args.csv or args.sync):
        ap.print_help()


if __name__ == "__main__":
    main()
