/**
 * Conference Deadline Tracker - Frontend JavaScript
 * Supports All Conferences View and Dedicated Conference Pages,
 * AoE Local Time Conversions, User Memory & Pinned Targets,
 * Dual View Switcher (Timeline & Cards), Domain Grouping (SE Closed by Default),
 * Sorting, CORE Rating Filtering, Locations, and Flat SVG Flags.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Software Engineering (SE) Conferences classification
    const SE_CONFERENCES = new Set([
        'ICSE', 'FSE', 'ISSTA', 'SANER', 'EASE', 'ICSA', 'SEAMS',
        'AGENT', 'CAIN', 'MODELS', 'ISEC', 'ECSA', 'MSR', 'ICPC',
        'ASE', 'RE'
    ]);

    // Conference Metadata (Locations, CORE ratings, Year, etc.)
    const CONFERENCE_METADATA = {
        'ICSE': {
            fullName: "International Conference on Software Engineering",
            coreRating: "A*",
            location: "Dublin, Ireland",
            country: "Ireland",
            country_code: "ie",
            year: "2027",
            website: "https://conf.researchr.org/home/icse-2027",
            cohosted: ["SEAMS", "CAIN", "AGENT", "MSR", "ICPC", "LLM4Code", "DeepTest", "ChainSEC"]
        },
        'FSE': {
            fullName: "ACM International Conference on the Foundations of Software Engineering",
            coreRating: "A*",
            location: "Shenzhen, China",
            country: "China",
            country_code: "cn",
            year: "2027",
            website: "https://conf.researchr.org/home/fse-2027",
            cohosted: ["LLMTrust Workshop", "CauSE Workshop", "Student Research Competition"]
        },
        'ISSTA': {
            fullName: "International Symposium on Software Testing and Analysis",
            coreRating: "A",
            location: "Singapore",
            country: "Singapore",
            country_code: "sg",
            year: "2027",
            website: "https://conf.researchr.org/home/issta-2027",
            cohosted: ["ISSTA Tool Demos", "Doctoral Symposium"]
        },
        'SANER': {
            fullName: "IEEE International Conference on Software Analysis, Evolution and Reengineering",
            coreRating: "A",
            location: "Richmond, Virginia, USA",
            country: "United States",
            country_code: "us",
            year: "2027",
            website: "https://conf.researchr.org/home/saner-2027",
            cohosted: ["IWESEP", "ERA Track", "RENE Track"]
        },
        'EASE': {
            fullName: "International Conference on Evaluation and Assessment in Software Engineering",
            coreRating: "A",
            location: "Hanoi, Vietnam",
            country: "Vietnam",
            country_code: "vn",
            year: "2027",
            website: "https://conf.researchr.org/home/ease-2027",
            cohosted: ["Emerging Results Track", "Doctoral Symposium"]
        },
        'IEEE VR': {
            fullName: "IEEE Conference on Virtual Reality and 3D User Interfaces",
            coreRating: "A*",
            location: "Melbourne, Australia",
            country: "Australia",
            country_code: "au",
            year: "2027",
            website: "https://ieeevr.org/2027/",
            cohosted: ["3DUI Symposium", "KELVAR", "SEARIS", "OpenXRS", "XR-Health"]
        },
        'ISMAR': {
            fullName: "IEEE International Symposium on Mixed and Augmented Reality",
            coreRating: "A*",
            location: "Bari, Italy",
            country: "Italy",
            country_code: "it",
            year: "2027",
            website: "https://www.ismar.net/",
            cohosted: ["XR-Health Workshop", "MAR Art & Design", "Doctoral Consortium"]
        },
        'VRST': {
            fullName: "ACM Symposium on Virtual Reality Software and Technology",
            coreRating: "A",
            location: "Sendai, Japan",
            country: "Japan",
            country_code: "jp",
            year: "2026",
            website: "https://vrst.acm.org/",
            cohosted: ["Virtual Reality Technologies Workshop", "Posters & Demos"]
        },
        'CHI PLAY': {
            fullName: "ACM SIGCHI Annual Symposium on Computer-Human Interaction in Play",
            coreRating: "A",
            location: "York, United Kingdom",
            country: "United Kingdom",
            country_code: "gb",
            year: "2026",
            website: "https://chiplay.acm.org/2026/",
            cohosted: ["Serious Games & VR Showcase", "CHI PLAY WIP & Demos"]
        },
        'ICSA': {
            fullName: "IEEE International Conference on Software Architecture",
            coreRating: "A",
            location: "Amsterdam, Netherlands",
            country: "Netherlands",
            country_code: "nl",
            year: "2027",
            website: "https://conf.researchr.org/home/icsa-2027",
            cohosted: ["CAAIN Workshop", "NEMI Track", "Architecture in Practice"]
        },
        'SEAMS': {
            fullName: "International Symposium on Software Engineering for Adaptive and Self-Managing Systems",
            coreRating: "A",
            location: "Dublin, Ireland (Co-located with ICSE 2027)",
            country: "Ireland",
            country_code: "ie",
            year: "2027",
            website: "https://conf.researchr.org/home/seams-2026",
            cohosted: ["ICSE", "CAIN", "AGENT", "MSR", "ICPC"]
        },
        'AGENT': {
            fullName: "International Conference on Agent-Based Software Engineering",
            coreRating: "A* Co-located",
            location: "Dublin, Ireland (Co-located with ICSE 2027)",
            country: "Ireland",
            country_code: "ie",
            year: "2027",
            website: "https://conf.researchr.org/home/icse-2027/agent-2027",
            cohosted: ["ICSE", "SEAMS", "CAIN"]
        },
        'CAIN': {
            fullName: "IEEE/ACM International Conference on AI Engineering \u2013 Software Engineering for AI",
            coreRating: "A",
            location: "Dublin, Ireland (Co-located with ICSE 2027)",
            country: "Ireland",
            country_code: "ie",
            year: "2027",
            website: "https://conf.researchr.org/home/cain-2026",
            cohosted: ["ICSE", "SEAMS", "AGENT"]
        },
        'MODELS': {
            fullName: "ACM/IEEE International Conference on Model Driven Engineering Languages and Systems",
            coreRating: "A",
            location: "Linz, Austria",
            country: "Austria",
            country_code: "at",
            year: "2027",
            website: "https://conf.researchr.org/home/models-2027",
            cohosted: ["SAM (System Analysis and Modelling)", "MDE4AI Workshop"]
        },
        'ISEC': {
            fullName: "Innovations in Software Engineering Conference",
            coreRating: "A",
            location: "Hyderabad, India",
            country: "India",
            country_code: "in",
            year: "2027",
            website: "https://conf.researchr.org/home/isec-2027",
            cohosted: ["ModSym (Modelling Symposium)", "VR in Software Engineering Track"]
        },
        'ECSA': {
            fullName: "European Conference on Software Architecture",
            coreRating: "A",
            location: "Limassol, Cyprus",
            country: "Cyprus",
            country_code: "cy",
            year: "2027",
            website: "https://conf.researchr.org/home/ecsa-2027",
            cohosted: ["Agentic AI & Sustainable Software Track", "ECSA Workshops"]
        },
        'MSR': {
            fullName: "Mining Software Repositories",
            coreRating: "A",
            location: "Dublin, Ireland (Co-located with ICSE 2027)",
            country: "Ireland",
            country_code: "ie",
            year: "2027",
            website: "https://conf.researchr.org/home/msr-2027",
            cohosted: ["ICSE", "ICPC", "SEAMS"]
        },
        'ICPC': {
            fullName: "IEEE/ACM International Conference on Program Comprehension",
            coreRating: "A",
            location: "Dublin, Ireland (Co-located with ICSE 2027)",
            country: "Ireland",
            country_code: "ie",
            year: "2027",
            website: "https://conf.researchr.org/home/icpc-2027",
            cohosted: ["ICSE", "MSR", "SEAMS"]
        },
        'AAMAS': {
            fullName: "International Conference on Autonomous Agents and Multiagent Systems",
            coreRating: "A*",
            location: "Paphos, Cyprus",
            country: "Cyprus",
            country_code: "cy",
            year: "2027",
            website: "https://cyprusconferences.org/aamas2026/",
            cohosted: ["Blue Sky Ideas Track", "Demonstrations Track", "Doctoral Consortium"]
        },
        'ASE': {
            fullName: "IEEE/ACM International Conference on Automated Software Engineering",
            coreRating: "A*",
            location: "Munich, Germany",
            country: "Germany",
            country_code: "de",
            year: "2027",
            website: "https://conf.researchr.org/home/ase-2026",
            cohosted: ["Industry Showcase Track", "Tool Demonstrations Track"]
        },
        'RE': {
            fullName: "IEEE International Requirements Engineering Conference",
            coreRating: "A",
            location: "Montreal, Canada",
            country: "Canada",
            country_code: "ca",
            year: "2027",
            website: "https://conf.researchr.org/home/re-2026",
            cohosted: ["RE@Next! Track", "Industrial Innovation Track"]
        }
    };

    function getMeta(confName) {
        if (!confName) return { fullName: 'Unknown', coreRating: 'Unranked', location: 'TBA', year: '2027', website: '#', cohosted: [] };
        const key = confName.toUpperCase();
        for (const [k, v] of Object.entries(CONFERENCE_METADATA)) {
            if (k.toUpperCase() === key) return v;
        }
        return { fullName: confName, coreRating: 'Unranked', location: 'TBA', year: '2027', website: '#', cohosted: [] };
    }

    // Escape text for safe interpolation into HTML (data comes from scraped JSON / user input)
    function esc(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, ch => (
            { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
        ));
    }

    // Only allow http(s) links; anything else (javascript:, data:) becomes ''
    function safeUrl(url) {
        if (!url || url === '#') return '';
        try {
            const u = new URL(url, window.location.href);
            return (u.protocol === 'http:' || u.protocol === 'https:') ? u.href : '';
        } catch (e) {
            return '';
        }
    }

    // localStorage can throw (private mode, blocked storage)
    function storageGet(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    }
    function storageSet(key, value) {
        try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
    }

    const DAY_MS = 86400000;

    // Dates rolled forward from a previous cycle are projections, not confirmed by the conference
    const EST_TITLE = 'Estimated: projected from the previous cycle, not yet confirmed by the conference';
    const EST_BADGE_HTML = `<span class="est-badge" title="${EST_TITLE}">Est.</span>`;

    // Days until an AoE deadline (negative = passed) + CSS status class + label
    function getDeadlineStatus(dateStr) {
        const due = parseAoeDate(dateStr);
        if (!due) return null;
        const days = Math.ceil((due.getTime() - Date.now()) / DAY_MS);
        let statusClass = 'days-status-safe';
        if (days < 0) statusClass = 'days-status-past';
        else if (days <= 10) statusClass = 'days-status-urgent';
        else if (days <= 30) statusClass = 'days-status-soon';
        else if (days <= 60) statusClass = 'days-status-medium';
        const label = days > 0 ? `${days}d left` : days === 0 ? 'Due Today' : `Passed ${Math.abs(days)}d ago`;
        return { days, statusClass, label };
    }

    function findDeadline(confName, trackName) {
        const confNorm = (confName || '').toUpperCase();
        const trackNorm = (trackName || 'Main Track').toUpperCase();
        return allDeadlines.find(d => (d.conference_name || '').toUpperCase() === confNorm &&
            (d.workshop_name || d.track_name || 'Main Track').toUpperCase() === trackNorm);
    }

    const isInSubfolder = window.location.pathname.includes('/conferences/');
    const isConferencePage = document.body.dataset.page === 'conference';

    function confSlug(name) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return isInSubfolder ? `${slug}.html` : `conferences/${slug}.html`;
    }

    // Flat SVG Flags lookup table (country name -> ISO code)
    const COUNTRY_CODES = {
        'Ireland': 'ie', 'China': 'cn', 'Singapore': 'sg', 'United States': 'us', 'USA': 'us',
        'Vietnam': 'vn', 'Australia': 'au', 'Italy': 'it', 'Japan': 'jp', 'Switzerland': 'ch',
        'Netherlands': 'nl', 'Austria': 'at', 'India': 'in', 'Cyprus': 'cy', 'Denmark': 'dk',
        'Germany': 'de', 'Canada': 'ca', 'United Kingdom': 'gb'
    };
    const FLAG_CODES = new Set(Object.values(COUNTRY_CODES));

    function getFlagCode(metaOrConf) {
        if (!metaOrConf) return 'globe';
        const cc = (metaOrConf.country_code || '').toLowerCase();
        if (FLAG_CODES.has(cc)) return cc;
        if (metaOrConf.country && COUNTRY_CODES[metaOrConf.country]) return COUNTRY_CODES[metaOrConf.country];
        return 'globe';
    }

    function renderFlagHtml(metaOrConf, sizeClass = '') {
        const code = getFlagCode(metaOrConf);
        const countryName = (metaOrConf && metaOrConf.country) || (metaOrConf && metaOrConf.location) || '';
        const flagPath = isInSubfolder ? `../assets/flags/${code}.svg` : `assets/flags/${code}.svg`;
        const cls = sizeClass ? `flat-flag ${sizeClass}` : 'flat-flag';
        return `<img src="${flagPath}" class="${cls}" alt="${countryName}" title="${countryName}" loading="lazy">`;
        return `<img src="${flagPath}" class="${cls}" alt="${esc(countryName)}" title="${esc(countryName)}" loading="lazy">`;
    }

    // State
    /** @type {any[]} */
    let allDeadlines = [];
    /** @type {any[]} */
    let allConferences = [];

    const urlParams = new URLSearchParams(window.location.search);
    let selectedConference = document.body.dataset.conf || urlParams.get('conf') || '';

    // DOM Elements
    const searchInput = /** @type {HTMLInputElement|null} */ (document.getElementById('keyword-search'));
    const clearSearchBtn = /** @type {HTMLButtonElement|null} */ (document.getElementById('clear-search-btn'));
    const keywordChips = document.querySelectorAll('.keyword-chip');
    const conferenceFilter = /** @type {HTMLSelectElement|null} */ (document.getElementById('conference-filter'));
    const coreFilter = /** @type {HTMLSelectElement|null} */ (document.getElementById('core-filter'));
    const sortOrderSelect = /** @type {HTMLSelectElement|null} */ (document.getElementById('sort-order'));
    const workshopListContainer = document.getElementById('workshop-list-container');
    const conferenceStats = document.getElementById('conference-stats');
    const workshopCount = document.getElementById('workshop-count');
    const quickPillsContainer = document.getElementById('conference-quick-pills');
    const switcherContainer = document.getElementById('conference-switcher');

    // Helper: Parses YYYY-MM-DD date strings in local time without UTC offset shifts
    function parseLocalDate(dateStr) {
        if (!dateStr) return null;
        const cleanDate = dateStr.split('T')[0];
        const parts = cleanDate.split('-');
        if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            return new Date(year, month, day);
        }
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
    }

    // Helper: Converts Anywhere on Earth (AoE, UTC-12) deadline date string to user's local Date
    // 23:59:59 AoE = 11:59:59 UTC on following day
    function parseAoeDate(dateStr) {
        if (!dateStr) return null;
        const cleanDate = dateStr.split('T')[0];
        const parts = cleanDate.split('-');
        if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            const utcMs = Date.UTC(year, month, day, 23, 59, 59) + (12 * 3600 * 1000);
            return new Date(utcMs);
        }
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
    }

    // Helper: Formats an AoE deadline into the user's local timezone
    function formatAoeToLocal(dateStr) {
        const localDt = parseAoeDate(dateStr);
        if (!localDt) return '';
        try {
            return localDt.toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                timeZoneName: 'short'
            });
        } catch (e) {
            return localDt.toLocaleDateString();
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return 'TBA';
        const date = parseLocalDate(dateStr);
        if (!date) return dateStr;
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    function deriveConferences(deadlines) {
        const map = new Map();
        deadlines.forEach(d => {
            if (!map.has(d.conference_name)) map.set(d.conference_name, new Set());
            if (d.track_name) map.get(d.conference_name).add(d.track_name);
            if (d.track_name || d.workshop_name) {
                map.get(d.conference_name).add(d.workshop_name || d.track_name);
            }
        });
        return [...map.entries()]
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([name, tracks]) => ({ name, tracks: [...tracks].sort() }));
    }

    function enrichDeadlines(data) {
        return data.map(d => {
            const meta = getMeta(d.conference_name);
            return {
                ...d,
                core_rating: d.core_rating || meta.coreRating,
                location: d.location || meta.location,
                country_code: d.country_code || meta.country_code,
                country: meta.country || ''
            };
        });
    }

    async function fetchDeadlines() {
        const primaryPath = isInSubfolder ? '../data/deadlines.json' : 'data/deadlines.json';
        const fallbackPath = isInSubfolder ? 'data/deadlines.json' : '../data/deadlines.json';
        const cacheKey = 'conference_deadlines_cache';
        try {
            let r = await fetch(primaryPath).catch(() => null);
            if (!r || !r.ok) {
                const rFallback = await fetch(fallbackPath).catch(() => null);
                if (rFallback && rFallback.ok) {
                    r = rFallback;
                }
            }
            if (!r || !r.ok) throw new Error(`HTTP ${r ? r.status : 'offline'}`);
            const data = await r.json();
            storageSet(cacheKey, JSON.stringify(data));
            return enrichDeadlines(data);
        } catch (fetchErr) {
            console.warn('Network fetch failed, attempting localStorage cache fallback:', fetchErr);
            const cached = storageGet(cacheKey);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    console.info('Loaded deadlines from offline localStorage cache');
                    return enrichDeadlines(parsed);
                } catch (parseErr) {
                    console.error('Failed parsing localStorage cache:', parseErr);
                }
            }
            throw fetchErr;
        }
    }

    /* ==========================================================================
       Theme Management (Light / Dark / Auto System Mode)
       ========================================================================== */
    function initTheme() {
        const themeBtn = document.getElementById('theme-toggle-btn');
        const themeIcon = document.getElementById('theme-icon');
        const themeLabel = document.getElementById('theme-label');

        function applyTheme(theme) {
            if (theme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
                if (themeIcon) themeIcon.textContent = '●';
                if (themeLabel) themeLabel.textContent = 'Dark';
            } else if (theme === 'light') {
                document.documentElement.setAttribute('data-theme', 'light');
                if (themeIcon) themeIcon.textContent = '○';
                if (themeLabel) themeLabel.textContent = 'Light';
            } else {
                document.documentElement.removeAttribute('data-theme');
                const isSystemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (themeIcon) themeIcon.textContent = '◐';
                if (themeLabel) themeLabel.textContent = `Auto (${isSystemDark ? 'dark' : 'light'})`;
            }
            if (themeBtn) themeBtn.title = `Theme: ${themeLabel ? themeLabel.textContent : theme} - click to switch`;
        }

        const savedTheme = storageGet('cdl_theme') || 'auto';
        applyTheme(savedTheme);

        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                const current = storageGet('cdl_theme') || 'auto';
                let next = 'dark';
                if (current === 'auto') {
                    const isSystemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                    next = isSystemDark ? 'light' : 'dark';
                } else if (current === 'dark') {
                    next = 'light';
                } else {
                    next = 'dark';
                }
                storageSet('cdl_theme', next);
                applyTheme(next);
            });
        }

        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                if ((storageGet('cdl_theme') || 'auto') === 'auto') {
                    applyTheme('auto');
                }
            });
        }
    }

    /* ==========================================================================
       User Memory & Target Conferences (Pinned Cards, Live Timers & Reminders)
       ========================================================================== */
    const STORAGE_KEY_PINNED = 'cdl_pinned_targets';
    let countdownIntervalId = null;
    const collapsedTimelineGroups = new Set();

    function getPinnedTargets() {
        try {
            const raw = storageGet(STORAGE_KEY_PINNED);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed.filter(t => t && t.conf) : [];
        } catch (e) {
            return [];
        }
    }

    function savePinnedTargets(targets) {
        storageSet(STORAGE_KEY_PINNED, JSON.stringify(targets));
    }

    function isTargetPinned(confName, trackName) {
        const targets = getPinnedTargets();
        const confNorm = (confName || '').toUpperCase();
        const trackNorm = (trackName || 'Main Track').toUpperCase();
        return targets.some(t => t.conf.toUpperCase() === confNorm && (t.track || 'Main Track').toUpperCase() === trackNorm);
    }

    let toastTimer = null;
    function showToast(message, actionLabel, onAction) {
        let el = document.getElementById('cdl-toast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'cdl-toast';
            el.className = 'cdl-toast';
            el.setAttribute('role', 'status');
            el.setAttribute('aria-live', 'polite');
            document.body.appendChild(el);
        }
        el.innerHTML = `<span>${esc(message)}</span>${actionLabel ? `<button type="button" class="cdl-toast-action">${esc(actionLabel)}</button>` : ''}`;
        const actionBtn = el.querySelector('.cdl-toast-action');
        if (actionBtn && onAction) actionBtn.addEventListener('click', () => { onAction(); el.classList.remove('is-visible'); });
        el.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove('is-visible'), 4500);
    }

    function revealPinnedSection() {
        const section = document.getElementById('pinned-targets-section');
        if (!section) return;
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        section.classList.remove('is-flash');
        void section.offsetWidth;
        section.classList.add('is-flash');
    }

    function toggleTargetPin(confName, trackName) {
        let targets = getPinnedTargets();
        const confNorm = (confName || '').toUpperCase();
        const trackNorm = (trackName || 'Main Track').toUpperCase();

        const index = targets.findIndex(t => t.conf.toUpperCase() === confNorm && (t.track || 'Main Track').toUpperCase() === trackNorm);

        if (index >= 0) {
            targets.splice(index, 1);
        } else {
            const found = findDeadline(confName, trackName);
            targets.push({
                conf: confName,
                track: trackName || 'Main Track',
                paper_submission_date: found ? found.paper_submission_date : null,
                abstract_deadline: found ? found.abstract_deadline : null,
                intimation_date: found ? found.intimation_date : null,
                camera_ready_deadline: found ? found.camera_ready_deadline : null,
                website_url: found ? found.website_url : null,
                estimated: found ? !!found.estimated : false,
                pinnedAt: Date.now()
            });
        }

        savePinnedTargets(targets);
        renderPinnedTargets();
        updatePinToggleButtons();
        if (index >= 0) {
            showToast(`Unpinned ${confName} - ${trackName || 'Main Track'}`);
        } else {
            showToast(`Pinned ${confName} - ${trackName || 'Main Track'}`, 'View targets', revealPinnedSection);
        }
    }

    function clearAllPinnedTargets() {
        savePinnedTargets([]);
        renderPinnedTargets();
        updatePinToggleButtons();
    }

    const PIN_SVG = '<svg class="pin-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 17v5"></path><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"></path></svg>';

    function pinButtonHtml(confName, trackName, extraClass = '') {
        const pinned = isTargetPinned(confName, trackName);
        return `<button type="button" class="btn-pin-toggle pin-icon-btn ${extraClass} ${pinned ? 'is-pinned' : ''}" data-conf="${esc(confName)}" data-track="${esc(trackName)}" title="${pinned ? 'Unpin target' : 'Pin to Target Conferences'}" aria-label="${pinned ? 'Unpin' : 'Pin'} ${esc(confName)} - ${esc(trackName)}" aria-pressed="${pinned}">${PIN_SVG}</button>`;
    }

    function updatePinToggleButtons() {
        document.querySelectorAll('.btn-pin-toggle').forEach(btn => {
            const hBtn = /** @type {HTMLElement} */ (btn);
            const conf = hBtn.dataset.conf;
            const track = hBtn.dataset.track;
            if (conf) {
                const pinned = isTargetPinned(conf, track);
                hBtn.classList.toggle('is-pinned', pinned);
                hBtn.setAttribute('aria-pressed', String(pinned));
                hBtn.title = pinned ? 'Unpin target' : 'Pin to Target Conferences';
            }
        });
    }

    const pad2 = n => String(n).padStart(2, '0');

    // 20271031T115959Z
    function toUtcStamp(date) {
        return `${date.getUTCFullYear()}${pad2(date.getUTCMonth() + 1)}${pad2(date.getUTCDate())}` +
            `T${pad2(date.getUTCHours())}${pad2(date.getUTCMinutes())}${pad2(date.getUTCSeconds())}Z`;
    }

    // 20271031 (local calendar date)
    function toIcsDate(date) {
        return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`;
    }

    function icsEscape(text) {
        return String(text == null ? '' : text)
            .replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
    }

    // RFC 5545: lines longer than 75 octets must be folded
    function icsFold(line) {
        const chunks = [];
        let rest = line;
        while (rest.length > 74) {
            chunks.push(rest.slice(0, 74));
            rest = ' ' + rest.slice(74);
        }
        chunks.push(rest);
        return chunks.join('\r\n');
    }

    function getGoogleCalendarUrl(confName, trackName, dateStr, website, estimated = false) {
        if (!dateStr) return '#';
        const due = parseAoeDate(dateStr);
        if (!due) return '#';
        // Deadline is 23:59:59 AoE (UTC-12); mark the final 30 minutes
        const dates = `${toUtcStamp(new Date(due.getTime() - 30 * 60 * 1000))}/${toUtcStamp(due)}`;
        const title = encodeURIComponent(`${confName} - ${trackName} Deadline${estimated ? ' (estimated)' : ''}`);
        const details = encodeURIComponent(`Submission deadline for ${confName} (${trackName}). Anywhere on Earth (AoE).${estimated ? ' ESTIMATED - not yet confirmed.' : ''}\nWebsite: ${website || ''}\nTracked via SERC Conference DateLine.`);
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}`;
    }

    // Returns VEVENT lines for one deadline, or '' when no usable date
    function buildIcsEvent(confName, trackName, dateStr, websiteUrl, estimated = false) {
        const date = parseLocalDate(dateStr);
        if (!date) return '';
        const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        const dt = toIcsDate(date);
        const slug = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const url = safeUrl(websiteUrl) || safeUrl(getMeta(confName).website);
        const lines = [
            'BEGIN:VEVENT',
            `UID:cdl-${slug(confName)}-${slug(trackName)}-${dt}@conferencedateline`,
            `DTSTAMP:${toUtcStamp(new Date())}`,
            `DTSTART;VALUE=DATE:${dt}`,
            `DTEND;VALUE=DATE:${toIcsDate(next)}`,
            `SUMMARY:${icsEscape(`${confName} - ${trackName} Submission Deadline (AoE)${estimated ? ' [ESTIMATED]' : ''}`)}`,
            `DESCRIPTION:${icsEscape(`Paper submission deadline for ${confName} (${trackName}). Anywhere on Earth (AoE).${estimated ? ' ESTIMATED: projected from the previous cycle, not yet confirmed - check the official site.' : ''}${url ? ` Official link: ${url}` : ''}`)}`,
            'STATUS:CONFIRMED',
            'BEGIN:VALARM',
            'TRIGGER:-P3D',
            'ACTION:DISPLAY',
            `DESCRIPTION:${icsEscape(`Reminder: ${confName} submission deadline in 3 days!`)}`,
            'END:VALARM',
            'END:VEVENT'
        ];
        return lines.map(icsFold).join('\r\n');
    }

    function downloadIcs(events, filename) {
        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//ConferenceDateLine//Tracker//EN',
            'CALSCALE:GREGORIAN',
            events,
            'END:VCALENDAR'
        ].join('\r\n') + '\r\n';

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    }

    function downloadIcsReminder(confName, trackName) {
        const found = findDeadline(confName, trackName);
        const event = found ? buildIcsEvent(confName, trackName, found.paper_submission_date, found.website_url, !!found.estimated) : '';
        if (!event) {
            alert(`No confirmed submission date found for ${confName} - ${trackName}`);
            return;
        }
        downloadIcs(event, `${confName}_${(trackName || 'Main Track').replace(/[^a-zA-Z0-9]/g, '_')}_deadline.ics`);
    }

    function downloadAllPinnedIcs() {
        const targets = getPinnedTargets();
        if (targets.length === 0) {
            alert('No pinned target conferences to export.');
            return;
        }

        const events = targets.map(t => {
            const track = t.track || 'Main Track';
            const found = findDeadline(t.conf, track);
            const dateStr = (found && found.paper_submission_date) || t.paper_submission_date;
            return buildIcsEvent(t.conf, track, dateStr, (found && found.website_url) || t.website_url, found ? !!found.estimated : !!t.estimated);
        }).filter(Boolean).join('\r\n');

        if (!events) {
            alert('No confirmed dates available to export.');
            return;
        }

        downloadIcs(events, 'Target_Conferences_Deadlines.ics');
    }

    function setupBrowserNotification(confName, trackName) {
        if (!('Notification' in window)) {
            alert('Browser notifications are not supported in your browser.');
            return;
        }

        const notify = () => new Notification(`Target Pinned: ${confName}`, {
            body: `You are tracking ${confName} - ${trackName}. Live countdown is ticking at the top!`,
            icon: isInSubfolder ? '../assets/flags/globe.svg' : 'assets/flags/globe.svg'
        });

        if (Notification.permission === 'granted') {
            notify();
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') notify();
            });
        } else {
            alert('Browser notifications are blocked. Please enable them in your browser settings to receive alerts.');
        }
    }

    function renderPinnedTargets() {
        const pinnedSection = /** @type {HTMLElement|null} */ (document.getElementById('pinned-targets-section'));
        const pinnedCountBadge = document.getElementById('pinned-count-badge');
        const pinnedGrid = document.getElementById('pinned-cards-grid');

        if (!pinnedSection || !pinnedGrid) return;

        const targets = getPinnedTargets();

        pinnedSection.classList.toggle('hidden', targets.length === 0);
        pinnedSection.hidden = targets.length === 0;
        pinnedSection.style.display = targets.length === 0 ? 'none' : '';

        if (targets.length === 0) {
            pinnedSection.classList.add('hidden');
            pinnedSection.hidden = true;
            pinnedSection.style.setProperty('display', 'none', 'important');
            if (pinnedCountBadge) pinnedCountBadge.textContent = '0 pinned';
            pinnedGrid.innerHTML = '';
            return;
        }

        pinnedSection.classList.remove('hidden');
        pinnedSection.hidden = false;
        pinnedSection.style.removeProperty('display');
        pinnedSection.style.display = '';
        if (pinnedCountBadge) pinnedCountBadge.textContent = `${targets.length} target${targets.length > 1 ? 's' : ''}`;

        pinnedGrid.innerHTML = targets.map(t => {
            const track = t.track || 'Main Track';
            // Prefer live data over the snapshot saved when pinned
            const live = findDeadline(t.conf, track);
            const submission = (live && live.paper_submission_date) || t.paper_submission_date;
            const website = safeUrl((live && live.website_url) || t.website_url);
            const isEstimated = live ? !!live.estimated : !!t.estimated;
            const meta = getMeta(t.conf);
            const confPageUrl = confSlug(t.conf);
            const gcalUrl = getGoogleCalendarUrl(t.conf, track, submission, website, isEstimated);
            const localFormatted = formatAoeToLocal(submission);
            const conf = esc(t.conf);
            const trk = esc(track);

            return `
                <div class="pinned-target-card" data-conf="${conf}" data-track="${trk}">
                    <div class="pinned-card-top">
                        <div class="pinned-card-identity">
                            ${renderFlagHtml(meta, 'flag-sm')}
                            <a href="${esc(confPageUrl)}" style="color:inherit; text-decoration:none;"><strong>${conf}</strong></a>
                            <span class="core-tag ${meta.coreRating === 'A*' ? 'core-star' : 'core-a'}" style="font-size:10px; padding:1px 5px;">CORE ${esc(meta.coreRating)}</span>
                        </div>
                        <button type="button" class="pinned-unpin-btn" data-conf="${conf}" data-track="${trk}" title="Unpin this target conference" aria-label="Unpin ${conf}">×</button>
                    </div>

                    <div class="pinned-track-title" title="${trk}">${trk}</div>

                    <div class="live-countdown-box">
                        <span class="countdown-timer-value" data-date="${esc(submission || '')}">Calculating...</span>
                        <div class="countdown-due-date">
                            <span><span class="aoe-badge">AoE</span> ${esc(formatDate(submission))} ${isEstimated ? EST_BADGE_HTML : ''}</span>
                            ${localFormatted ? `<span class="local-due-text">Your time: ${esc(localFormatted)}</span>` : ''}
                        </div>
                    </div>

                    <div class="pinned-card-actions">
                        ${gcalUrl !== '#' ? `<a href="${esc(gcalUrl)}" target="_blank" rel="noopener noreferrer" class="btn-reminder-action" title="Add submission deadline to Google Calendar">
                            Google Calendar
                        </a>` : ''}
                        <button type="button" class="btn-reminder-action download-ics-btn" data-conf="${conf}" data-track="${trk}" title="Download .ics Calendar File">
                            Export .ics
                        </button>
                        <button type="button" class="btn-reminder-action notify-reminder-btn" data-conf="${conf}" data-track="${trk}" title="Set browser notification alert">
                            Notify
                        </button>
                        ${website ? `<a href="${esc(website)}" target="_blank" rel="noopener noreferrer" class="btn-reminder-action">Official Link ↗</a>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        updateLiveCountdowns();
    }

    function updateLiveCountdowns() {
        const timerEls = document.querySelectorAll('.countdown-timer-value');
        const now = new Date();

        timerEls.forEach(el => {
            const hEl = /** @type {HTMLElement} */ (el);
            const dateStr = hEl.dataset.date;
            if (!dateStr) {
                hEl.textContent = 'Date TBA';
                return;
            }

            const targetDate = parseAoeDate(dateStr);
            if (!targetDate) {
                hEl.textContent = 'Date TBA';
                return;
            }

            const diff = targetDate.getTime() - now.getTime();

            if (diff <= 0) {
                hEl.textContent = 'Deadline Passed';
                hEl.classList.remove('is-urgent');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const mins = Math.floor((diff / (1000 * 60)) % 60);
            const secs = Math.floor((diff / 1000) % 60);

            hEl.textContent = `${days}d ${hours}h ${mins}m ${secs}s`;

            if (days <= 7) {
                hEl.classList.add('is-urgent');
            } else {
                hEl.classList.remove('is-urgent');
            }
        });
    }

    function startLiveCountdownInterval() {
        if (countdownIntervalId) clearInterval(countdownIntervalId);
        updateLiveCountdowns();
        countdownIntervalId = setInterval(updateLiveCountdowns, 1000);
    }

    function initUserMemory() {
        const clearBtn = document.getElementById('clear-all-pinned-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Clear all pinned target conferences?')) {
                    clearAllPinnedTargets();
                }
            });
        }

        const exportAllBtn = document.getElementById('export-all-pinned-btn');
        if (exportAllBtn) {
            exportAllBtn.addEventListener('click', downloadAllPinnedIcs);
        }

        const pinnedGrid = document.getElementById('pinned-cards-grid');
        if (pinnedGrid) {
            pinnedGrid.addEventListener('click', (e) => {
                const target = /** @type {HTMLElement} */ (e.target);
                const unpinBtn = /** @type {HTMLElement|null} */ (target.closest('.pinned-unpin-btn'));
                if (unpinBtn && unpinBtn.dataset.conf && unpinBtn.dataset.track) {
                    toggleTargetPin(unpinBtn.dataset.conf, unpinBtn.dataset.track);
                    return;
                }

                const icsBtn = /** @type {HTMLElement|null} */ (target.closest('.download-ics-btn'));
                if (icsBtn && icsBtn.dataset.conf && icsBtn.dataset.track) {
                    downloadIcsReminder(icsBtn.dataset.conf, icsBtn.dataset.track);
                    return;
                }

                const notifyBtn = /** @type {HTMLElement|null} */ (target.closest('.notify-reminder-btn'));
                if (notifyBtn && notifyBtn.dataset.conf && notifyBtn.dataset.track) {
                    setupBrowserNotification(notifyBtn.dataset.conf, notifyBtn.dataset.track);
                    return;
                }
            });
        }

        renderPinnedTargets();
        startLiveCountdownInterval();
    }

    /* ==========================================================================
       Navigation, Dropdowns & Dedicated Page Switcher
       ========================================================================== */
    function setupNavigation() {
        // Setup for Home Page
        if (!isConferencePage && conferenceFilter) {
            conferenceFilter.innerHTML = '<option value="all">All Conferences</option>';
            const seOptGroup = document.createElement('optgroup');
            seOptGroup.label = 'Software Engineering (SE)';
            const vrOptGroup = document.createElement('optgroup');
            vrOptGroup.label = 'VR, Games & HCI';

            allConferences.forEach(conf => {
                const meta = getMeta(conf.name);
                const option = document.createElement('option');
                option.value = conf.name;
                option.textContent = `${conf.name} (${meta.coreRating}) - ${meta.location}`;
                if (SE_CONFERENCES.has(conf.name.toUpperCase())) {
                    seOptGroup.appendChild(option);
                } else {
                    vrOptGroup.appendChild(option);
                }
            });
            conferenceFilter.appendChild(seOptGroup);
            conferenceFilter.appendChild(vrOptGroup);

            // Ignore ?conf= values that match no option (select would go blank and hide everything)
            const confParam = (urlParams.get('conf') || '').toUpperCase();
            const matched = allConferences.find(c => c.name.toUpperCase() === confParam);
            if (matched) conferenceFilter.value = matched.name;
        }

        // Setup dedicated page pills on Home Page
        if (quickPillsContainer) {
            quickPillsContainer.innerHTML = '';
            allConferences.forEach(conf => {
                const meta = getMeta(conf.name);
                const link = document.createElement('a');
                link.href = confSlug(conf.name);
                link.className = 'dedicated-pill-link';
                link.innerHTML = `${renderFlagHtml(meta, 'flag-sm')} <strong>${conf.name}</strong> <span class="pill-core">${meta.coreRating}</span> ↗`;
                link.innerHTML = `${renderFlagHtml(meta, 'flag-sm')} <strong>${esc(conf.name)}</strong> <span class="pill-core">${esc(meta.coreRating)}</span> ↗`;
                quickPillsContainer.appendChild(link);
            });
        }

        // Setup switcher pills on Dedicated Conference Page
        if (isConferencePage && switcherContainer) {
            switcherContainer.innerHTML = '';
            allConferences.forEach(conf => {
                const meta = getMeta(conf.name);
                const isActive = conf.name.toUpperCase() === selectedConference.toUpperCase();
                const link = document.createElement('a');
                link.href = confSlug(conf.name);
                link.className = `switcher-pill ${isActive ? 'is-active' : ''}`;
                link.innerHTML = `${renderFlagHtml(meta, 'flag-sm')} <strong>${conf.name}</strong>`;
                link.innerHTML = `${renderFlagHtml(meta, 'flag-sm')} <strong>${esc(conf.name)}</strong>`;
                switcherContainer.appendChild(link);
            });
        }
    }

    function renderConferenceHero(confName) {
        const meta = getMeta(confName);
        const heroTitle = document.getElementById('hero-title');
        const heroFlag = document.getElementById('hero-flag');
        const heroCoreBadge = document.getElementById('hero-core-badge');
        const heroDesc = document.getElementById('hero-desc');
        const heroLocation = document.getElementById('hero-location');
        const heroYear = document.getElementById('hero-year');
        const heroTracksCount = document.getElementById('hero-tracks-count');
        const heroWebsiteLink = /** @type {HTMLAnchorElement|null} */ (document.getElementById('hero-website-link'));
        const listTitle = document.getElementById('workshop-list-title');

        document.title = `${confName} (${meta.coreRating}) - Conference Deadlines & Tracks`;

        if (heroTitle) heroTitle.textContent = `${confName} ${meta.year}`;
        if (heroFlag) heroFlag.innerHTML = renderFlagHtml(meta, 'flag-hero');
        if (heroCoreBadge) {
            heroCoreBadge.textContent = `CORE ${meta.coreRating}`;
            heroCoreBadge.className = `core-badge ${meta.coreRating === 'A*' ? 'is-core-star' : 'is-core-a'}`;
        }
        if (heroDesc) heroDesc.textContent = meta.fullName;
        if (heroLocation) heroLocation.textContent = meta.location;
        if (heroYear) heroYear.textContent = meta.year;

        const confDeadlines = allDeadlines.filter(d => d.conference_name.toUpperCase() === confName.toUpperCase());
        if (heroTracksCount) heroTracksCount.textContent = `${confDeadlines.length} Tracks & Workshops`;

        if (heroWebsiteLink) {
            const trackWithUrl = confDeadlines.find(d => d.website_url);
            heroWebsiteLink.href = (meta.website && meta.website !== '#') ? meta.website : (trackWithUrl ? trackWithUrl.website_url : '#');
            heroWebsiteLink.href = safeUrl(meta.website) || safeUrl(trackWithUrl && trackWithUrl.website_url) || '#';
        }

        if (listTitle) {
            listTitle.textContent = `${confName} Tracks & Workshops`;
        }

        // Render dedicated page co-hosted events section
        const cohostedPillsRow = document.getElementById('cohosted-pills-row');
        const cohostedCountTag = document.getElementById('cohosted-count-tag');
        const cohostedBannerSection = document.getElementById('cohosted-banner-section');
        if (cohostedPillsRow && cohostedBannerSection) {
            const cohostedList = meta.cohosted || [];
            if (cohostedList.length > 0) {
                cohostedBannerSection.style.display = 'block';
                if (cohostedCountTag) cohostedCountTag.textContent = `${cohostedList.length} Events`;
                cohostedPillsRow.innerHTML = cohostedList.map(item => {
                    const itemMeta = getMeta(item);
                    const hasPage = allConferences.some(c => c.name.toUpperCase() === item.toUpperCase());
                    const link = hasPage ? confSlug(item) : safeUrl(itemMeta.website);
                    const actionButton = link
                        ? `<a href="${esc(link)}" class="btn-card-action" style="padding:2px 8px;" ${hasPage ? '' : 'target="_blank" rel="noopener noreferrer"'}>${hasPage ? 'View Page ↗' : 'Official Site ↗'}</a>`
                        : `<span class="cohosted-pill-tag">Co-located</span>`;
                    return `
                        <div class="cohosted-pill-card" data-conf="${esc(item)}">
                            <span class="cohosted-pill-flag">${renderFlagHtml(itemMeta, 'flag-sm')}</span>
                            <strong>${esc(item)}</strong>
                            ${itemMeta.coreRating && itemMeta.coreRating !== 'Unranked' ? `<span class="cohosted-pill-badge">${esc(itemMeta.coreRating)}</span>` : ''}
                            ${actionButton}
                        </div>
                    `;
                }).join('');
            } else {
                cohostedBannerSection.style.display = 'none';
            }
        }
    }

    function setupEventListeners() {
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                updateClearBtnVisibility();
                renderTimeline();
                renderWorkshopList();
            });
        }

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                keywordChips.forEach(c => c.classList.remove('is-active'));
                updateClearBtnVisibility();
                renderTimeline();
                renderWorkshopList();
            });
        }

        keywordChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const hChip = /** @type {HTMLElement} */ (chip);
                const keyword = hChip.dataset.keyword;
                const wasActive = hChip.classList.contains('is-active');

                keywordChips.forEach(c => c.classList.remove('is-active'));

                if (wasActive) {
                    if (searchInput) searchInput.value = '';
                } else {
                    hChip.classList.add('is-active');
                    if (searchInput) searchInput.value = keyword || '';
                }

                updateClearBtnVisibility();
                renderTimeline();
                renderWorkshopList();
            });
        });

        if (conferenceFilter) {
            conferenceFilter.addEventListener('change', () => {
                renderTimeline();
                renderWorkshopList();
            });
        }

        if (coreFilter) {
            coreFilter.addEventListener('change', () => {
                renderTimeline();
                renderWorkshopList();
            });
        }

        if (sortOrderSelect) {
            sortOrderSelect.addEventListener('change', () => {
                renderTimeline();
                renderWorkshopList();
            });
        }

        // Pin button delegation (timeline rows + cards)
        [document.getElementById('timeline-chart'), workshopListContainer].forEach(container => {
            if (!container) return;
            container.addEventListener('click', (e) => {
                const target = /** @type {HTMLElement} */ (e.target);
                const groupBtn = /** @type {HTMLElement|null} */ (target.closest('.timeline-group-header'));
                if (groupBtn && groupBtn.dataset.group) {
                    const key = groupBtn.dataset.group;
                    if (collapsedTimelineGroups.has(key)) collapsedTimelineGroups.delete(key);
                    else collapsedTimelineGroups.add(key);
                    renderTimeline();
                    return;
                }
                const pinBtn = /** @type {HTMLElement|null} */ (target.closest('.btn-pin-toggle'));
                if (pinBtn && pinBtn.dataset.conf) {
                    toggleTargetPin(pinBtn.dataset.conf, pinBtn.dataset.track || 'Main Track');
                }
            });
        });
    }

    function updateClearBtnVisibility() {
        if (clearSearchBtn && searchInput) {
            clearSearchBtn.style.display = searchInput.value.trim() ? 'flex' : 'none';
        }
    }

    /* ==========================================================================
       Filtering & Sorting Engine
       ========================================================================== */
    function getFilteredDeadlines() {
        let result = [...allDeadlines];

        // 1. Keyword search
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        if (query) {
            const queryTokens = [query];
            if (query === 'agents' || query === 'agent') {
                queryTokens.push('agent', 'agents', 'agentic', 'aamas', 'autonomous agents');
            } else if (query.endsWith('s') && query.length > 3) {
                queryTokens.push(query.slice(0, -1));
            }

            result = result.filter(d => {
                const conf = (d.conference_name || '').toLowerCase();
                const track = (d.track_name || '').toLowerCase();
                const workshop = (d.workshop_name || '').toLowerCase();
                const location = (d.location || '').toLowerCase();
                const core = (d.core_rating || '').toLowerCase();
                const meta = getMeta(d.conference_name);
                const fullName = (meta.fullName || '').toLowerCase();

                return queryTokens.some(q =>
                    conf.includes(q) || track.includes(q) || workshop.includes(q) ||
                    location.includes(q) || core.includes(q) || fullName.includes(q)
                );
            });
        }

        // 2. Conference filter
        if (isConferencePage && selectedConference) {
            result = result.filter(d => d.conference_name.toUpperCase() === selectedConference.toUpperCase());
        } else if (conferenceFilter && conferenceFilter.value !== 'all') {
            result = result.filter(d => d.conference_name === conferenceFilter.value);
        }

        // 3. CORE rating filter
        if (coreFilter && coreFilter.value !== 'all') {
            const targetRating = coreFilter.value;
            result = result.filter(d => {
                const meta = getMeta(d.conference_name);
                return meta.coreRating === targetRating;
            });
        }

        // 4. Sorting
        const sortVal = sortOrderSelect ? sortOrderSelect.value : 'deadline-asc';
        const fallbackFarFuture = new Date(9999, 0, 1).getTime();

        const nowMs = Date.now();
        const isPast = d => {
            const due = parseAoeDate(d.paper_submission_date);
            return !!due && due.getTime() < nowMs;
        };

        result.sort((a, b) => {
            const dtStartA = parseLocalDate(a.paper_submission_date);
            const dtStartB = parseLocalDate(b.paper_submission_date);
            const dtEndA = parseLocalDate(a.intimation_date);
            const dtEndB = parseLocalDate(b.intimation_date);
            const dtCamA = parseLocalDate(a.camera_ready_deadline);
            const dtCamB = parseLocalDate(b.camera_ready_deadline);

            const startA = dtStartA ? dtStartA.getTime() : fallbackFarFuture;
            const startB = dtStartB ? dtStartB.getTime() : fallbackFarFuture;
            const endA = dtEndA ? dtEndA.getTime() : fallbackFarFuture;
            const endB = dtEndB ? dtEndB.getTime() : fallbackFarFuture;
            const camA = dtCamA ? dtCamA.getTime() : fallbackFarFuture;
            const camB = dtCamB ? dtCamB.getTime() : fallbackFarFuture;

            switch (sortVal) {
                case 'deadline-desc':
                    return startB - startA;
                case 'name-asc': {
                    const nameA = a.workshop_name || a.track_name || a.conference_name;
                    const nameB = b.workshop_name || b.track_name || b.conference_name;
                    return nameA.localeCompare(nameB);
                }
                case 'core-desc': {
                    const metaA = getMeta(a.conference_name);
                    const metaB = getMeta(b.conference_name);
                    const scoreA = metaA.coreRating === 'A*' ? 2 : metaA.coreRating === 'A' ? 1 : 0;
                    const scoreB = metaB.coreRating === 'A*' ? 2 : metaB.coreRating === 'A' ? 1 : 0;
                    if (scoreB !== scoreA) return scoreB - scoreA;
                    return startA - startB;
                }
                case 'notification-asc':
                    return endA - endB;
                case 'cameraready-asc':
                    return camA - camB;
                case 'deadline-asc':
                default: {
                    // Upcoming first (soonest -> latest), then passed (most recent first)
                    const pastA = isPast(a);
                    const pastB = isPast(b);
                    if (pastA !== pastB) return pastA ? 1 : -1;
                    return pastA ? startB - startA : startA - startB;
                }
            }
        });

        return result;
    }

    /* ==========================================================================
       Timeline Chart Rendering
       ========================================================================== */
    function renderTimeline() {
        const rawDeadlines = getFilteredDeadlines();
        const container = document.getElementById('timeline-chart');
        if (!container) return;

        if (!rawDeadlines || rawDeadlines.length === 0) {
            container.innerHTML = '<div class="no-data">No data matching your search or filters</div>';
            if (conferenceStats) conferenceStats.textContent = '0 Conferences • 0 Tracks';
            if (workshopCount) workshopCount.textContent = '0 items';
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const minDate = new Date(today);
        minDate.setDate(minDate.getDate() - 7);

        const maxDate = new Date(today);
        maxDate.setFullYear(maxDate.getFullYear() + 1);

        const totalDays = (maxDate.getTime() - minDate.getTime()) / 86400000;
        const todayOffset = Math.max(0, Math.min(100, ((today.getTime() - minDate.getTime()) / 86400000) / totalDays * 100));

        const deadlines = rawDeadlines.filter(d => {
            const start = parseLocalDate(d.paper_submission_date);
            const end = parseLocalDate(d.intimation_date);
            const cam = parseLocalDate(d.camera_ready_deadline);
            const effectiveEnd = cam || end;
            return start && effectiveEnd && effectiveEnd >= minDate && start <= maxDate;
        });

        if (deadlines.length === 0) {
            container.innerHTML = '<div class="no-data">No active deadline date ranges found within the 1-year window</div>';
            if (conferenceStats) conferenceStats.textContent = '0 active deadlines';
            return;
        }

        let confColWidth = isConferencePage ? 75 : 95;
        let trackLabelWidth = 140;

        deadlines.forEach(d => {
            const confName = d.conference_name || 'Conference';
            const name = d.workshop_name || d.track_name || 'Main Track';

            const confTextWidth = Math.ceil(confName.length * 8.5) + 24;
            confColWidth = Math.max(confColWidth, confTextWidth);

            const textWidth = Math.ceil(name.length * 7.2);
            trackLabelWidth = Math.max(trackLabelWidth, textWidth);
        });

        confColWidth = Math.min(Math.max(confColWidth, 90), 125);
        trackLabelWidth = Math.min(Math.max(trackLabelWidth, 140), 230);

        const groupedDeadlines = {};
        const confOrder = [];

        deadlines.forEach(d => {
            const confName = d.conference_name || 'Conference';
            if (!groupedDeadlines[confName]) {
                groupedDeadlines[confName] = [];
                confOrder.push(confName);
            }
            groupedDeadlines[confName].push(d);
        });

        if (conferenceStats) {
            conferenceStats.textContent = `${confOrder.length} Conferences • ${deadlines.length} Tracks`;
        }
        if (workshopCount) {
            const query = searchInput ? searchInput.value.trim() : '';
            workshopCount.textContent = query ? `Showing ${deadlines.length} results for "${query}"` : `Showing ${deadlines.length} items`;
        }

        const months = [];
        const curDate = new Date(minDate);
        curDate.setDate(1);
        const endDate = new Date(maxDate);

        while (curDate <= endDate) {
            const monthStart = new Date(curDate.getFullYear(), curDate.getMonth(), 1);
            const offset = ((monthStart.getTime() - minDate.getTime()) / 86400000) / totalDays;
            if (offset >= 0 && offset <= 1) {
                months.push({
                    date: new Date(curDate),
                    left: offset * 100
                });
            }
            curDate.setMonth(curDate.getMonth() + 1);
        }

        let html = `
            <div class="timeline-wrapper">
                <div class="timeline-scale-row" style="display: grid; grid-template-columns: ${confColWidth}px ${trackLabelWidth}px 1fr; column-gap: 12px;">
                    <div class="timeline-label-spacer"></div>
                    <div class="timeline-label-spacer"></div>
                    <div class="timeline-scale">
        `;

        months.forEach((month, i) => {
            const nextLeft = months[i + 1] ? months[i + 1].left : 100;
            const midLeft = (month.left + nextLeft) / 2;
            const monthName = month.date.toLocaleDateString('en-US', { month: 'short' });
            const yearShort = month.date.toLocaleDateString('en-US', { year: '2-digit' });

            html += `<div class="scale-tick" style="left: ${month.left}%"></div>`;
            if (midLeft <= 95) {
                html += `<div class="scale-month-label" style="left: ${midLeft}%"><span>${monthName} '${yearShort}</span></div>`;
            }
        });

        html += `
                        <div class="scale-today-marker" style="left: ${todayOffset}%">
                            <span class="today-tag">Today</span>
                        </div>
                    </div>
                </div>
                <div class="timeline-bars" style="display: grid; grid-template-columns: ${confColWidth}px ${trackLabelWidth}px 1fr; column-gap: 12px; row-gap: 8px;">
        `;

        let currentRow = 1;
        let rowsHtml = '';

        // Separate Software Engineering and VR/Games/HCI conferences (single-conference pages stay flat)
        const timelineGroups = isConferencePage
            ? [{ key: 'all', title: '', confs: confOrder }]
            : [
                { key: 'vr', title: 'Virtual Reality, Games & HCI', confs: confOrder.filter(c => !SE_CONFERENCES.has(c.toUpperCase())) },
                { key: 'se', title: 'Software Engineering', confs: confOrder.filter(c => SE_CONFERENCES.has(c.toUpperCase())) }
            ].filter(g => g.confs.length > 0);

        let confCounter = 0;

        timelineGroups.forEach(group => {
          if (!isConferencePage) {
            const collapsed = collapsedTimelineGroups.has(group.key);
            const trackTotal = group.confs.reduce((n, c) => n + groupedDeadlines[c].length, 0);
            rowsHtml += `
                <button type="button" class="timeline-group-header ${collapsed ? 'is-collapsed' : ''}" data-group="${group.key}" aria-expanded="${!collapsed}" style="grid-row: ${currentRow}; grid-column: 1 / span 3;">
                    <span class="timeline-group-chevron" aria-hidden="true">▾</span>
                    <span class="timeline-group-title">${esc(group.title)}</span>
                    <span class="timeline-group-count">${group.confs.length} conferences • ${trackTotal} tracks</span>
                </button>
            `;
            currentRow++;
            if (collapsed) return;
          }

          group.confs.forEach((confName, groupIdx) => {
            const confIndex = confCounter++;
            const tracks = groupedDeadlines[confName];
            const trackCount = tracks.length;
            const startRow = currentRow;
            const meta = getMeta(confName);
            const pageUrl = confSlug(confName);

            rowsHtml += `
                <div class="conference-column" style="grid-row: ${startRow} / span ${trackCount}; grid-column: 1;" title="${esc(`${confName} (${meta.coreRating}) • ${meta.location}`)}">
                    <a href="${esc(pageUrl)}" class="conference-badge-link" data-conf="${esc(confName)}">
                        <div class="conference-badge-vertical">
                            ${renderFlagHtml(meta, 'flag-timeline')}
                            <span class="badge-name">${esc(confName)}</span>
                            <span class="badge-core">${esc(meta.coreRating)}</span>
                        </div>
                    </a>
                </div>
            `;

            tracks.forEach((d, trackIndex) => {
                const row = startRow + trackIndex;
                const start = parseLocalDate(d.paper_submission_date);
                const end = parseLocalDate(d.intimation_date);
                const abstractDate = parseLocalDate(d.abstract_deadline);
                const cameraReadyDate = parseLocalDate(d.camera_ready_deadline);

                const startOffset = start ? Math.max(0, Math.min(100, ((start.getTime() - minDate.getTime()) / 86400000) / totalDays * 100)) : 0;
                const endOffset = end ? Math.max(0, Math.min(100, ((end.getTime() - minDate.getTime()) / 86400000) / totalDays * 100)) : startOffset;
                const width = Math.max(1.5, endOffset - startOffset);

                const status = getDeadlineStatus(d.paper_submission_date);
                const statusClass = status ? status.statusClass : 'days-status-safe';
                const daysDisplay = status ? status.label : '';

                const name = d.workshop_name || d.track_name || 'Main Track';
                const websiteUrl = safeUrl(d.website_url);
                const durationDays = (start && end) ? Math.round((end.getTime() - start.getTime()) / 86400000) : 0;
                const isNarrowBar = width < 8;
                const isFarRight = endOffset > 88;

                const outsideLabelHtml = (durationDays > 0 && isNarrowBar) ? (
                    isFarRight
                        ? `<span class="timeline-bar-label-outside label-left" style="right: calc(${100 - startOffset}% + 12px);">${durationDays}d review</span>`
                        : `<span class="timeline-bar-label-outside" style="left: calc(${endOffset}% + 12px);">${durationDays}d review</span>`
                ) : '';

                const insideDurationHtml = (!isNarrowBar && durationDays > 0)
                    ? `<span class="duration">${durationDays}d review</span>`
                    : '';

                const formatDateSafe = (date) => date ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
                const barTooltip = esc(`${d.estimated ? '[ESTIMATED - projected from previous cycle, unconfirmed]\n' : ''}${confName} - ${name}\nLocation: ${meta.location}\nCORE: ${meta.coreRating}\nSubmission Deadline: ${formatDateSafe(start)}\nReview Window: ${durationDays} days (${formatDateSafe(start)} to ${formatDateSafe(end)})\nNotification: ${formatDateSafe(end)}${abstractDate ? `\nAbstract: ${formatDateSafe(abstractDate)}` : ''}${cameraReadyDate ? `\nCamera-Ready: ${formatDateSafe(cameraReadyDate)}` : ''}`);

                rowsHtml += `
                    <div class="timeline-row conf-group-${confIndex % 2}" style="grid-row: ${row}; grid-column: 2 / span 2;">
                        <div class="timeline-label" style="width: ${trackLabelWidth}px;">
                            ${pinButtonHtml(confName, name, 'pin-timeline')}
                            <div class="track-name">${websiteUrl ? `<a href="${esc(websiteUrl)}" target="_blank" rel="noopener noreferrer" title="${esc(name)}">${esc(name)}</a>` : `<span title="${esc(name)}">${esc(name)}</span>`}</div>
                            <div class="days-left-badge ${statusClass}">${daysDisplay}${d.estimated && daysDisplay ? ' (est.)' : ''}</div>
                        </div>
                        <div class="timeline-bar-container" title="${barTooltip}">
                            <div class="timeline-bar submission-start${d.estimated ? ' is-estimated' : ''}${start && start < minDate ? ' is-clipped-left' : ''}" style="left: ${startOffset}%; width: ${width}%">
                                ${insideDurationHtml}
                            </div>
                            ${outsideLabelHtml}
                            ${start && start >= minDate && start <= maxDate ? `<div class="timeline-marker submission-marker" style="left: ${startOffset}%" title="Submission Deadline: ${formatDateSafe(start)}"></div>` : ''}
                            ${abstractDate && abstractDate >= minDate && abstractDate <= maxDate ? `<div class="timeline-marker abstract-marker" style="left: ${((abstractDate.getTime() - minDate.getTime()) / 86400000) / totalDays * 100}%" title="Abstract Deadline: ${formatDateSafe(abstractDate)}"></div>` : ''}
                            ${end && end >= minDate && end <= maxDate ? `<div class="timeline-marker notification-marker" style="left: ${((end.getTime() - minDate.getTime()) / 86400000) / totalDays * 100}%" title="Notification Date: ${formatDateSafe(end)}"></div>` : ''}
                            ${cameraReadyDate && cameraReadyDate >= minDate && cameraReadyDate <= maxDate ? `<div class="timeline-marker camera-ready-marker" style="left: ${((cameraReadyDate.getTime() - minDate.getTime()) / 86400000) / totalDays * 100}%" title="Camera-ready Deadline: ${formatDateSafe(cameraReadyDate)}"></div>` : ''}
                        </div>
                    </div>
                `;
            });

            currentRow += trackCount;

            if (groupIdx < group.confs.length - 1) {
                rowsHtml += `
                    <div class="conference-separator" style="grid-row: ${currentRow}; grid-column: 1 / span 3;" role="separator"></div>
                `;
                currentRow++;
            }
          });
        });

        const totalRows = currentRow - 1;

        const gridLinesHtml = `
            <div class="timeline-grid-lines" style="grid-column: 3; grid-row: 1 / span ${totalRows};">
                ${months.map(m => `<div class="month-grid-line" style="left: ${m.left}%"></div>`).join('')}
            </div>
        `;

        const todayLineHtml = `
            <div class="timeline-today-layer" style="grid-column: 3; grid-row: 1 / span ${totalRows};">
                <div class="today-line-overlay" style="left: ${todayOffset}%"></div>
            </div>
        `;

        html += gridLinesHtml + rowsHtml + todayLineHtml;
        html += '</div></div>';
        container.innerHTML = html;
    }

    /* ==========================================================================
       Workshops & Tracks Card List (Domain Grouped: SE Closed by Default)
       ========================================================================== */
    function renderCard(d) {
        const isWorkshop = !!d.workshop_name;
        const cardClass = (isWorkshop ? 'workshop-card is-workshop' : 'workshop-card is-track') + (d.estimated ? ' is-estimated' : '');
        const name = d.workshop_name || (d.track_name || 'Main Track');
        const meta = getMeta(d.conference_name);
        const confPageUrl = confSlug(d.conference_name);

        const status = getDeadlineStatus(d.paper_submission_date);
        const daysBadgeHtml = status ? `
            <span class="days-left-badge ${status.statusClass}">${status.label}</span>
        ` : '';

        const url = safeUrl(d.website_url);
        const titleHtml = url
            ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" class="workshop-title-link">${esc(name)} ↗</a>`
            : esc(name);

        const localTimeFormatted = formatAoeToLocal(d.paper_submission_date);

        return `
            <div class="${cardClass}">
                <div class="workshop-header">
                    <div class="header-chips">
                        <a href="${esc(confPageUrl)}" class="workshop-conf-badge" title="View ${esc(d.conference_name)} page">
                            ${renderFlagHtml(meta, 'flag-sm')} ${esc(d.conference_name)} ↗
                        </a>
                        <span class="core-tag ${meta.coreRating === 'A*' ? 'core-star' : 'core-a'}">CORE ${esc(meta.coreRating)}</span>
                        ${daysBadgeHtml}
                        ${d.estimated ? EST_BADGE_HTML : ''}
                    </div>
                    <div style="display:flex; align-items:center; gap:6px;">
                        ${pinButtonHtml(d.conference_name, name)}
                        <span class="workshop-type-pill">${isWorkshop ? 'Workshop' : 'Track'}</span>
                    </div>
                </div>

                <div class="workshop-name">${titleHtml}</div>

                <div class="workshop-location-row">
                    <span class="location-chip">${esc(meta.location)} ${renderFlagHtml(meta, 'flag-sm')}</span>
                </div>

                <div class="workshop-dates-grid">
                    <div class="date-chip">
                        <span class="date-chip-label">
                            <svg class="chip-icon-sub" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                            Submission (AoE)
                        </span>
                        <span class="date-chip-val">${formatDate(d.paper_submission_date)}${d.estimated && d.paper_submission_date ? ' <span class="est-mark" title="' + EST_TITLE + '">(est.)</span>' : ''}</span>
                        ${localTimeFormatted ? `<span class="date-local-hint">Local: ${esc(localTimeFormatted)}</span>` : ''}
                    </div>
                    ${d.abstract_deadline ? `
                    <div class="date-chip">
                        <span class="date-chip-label">
                            <svg class="chip-icon-abs" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                            Abstract Deadline
                        </span>
                        <span class="date-chip-val">${formatDate(d.abstract_deadline)}${d.estimated && d.abstract_deadline ? ' <span class="est-mark" title="' + EST_TITLE + '">(est.)</span>' : ''}</span>
                    </div>
                    ` : ''}
                    <div class="date-chip">
                        <span class="date-chip-label">
                            <svg class="chip-icon-not" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                            Notification Date
                        </span>
                        <span class="date-chip-val">${formatDate(d.intimation_date)}${d.estimated && d.intimation_date ? ' <span class="est-mark" title="' + EST_TITLE + '">(est.)</span>' : ''}</span>
                    </div>
                    ${d.camera_ready_deadline ? `
                    <div class="date-chip">
                        <span class="date-chip-label">
                            <svg class="chip-icon-cam" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                            Camera-ready Deadline
                        </span>
                        <span class="date-chip-val">${formatDate(d.camera_ready_deadline)}${d.estimated && d.camera_ready_deadline ? ' <span class="est-mark" title="' + EST_TITLE + '">(est.)</span>' : ''}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    function renderWorkshopList() {
        if (!workshopListContainer) return;

        const deadlines = getFilteredDeadlines();

        if (deadlines.length === 0) {
            workshopListContainer.innerHTML = '<p class="no-data">No workshops or tracks match your criteria.</p>';
            return;
        }

        // On single conference page: render flat grid of cards
        if (isConferencePage) {
            workshopListContainer.innerHTML = `
                <div class="domain-cards-grid">
                    ${deadlines.map(d => renderCard(d)).join('')}
                </div>
            `;
            return;
        }

        // On home page: Group into Software Engineering (SE) and VR/Games/HCI
        const seDeadlines = deadlines.filter(d => SE_CONFERENCES.has((d.conference_name || '').toUpperCase()));
        const vrDeadlines = deadlines.filter(d => !SE_CONFERENCES.has((d.conference_name || '').toUpperCase()));

        // Check if there is an active search or SE filter that should auto-expand SE
        const query = searchInput ? searchInput.value.trim() : '';
        const selectedConf = conferenceFilter ? conferenceFilter.value : 'all';
        const isSeSelected = selectedConf !== 'all' && SE_CONFERENCES.has(selectedConf.toUpperCase());
        const shouldExpandSe = !!query || isSeSelected;

        let html = '';

        // Extended Reality, Games & HCI Group (Open by default)
        if (vrDeadlines.length > 0) {
            html += `
                <details class="domain-group vr-group" id="domain-group-vr" open>
                    <summary class="domain-summary">
                        <div class="domain-summary-left">
                            <span class="domain-chevron">▶</span>
                            <h3 class="domain-title">Virtual Reality, Games & HCI Conferences</h3>
                            <span class="domain-meta-badge">${vrDeadlines.length} Tracks & Workshops</span>
                        </div>
                        <span class="domain-toggle-hint">Click to expand / collapse</span>
                    </summary>
                    <div class="domain-cards-grid">
                        ${vrDeadlines.map(d => renderCard(d)).join('')}
                    </div>
                </details>
            `;
        }

        // Software Engineering (SE) Group (CLOSED BY DEFAULT per user requirement)
        if (seDeadlines.length > 0) {
            html += `
                <details class="domain-group se-group" id="domain-group-se" ${shouldExpandSe ? 'open' : ''}>
                    <summary class="domain-summary">
                        <div class="domain-summary-left">
                            <span class="domain-chevron">▶</span>
                            <h3 class="domain-title">Software Engineering Conferences</h3>
                            <span class="domain-meta-badge">${seDeadlines.length} Tracks & Workshops</span>
                        </div>
                        <span class="domain-toggle-hint">Click to expand / collapse</span>
                    </summary>
                    <div class="domain-cards-grid">
                        ${seDeadlines.map(d => renderCard(d)).join('')}
                    </div>
                </details>
            `;
        }

        workshopListContainer.innerHTML = html;
    }

    /* ==========================================================================
       Dual View Switcher (Timeline vs Cards Grid vs Combined)
       ========================================================================== */
    function initViewMode() {
        const timelineContainer = /** @type {HTMLElement|null} */ (document.querySelector('.timeline-container'));
        const workshopList = /** @type {HTMLElement|null} */ (document.querySelector('.workshop-list'));
        const timelineBtn = document.getElementById('view-timeline-btn');
        const cardsBtn = document.getElementById('view-cards-btn');
        const bothBtn = document.getElementById('view-both-btn');

        if (!timelineContainer || !workshopList) return;

        function setView(mode) {
            storageSet(isConferencePage ? 'cdl_conf_view_mode' : 'cdl_view_mode', mode);
            if (timelineBtn) timelineBtn.classList.toggle('active', mode === 'timeline');
            if (cardsBtn) cardsBtn.classList.toggle('active', mode === 'cards');
            if (bothBtn) bothBtn.classList.toggle('active', mode === 'both');

            if (mode === 'timeline') {
                timelineContainer.style.display = 'block';
                workshopList.style.display = 'none';
            } else if (mode === 'cards') {
                timelineContainer.style.display = 'none';
                workshopList.style.display = 'block';
            } else {
                timelineContainer.style.display = 'block';
                workshopList.style.display = 'block';
            }
        }

        const savedMode = isConferencePage ? (storageGet('cdl_conf_view_mode') || 'both') : (storageGet('cdl_view_mode') || 'timeline');
        setView(savedMode);

        if (timelineBtn) timelineBtn.addEventListener('click', () => setView('timeline'));
        if (cardsBtn) cardsBtn.addEventListener('click', () => setView('cards'));
        if (bothBtn) bothBtn.addEventListener('click', () => setView('both'));
    }

    /* ==========================================================================
       Keyboard Shortcuts (Cmd+K / Ctrl+K and / for Quick Search)
       ========================================================================== */
    function initSearchShortcut() {
        window.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            } else if (e.key === '/' && document.activeElement && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) && !(/** @type {HTMLElement} */ (document.activeElement)).isContentEditable) {
                e.preventDefault();
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
        });
    }

    /* ==========================================================================
       Local Assistant Bot Implementation (Offline NL QA + Optional Local Ollama LLM)
       ========================================================================== */
    function initLocalChatBot() {
        const widget = document.getElementById('dateline-chat-widget');
        const toggleBtn = document.getElementById('chat-toggle-btn');
        const panel = document.getElementById('chat-panel');
        const closeBtn = document.getElementById('chat-close-btn');
        const settingsBtn = document.getElementById('chat-llm-settings-btn');
        const settingsDrawer = document.getElementById('chat-settings-drawer');
        const form = document.getElementById('chat-form');
        const input = /** @type {HTMLInputElement|null} */ (document.getElementById('chat-input'));
        const messagesContainer = document.getElementById('chat-messages');
        const promptPills = document.querySelectorAll('.chat-prompt-pill');
        const enableOllamaCb = /** @type {HTMLInputElement|null} */ (document.getElementById('enable-ollama-cb'));
        const engineTag = document.getElementById('chat-engine-tag');

        if (!widget || !toggleBtn || !panel) return;

        toggleBtn.addEventListener('click', () => {
            const isHidden = panel.classList.contains('hidden');
            if (isHidden) {
                panel.classList.remove('hidden');
                if (messagesContainer && messagesContainer.children.length === 0) {
                    renderInitialBotMessage();
                }
                setTimeout(() => input && input.focus(), 100);
            } else {
                panel.classList.add('hidden');
            }
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => panel.classList.add('hidden'));
        }

        if (settingsBtn && settingsDrawer) {
            settingsBtn.addEventListener('click', () => {
                settingsDrawer.classList.toggle('hidden');
            });
        }

        if (enableOllamaCb && engineTag) {
            enableOllamaCb.addEventListener('change', () => {
                if (enableOllamaCb.checked) {
                    engineTag.textContent = 'Local Ollama LLM';
                    engineTag.style.color = '#0284c7';
                } else {
                    engineTag.textContent = 'Offline Local NLP';
                    engineTag.style.color = '#059669';
                }
            });
        }

        promptPills.forEach(pill => {
            pill.addEventListener('click', () => {
                const hPill = /** @type {HTMLElement} */ (pill);
                const prompt = hPill.dataset.prompt;
                if (!prompt) return;
                handleUserMessage(prompt);
            });
        });

        if (form && input) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const text = input.value.trim();
                if (!text) return;
                input.value = '';
                handleUserMessage(text);
            });
        }

        if (messagesContainer) {
            messagesContainer.addEventListener('click', (e) => {
                const target = /** @type {HTMLElement} */ (e.target);
                const btn = /** @type {HTMLElement|null} */ (target.closest('.chat-action-btn'));
                if (!btn) return;
                const action = btn.dataset.action;
                const val = btn.dataset.val || '';

                if (action === 'filter-conf') {
                    if (conferenceFilter) conferenceFilter.value = val;
                    if (searchInput) searchInput.value = '';
                    updateClearBtnVisibility();
                    renderTimeline();
                    renderWorkshopList();
                } else if (action === 'search-kw') {
                    if (searchInput) searchInput.value = val;
                    updateClearBtnVisibility();
                    renderTimeline();
                    renderWorkshopList();
                } else if (action === 'open-page') {
                    window.location.href = confSlug(val);
                }
            });
        }

        function renderInitialBotMessage() {
            appendMessage('bot', `
                <strong>Hello! I am Dateline Assistant</strong>, your local conference intelligence bot.<br><br>
                I run directly in your browser and can answer questions on:<br>
                • Upcoming deadlines & submission dates (AoE converted to local time)<br>
                • <strong>SERC Faculty Research Venues</strong> (CHI PLAY, ICSA, SEAMS, AGENT workshop, MODELS, ISEC, CAIN)<br>
                • VR / XR & Serious Games (CHI PLAY, IEEE VR, ISMAR)<br>
                • <strong>Co-hosted & sister conferences</strong> (events co-located with ICSE)<br>
                • CORE A* / A rankings & tracks<br><br>
                Ask me anything below or select a quick prompt!
            `);
        }

        async function handleUserMessage(query) {
            appendMessage('user', esc(query));
            const typingEl = appendMessage('bot', '<em>Thinking...</em>');

            try {
                if (enableOllamaCb && enableOllamaCb.checked) {
                    const urlInput = /** @type {HTMLInputElement|null} */ (document.getElementById('ollama-url'));
                    const modelInput = /** @type {HTMLInputElement|null} */ (document.getElementById('ollama-model'));
                    const ollamaUrl = ((urlInput ? urlInput.value.trim() : '') || 'http://localhost:11434').replace(/\/+$/, '');
                    const modelName = (modelInput ? modelInput.value.trim() : '') || 'llama3.2';
                    const reply = await askOllamaLLM(query, ollamaUrl, modelName);
                    if (typingEl) typingEl.innerHTML = reply;
                } else {
                    const reply = generateLocalAssistantReply(query);
                    if (typingEl) typingEl.innerHTML = reply;
                }
            } catch (err) {
                console.warn('Ollama query failed, falling back to local NLP:', err);
                const fallbackReply = generateLocalAssistantReply(query);
                if (typingEl) {
                    typingEl.innerHTML = `
                        <div style="font-size:11px; color:#d97706; margin-bottom:6px;">
                            Local Ollama was unreachable on localhost:11434. Responding with built-in offline intelligence:
                        </div>
                        ${fallbackReply}
                    `;
                }
            }

            if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function appendMessage(sender, htmlContent) {
            if (!messagesContainer) return null;
            const msgEl = document.createElement('div');
            msgEl.className = `chat-message ${sender}-msg`;
            msgEl.innerHTML = `<div class="chat-bubble">${htmlContent}</div>`;
            messagesContainer.appendChild(msgEl);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            return msgEl.querySelector('.chat-bubble');
        }
    }

    async function askOllamaLLM(prompt, endpoint, model) {
        const compactContext = allDeadlines.slice(0, 35).map(d => ({
            conf: d.conference_name,
            track: d.workshop_name || d.track_name,
            core: d.core_rating,
            due: d.paper_submission_date,
            loc: d.location,
            cohosted: d.cohosted
        }));

        const sysPrompt = `You are Dateline Assistant, assisting a researcher studying software engineering, virtual reality, software architecture, autonomous agents, and publication venues for SERC IIIT Hyderabad faculty (including Prof. Y. Raghu Reddy). Context: ${JSON.stringify(compactContext)}. Answer concisely with dates and CORE rankings.`;

        const resp = await fetch(`${endpoint}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model,
                prompt: `${sysPrompt}\n\nUser Question: ${prompt}`,
                stream: false
            })
        });

        if (!resp.ok) throw new Error(`Ollama HTTP ${resp.status}`);
        const data = await resp.json();
        return esc(data.response || 'No response returned from Ollama.').replace(/\n/g, '<br>');
    }

    function generateLocalAssistantReply(q) {
        const lower = q.toLowerCase();

        if (lower.includes('raghu') || lower.includes('serc') || lower.includes('faculty') || lower.includes('professor') || lower.includes('architecture') || lower.includes('agents')) {
            return `
                <strong>SERC IIIT Hyderabad Publication Venues:</strong><br><br>
                <strong>1. Prof. Y. Raghu Reddy (Virtual Reality, Requirements & Serious Games):</strong><br>
                • <strong>CHI PLAY (CORE A)</strong>: Serious games, game architectures, VR mazes (<em>ACMGVR 2024</em>).<br>
                • <strong>IEEE VR & VRW (CORE A*)</strong>: Locomotion in VR, visual acuity, HMD hardware evaluations.<br>
                • <strong>MODELS (CORE A)</strong>: <em>VRSpecML</em> domain-specific modeling for VR systems.<br>
                • <strong>ISEC (Flagship India)</strong>: 14+ publications on VR requirements, dev waste, smart contracts, ModSym.<br>
                • <strong>ICSE Companion & AST</strong>: <em>VReqST</em> requirement specification tool for VR.<br>
                • <strong>ASE Workshops</strong>: Conformance checking in VR interaction testing.<br><br>
                <strong>2. Software Architecture & Autonomous Agents:</strong><br>
                • <strong>ICSA (CORE A)</strong>: Premier software architecture venue. Architecture view generation via LLMs, AI agents generating microservices, refactoring.<br>
                • <strong>ECSA (CORE A)</strong>: Software architecture in the age of Agentic AI, sustainable MLOps (<em>HarmonE</em>).<br>
                • <strong>SEAMS (CORE A)</strong>: Self-adaptive systems, QoS routing for SLMs (<em>CALM</em>), sustainable MLOps (co-located with ICSE).<br>
                • <strong>AGENT Workshop</strong>: International Workshop on Agentic Engineering (co-located with ICSE).<br>
                • <strong>CAIN</strong>: AI Engineering – SE for AI (co-located with ICSE).<br>
                • <strong>ASE (CORE A*)</strong>: QoS-aware model switching in ML systems.<br><br>
                <div class="chat-actions-row">
                    <button type="button" class="chat-action-btn" data-action="search-kw" data-val="CHI PLAY">Filter CHI PLAY</button>
                    <button type="button" class="chat-action-btn" data-action="search-kw" data-val="ICSA">Filter ICSA</button>
                    <button type="button" class="chat-action-btn" data-action="search-kw" data-val="SEAMS">Filter SEAMS</button>
                    <button type="button" class="chat-action-btn" data-action="search-kw" data-val="AGENT">Filter AGENT</button>
                    <button type="button" class="chat-action-btn" data-action="search-kw" data-val="MODELS">Filter MODELS</button>
                    <button type="button" class="chat-action-btn" data-action="search-kw" data-val="ISEC">Filter ISEC</button>
                </div>
            `;
        }

        if (lower.includes('upcoming') || lower.includes('next') || lower.includes('deadline') || lower.includes('due') || lower.includes('when')) {
            const upcoming = allDeadlines
                .filter(d => {
                    const dt = parseAoeDate(d.paper_submission_date);
                    return dt && dt.getTime() >= Date.now();
                })
                .sort((a, b) => parseAoeDate(a.paper_submission_date) - parseAoeDate(b.paper_submission_date))
                .slice(0, 5);

            if (upcoming.length === 0) {
                return 'No upcoming deadlines found in the active 1-year window.';
            }

            const itemsHtml = upcoming.map(d => {
                const status = getDeadlineStatus(d.paper_submission_date);
                const days = status ? Math.max(0, status.days) : 0;
                const name = d.workshop_name || d.track_name || 'Main Track';
                const meta = getMeta(d.conference_name);
                const localHint = formatAoeToLocal(d.paper_submission_date);
                return `
                    <div style="margin-bottom:6px; padding:4px 0; border-bottom:1px dashed var(--color-border);">
                        <strong>${renderFlagHtml(meta, 'flag-sm')} ${esc(d.conference_name)}</strong> - ${esc(name)}<br>
                        Due: <strong>${esc(formatDate(d.paper_submission_date))}</strong> (AoE • ${days} days left${d.estimated ? ' • <em>estimated, unconfirmed</em>' : ''})<br>
                        ${localHint ? `<span style="font-size:11px; color:var(--color-text-secondary);">Your time: ${esc(localHint)}</span> • ` : ''}<span class="core-tag">${esc(meta.coreRating)}</span>
                    </div>
                `;
            }).join('');

            return `
                <strong>Next Upcoming Deadlines:</strong><br><br>
                ${itemsHtml}
                <div class="chat-actions-row">
                    <button type="button" class="chat-action-btn" data-action="search-kw" data-val="">View All in Timeline</button>
                </div>
            `;
        }

        if (lower.includes('vr') || lower.includes('chi play') || lower.includes('kai play') || lower.includes('game') || lower.includes('virtual') || lower.includes('xr')) {
            return `
                <strong>Virtual Reality & Gaming Venues Tracked:</strong><br><br>
                • <strong>CHI PLAY 2026 (CORE A)</strong>: York, United Kingdom, Nov 2-5 (Papers, Work-in-Progress, Serious Games Showcase).<br>
                • <strong>IEEE VR 2027 (CORE A*)</strong>: Melbourne, Australia (Research Papers, Posters, 3DUI, KELVAR, SEARIS, OpenXRS).<br>
                • <strong>ISMAR 2027 (CORE A*)</strong>: Bari, Italy (Research Papers, Posters, XR-Health).<br>
                • <strong>VRST 2026 (CORE A)</strong>: Sendai, Japan (Full Papers, Short Papers & Demos).<br><br>
                <div class="chat-actions-row">
                    <button type="button" class="chat-action-btn" data-action="search-kw" data-val="VR">Filter to VR / XR</button>
                    <button type="button" class="chat-action-btn" data-action="search-kw" data-val="CHI PLAY">Filter to CHI PLAY</button>
                    <button type="button" class="chat-action-btn" data-action="open-page" data-val="IEEE VR">View IEEE VR Page</button>
                </div>
            `;
        }

        if (lower.includes('cohosted') || lower.includes('co-hosted') || lower.includes('colocated') || lower.includes('sister')) {
            return `
                <strong>Co-hosted Conferences & Sister Events:</strong><br><br>
                • <strong>ICSE 2027 (Dublin)</strong> co-hosts: <em>SEAMS</em> (CORE A), <em>CAIN</em>, <em>AGENT Workshop</em>, <em>MSR</em> (CORE A), <em>ICPC</em> (CORE A), <em>LLM4Code</em>, <em>DeepTest</em>.<br>
                • <strong>IEEE VR 2027 (Melbourne)</strong> co-hosts: <em>3DUI Symposium</em> (CORE A*), <em>KELVAR</em>, <em>SEARIS</em>, <em>OpenXRS</em>, <em>XR-Health</em>.<br>
                • <strong>ISMAR 2027 (Bari)</strong> co-hosts: <em>XR-Health Workshop</em>, <em>MAR Art & Design</em>.<br>
                • <strong>CHI PLAY 2026 (York)</strong> co-hosts: <em>Serious Games & VR Showcase</em>, <em>Work-in-Progress & Demos</em>.<br>
                • <strong>ISEC 2026 (Hyderabad)</strong> co-hosts: <em>ModSym</em> (Modelling Symposium), <em>VR in SE Track</em>.<br><br>
                <div class="chat-actions-row">
                    <button type="button" class="chat-action-btn" data-action="open-page" data-val="ICSE">Open ICSE Page</button>
                    <button type="button" class="chat-action-btn" data-action="open-page" data-val="IEEE VR">Open IEEE VR Page</button>
                </div>
            `;
        }

        if (lower.includes('agent') || lower.includes('agentic') || lower.includes('llm') || /\bai\b/.test(lower)) {
            return `
                <strong>Agentic Engineering & AI Workshops:</strong><br><br>
                • <strong>AGENT Workshop</strong>: International Workshop on Agentic Engineering (Agentic AI in SE, co-located with ICSE 2027).<br>
                • <strong>CAIN</strong>: IEEE/ACM Conference on AI Engineering – Software Engineering for AI (co-located with ICSE).<br>
                • <strong>LLM4Code</strong>: LLMs for Code workshop (ICSE).<br>
                • <strong>LLMTrust</strong>: Trustworthy LLMs in SE (FSE).<br>
                • <strong>CauSE</strong>: Causal Methods in SE (FSE).<br>
                • <strong>SE4ALL</strong>: Software Engineering and AI for All (ICSE).<br><br>
                <div class="chat-actions-row">
                    <button type="button" class="chat-action-btn" data-action="search-kw" data-val="Agents">Filter to Agents</button>
                    <button type="button" class="chat-action-btn" data-action="search-kw" data-val="AI">Filter to AI / LLM</button>
                </div>
            `;
        }

        if (lower.includes('core') || lower.includes('ranking') || lower.includes('rating') || lower.includes('a*')) {
            return `
                <strong>CORE Rankings Overview:</strong><br><br>
                • <strong>CORE A* (Premier)</strong>: ICSE, FSE, IEEE VR, ISMAR.<br>
                • <strong>CORE A (Major)</strong>: CHI PLAY, ICSA, SEAMS, MODELS, ECSA, MSR, ICPC, ISSTA, SANER, EASE, VRST.<br><br>
                <div class="chat-actions-row">
                    <button type="button" class="chat-action-btn" data-action="search-kw" data-val="A*">Show CORE A*</button>
                    <button type="button" class="chat-action-btn" data-action="search-kw" data-val="A">Show CORE A</button>
                </div>
            `;
        }

        const matches = allDeadlines.filter(d => {
            const conf = (d.conference_name || '').toLowerCase();
            const track = (d.workshop_name || d.track_name || '').toLowerCase();
            const loc = (d.location || '').toLowerCase();
            return conf.includes(lower) || track.includes(lower) || loc.includes(lower);
        }).slice(0, 4);

        if (matches.length > 0) {
            const resHtml = matches.map(m => {
                const meta = getMeta(m.conference_name);
                const name = m.workshop_name || m.track_name || 'Main Track';
                return `• <strong>${renderFlagHtml(meta, 'flag-sm')} ${esc(m.conference_name)}</strong> - ${esc(name)} (Due: ${esc(formatDate(m.paper_submission_date))})`;
            }).join('<br>');

            return `
                I found ${matches.length} matching entries for "<strong>${esc(q)}</strong>":<br><br>
                ${resHtml}<br><br>
                <div class="chat-actions-row">
                    <button type="button" class="chat-action-btn" data-action="search-kw" data-val="${esc(q)}">Filter Timeline to "${esc(q)}"</button>
                </div>
            `;
        }

        return `
            I'm tracking <strong>${allConferences.length} conferences</strong> and <strong>${allDeadlines.length} tracks</strong>.<br><br>
            Try asking about:<br>
            • <em>"What deadlines are coming up next?"</em><br>
            • <em>"Where does SERC faculty publish?"</em><br>
            • <em>"Show me VR & CHI PLAY conferences"</em><br>
            • <em>"What conferences are co-hosted with ICSE?"</em><br>
            • <em>"Show agent and AI workshops"</em>
        `;
    }

    // App Initialization
    async function init() {
        initTheme();
        initUserMemory();
        initViewMode();
        initSearchShortcut();

        try {
            allDeadlines = await fetchDeadlines();
            allConferences = deriveConferences(allDeadlines);

            setupNavigation();
            setupEventListeners();

            if (isConferencePage && selectedConference) {
                renderConferenceHero(selectedConference);
            }

            renderTimeline();
            renderWorkshopList();
            renderPinnedTargets();
            initLocalChatBot();
        } catch (err) {
            console.error('Failed to initialize Conference DateLine:', err);
            const container = document.getElementById('timeline-chart');
            if (container) {
                container.innerHTML = '<div class="no-data">Failed to load conference deadlines data. Please refresh.</div>';
            }
        }
    }

    init();
});