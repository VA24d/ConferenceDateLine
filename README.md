# Conference Deadline Tracker

A web-based interface for tracking conference deadlines, tracks, and workshops with visual timeline display.

## Features

- View deadlines for multiple conferences and their tracks
- Visual timeline showing:
  - Paper submission date (start - green marker)
  - Abstract deadline (yellow marker, if applicable)
  - Notification/intimation date (end - red marker)
- Filter by conference
- Data source: CSV file (local or OneDrive URL)
- Future-ready for web scraping integration

## Project Structure

```
researchDashboard/
├── backend/                 # Python Flask server
│   ├── app.py              # Main Flask application
│   ├── models.py           # Data models
│   ├── data_loader.py      # CSV/OneDrive data loading
│   ├── scraper.py          # Placeholder for future scraper
│   └── requirements.txt    # Python dependencies
├── frontend/               # Web interface
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── data/
│   └── conferences.csv     # Conference deadline data
└── README.md
```

## Setup Instructions

### Backend Setup

1. Install Python 3.8+ and pip

2. Navigate to the backend directory:
```bash
cd researchDashboard/backend
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the Flask server:
```bash
python app.py
```

The API will be available at `http://localhost:5000`

### Frontend Setup

The frontend is served by the Flask backend. Once the backend is running, open:
```
http://localhost:5000
```

### Data Configuration

By default, the system reads from `data/conferences.csv`. To use a different data source:

1. Set the `CONFERENCE_DATA_PATH` environment variable:
```bash
# Local file
export CONFERENCE_DATA_PATH=/path/to/your/conferences.csv

# OneDrive URL
export CONFERENCE_DATA_PATH=https://your-onedrive-link-to-csv
```

2. Restart the Flask server

### CSV Format

```csv
conference_name,track_name,workshop_name,paper_submission_date,abstract_deadline,intimation_date
ICSE 2025,Main Track,,2024-10-15,2024-10-08,2025-02-15
ICSE 2025,,Workshop on AI,2024-12-01,2024-11-20,2025-03-15
```

- `conference_name`: Name of the conference
- `track_name`: Track name (optional)
- `workshop_name`: Workshop name (optional)
- `paper_submission_date`: Paper submission deadline (YYYY-MM-DD)
- `abstract_deadline`: Abstract deadline (optional, YYYY-MM-DD)
- `intimation_date`: Notification date (YYYY-MM-DD)

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/conferences` | GET | List all conferences with tracks |
| `/api/deadlines` | GET | Get all deadlines for timeline |
| `/api/conferences/{name}/tracks` | GET | Get tracks for a conference |
| `/api/workshops` | POST | Add a new workshop |
| `/api/health` | GET | Health check |

## Future Development

The `scraper.py` module is ready for implementation to automatically scrape conference websites. Planned features:
- Web scraping for conference deadline extraction
- Scheduled updates
- Multi-source data aggregation

## License

MIT License
## GitHub Pages

The site is fully static: `index.html`, `app.js`, `styles.css` and `data/deadlines.json`. There is no backend and no in-browser editing.

To update deadlines, edit `data/conferences.csv` and push to `main`. The workflow in `.github/workflows/pages.yml` regenerates `data/deadlines.json` and deploys. To preview locally:

```
python3 scripts/build_static_data.py
python3 -m http.server
```

One-time setup: repo Settings → Pages → Source → **GitHub Actions**.

The Flask backend in `backend/` is kept only as the CSV loader used by the build script.


## Scraping deadlines

`python scripts/scrape_deadlines.py --all` refreshes dates in `config/conferences.yml` (then rebuilds the data files and pages).
Only conferences already in the config are updated. Sources are tried in this order, first hit wins:

1. the track's official page
2. [se-deadlines](https://se-deadlines.github.io) (software engineering)
3. [hci-deadlines](https://hci-deadlines.github.io) (HCI, VR/AR, games)
4. [WikiCFP](http://www.wikicfp.com/cfp/home) (main tracks only, throttled)

A confirmed date clears the track's `estimated` flag; anything no source can confirm is left untouched.

| Flag | Purpose |
| --- | --- |
| `--dry-run` | print changes, write nothing |
| `--sources web,se,hci,wikicfp` | restrict sources |
| `--discover` | list untracked venues matching our topics (SE, architecture, agents, VR/AR/XR, games) |
| `--validate` | cross-check year/location of tracked SIGCHI venues against [sigchi.org](https://sigchi.org/conferences/upcoming/) |

## CORE import (FoR 4612 A*/A)

```
python3 scripts/import_core.py --fetch --sync   # Playwright+stealth scrape -> data/core_se.json, add missing venues
python3 scripts/import_core.py --csv export.csv --sync   # or from a portal CSV export
python3 scripts/build_static_data.py
```

New venues get an *estimated* deadline from `TYPICAL_CYCLES` until a scraper or maintainer confirms it. ISEC is labelled `Indian` (not CORE-ranked).
