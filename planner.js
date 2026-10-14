/**
 * Submission planner: given pinned (conference, track) targets, find deadline clashes,
 * concurrent-review overlaps (dual-submission risk) and a conflict-free submission chain.
 *
 * Pure functions, no DOM. Works in the browser (window.SubmissionPlanner) and in Node (tests).
 * Dates are 'YYYY-MM-DD' strings; each deadline is treated as a calendar day.
 */
(function (root) {
    'use strict';

    const DAY_MS = 86400000;
    // Notification date missing: assume a typical review period so the venue still blocks its window.
    const DEFAULT_REVIEW_DAYS = 90;

    function toDay(str) {
        if (!str) return null;
        const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(str);
        return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : null;
    }

    function toIso(ms) {
        return new Date(ms).toISOString().slice(0, 10);
    }

    function normalize(targets, nowMs) {
        const items = [];
        const passed = [];
        const undated = [];
        (targets || []).forEach(t => {
            const sub = toDay(t.paper_submission_date);
            const label = `${t.conf} – ${t.track || 'Main Track'}`;
            if (sub == null) { undated.push({ label }); return; }
            const notif = toDay(t.intimation_date);
            const item = {
                label,
                conf: t.conf,
                track: t.track || 'Main Track',
                sub,
                notif: notif != null && notif >= sub ? notif : sub + DEFAULT_REVIEW_DAYS * DAY_MS,
                notifKnown: notif != null && notif >= sub,
                estimated: !!t.estimated,
            };
            (sub < nowMs ? passed : items).push(item);
        });
        items.sort((a, b) => a.sub - b.sub || a.notif - b.notif);
        return { items, passed, undated };
    }

    /**
     * @param {Array} targets pinned targets {conf, track, paper_submission_date, intimation_date, estimated}
     * @param {{clashDays?:number, now?:number}} [opts]
     */
    function analyze(targets, opts) {
        const clashDays = opts && opts.clashDays != null ? opts.clashDays : 3;
        const nowMs = opts && opts.now != null ? opts.now : Date.now();
        const { items, passed, undated } = normalize(targets, nowMs);

        const clashes = [];
        const overlaps = [];
        for (let i = 0; i < items.length; i++) {
            for (let j = i + 1; j < items.length; j++) {
                const a = items[i], b = items[j];
                const gap = Math.round((b.sub - a.sub) / DAY_MS);
                if (gap <= clashDays) clashes.push({ a: a.label, b: b.label, gapDays: gap });
                // b is submitted while a is still under review, and a's outcome is not yet known
                if (b.sub < a.notif) {
                    overlaps.push({ first: a.label, second: b.label, firstNotif: toIso(a.notif),
                        secondSub: toIso(b.sub), notifKnown: a.notifKnown });
                }
            }
        }

        // Maximum set of non-overlapping [submit, notify] windows: earliest-finish-first.
        const byEnd = items.slice().sort((a, b) => a.notif - b.notif || a.sub - b.sub);
        const chain = [];
        const deferred = [];
        let freeFrom = -Infinity;
        byEnd.forEach(it => {
            if (it.sub >= freeFrom) { chain.push(it); freeFrom = it.notif; } else deferred.push(it);
        });
        chain.sort((a, b) => a.sub - b.sub);

        const fmt = it => ({
            label: it.label, submit: toIso(it.sub), notify: toIso(it.notif),
            notifKnown: it.notifKnown, estimated: it.estimated,
        });
        return {
            clashes,
            overlaps,
            chain: chain.map(fmt),
            deferred: deferred.map(fmt),
            passed: passed.map(p => p.label),
            undated: undated.map(u => u.label),
            conflictFree: overlaps.length === 0 && clashes.length === 0,
        };
    }

    const api = { analyze, DEFAULT_REVIEW_DAYS };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    root.SubmissionPlanner = api;
})(typeof window !== 'undefined' ? window : globalThis);
