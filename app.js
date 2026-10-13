/**
 * Conference Deadline Tracker - Frontend JavaScript
 * Supports All Conferences View and Dedicated Conference Pages,
 * Sorting, CORE Rating Filtering, Locations, and Flags.
 * VR Conferences, Workshops, Keyword Search, CORE Ratings, Sorting, Locations, and Flags.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Conference Metadata (Locations, Flags, CORE ratings, Year, etc.)
    const CONFERENCE_METADATA = {
        'ICSE': {
            fullName: 'International Conference on Software Engineering',
            coreRating: 'A*',
            location: 'Dublin, Ireland',
            country: 'Ireland',
            flag: '🇮🇪',
            year: '2027',
            website: 'https://conf.researchr.org/home/icse-2027'
            website: 'https://conf.researchr.org/home/icse-2027',
            cohosted: ['SEAMS', 'CAIN', 'AGENT', 'MSR', 'ICPC', 'LLM4Code', 'DeepTest', 'ChainSEC']
        },
        'FSE': {
            fullName: 'ACM International Conference on the Foundations of Software Engineering',
            coreRating: 'A*',
            location: 'Shenzhen, China',
            country: 'China',
            flag: '🇨🇳',
            year: '2027',
            website: 'https://conf.researchr.org/home/fse-2027'
            website: 'https://conf.researchr.org/home/fse-2027',
            cohosted: ['LLMTrust Workshop', 'CauSE Workshop', 'Student Research Competition']
        },
        'ISSTA': {
            fullName: 'International Symposium on Software Testing and Analysis',
            coreRating: 'A',
            location: 'Singapore',
            country: 'Singapore',
            flag: '🇸🇬',
            year: '2027',
            website: 'https://conf.researchr.org/home/issta-2027'
            website: 'https://conf.researchr.org/home/issta-2027',
            cohosted: ['ISSTA Tool Demos', 'Doctoral Symposium']
        },
        'SANER': {
            fullName: 'IEEE International Conference on Software Analysis, Evolution and Reengineering',
            coreRating: 'A',
            location: 'Richmond, Virginia, USA',
            country: 'United States',
            flag: '🇺🇸',
            year: '2027',
            website: 'https://conf.researchr.org/home/saner-2027'
            website: 'https://conf.researchr.org/home/saner-2027',
            cohosted: ['IWESEP', 'ERA Track', 'RENE Track']
        },
        'EASE': {
            fullName: 'International Conference on Evaluation and Assessment in Software Engineering',
            coreRating: 'A',
            location: 'Hanoi, Vietnam',
            country: 'Vietnam',
            flag: '🇻🇳',
            year: '2027',
            website: 'https://conf.researchr.org/home/ease-2027'
            website: 'https://conf.researchr.org/home/ease-2027',
            cohosted: ['Emerging Results Track', 'Doctoral Symposium']
        },
        'IEEE VR': {
            fullName: 'IEEE Conference on Virtual Reality and 3D User Interfaces',
            coreRating: 'A*',
            location: 'Melbourne, Australia',
            country: 'Australia',
            flag: '🇦🇺',
            year: '2027',
            website: 'https://ieeevr.org/2027/'
            website: 'https://ieeevr.org/2027/',
            cohosted: ['3DUI Symposium', 'KELVAR', 'SEARIS', 'OpenXRS', 'XR-Health']
        },
        'ISMAR': {
            fullName: 'IEEE International Symposium on Mixed and Augmented Reality',
            coreRating: 'A*',
            location: 'Bari, Italy',
            country: 'Italy',
            flag: '🇮🇹',
            year: '2027',
            website: 'https://ieeeismar.net/'
            website: 'https://ieeeismar.net/',
            cohosted: ['XR-Health Workshop', 'MAR Art & Design', 'Doctoral Consortium']
        },
        'VRST': {
            fullName: 'ACM Symposium on Virtual Reality Software and Technology',
            coreRating: 'A',
            location: 'Sendai, Japan',
            country: 'Japan',
            flag: '🇯🇵',
            year: '2026',
            website: 'https://vrst.acm.org/'
            website: 'https://vrst.acm.org/',
            cohosted: ['Virtual Reality Technologies Workshop', 'Posters & Demos']
        },
        'CHI PLAY': {
            fullName: 'ACM SIGCHI Annual Symposium on Computer-Human Interaction in Play',
            coreRating: 'A',
            location: 'Zurich, Switzerland',
            country: 'Switzerland',
            flag: '🇨🇭',
            year: '2026',
            website: 'https://chiplay.acm.org/2026/',
            cohosted: ['Serious Games & VR Showcase', 'CHI PLAY WIP & Demos']
        },
        'ICSA': {
            fullName: 'IEEE International Conference on Software Architecture',
            coreRating: 'A',
            location: 'Amsterdam, Netherlands',
            country: 'Netherlands',
            flag: '🇳🇱',
            year: '2026',
            website: 'https://conf.researchr.org/home/icsa-2026',
            cohosted: ['CAAIN Workshop', 'NEMI Track', 'Architecture in Practice']
        },
        'SEAMS': {
            fullName: 'International Symposium on Software Engineering for Adaptive and Self-Managing Systems',
            coreRating: 'A',
            location: 'Dublin, Ireland (Co-located with ICSE 2027)',
            country: 'Ireland',
            flag: '🇮🇪',
            year: '2027',
            website: 'https://conf.researchr.org/home/seams-2026',
            cohosted: ['ICSE', 'CAIN', 'AGENT', 'MSR', 'ICPC']
        },
        'AGENT': {
            fullName: 'International Workshop on Agentic Engineering (Agentic AI in SE)',
            coreRating: 'Workshop',
            location: 'Dublin, Ireland (Co-located with ICSE 2027)',
            country: 'Ireland',
            flag: '🇮🇪',
            year: '2027',
            website: 'https://agentic-engineering.github.io/',
            cohosted: ['ICSE', 'SEAMS', 'CAIN']
        },
        'CAIN': {
            fullName: 'IEEE/ACM International Conference on AI Engineering – Software Engineering for AI',
            coreRating: 'A',
            location: 'Dublin, Ireland (Co-located with ICSE 2027)',
            country: 'Ireland',
            flag: '🇮🇪',
            year: '2027',
            website: 'https://conf.researchr.org/home/cain-2026',
            cohosted: ['ICSE', 'SEAMS', 'AGENT']
        },
        'MODELS': {
            fullName: 'ACM/IEEE International Conference on Model Driven Engineering Languages and Systems',
            coreRating: 'A',
            location: 'Linz, Austria',
            country: 'Austria',
            flag: '🇦🇹',
            year: '2026',
            website: 'https://conf.researchr.org/home/models-2026',
            cohosted: ['SAM (System Analysis and Modelling)', 'MDE4AI Workshop']
        },
        'ISEC': {
            fullName: 'Innovations in Software Engineering Conference',
            coreRating: 'A',
            location: 'Hyderabad, India',
            country: 'India',
            flag: '🇮🇳',
            year: '2026',
            website: 'https://isec2026.github.io/',
            cohosted: ['ModSym (Modelling Symposium)', 'VR in Software Engineering Track']
        },
        'ECSA': {
            fullName: 'European Conference on Software Architecture',
            coreRating: 'A',
            location: 'Limassol, Cyprus',
            country: 'Cyprus',
            flag: '🇨🇾',
            year: '2026',
            website: 'https://ecsa2026.disim.univaq.it/',
            cohosted: ['Agentic AI & Sustainable Software Track', 'ECSA Workshops']
        },
        'MSR': {
            fullName: 'Mining Software Repositories',
            coreRating: 'A',
            location: 'Dublin, Ireland (Co-located with ICSE 2027)',
            country: 'Ireland',
            flag: '🇮🇪',
            year: '2027',
            website: 'https://conf.researchr.org/home/msr-2027',
            cohosted: ['ICSE', 'ICPC', 'SEAMS']
        },
        'ICPC': {
            fullName: 'IEEE/ACM International Conference on Program Comprehension',
            coreRating: 'A',
            location: 'Dublin, Ireland (Co-located with ICSE 2027)',
            country: 'Ireland',
            flag: '🇮🇪',
            year: '2027',
            website: 'https://conf.researchr.org/home/icpc-2027',
            cohosted: ['ICSE', 'MSR', 'SEAMS']
        }
    };

    function confSlug(name) {
        return name.toLowerCase().replace(/\s+/g, '-') + '.html';
    }

    function getMeta(confName) {
        return CONFERENCE_METADATA[confName] || {
            fullName: `${confName} Conference`,
            coreRating: 'Unranked',
            location: 'TBA',
            country: '',
            flag: '🌐',
            year: '2027',
            website: '#'
        };
    }

    // State
    let allDeadlines = [];
    let allConferences = [];

    // Page mode detection
    const isConferencePage = document.body.dataset.page === 'conference';
    const urlParams = new URLSearchParams(window.location.search);
    let selectedConference = document.body.dataset.conf || urlParams.get('conf') || '';

    // DOM Elements
    const searchInput = document.getElementById('keyword-search');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const keywordChips = document.querySelectorAll('.keyword-chip');
    const conferenceFilter = document.getElementById('conference-filter');
    const coreFilter = document.getElementById('core-filter');
    const sortOrderSelect = document.getElementById('sort-order');
    const workshopListContainer = document.getElementById('workshop-list-container');
    const conferenceStats = document.getElementById('conference-stats');
    const workshopCount = document.getElementById('workshop-count');
    const quickPillsContainer = document.getElementById('conference-quick-pills');
    const switcherContainer = document.getElementById('conference-switcher');

    // Helper: Safely parses YYYY-MM-DD date strings in local time without UTC offset shifts
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

    // Derive the conference list from the deadlines
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

    async function fetchDeadlines() {
        const r = await fetch('data/deadlines.json');
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        // Enrich data with metadata if missing
        return data.map(d => {
            const meta = getMeta(d.conference_name);
            return {
                ...d,
                core_rating: d.core_rating || meta.coreRating,
                location: d.location || meta.location,
                flag: d.flag || meta.flag
            };
        });
    }

    // Initialize
    init();

    async function init() {
        await loadDeadlines();
        setupNavigation();
        setupEventListeners();
        initCohostedEvents();
        initLocalChatBot();
    }

    async function loadDeadlines() {
        try {
            allDeadlines = await fetchDeadlines();
            allConferences = deriveConferences(allDeadlines);

            // Default conference for dedicated page if none provided
            if (isConferencePage && !selectedConference && allConferences.length > 0) {
                selectedConference = allConferences[0].name;
            }

            if (isConferencePage) {
                renderConferenceHero(selectedConference);
            }

            renderTimeline();
            renderWorkshopList();
        } catch (error) {
            console.error('Error loading deadlines:', error);
        }
    }

    function setupNavigation() {
        // Setup for Home Page
        if (!isConferencePage && conferenceFilter) {
            conferenceFilter.innerHTML = '<option value="all">All Conferences</option>';
            allConferences.forEach(conf => {
                const meta = getMeta(conf.name);
                const option = document.createElement('option');
                option.value = conf.name;
                option.textContent = `${conf.name} ${meta.flag} (${meta.coreRating})`;
                conferenceFilter.appendChild(option);
            });

            if (urlParams.get('conf')) {
                conferenceFilter.value = urlParams.get('conf');
            }
        }

        // Setup dedicated page pills on Home Page
        if (quickPillsContainer) {
            quickPillsContainer.innerHTML = '';
            allConferences.forEach(conf => {
                const meta = getMeta(conf.name);
                const link = document.createElement('a');
                link.href = `${conf.name.toLowerCase()}.html`;
                link.href = confSlug(conf.name);
                link.className = 'dedicated-pill-link';
                link.innerHTML = `<span>${meta.flag}</span> <strong>${conf.name}</strong> <span class="pill-core">${meta.coreRating}</span> ↗`;
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
                link.href = `${conf.name.toLowerCase()}.html`;
                link.href = confSlug(conf.name);
                link.className = `switcher-pill ${isActive ? 'is-active' : ''}`;
                link.innerHTML = `<span>${meta.flag}</span> <strong>${conf.name}</strong>`;
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
        const heroWebsiteLink = document.getElementById('hero-website-link');
        const listTitle = document.getElementById('workshop-list-title');

        document.title = `${confName} ${meta.flag} - Conference Deadlines & Tracks`;

        if (heroTitle) heroTitle.textContent = `${confName} ${meta.year}`;
        if (heroFlag) heroFlag.textContent = meta.flag;
        if (heroCoreBadge) {
            heroCoreBadge.textContent = `CORE ${meta.coreRating}`;
            heroCoreBadge.className = `core-badge ${meta.coreRating === 'A*' ? 'is-core-star' : 'is-core-a'}`;
        }
        if (heroDesc) heroDesc.textContent = meta.fullName;
        if (heroLocation) heroLocation.textContent = `📍 ${meta.location}`;
        if (heroYear) heroYear.textContent = `📅 ${meta.year}`;

        const confDeadlines = allDeadlines.filter(d => d.conference_name.toUpperCase() === confName.toUpperCase());
        if (heroTracksCount) heroTracksCount.textContent = `📊 ${confDeadlines.length} Tracks & Workshops`;

        if (heroWebsiteLink) {
            // Find first website URL from tracks if available
            const trackWithUrl = confDeadlines.find(d => d.website_url);
            heroWebsiteLink.href = trackWithUrl ? trackWithUrl.website_url : meta.website;
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
                    const link = hasPage ? confSlug(item) : '#';
                    return `
                        <div class="cohosted-pill-card" data-conf="${item}">
                            <span class="cohosted-pill-flag">${itemMeta.flag}</span>
                            <strong>${item}</strong>
                            <span class="cohosted-pill-badge">${itemMeta.coreRating}</span>
                            ${hasPage ? `<a href="${link}" class="btn-card-action" style="padding:1px 6px;">Page ↗</a>` : ''}
                            <button type="button" class="btn-card-action cohost-filter-chip" data-conf="${item}">View Details 🤝</button>
                        </div>
                    `;
                }).join('');

                // Attach click handlers to cohost filter chips
                cohostedPillsRow.querySelectorAll('.cohost-filter-chip').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openCohostedModal(btn.dataset.conf);
                    });
                });
            } else {
                cohostedBannerSection.style.display = 'none';
            }
        }
    }

    function setupEventListeners() {
        // Keyword Search Input
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

        // Quick Keyword Chips
        keywordChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const keyword = chip.dataset.keyword;
                const wasActive = chip.classList.contains('is-active');

                // Clear other active chips
                keywordChips.forEach(c => c.classList.remove('is-active'));

                if (wasActive) {
                    if (searchInput) searchInput.value = '';
                } else {
                    chip.classList.add('is-active');
                    if (searchInput) searchInput.value = keyword;
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
    }

    function updateClearBtnVisibility() {
        if (!clearSearchBtn) return;
        const hasText = searchInput && searchInput.value.trim().length > 0;
        clearSearchBtn.style.display = hasText ? 'inline-flex' : 'none';
    }

    function getFilteredDeadlines() {
        let result = [...allDeadlines];

        // If on dedicated conference page, strictly filter to that conference
        // 1. Keyword search filter
        const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
        if (query) {
            result = result.filter(d => {
                const conf = (d.conference_name || '').toLowerCase();
                const track = (d.track_name || '').toLowerCase();
                const workshop = (d.workshop_name || '').toLowerCase();
                const location = (d.location || '').toLowerCase();
                const core = (d.core_rating || '').toLowerCase();
                const meta = getMeta(d.conference_name);
                const fullName = (meta.fullName || '').toLowerCase();

                if (query === 'workshop') {
                    return Boolean(d.workshop_name);
                }

                if (query === 'vr' || query === 'xr') {
                    return conf.includes('vr') || conf.includes('ismar') || track.includes('vr') ||
                           workshop.includes('vr') || workshop.includes('xr') || workshop.includes('virtual') ||
                           fullName.includes('virtual');
                }

                if (query === 'ai' || query === 'llm') {
                    return track.includes('ai') || workshop.includes('ai') || workshop.includes('llm') ||
                           track.includes('llm') || track.includes('intelligence');
                           track.includes('llm') || track.includes('intelligence') || conf.includes('cain');
                }

                if (query === 'agents' || query === 'agent') {
                    return conf.includes('agent') || track.includes('agent') || workshop.includes('agent') ||
                           fullName.includes('agent') || track.includes('autonomous');
                }

                if (query === 'chi play' || query === 'games' || query === 'game') {
                    return conf.includes('chi play') || track.includes('game') || workshop.includes('game') ||
                           track.includes('play') || workshop.includes('play');
                }

                if (query === 'architecture') {
                    return conf.includes('icsa') || conf.includes('ecsa') || track.includes('architecture') ||
                           workshop.includes('architecture') || fullName.includes('architecture');
                }

                return conf.includes(query) || track.includes(query) || workshop.includes(query) ||
                       location.includes(query) || core.includes(query) || fullName.includes(query);
            });
        }

        // 2. Conference filter (home or dedicated page)
        if (isConferencePage && selectedConference) {
            result = result.filter(d => d.conference_name.toUpperCase() === selectedConference.toUpperCase());
        } else if (conferenceFilter && conferenceFilter.value !== 'all') {
            result = result.filter(d => d.conference_name === conferenceFilter.value);
        }

        // Filter by CORE rating
        // 3. CORE rating filter
        if (coreFilter && coreFilter.value !== 'all') {
            const targetRating = coreFilter.value;
            result = result.filter(d => {
                const meta = getMeta(d.conference_name);
                return meta.coreRating === targetRating;
            });
        }

        // Sorting
        // 4. Sorting
        const sortVal = sortOrderSelect ? sortOrderSelect.value : 'deadline-asc';
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        result.sort((a, b) => {
            const startA = parseLocalDate(a.paper_submission_date) || new Date(9999, 0, 1);
            const startB = parseLocalDate(b.paper_submission_date) || new Date(9999, 0, 1);
            const endA = parseLocalDate(a.intimation_date) || new Date(9999, 0, 1);
            const endB = parseLocalDate(b.intimation_date) || new Date(9999, 0, 1);

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
                case 'deadline-asc':
                default:
                    return startA - startB;
            }
        });

        return result;
    }

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

        // Set time window: 1 week ago to 1 year from today
        const minDate = new Date(today);
        minDate.setDate(minDate.getDate() - 7);

        const maxDate = new Date(today);
        maxDate.setFullYear(maxDate.getFullYear() + 1);

        const totalDays = (maxDate - minDate) / 86400000;
        const todayOffset = Math.max(0, Math.min(100, ((today - minDate) / 86400000) / totalDays * 100));

        // Filter deadlines that overlap with this 1-year range
        const deadlines = rawDeadlines.filter(d => {
            const start = parseLocalDate(d.paper_submission_date);
            const end = parseLocalDate(d.intimation_date);
            return start && end && end >= minDate && start <= maxDate;
        });

        if (deadlines.length === 0) {
            container.innerHTML = '<div class="no-data">No active deadline date ranges found within the 1-year window</div>';
            if (conferenceStats) conferenceStats.textContent = '0 active deadlines';
            return;
        }

        // Calculate widths for conference column and track label column
        let confColWidth = isConferencePage ? 60 : 54;
        let trackLabelWidth = 140;

        deadlines.forEach(d => {
            const confName = d.conference_name || 'Conference';
            const name = d.workshop_name || d.track_name || 'Main Track';

            const confTextWidth = Math.min(confName.length * 8, 70);
            confColWidth = Math.max(confColWidth, confTextWidth);

            const textWidth = Math.ceil(name.length * 7.2);
            trackLabelWidth = Math.max(trackLabelWidth, textWidth);
        });

        trackLabelWidth = Math.min(Math.max(trackLabelWidth, 140), 190);

        // Group deadlines by conference preserving order
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

        // Update stats badge
        if (conferenceStats) {
            const uniqueFlags = [...new Set(confOrder.map(c => getMeta(c).flag))].join(' ');
            conferenceStats.textContent = `${confOrder.length} Conferences • ${deadlines.length} Tracks ${uniqueFlags ? '• ' + uniqueFlags : ''}`;
        }
        if (workshopCount) {
            workshopCount.textContent = `Showing ${deadlines.length} items`;
            const query = searchInput ? searchInput.value.trim() : '';
            workshopCount.textContent = query ? `Showing ${deadlines.length} results for "${query}"` : `Showing ${deadlines.length} items`;
        }

        // Calculate month boundaries for scale and vertical grid lines
        const months = [];
        const curDate = new Date(minDate);
        curDate.setDate(1);
        const endDate = new Date(maxDate);

        while (curDate <= endDate) {
            const monthStart = new Date(curDate.getFullYear(), curDate.getMonth(), 1);
            const offset = ((monthStart - minDate) / 86400000) / totalDays;
            if (offset >= 0 && offset <= 1) {
                months.push({
                    date: new Date(curDate),
                    left: offset * 100
                });
            }
            curDate.setMonth(curDate.getMonth() + 1);
        }

        // Render Header Scale with clean horizontal month markers
        let html = `
            <div class="timeline-wrapper">
                <div class="timeline-scale-row" style="display: grid; grid-template-columns: ${confColWidth}px ${trackLabelWidth}px 1fr; column-gap: 12px;">
                    <div class="timeline-label-spacer"></div>
                    <div class="timeline-label-spacer"></div>
                    <div class="timeline-scale">
        `;

        // Render month ticks and horizontal labels
        months.forEach((month, i) => {
            const nextLeft = months[i + 1] ? months[i + 1].left : 100;
            const midLeft = (month.left + nextLeft) / 2;
            const monthName = month.date.toLocaleDateString('en-US', { month: 'short' });
            const yearShort = month.date.toLocaleDateString('en-US', { year: '2-digit' });

            html += `<div class="scale-tick" style="left: ${month.left}%"></div>`;
            html += `<div class="scale-month-label" style="left: ${midLeft}%"><span>${monthName} '${yearShort}</span></div>`;
        });

        // Today tag in header scale
        html += `
                        <div class="scale-today-marker" style="left: ${todayOffset}%">
                            <span class="today-tag">Today</span>
                        </div>
                    </div>
                </div>
                <div class="timeline-bars" style="display: grid; grid-template-columns: ${confColWidth}px ${trackLabelWidth}px 1fr; column-gap: 12px; row-gap: 8px;">
        `;

        // Generate rows and conference separators
        let currentRow = 1;
        let rowsHtml = '';

        confOrder.forEach((confName, confIndex) => {
            const tracks = groupedDeadlines[confName];
            const trackCount = tracks.length;
            const startRow = currentRow;
            const meta = getMeta(confName);
            const pageUrl = confSlug(confName);

            // Conference badge column with Flag & CORE rating (links to dedicated page)
            // Conference badge column with Flag & CORE rating (links to dedicated page & opens cohosted modal)
            const cohostedCount = (meta.cohosted || []).length;
            rowsHtml += `
                <div class="conference-column" style="grid-row: ${startRow} / span ${trackCount}; grid-column: 1;" title="${confName} (${meta.coreRating}) • ${meta.location}">
                    <a href="${pageUrl}" class="conference-badge-link">
                    <a href="${pageUrl}" class="conference-badge-link" data-conf="${confName}">
                        <div class="conference-badge-vertical">
                            <span class="badge-flag">${meta.flag}</span>
                            <span class="badge-name">${confName}</span>
                            <span class="badge-core">${meta.coreRating}</span>
                        </div>
                    </a>
                    ${cohostedCount > 0 ? `
                        <button type="button" class="cohosted-trigger-badge" data-conf="${confName}" title="View ${cohostedCount} co-hosted events for ${confName}">
                            🤝 ${cohostedCount}
                        </button>
                    ` : ''}
                </div>
            `;

            // Render each track row
            tracks.forEach((d, trackIndex) => {
                const row = startRow + trackIndex;
                const start = parseLocalDate(d.paper_submission_date);
                const end = parseLocalDate(d.intimation_date);
                const abstractDate = parseLocalDate(d.abstract_deadline);

                const startOffset = Math.max(0, Math.min(100, ((start - minDate) / 86400000) / totalDays * 100));
                const endOffset = Math.max(0, Math.min(100, ((end - minDate) / 86400000) / totalDays * 100));
                const width = Math.max(1.5, endOffset - startOffset);

                const daysToSubmission = Math.ceil((start - today) / 86400000);

                let statusClass = 'days-status-safe';
                if (daysToSubmission <= 0) statusClass = 'days-status-past';
                else if (daysToSubmission <= 10) statusClass = 'days-status-urgent';
                else if (daysToSubmission <= 30) statusClass = 'days-status-soon';
                else if (daysToSubmission <= 60) statusClass = 'days-status-medium';

                const daysDisplay = daysToSubmission > 0 ? `${daysToSubmission}d left` : 
                                   daysToSubmission === 0 ? 'Today!' : 
                                   `${Math.abs(daysToSubmission)}d ago`;

                const name = d.workshop_name || d.track_name || 'Main Track';
                const websiteUrl = d.website_url || '';
                const durationDays = Math.round((end - start) / 86400000);

                const formatDateSafe = (date) => date ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
                const barTooltip = `${confName} ${meta.flag} - ${name}\nLocation: ${meta.location}\nCORE: ${meta.coreRating}\nSubmission: ${formatDateSafe(start)}\nNotification: ${formatDateSafe(end)}${abstractDate ? `\nAbstract: ${formatDateSafe(abstractDate)}` : ''}`;

                rowsHtml += `
                    <div class="timeline-row conf-group-${confIndex % 2}" style="grid-row: ${row}; grid-column: 2 / span 2;">
                        <div class="timeline-label" style="width: ${trackLabelWidth}px;">
                            <div class="track-name">${websiteUrl ? `<a href="${websiteUrl}" target="_blank" rel="noopener noreferrer" title="${name}">${name}</a>` : `<span title="${name}">${name}</span>`}</div>
                            <div class="days-left-badge ${statusClass}">${daysDisplay}</div>
                        </div>
                        <div class="timeline-bar-container" title="${barTooltip}">
                            <div class="timeline-bar submission-start" style="left: ${startOffset}%; width: ${width}%">
                                <span class="duration">${durationDays}d</span>
                            </div>
                            ${abstractDate && abstractDate >= minDate && abstractDate <= maxDate ? `<div class="timeline-marker abstract-marker" style="left: ${((abstractDate - minDate) / 86400000) / totalDays * 100}%" title="Abstract Deadline: ${formatDateSafe(abstractDate)}"></div>` : ''}
                            ${end >= minDate && end <= maxDate ? `<div class="timeline-marker notification-marker" style="left: ${((end - minDate) / 86400000) / totalDays * 100}%" title="Notification Date: ${formatDateSafe(end)}"></div>` : ''}
                        </div>
                    </div>
                `;
            });

            currentRow += trackCount;

            // Conference Separator in between conferences
            if (confIndex < confOrder.length - 1) {
                rowsHtml += `
                    <div class="conference-separator" style="grid-row: ${currentRow}; grid-column: 1 / span 3;" role="separator"></div>
                `;
                currentRow++;
            }
        });

        const totalRows = currentRow - 1;

        // Layer 1: Month grid lines in column 3 (rendered behind bars)
        const gridLinesHtml = `
            <div class="timeline-grid-lines" style="grid-column: 3; grid-row: 1 / span ${totalRows};">
                ${months.map(m => `<div class="month-grid-line" style="left: ${m.left}%"></div>`).join('')}
            </div>
        `;

        // Layer 3: Today line overlay in column 3 (rendered in front of bars)
        const todayLineHtml = `
            <div class="timeline-today-layer" style="grid-column: 3; grid-row: 1 / span ${totalRows};">
                <div class="today-line-overlay" style="left: ${todayOffset}%"></div>
            </div>
        `;

        html += gridLinesHtml + rowsHtml + todayLineHtml;
        html += '</div></div>';
        container.innerHTML = html;
    }

    function renderWorkshopList() {
        const deadlines = getFilteredDeadlines();

        if (deadlines.length === 0) {
            workshopListContainer.innerHTML = '<p class="no-data">No workshops or tracks match your criteria.</p>';
            return;
        }

        const html = deadlines.map(d => {
            const isWorkshop = !!d.workshop_name;
            const cardClass = isWorkshop ? 'workshop-card is-workshop' : 'workshop-card is-track';
            const name = d.workshop_name || (d.track_name || 'Main Track');
            const url = d.website_url;
            const meta = getMeta(d.conference_name);
            const confPageUrl = confSlug(d.conference_name);

            const titleHtml = url 
                ? `<a href="${url}" target="_blank" rel="noopener noreferrer" class="workshop-title-link">${name} ↗</a>`
                : name;

            return `
                <div class="${cardClass}">
                    <div class="workshop-header">
                        <div class="header-chips">
                            <a href="${confPageUrl}" class="workshop-conf-badge" title="View ${d.conference_name} page">
                                <span>${meta.flag}</span> ${d.conference_name} ↗
                            </a>
                            <span class="core-tag ${meta.coreRating === 'A*' ? 'core-star' : 'core-a'}">★ CORE ${meta.coreRating}</span>
                            ${meta.cohosted && meta.cohosted.length > 0 ? `
                                <button type="button" class="btn-card-action cohost-modal-trigger" data-conf="${d.conference_name}" style="padding: 2px 7px; font-size: 10px; cursor: pointer;">
                                    🤝 Co-hosted (${meta.cohosted.length})
                                </button>
                            ` : ''}
                        </div>
                        <span class="workshop-type-pill">${isWorkshop ? 'Workshop' : 'Track'}</span>
                    </div>

                    <div class="workshop-name">${titleHtml}</div>

                    <div class="workshop-location-row">
                        <span class="location-chip">📍 ${meta.location} ${meta.flag}</span>
                    </div>

                    <div class="workshop-dates-grid">
                        <div class="date-chip">
                            <span class="date-chip-label">Paper Submission</span>
                            <span class="date-chip-val">${formatDate(d.paper_submission_date)}</span>
                        </div>
                        ${d.abstract_deadline ? `
                        <div class="date-chip">
                            <span class="date-chip-label">Abstract Deadline</span>
                            <span class="date-chip-val">${formatDate(d.abstract_deadline)}</span>
                        </div>` : ''}
                        <div class="date-chip">
                            <span class="date-chip-label">Notification</span>
                            <span class="date-chip-val">${formatDate(d.intimation_date)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        workshopListContainer.innerHTML = html;
    }

    function formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        const date = parseLocalDate(dateStr);
        if (!date) return 'N/A';
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    /* ==========================================================================
       Co-hosted Conferences Modal & Logic
       ========================================================================== */
    function initCohostedEvents() {
        const modal = document.getElementById('cohosted-modal');
        const closeBtn = document.getElementById('modal-close-btn');

        if (closeBtn) {
            closeBtn.addEventListener('click', closeCohostedModal);
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeCohostedModal();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeCohostedModal();
        });

        // Delegate clicks for cohosted triggers anywhere on the page
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('.cohosted-trigger-badge, .cohost-modal-trigger');
            if (trigger) {
                e.preventDefault();
                e.stopPropagation();
                openCohostedModal(trigger.dataset.conf);
                return;
            }

            const confLink = e.target.closest('.conference-badge-link');
            if (confLink && !isConferencePage) {
                if (!e.metaKey && !e.ctrlKey) {
                    e.preventDefault();
                    openCohostedModal(confLink.dataset.conf);
                }
            }
        });
    }

    function openCohostedModal(confName) {
        if (!confName) return;
        const meta = getMeta(confName);
        const modal = document.getElementById('cohosted-modal');
        if (!modal) return;

        const titleEl = document.getElementById('cohosted-modal-title');
        const flagEl = document.getElementById('modal-conf-flag');
        const coreBadgeEl = document.getElementById('modal-core-badge');
        const descEl = document.getElementById('modal-conf-desc');
        const locEl = document.getElementById('modal-conf-location');
        const yearEl = document.getElementById('modal-conf-year');
        const webLinkEl = document.getElementById('modal-website-link');
        const dedLinkEl = document.getElementById('modal-dedicated-link');
        const cohostedGrid = document.getElementById('modal-cohosted-grid');
        const cohostedCount = document.getElementById('modal-cohosted-count');
        const tracksList = document.getElementById('modal-tracks-list');
        const tracksCount = document.getElementById('modal-tracks-count');
        const filterAllBtn = document.getElementById('modal-filter-all-btn');

        if (titleEl) titleEl.textContent = `${confName} ${meta.year}`;
        if (flagEl) flagEl.textContent = meta.flag;
        if (coreBadgeEl) {
            coreBadgeEl.textContent = `CORE ${meta.coreRating}`;
            coreBadgeEl.className = `core-badge ${meta.coreRating === 'A*' ? 'is-core-star' : 'is-core-a'}`;
        }
        if (descEl) descEl.textContent = meta.fullName;
        if (locEl) locEl.textContent = meta.location;
        if (yearEl) yearEl.textContent = meta.year;
        if (webLinkEl) webLinkEl.href = meta.website;
        if (dedLinkEl) dedLinkEl.href = confSlug(confName);

        // Render co-hosted events
        const cohostedList = meta.cohosted || [];
        if (cohostedCount) cohostedCount.textContent = `${cohostedList.length} Events`;
        if (cohostedGrid) {
            if (cohostedList.length === 0) {
                cohostedGrid.innerHTML = '<p class="no-data" style="margin:0; font-size:12px;">No separate co-hosted conferences registered for this venue.</p>';
            } else {
                cohostedGrid.innerHTML = cohostedList.map(item => {
                    const itemMeta = getMeta(item);
                    const isKnownConf = allConferences.some(c => c.name.toUpperCase() === item.toUpperCase());
                    const itemDeadlines = allDeadlines.filter(d => d.conference_name.toUpperCase() === item.toUpperCase());
                    const nextD = itemDeadlines[0];
                    const subDate = nextD ? formatDate(nextD.paper_submission_date) : 'TBA';
                    return `
                        <div class="cohosted-card-item">
                            <div class="cohosted-card-top">
                                <span class="cohosted-card-name">${itemMeta.flag} ${item}</span>
                                <span class="core-tag ${itemMeta.coreRating === 'A*' ? 'core-star' : 'core-a'}">${itemMeta.coreRating}</span>
                            </div>
                            <div class="cohosted-card-desc">${itemMeta.fullName}</div>
                            <div style="font-size:11px; color:var(--color-text-secondary); margin-top:2px;">
                                Submission: <strong>${subDate}</strong>
                            </div>
                            <div class="cohosted-card-actions">
                                <button type="button" class="btn-card-action modal-filter-item-btn" data-conf="${item}">Filter Timeline 🔍</button>
                                ${isKnownConf ? `<a href="${confSlug(item)}" class="btn-card-action">Dedicated Page ↗</a>` : ''}
                                ${itemMeta.website && itemMeta.website !== '#' ? `<a href="${itemMeta.website}" target="_blank" rel="noopener noreferrer" class="btn-card-action">Website ↗</a>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');

                cohostedGrid.querySelectorAll('.modal-filter-item-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const target = btn.dataset.conf;
                        closeCohostedModal();
                        filterTimelineToConferenceAndCohosted(target);
                    });
                });
            }
        }

        // Render host tracks
        const confDeadlines = allDeadlines.filter(d => d.conference_name.toUpperCase() === confName.toUpperCase());
        if (tracksCount) tracksCount.textContent = `${confDeadlines.length} Tracks & Workshops`;
        if (tracksList) {
            tracksList.innerHTML = confDeadlines.map(d => {
                const name = d.workshop_name || d.track_name || 'Main Track';
                return `
                    <div class="modal-track-item">
                        <span class="modal-track-name">${name}</span>
                        <span class="modal-track-dates">Due: <strong>${formatDate(d.paper_submission_date)}</strong></span>
                    </div>
                `;
            }).join('');
        }

        if (filterAllBtn) {
            filterAllBtn.onclick = () => {
                closeCohostedModal();
                filterTimelineToConferenceAndCohosted(confName);
            };
        }

        modal.classList.remove('hidden');
    }

    function closeCohostedModal() {
        const modal = document.getElementById('cohosted-modal');
        if (modal) modal.classList.add('hidden');
    }

    function filterTimelineToConferenceAndCohosted(confName) {
        if (!confName) return;
        if (isConferencePage) {
            window.location.href = confSlug(confName);
            return;
        }

        if (conferenceFilter) conferenceFilter.value = 'all';
        if (searchInput) {
            searchInput.value = confName;
            updateClearBtnVisibility();
        }
        renderTimeline();
        renderWorkshopList();

        const timelineContainer = document.querySelector('.timeline-container');
        if (timelineContainer) timelineContainer.scrollIntoView({ behavior: 'smooth' });
    }

    /* ==========================================================================
       Local Chat Bot Implementation (Offline NL QA + Optional Local Ollama LLM)
       ========================================================================== */
    function initLocalChatBot() {
        const widget = document.getElementById('dateline-chat-widget');
        const toggleBtn = document.getElementById('chat-toggle-btn');
        const panel = document.getElementById('chat-panel');
        const closeBtn = document.getElementById('chat-close-btn');
        const settingsBtn = document.getElementById('chat-llm-settings-btn');
        const settingsDrawer = document.getElementById('chat-settings-drawer');
        const form = document.getElementById('chat-form');
        const input = document.getElementById('chat-input');
        const messagesContainer = document.getElementById('chat-messages');
        const promptPills = document.querySelectorAll('.chat-prompt-pill');
        const enableOllamaCb = document.getElementById('enable-ollama-cb');
        const engineTag = document.getElementById('chat-engine-tag');

        if (!widget || !toggleBtn || !panel) return;

        // Toggle chat panel
        toggleBtn.addEventListener('click', () => {
            const isHidden = panel.classList.contains('hidden');
            if (isHidden) {
                panel.classList.remove('hidden');
                if (messagesContainer.children.length === 0) {
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
                    engineTag.textContent = '🦙 Local Ollama Mode';
                    engineTag.style.color = '#7c3aed';
                } else {
                    engineTag.textContent = '🟢 Offline Local NLP';
                    engineTag.style.color = '#059669';
                }
            });
        }

        // Quick suggestions
        promptPills.forEach(pill => {
            pill.addEventListener('click', () => {
                const prompt = pill.dataset.prompt;
                if (!prompt) return;
                handleUserMessage(prompt);
            });
        });

        // Form submit
        if (form && input) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const text = input.value.trim();
                if (!text) return;
                input.value = '';
                handleUserMessage(text);
            });
        }

        // Chat Action Buttons delegation
        if (messagesContainer) {
            messagesContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.chat-action-btn');
                if (!btn) return;
                const action = btn.dataset.action;
                const val = btn.dataset.val;

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
                } else if (action === 'open-modal') {
                    openCohostedModal(val);
                } else if (action === 'open-page') {
                    window.location.href = confSlug(val);
                }
            });
        }

        function renderInitialBotMessage() {
            appendMessage('bot', `
                👋 <strong>Hello! I am Dateline Assistant</strong>, your local conference intelligence bot.<br><br>
                I run completely in your browser and can answer questions on:<br>
                • 📅 Upcoming deadlines & submission dates<br>
                • 🎓 <strong>Prof. Raghu Reddy & Dr. Karthik Vaidhyanathan (KV)</strong> publication venues (CHI PLAY, ICSA, SEAMS, AGENT workshop, MODELS, ISEC)<br>
                • 🥽 VR / XR & Serious Games (CHI PLAY, IEEE VR, ISMAR)<br>
                • 🤝 <strong>Co-hosted & sister conferences</strong> (e.g. events co-located with ICSE)<br>
                • ⭐ CORE A* / A rankings & tracks<br><br>
                Ask me anything below or pick a quick prompt!
            `);
        }

        async function handleUserMessage(query) {
            appendMessage('user', query);

            // Add typing indicator
            const typingEl = appendMessage('bot', '<em>Thinking...</em>');

            try {
                if (enableOllamaCb && enableOllamaCb.checked) {
                    const ollamaUrl = document.getElementById('ollama-url').value.trim() || 'http://localhost:11434';
                    const modelName = document.getElementById('ollama-model').value.trim() || 'llama3.2';
                    const reply = await askOllamaLLM(query, ollamaUrl, modelName);
                    typingEl.innerHTML = reply;
                } else {
                    const reply = generateLocalAssistantReply(query);
                    typingEl.innerHTML = reply;
                }
            } catch (err) {
                console.warn('Ollama query failed, falling back to local NLP:', err);
                const fallbackReply = generateLocalAssistantReply(query);
                typingEl.innerHTML = `
                    <div style="font-size:11px; color:#d97706; margin-bottom:6px;">
                        ⚠️ Local Ollama was unreachable on localhost:11434. Responding with built-in offline intelligence:
                    </div>
                    ${fallbackReply}
                `;
            }

            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function appendMessage(sender, htmlContent) {
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

        const sysPrompt = `You are Dateline Assistant, pair programming with a researcher studying software engineering, virtual reality, and publication venues for SERC IIIT Hyderabad faculty Prof. Y. Raghu Reddy and Dr. Karthik Vaidhyanathan (KV). Context: ${JSON.stringify(compactContext)}. Answer concisely with dates and CORE rankings.`;

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
        return (data.response || 'No response returned from Ollama.').replace(/\n/g, '<br>');
    }

    function generateLocalAssistantReply(q) {
        const lower = q.toLowerCase();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Prof. Raghu & KV (SERC IIIT Hyderabad) query
        if (lower.includes('raghu') || lower.includes('kv') || lower.includes('karthik') || lower.includes('vaidhyanathan') || lower.includes('serc') || lower.includes('professor')) {
            return `
                <strong>🎓 SERC IIIT Hyderabad Publication Venues (Prof. Raghu & Dr. KV):</strong><br><br>
                <strong>1. Dr. Y. Raghu Reddy (Prof. Raghu):</strong><br>
                • <strong>CHI PLAY (CORE A)</strong>: Serious games, game architectures, VR mazes (<em>ACMGVR 2024</em>).<br>
                • <strong>IEEE VR & VRW (CORE A*)</strong>: Locomotion in VR, visual acuity, HMD hardware evaluations.<br>
                • <strong>MODELS (CORE A)</strong>: <em>VRSpecML</em> domain-specific modeling for VR systems.<br>
                • <strong>ISEC (Flagship India)</strong>: 14+ publications on VR requirements, dev waste, smart contracts, ModSym.<br>
                • <strong>ICSE Companion & AST</strong>: <em>VReqST</em> requirement specification tool for VR (2025).<br>
                • <strong>ASE Workshops</strong>: Conformance checking in VR interaction testing.<br><br>
                <strong>2. Dr. Karthik Vaidhyanathan (KV):</strong><br>
                • <strong>ICSA (CORE A)</strong>: Premier software architecture venue. Architecture view generation via LLMs, AI agents generating microservices, refactoring.<br>
                • <strong>ECSA (CORE A)</strong>: Software architecture in the age of Agentic AI, sustainable MLOps (<em>HarmonE</em>).<br>
                • <strong>SEAMS (CORE A)</strong>: Self-adaptive systems, QoS routing for SLMs (<em>CALM</em>), sustainable MLOps (co-located with ICSE).<br>
                • <strong>AGENT Workshop</strong>: International Workshop on Agentic Engineering (co-located with ICSE 2026).<br>
                • <strong>CAIN</strong>: AI Engineering – SE for AI (co-located with ICSE).<br>
                • <strong>ASE (CORE A*)</strong>: QoS-aware model switching in ML systems.<br><br>
                <div class="chat-actions-row">
                    <button type="button" class="chat-action-btn" data-action="search-kw" data-val="CHI PLAY">👉 Filter CHI PLAY</button>
                    <button type="button" class="chat-action-btn" data-action="search-kw" data-val="ICSA">👉 Filter ICSA</button>
                    <button type="button" class="chat-action-btn" data-action="search-kw" data-val="SEAMS">👉 Filter SEAMS</button>
                    <button type="button" class="chat-action-btn" data-action="search-kw" data-val="AGENT">👉 Filter AGENT</button>
                    <button type="button" class="chat-action-btn" data-action="search-kw" data-val="MODELS">👉 Filter MODELS</button>
                    <button type="button" class="chat-action-btn" data-action="search-kw" data-val="ISEC">👉 Filter ISEC</button>
                </div>
            `;
        }

        // 2. Upcoming deadlines query
        if (lower.includes('upcoming') || lower.includes('next') || lower.includes('deadline') || lower.includes('due') || lower.includes('when')) {
            const upcoming = allDeadlines
                .filter(d => {
                    const dt = parseLocalDate(d.paper_submission_date);
                    return dt && dt >= today;
                })
                .sort((a, b) => parseLocalDate(a.paper_submission_date) - parseLocalDate(b.paper_submission_date))
                .slice(0, 5);

            if (upcoming.length === 0) {
                return 'No upcoming deadlines found in the active 1-year window.';
            }

            const itemsHtml = upcoming.map(d => {
                const dt = parseLocalDate(d.paper_submission_date);
                const days = Math.ceil((dt - today) / 86400000);
                const name = d.workshop_name || d.track_name || 'Main Track';
                const meta = getMeta(d.conference_name);
                return `
                    <div style="margin-bottom:6px; padding:4px 0; border-bottom:1px dashed var(--color-border);">
                        <strong>${meta.flag} ${d.conference_name}</strong> - ${name}<br>
                        📅 Due: <strong>${formatDate(d.paper_submission_date)}</strong> (${days} days left) • <span class="core-tag">${meta.coreRating}</span>
                    </div>
                `;
            }).join('');

            return `
                <strong>📅 Next Upcoming Deadlines:</strong><br><br>
                ${itemsHtml}
                <div class="chat-actions-row">
                    <button type="button" class="chat-action-btn" data-action="search-kw" data-val="">👉 View All in Timeline</button>
                </div>
            `;
        }

        // 3. VR & Games query
        if (lower.includes('vr') || lower.includes('chi play') || lower.includes('kai play') || lower.includes('game') || lower.includes('virtual') || lower.includes('xr')) {
            return `
                <strong>🥽 Virtual Reality & Gaming Venues Tracked:</strong><br><br>
                • <strong>CHI PLAY (CORE A)</strong>: Zurich, Switzerland 🇨🇭 (Papers, Work-in-Progress, Serious Games Showcase).<br>
                • <strong>IEEE VR 2027 (CORE A*)</strong>: Melbourne, Australia 🇦🇺 (Research Papers, Posters, 3DUI, KELVAR, SEARIS, OpenXRS).<br>
                • <strong>ISMAR 2027 (CORE A*)</strong>: Bari, Italy 🇮🇹 (Research Papers, Posters, XR-Health).<br>
                • <strong>VRST 2026 (CORE A)</strong>: Sendai, Japan 🇯🇵 (Full Papers, Short Papers & Demos).<br><br>
                <div class="chat-actions-row">
                    <button type="button" class="chat-action-btn" data-action="search-kw" data-val="VR">👉 Filter to VR / XR</button>
                    <button type="button" class="chat-action-btn" data-action="search-kw" data-val="CHI PLAY">👉 Filter to CHI PLAY</button>
                    <button type="button" class="chat-action-btn" data-action="open-modal" data-val="IEEE VR">👉 IEEE VR Co-hosted</button>
                </div>
            `;
        }

        // 4. Co-hosted conferences query
        if (lower.includes('cohosted') || lower.includes('co-hosted') || lower.includes('colocated') || lower.includes('sister')) {
            return `
                <strong>🤝 Co-hosted Conferences & Sister Events:</strong><br><br>
                • <strong>ICSE 2027 (Dublin 🇮🇪)</strong> co-hosts: <em>SEAMS</em> (CORE A), <em>CAIN</em>, <em>AGENT Workshop</em>, <em>MSR</em> (CORE A), <em>ICPC</em> (CORE A), <em>LLM4Code</em>, <em>DeepTest</em>.<br>
                • <strong>IEEE VR 2027 (Melbourne 🇦🇺)</strong> co-hosts: <em>3DUI Symposium</em> (CORE A*), <em>KELVAR</em>, <em>SEARIS</em>, <em>OpenXRS</em>, <em>XR-Health</em>.<br>
                • <strong>ISMAR 2027 (Bari 🇮🇹)</strong> co-hosts: <em>XR-Health Workshop</em>, <em>MAR Art & Design</em>.<br>
                • <strong>CHI PLAY 2026 (Zurich 🇨🇭)</strong> co-hosts: <em>Serious Games & VR Showcase</em>, <em>Work-in-Progress & Demos</em>.<br>
                • <strong>ISEC 2026 (Hyderabad 🇮🇳)</strong> co-hosts: <em>ModSym</em> (Modelling Symposium), <em>VR in SE Track</em>.<br><br>
                <div class="chat-actions-row">
                    <button type="button" class="chat-action-btn" data-action="open-modal" data-val="ICSE">👉 View ICSE Co-hosted</button>
                    <button type="button" class="chat-action-btn" data-action="open-modal" data-val="IEEE VR">👉 View IEEE VR Co-hosted</button>
                </div>
            `;
        }

        // 5. Agent & AI query
        if (lower.includes('agent') || lower.includes('agentic') || lower.includes('llm') || lower.includes('ai')) {
            return `
                <strong>🤖 Agentic Engineering & AI Workshops:</strong><br><br>
                • <strong>AGENT Workshop</strong>: International Workshop on Agentic Engineering (Agentic AI in SE, co-located with ICSE 2026).<br>
                • <strong>CAIN</strong>: IEEE/ACM Conference on AI Engineering – Software Engineering for AI (co-located with ICSE).<br>
                • <strong>LLM4Code</strong>: LLMs for Code workshop (ICSE).<br>
                • <strong>LLMTrust</strong>: Trustworthy LLMs in SE (FSE).<br>
                • <strong>CauSE</strong>: Causal Methods in SE (FSE).<br>
                • <strong>SE4ALL</strong>: Software Engineering and AI for All (ICSE).<br><br>
                <div class="chat-actions-row">
                    <button type="button" class="chat-action-btn" data-action="search-kw" data-val="Agents">👉 Filter to Agents</button>
                    <button type="button" class="chat-action-btn" data-action="search-kw" data-val="AI">👉 Filter to AI / LLM</button>
                </div>
            `;
        }

        // 6. CORE Ratings query
        if (lower.includes('core') || lower.includes('ranking') || lower.includes('rating') || lower.includes('a*')) {
            return `
                <strong>⭐ CORE Rankings Overview:</strong><br><br>
                • <strong>CORE A* (Premier)</strong>: ICSE 🇮🇪, FSE 🇨🇳, IEEE VR 🇦🇺, ISMAR 🇮🇹.<br>
                • <strong>CORE A (Major)</strong>: CHI PLAY 🇨🇭, ICSA 🇳🇱, SEAMS 🇮🇪, MODELS 🇦🇹, ECSA 🇨🇾, MSR 🇮🇪, ICPC 🇮🇪, ISSTA 🇸🇬, SANER 🇺🇸, EASE 🇻🇳, VRST 🇯🇵.<br><br>
                <div class="chat-actions-row">
                    <button type="button" class="chat-action-btn" data-action="search-kw" data-val="A*">👉 Show CORE A*</button>
                    <button type="button" class="chat-action-btn" data-action="search-kw" data-val="A">👉 Show CORE A</button>
                </div>
            `;
        }

        // 7. General search fallback
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
                return `• <strong>${meta.flag} ${m.conference_name}</strong> - ${name} (Due: ${formatDate(m.paper_submission_date)})`;
            }).join('<br>');

            return `
                I found ${matches.length} matching entries for "<strong>${q}</strong>":<br><br>
                ${resHtml}<br><br>
                <div class="chat-actions-row">
                    <button type="button" class="chat-action-btn" data-action="search-kw" data-val="${q}">👉 Filter Timeline to "${q}"</button>
                </div>
            `;
        }

        return `
            I'm tracking <strong>${allConferences.length} conferences</strong> and <strong>${allDeadlines.length} tracks</strong>.<br><br>
            Try asking about:<br>
            • <em>"What deadlines are coming up next?"</em><br>
            • <em>"Where do Prof. Raghu and KV publish?"</em><br>
            • <em>"Show me VR & CHI PLAY conferences"</em><br>
            • <em>"What conferences are co-hosted with ICSE?"</em><br>
            • <em>"Show agent and AI workshops"</em>
        `;
    }
});