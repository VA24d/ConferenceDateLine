"""Unified static data builder for Conference DateLine.

Reads master conference configuration from config/conferences.yml,
synchronizes data/conferences.csv and data/deadlines.json,
and generates individual static conference pages in conferences/.
"""
import csv
import json
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
CSV_PATH = os.path.join(ROOT, "data", "conferences.csv")
JSON_PATH = os.path.join(ROOT, "data", "deadlines.json")
TEMPLATE_PATH = os.path.join(ROOT, "conference.html")
CONFERENCES_DIR = os.path.join(ROOT, "conferences")


def conf_slug(name: str) -> str:
    """Generate URL-safe slug for conference names."""
    return name.lower().replace(" ", "-")


def load_master_config(config_path: str = CONFIG_PATH) -> dict:
    """Load conferences configuration from YAML."""
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Configuration file not found: {config_path}")
    with open(config_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}
    return data.get("conferences", {})


def build_deadlines(conferences: dict) -> list:
    """Flatten conference tracks & workshops into deadline entries."""
    deadlines = []
    for conf_name, conf_data in conferences.items():
        core = conf_data.get("core_rating", "Unranked")
        loc = conf_data.get("location", "TBA")
        flag = conf_data.get("flag", "🌐")
        cohosted = conf_data.get("cohosted", [])
        year = str(conf_data.get("year", "2027"))
        website = conf_data.get("website", "#")

        for item in conf_data.get("tracks", []):
            entry = {
                "conference_name": conf_name,
                "track_name": item.get("track_name") or "",
                "workshop_name": item.get("workshop_name") or None,
                "paper_submission_date": item.get("paper_submission_date") or None,
                "abstract_deadline": item.get("abstract_deadline") or None,
                "intimation_date": item.get("intimation_date") or None,
                "website_url": item.get("website_url") or website,
                "core_rating": core,
                "location": loc,
                "flag": flag,
                "year": year,
                "cohosted": cohosted,
            }
            deadlines.append(entry)
    return deadlines


def write_csv(deadlines: list, csv_path: str = CSV_PATH):
    """Write deadlines out to CSV for backwards-compatibility."""
    os.makedirs(os.path.dirname(csv_path), exist_ok=True)
    fieldnames = [
        "conference_name",
        "track_name",
        "workshop_name",
        "paper_submission_date",
        "abstract_deadline",
        "intimation_date",
        "website_url",
    ]
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for d in deadlines:
            writer.writerow({
                "conference_name": d["conference_name"],
                "track_name": d["track_name"] or "",
                "workshop_name": d["workshop_name"] or "",
                "paper_submission_date": d["paper_submission_date"] or "",
                "abstract_deadline": d["abstract_deadline"] or "",
                "intimation_date": d["intimation_date"] or "",
                "website_url": d["website_url"] or "",
            })
    print(f"✓ Synchronized {csv_path} ({len(deadlines)} rows)")


def write_json(deadlines: list, json_path: str = JSON_PATH):
    """Write enriched deadlines out to JSON for frontend usage."""
    os.makedirs(os.path.dirname(json_path), exist_ok=True)
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(deadlines, f, indent=2, ensure_ascii=False)
    print(f"✓ Wrote {json_path} ({len(deadlines)} entries)")


def generate_conference_pages(conferences: dict, template_path: str = TEMPLATE_PATH, out_dir: str = CONFERENCES_DIR):
    """Generate static HTML pages for each conference in the conferences/ directory."""
    if not os.path.exists(template_path):
        print(f"Warning: Template {template_path} not found. Skipping HTML generation.")
        return

    with open(template_path, "r", encoding="utf-8") as f:
        raw_template = f.read()

    os.makedirs(out_dir, exist_ok=True)

    # Adjust asset links for child directory placement (conferences/ -> ../)
    subpage_template = (
        raw_template
        .replace('href="styles.css"', 'href="../styles.css"')
        .replace('src="app.js"', 'src="../app.js"')
        .replace('href="index.html"', 'href="../index.html"')
    )

    generated_files = []
    for conf_name, meta in conferences.items():
        slug = conf_slug(conf_name)
        flag = meta.get("flag", "🌐")
        year = str(meta.get("year", "2027"))
        core = meta.get("core_rating", "Unranked")
        full_name = meta.get("full_name", f"{conf_name} Conference")
        loc = meta.get("location", "TBA")
        website = meta.get("website", "#")

        page_content = subpage_template
        page_content = re.sub(
            r'<body\s+data-page="conference"[^>]*>',
            f'<body data-page="conference" data-conf="{conf_name}">',
            page_content
        )
        page_content = re.sub(
            r'<title>.*?</title>',
            f'<title>{conf_name} {flag} - Conference Deadlines & Tracks</title>',
            page_content
        )
        page_content = re.sub(
            r'<h1\s+id="hero-title">.*?</h1>',
            f'<h1 id="hero-title">{conf_name} {year}</h1>',
            page_content
        )
        page_content = re.sub(
            r'<span\s+class="hero-flag"\s+id="hero-flag">.*?</span>',
            f'<span class="hero-flag" id="hero-flag">{flag}</span>',
            page_content
        )
        page_content = re.sub(
            r'<span\s+class="core-badge"\s+id="hero-core-badge">.*?</span>',
            f'<span class="core-badge" id="hero-core-badge">CORE {core}</span>',
            page_content
        )
        page_content = re.sub(
            r'<p\s+class="hero-subtitle"\s+id="hero-desc">.*?</p>',
            f'<p class="hero-subtitle" id="hero-desc">{full_name}</p>',
            page_content
        )
        page_content = re.sub(
            r'<span\s+id="hero-location">.*?</span>',
            f'<span id="hero-location">{loc}</span>',
            page_content
        )
        page_content = re.sub(
            r'<span\s+id="hero-year">.*?</span>',
            f'<span id="hero-year">{year}</span>',
            page_content
        )
        page_content = re.sub(
            r'<a\s+[^>]*id="hero-website-link"[^>]*>.*?</a>',
            f'<a href="{website}" target="_blank" rel="noopener noreferrer" class="hero-external-link" id="hero-website-link">Official Website ↗</a>',
            page_content
        )

        out_file = os.path.join(out_dir, f"{slug}.html")
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(page_content)
        generated_files.append(out_file)

    print(f"✓ Generated {len(generated_files)} conference pages in {out_dir}/")


def main():
    print("Building Conference DateLine static assets...")
    conferences = load_master_config()
    deadlines = build_deadlines(conferences)
    write_csv(deadlines)
    write_json(deadlines)
    generate_conference_pages(conferences)
    print("✓ Static build complete!")


if __name__ == "__main__":
    main()
