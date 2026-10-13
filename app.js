/**
 * Conference Deadline Tracker - Frontend JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // State
    let allDeadlines = [];
    let allConferences = [];

    // Derive the conference list from the deadlines
    function deriveConferences(deadlines) {
        const map = new Map();
        deadlines.forEach(d => {
            if (!map.has(d.conference_name)) map.set(d.conference_name, new Set());
            if (d.track_name) map.get(d.conference_name).add(d.track_name);
        });
        return [...map.entries()]
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([name, tracks]) => ({ name, tracks: [...tracks].sort() }));
    }

    async function fetchDeadlines() {
        const r = await fetch('data/deadlines.json');
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
    }
    
    // DOM Elements
    const conferenceFilter = document.getElementById('conference-filter');
    const workshopListContainer = document.getElementById('workshop-list-container');
    const conferenceStats = document.getElementById('conference-stats');
    const workshopCount = document.getElementById('workshop-count');
    
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

    // Initialize
    init();
    
    async function init() {
        await loadDeadlines();
        await loadConferences();
        setupEventListeners();
    }
    
    async function loadConferences() {
        try {
            allConferences = deriveConferences(allDeadlines);
            
            // Populate conference filter
            conferenceFilter.innerHTML = '<option value="all">All Conferences</option>';
            allConferences.forEach(conf => {
                const option = document.createElement('option');
                option.value = conf.name;
                option.textContent = conf.name;
                conferenceFilter.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading conferences:', error);
        }
    }
    
    async function loadDeadlines() {
        try {
            allDeadlines = await fetchDeadlines();
            renderTimeline();
            renderWorkshopList();
        } catch (error) {
            console.error('Error loading deadlines:', error);
        }
    }
    
    function setupEventListeners() {
        conferenceFilter.addEventListener('change', () => {
            renderTimeline();
            renderWorkshopList();
        });
    }
    
    function getFilteredDeadlines() {
        const selectedConf = conferenceFilter.value;
        if (selectedConf === 'all') {
            return allDeadlines;
        }
        return allDeadlines.filter(d => d.conference_name === selectedConf);
    }

    function renderTimeline() {
        const rawDeadlines = getFilteredDeadlines();
        const container = document.getElementById('timeline-chart');
        if (!container) return;
        
        if (!rawDeadlines || rawDeadlines.length === 0) {
            container.innerHTML = '<div class="no-data">No data available for the selected conference</div>';
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
            container.innerHTML = '<div class="no-data">No deadline date ranges found within the 1-year window</div>';
            if (conferenceStats) conferenceStats.textContent = '0 active deadlines';
            return;
        }

        // Calculate widths for conference column and track label column
        let confColWidth = 52;
        let trackLabelWidth = 140;
        
        deadlines.forEach(d => {
            const confName = d.conference_name || 'Conference';
            const name = d.workshop_name || d.track_name || 'Main Track';
            
            const confTextWidth = Math.min(confName.length * 8, 70);
            confColWidth = Math.max(confColWidth, confTextWidth);
            
            const textWidth = Math.ceil(name.length * 7.2);
            trackLabelWidth = Math.max(trackLabelWidth, textWidth);
        });
        
        // Cap track label width for balanced layout
        trackLabelWidth = Math.min(Math.max(trackLabelWidth, 140), 190);

        // Group deadlines by conference name
        const groupedDeadlines = {};
        deadlines.forEach(d => {
            const confName = d.conference_name || 'Conference';
            if (!groupedDeadlines[confName]) {
                groupedDeadlines[confName] = [];
            }
            groupedDeadlines[confName].push(d);
        });

        const confNames = Object.keys(groupedDeadlines);

        // Update stats badges
        if (conferenceStats) {
            conferenceStats.textContent = `${confNames.length} Conferences • ${deadlines.length} Tracks & Workshops`;
        }
        if (workshopCount) {
            workshopCount.textContent = `Showing ${deadlines.length} items`;
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

        // Add sleek Today indicator in scale header
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

        confNames.forEach((confName, confIndex) => {
            const tracks = groupedDeadlines[confName];
            const trackCount = tracks.length;
            const startRow = currentRow;

            // Conference badge column (spans all tracks of this conference)
            rowsHtml += `
                <div class="conference-column" style="grid-row: ${startRow} / span ${trackCount}; grid-column: 1;" title="${confName}">
                    <div class="conference-badge-vertical">${confName}</div>
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
                const barTooltip = `Submission: ${formatDateSafe(start)}\nNotification: ${formatDateSafe(end)}${abstractDate ? `\nAbstract: ${formatDateSafe(abstractDate)}` : ''}`;

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
            if (confIndex < confNames.length - 1) {
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
            workshopListContainer.innerHTML = '<p class="no-data">No workshops or tracks found.</p>';
            return;
        }
        
        const html = deadlines.map(d => {
            const isWorkshop = !!d.workshop_name;
            const cardClass = isWorkshop ? 'workshop-card is-workshop' : 'workshop-card is-track';
            const name = d.workshop_name || (d.track_name || 'Main Track');
            const url = d.website_url;
            
            const titleHtml = url 
                ? `<a href="${url}" target="_blank" rel="noopener noreferrer" class="workshop-title-link">${name} ↗</a>`
                : name;

            return `
                <div class="${cardClass}">
                    <div class="workshop-header">
                        <span class="workshop-conf-badge">${d.conference_name}</span>
                        <span class="workshop-type-pill">${isWorkshop ? 'Workshop' : 'Track'}</span>
                    </div>
                    <div class="workshop-name">${titleHtml}</div>
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
});