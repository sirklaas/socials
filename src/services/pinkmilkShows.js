/**
 * Pink Milk show formats — edit this list anytime. Five are picked at random for the Concept step.
 */
const SHOW_TITLES = [
    'Pubquiz',
    'Ik hou van Holland',
    'De Slimste Mens (à la)',
    'Wie van de drie',
    'Ranking the Stars',
    'De vloer op (dans / act)',
    'MaDiWoDoVrijdagshow',
    'Karaoke battle',
    'Lip sync night',
    'Trivia-avond live',
    'Bingo met het team',
    'Escape room challenge',
    'Kookcompetitie studio',
    'Comedy roast (vriendelijk)',
    'Panelshow: roddel vs feit',
    'Muziekrate / hitquiz',
    'Guess the year',
    'VIP-interview couch',
    'Afterparty Q&A',
];

function hashId(text) {
    let h = 0;
    const s = String(text);
    for (let i = 0; i < s.length; i++) {
        h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    }
    return `pm-${Math.abs(h).toString(16)}`;
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function toTopic(title) {
    return {
        id: hashId(title),
        source: 'Pink Milk',
        title,
        summary: `Show / format: ${title}.`,
        url: '#pinkmilk',
    };
}

const ALL_TOPICS = SHOW_TITLES.map((title) => toTopic(title));

/**
 * @param {{ selectedId?: string | null, excludeIds?: string[], count?: number }} opts
 */
export function pickRandomPinkMilkShows({ selectedId = null, excludeIds = [], count = 5 } = {}) {
    const ex = new Set((excludeIds || []).filter(Boolean));
    const out = [];

    if (selectedId) {
        const kept = ALL_TOPICS.find((t) => t.id === selectedId);
        if (kept) out.push(kept);
    }

    const pool = shuffle(ALL_TOPICS.filter((t) => !ex.has(t.id) && t.id !== selectedId));
    for (const t of pool) {
        if (out.length >= count) break;
        if (out.some((x) => x.id === t.id)) continue;
        out.push(t);
    }

    let n = 0;
    while (out.length < count && n < ALL_TOPICS.length) {
        const fill = ALL_TOPICS[n % ALL_TOPICS.length];
        n += 1;
        if (out.some((x) => x.id === fill.id)) continue;
        out.push(fill);
    }

    return out.slice(0, count);
}
