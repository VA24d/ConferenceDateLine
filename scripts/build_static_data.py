"""Export data/conferences.csv to data/deadlines.json for the static (GitHub Pages) site,
enrich with CORE ratings, locations, and flags, and generate individual conference pages."""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "backend"))

from data_loader import DataLoader  # noqa: E402

CONFERENCE_METADATA = {
    "ICSE": {
        "full_name": "International Conference on Software Engineering",
        "core_rating": "A*",
        "location": "Dublin, Ireland",
        "country": "Ireland",
        "flag": "🇮🇪",
        "year": "2027",
        "cohosted": ["SEAMS", "CAIN", "AGENT", "MSR", "ICPC", "LLM4Code", "DeepTest", "ChainSEC"],
    },
    "FSE": {
        "full_name": "ACM International Conference on the Foundations of Software Engineering",
        "core_rating": "A*",
        "location": "Shenzhen, China",
        "country": "China",
        "flag": "🇨🇳",
        "year": "2027",
        "cohosted": ["LLMTrust Workshop", "CauSE Workshop", "SRC Track"],
    },
    "ISSTA": {
        "full_name": "International Symposium on Software Testing and Analysis",
        "core_rating": "A",
        "location": "Singapore",
        "country": "Singapore",
        "flag": "🇸🇬",
        "year": "2027",
        "cohosted": ["ISSTA Tool Demos", "Doctoral Symposium"],
    },
    "SANER": {
        "full_name": "IEEE International Conference on Software Analysis, Evolution and Reengineering",
        "core_rating": "A",
        "location": "Richmond, Virginia, USA",
        "country": "United States",
        "flag": "🇺🇸",
        "year": "2027",
        "cohosted": ["IWESEP", "ERA Track", "RENE Track"],
    },
    "EASE": {
        "full_name": "International Conference on Evaluation and Assessment in Software Engineering",
        "core_rating": "A",
        "location": "Hanoi, Vietnam",
        "country": "Vietnam",
        "flag": "🇻🇳",
        "year": "2027",
        "cohosted": ["Emerging Results Track", "Doctoral Symposium"],
    },
    "IEEE VR": {
        "full_name": "IEEE Conference on Virtual Reality and 3D User Interfaces",
        "core_rating": "A*",
        "location": "Melbourne, Australia",
        "country": "Australia",
        "flag": "🇦🇺",
        "year": "2027",
        "cohosted": ["3DUI Symposium", "KELVAR", "SEARIS", "OpenXRS", "XR-Health"],
    },
    "ISMAR": {
        "full_name": "IEEE International Symposium on Mixed and Augmented Reality",
        "core_rating": "A*",
        "location": "Bari, Italy",
        "country": "Italy",
        "flag": "🇮🇹",
        "year": "2027",
        "cohosted": ["XR-Health Workshop", "MAR Art & Design", "Doctoral Consortium"],
    },
    "VRST": {
        "full_name": "ACM Symposium on Virtual Reality Software and Technology",
        "core_rating": "A",
        "location": "Sendai, Japan",
        "country": "Japan",
        "flag": "🇯🇵",
        "year": "2026",
        "cohosted": ["Virtual Reality Technologies Workshop", "Posters & Demos"],
    },
    "CHI PLAY": {
        "full_name": "ACM SIGCHI Annual Symposium on Computer-Human Interaction in Play",
        "core_rating": "A",
        "location": "Zurich, Switzerland",
        "country": "Switzerland",
        "flag": "🇨🇭",
        "year": "2026",
        "cohosted": ["Serious Games & VR Showcase", "CHI PLAY WIP & Demos"],
    },
    "ICSA": {
        "full_name": "IEEE International Conference on Software Architecture",
        "core_rating": "A",
        "location": "Amsterdam, Netherlands",
        "country": "Netherlands",
        "flag": "🇳🇱",
        "year": "2026",
        "cohosted": ["CAAIN Workshop", "NEMI Track", "Architecture in Practice"],
    },
    "SEAMS": {
        "full_name": "International Symposium on Software Engineering for Adaptive and Self-Managing Systems",
        "core_rating": "A",
        "location": "Dublin, Ireland (Co-located with ICSE 2027)",
        "country": "Ireland",
        "flag": "🇮🇪",
        "year": "2027",
        "cohosted": ["ICSE", "CAIN", "AGENT", "MSR", "ICPC"],
    },
    "AGENT": {
        "full_name": "International Workshop on Agentic Engineering (Agentic AI in SE)",
        "core_rating": "Workshop",
        "location": "Dublin, Ireland (Co-located with ICSE 2027)",
        "country": "Ireland",
        "flag": "🇮🇪",
        "year": "2027",
        "cohosted": ["ICSE", "SEAMS", "CAIN"],
    },
    "CAIN": {
        "full_name": "IEEE/ACM International Conference on AI Engineering – Software Engineering for AI",
        "core_rating": "A",
        "location": "Dublin, Ireland (Co-located with ICSE 2027)",
        "country": "Ireland",
        "flag": "🇮🇪",
        "year": "2027",
        "cohosted": ["ICSE", "SEAMS", "AGENT"],
    },
    "MODELS": {
        "full_name": "ACM/IEEE International Conference on Model Driven Engineering Languages and Systems",
        "core_rating": "A",
        "location": "Linz, Austria",
        "country": "Austria",
        "flag": "🇦🇹",
        "year": "2026",
        "cohosted": ["SAM (System Analysis and Modelling)", "MDE4AI Workshop"],
    },
    "ISEC": {
        "full_name": "Innovations in Software Engineering Conference",
        "core_rating": "A",
        "location": "Hyderabad, India",
        "country": "India",
        "flag": "🇮🇳",
        "year": "2026",
        "cohosted": ["ModSym (Modelling Symposium)", "VR in Software Engineering Track"],
    },
    "ECSA": {
        "full_name": "European Conference on Software Architecture",
        "core_rating": "A",
        "location": "Limassol, Cyprus",
        "country": "Cyprus",
        "flag": "🇨🇾",
        "year": "2026",
        "cohosted": ["Agentic AI & Sustainable Software Track", "ECSA Workshops"],
    },
    "MSR": {
        "full_name": "Mining Software Repositories",
        "core_rating": "A",
        "location": "Dublin, Ireland (Co-located with ICSE 2027)",
        "country": "Ireland",
        "flag": "🇮🇪",
        "year": "2027",
        "cohosted": ["ICSE", "ICPC", "SEAMS"],
    },
    "ICPC": {
        "full_name": "IEEE/ACM International Conference on Program Comprehension",
        "core_rating": "A",
        "location": "Dublin, Ireland (Co-located with ICSE 2027)",
        "country": "Ireland",
        "flag": "🇮🇪",
        "year": "2027",
        "cohosted": ["ICSE", "MSR", "SEAMS"],
    },
}

