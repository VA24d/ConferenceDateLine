"""Export data/conferences.csv to data/deadlines.json for the static (GitHub Pages) site."""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "backend"))

from data_loader import DataLoader  # noqa: E402

loader = DataLoader(os.path.join(ROOT, "data", "conferences.csv"))
out = os.path.join(ROOT, "data", "deadlines.json")
with open(out, "w", encoding="utf-8") as f:
    json.dump(loader.get_deadlines_for_timeline(), f, indent=2)
print(f"wrote {out}")
