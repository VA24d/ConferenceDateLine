"""Decide which feed entries matter to this tracker.

Only conferences listed in config/conferences.yml are ever written back. Everything else from a feed
is either dropped or, when it matches our research topics, reported by ``--discover`` so a human can
decide whether to start tracking it.
"""
import re
from typing import Iterable, Optional, Tuple

# Feed spellings that differ from the names used in config/conferences.yml (keys are normalised).
ALIASES = {
    "CHIPLAY": "CHI PLAY",
    "IEEEVR": "IEEE VR",
    "VR": "IEEE VR",
    "IEEEVRVRW": "IEEE VR",
    "ISMARCONFERENCEPAPERS": "ISMAR",
    "ISMARJOURNALPAPERS": "ISMAR",
}

# Suffix used by se-deadlines for sub-tracks -> keywords that appear in our track names.
SUBTRACK_KEYWORDS = {
    "SEIP": ("practice",), "IP": ("practice",), "IIP": ("industr",), "IS": ("industry",),
    "SEIS": ("society",),
    "NIER": ("new ideas",), "ERA": ("new ideas", "early"), "IDEAS": ("new ideas",), "RENE": ("negative",),
    "JF": ("journal",), "JFT": ("journal",), "JFP": ("journal",), "J1C2": ("journal",),
    "SEET": ("education",), "SEE": ("education",), "EDU": ("education",),
    "DS": ("doctoral",), "DC": ("doctoral",),
    "SRC": ("student",),
    "TUT": ("tutorial",), "T&TB": ("tutorial",),
    "TD": ("tool",), "DT": ("tool",),
    "ART": ("research",), "RP": ("research",), "RPT": ("research",),
    "RR": ("reproduc", "registered", "replication"),
    "ICT": ("challenge",),
    "AT": ("artifact", "tool"),
}

# Topics we care about; used only for discovery of conferences we do not track yet.
TOPIC_KEYWORDS = (
    "software engineering", "software architecture", "software testing", "program comprehension",
    "requirements engineering", "mining software", "model driven", "model-driven", "self-adaptive",
    "software maintenance", "empirical software", "automated software", "agentic", "multiagent",
    "multi-agent", "autonomous agents", "virtual reality", "augmented reality", "mixed reality",
    "extended reality", "spatial user interaction", "serious games", "game", "play",
)
TOPIC_ACRONYM_WORDS = re.compile(r"\b(VR|AR|XR|MR|SE|LLM|AI)\b")


def normalize(name: str) -> str:
    """Upper-case and strip everything except letters/digits, dropping '(…)' qualifiers."""
    name = re.sub(r"\([^)]*\)", "", name or "")
    return re.sub(r"[^A-Za-z0-9]", "", name).upper()


def match_conference(feed_title: str, tracked: Iterable[str]) -> Tuple[Optional[str], str]:
    """Map a feed title to ``(tracked conference name, sub-track suffix)``.

    'ICSE-SEIP' -> ('ICSE', 'SEIP'); 'CHI Play' -> ('CHI PLAY', ''); 'Foo' -> (None, '').
    Longest tracked name wins so 'IEEE VR' is not confused with 'VR'.
    """
    raw = feed_title or ""
    qualifier = " ".join(re.findall(r"\(([^)]*)\)", raw)).strip().upper()
    title = re.sub(r"\([^)]*\)", "", raw).strip()
    norm_all = normalize(title)
    tracked = list(tracked)
    by_norm = {normalize(t): t for t in tracked}
    for alias, target in ALIASES.items():
        if target in tracked:
            by_norm.setdefault(alias, target)

    if norm_all in by_norm:
        return by_norm[norm_all], qualifier

    # "<CONF>-<SUBTRACK>" / "<CONF> <SUBTRACK>" / "<CONF>@Foo": the head must be exactly a tracked name
    for sep in ("-", " ", "@", "/"):
        if sep in title:
            head, _, tail = title.partition(sep)
            if normalize(head) in by_norm:
                return by_norm[normalize(head)], (tail.strip().upper() or qualifier)
    # Multi-word conference names followed by a qualifier, e.g. "CHI PLAY Showcase"
    for tn, tname in sorted(by_norm.items(), key=lambda kv: -len(kv[0])):
        if " " in tname and title.upper().startswith(tname.upper() + " "):
            return tname, title[len(tname):].strip().upper()
    return None, ""


def subtrack_matches(suffix: str, track_name: str) -> bool:
    """Does a feed sub-track suffix (e.g. 'SEIP') describe the given track name?"""
    if not suffix:
        return False
    track = (track_name or "").lower()
    keywords = SUBTRACK_KEYWORDS.get(suffix.upper().strip("!"), ())
    if any(k in track for k in keywords):
        return True
    if normalize(suffix) and normalize(suffix) in normalize(track_name):
        return True
    return any(len(w) > 3 and w.lower() in track for w in re.findall(r"[A-Za-z]+", suffix))


MAIN_QUALIFIERS = {"", "RP", "RPT", "ART", "CONFERENCE PAPERS", "RESEARCH", "MAIN", "FULL PAPERS"}


def is_main_suffix(suffix: str) -> bool:
    return (suffix or "").upper().strip() in MAIN_QUALIFIERS


def is_main_track(track: dict) -> bool:
    """A conference-level feed deadline describes the main research track, never a workshop or side track."""
    if track.get("workshop_name"):
        return False
    name = (track.get("track_name") or "").strip().lower()
    return bool(re.match(r"^(research|main|technical|full)\b", name)) and not any(
        k in name for k in ("short", "poster", "demo", "industr", "journal", "student", "tutorial", "reproduc", "registered")
    )


def is_topic_relevant(*texts: str) -> bool:
    blob = " ".join(t for t in texts if t)
    low = blob.lower()
    if any(k in low for k in TOPIC_KEYWORDS):
        return True
    return bool(TOPIC_ACRONYM_WORDS.search(blob))