def conf_slug(name):
    return name.lower().replace(" ", "-")

def main():
    loader = DataLoader(os.path.join(ROOT, "data", "conferences.csv"))
    deadlines = loader.get_deadlines_for_timeline()

    # Enrich deadlines with metadata
    for d in deadlines:
        conf = d.get("conference_name")
        meta = CONFERENCE_METADATA.get(conf, {})
        d["core_rating"] = d.get("core_rating") or meta.get("core_rating", "Unranked")
        d["location"] = d.get("location") or meta.get("location", "TBA")
        d["flag"] = d.get("flag") or meta.get("flag", "🌐")
        d["cohosted"] = meta.get("cohosted", [])

    out = os.path.join(ROOT, "data", "deadlines.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(deadlines, f, indent=2)
    print(f"wrote {out} ({len(deadlines)} entries)")

    # Generate individual conference HTML pages
    conf_template_path = os.path.join(ROOT, "conference.html")
    if os.path.exists(conf_template_path):
        with open(conf_template_path, "r", encoding="utf-8") as f:
            template_content = f.read()

        unique_confs = sorted(list({d.get("conference_name") for d in deadlines if d.get("conference_name")}))
        for conf in unique_confs:
            meta = CONFERENCE_METADATA.get(conf, {})
            flag = meta.get("flag", "🌐")
            conf_filename = f"{conf.lower()}.html"
            conf_filename = f"{conf_slug(conf)}.html"
            page_content = template_content.replace(
                '<body data-page="conference">',
                f'<body data-page="conference" data-conf="{conf}">'
            ).replace(
                '<title>Conference Tracker - Dedicated View</title>',
                f'<title>{conf} {flag} - Conference Deadlines & Tracks</title>'
            )
            dest_path = os.path.join(ROOT, conf_filename)
            with open(dest_path, "w", encoding="utf-8") as f:
                f.write(page_content)
            print(f"generated dedicated conference page: {conf_filename}")

if __name__ == "__main__":
    main()
