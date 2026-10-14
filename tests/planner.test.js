// Run: node tests/planner.test.js
const assert = require('node:assert');
const { analyze } = require('../planner.js');

const now = Date.UTC(2026, 9, 14);
const t = (conf, sub, notif, extra = {}) => ({
    conf, track: 'Research', paper_submission_date: sub, intimation_date: notif, ...extra,
});

// Sequential windows: no conflicts, full chain
let r = analyze([t('A', '2026-11-01', '2027-01-15'), t('B', '2027-02-01', '2027-04-01')], { now });
assert.strictEqual(r.conflictFree, true);
assert.deepStrictEqual(r.chain.map(c => c.label), ['A – Research', 'B – Research']);

// B submitted while A under review -> overlap; only one fits the chain (earliest notification wins)
r = analyze([t('A', '2026-11-01', '2027-02-15'), t('B', '2026-12-01', '2027-01-20')], { now });
assert.strictEqual(r.overlaps.length, 1);
assert.strictEqual(r.chain.length, 1);
assert.strictEqual(r.chain[0].label, 'B – Research');
assert.strictEqual(r.deferred[0].label, 'A – Research');

// Same-week deadlines clash
r = analyze([t('A', '2026-11-01', '2027-01-01'), t('B', '2026-11-03', '2027-01-10')], { now, clashDays: 3 });
assert.strictEqual(r.clashes.length, 1);

// Notification equals next submission day is allowed (outcome known the same day)
r = analyze([t('A', '2026-11-01', '2026-12-01'), t('B', '2026-12-01', '2027-02-01')], { now });
assert.strictEqual(r.overlaps.length, 0);
assert.strictEqual(r.chain.length, 2);

// Missing notification -> default review window blocks overlapping venue
r = analyze([t('A', '2026-11-01', ''), t('B', '2026-12-01', '2027-03-01')], { now });
assert.strictEqual(r.overlaps.length, 1);
assert.strictEqual(r.overlaps[0].notifKnown, false);

// Passed and undated are set aside
r = analyze([t('A', '2026-01-01', '2026-03-01'), t('B', '', ''), t('C', '2026-11-01', '2027-01-01')], { now });
assert.deepStrictEqual(r.passed, ['A – Research']);
assert.deepStrictEqual(r.undated, ['B – Research']);
assert.strictEqual(r.chain.length, 1);

console.log('planner tests passed');
