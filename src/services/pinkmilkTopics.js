import { fetchPinkmilkRaw } from './topicSources';
import { pickRandomPinkMilkShows } from './pinkmilkShows';

function simpleHash(text) {
    let h = 0;
    const s = String(text);
    for (let i = 0; i < s.length; i++) {
        h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    }
    return Math.abs(h).toString(16);
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/**
 * Map hosted LP / dashboard JSON into topic rows for the Concept step.
 * Accepts flexible shapes: hero blocks, benefit arrays, strings.
 *
 * @param {unknown} data
 * @param {number} max
 * @returns {Array<{ id: string, source: string, title: string, summary: string, url: string }>}
 */
export function mapPinkMilkLpJsonToTopics(data, max = 24) {
    const items = [];
    const add = (title, summary = '') => {
        const ti = String(title || '').trim().slice(0, 200);
        if (ti.length < 4) return;
        if (items.some((x) => x.title === ti)) return;
        items.push({
            id: `pm-lp-${simpleHash(ti)}`,
            source: 'Pink Milk',
            title: ti,
            summary: String(summary || ti).slice(0, 520),
            url: '#pinkmilk-lp',
        });
        return items.length >= max;
    };

    const root = data?.data != null ? data.data : data;
    if (!root || typeof root !== 'object') return items;

    const hero = root.hero;
    if (typeof hero === 'string') {
        add(hero);
    } else if (hero && typeof hero === 'object') {
        add(hero.title || hero.headline || hero.heading, hero.subtitle || hero.subheadline || hero.description || hero.text);
    }

    const benefitBlocks = root.benefits || root.blocks || root.features;
    if (Array.isArray(benefitBlocks)) {
        for (const b of benefitBlocks) {
            if (items.length >= max) break;
            if (typeof b === 'string') add(b);
            else if (b && typeof b === 'object') {
                add(b.title || b.heading || b.headline, b.text || b.body || b.description);
            }
        }
    }

    if (root.quote && typeof root.quote === 'object' && items.length < max) {
        add(root.quote.text || root.quote.body, root.quote.attribution || '');
    }

    if (root.cta && typeof root.cta === 'object' && items.length < max) {
        add(root.cta.label || root.cta.text, root.cta.href || '');
    }

    if (items.length < max && typeof root.tagline === 'string') add(root.tagline);
    if (items.length < max && typeof root.description === 'string') add(root.description.slice(0, 120), root.description);

    return items.slice(0, max);
}

/**
 * @returns {Promise<{ topics: Array, source: 'lp' } | null>}
 */
export async function fetchPinkmilkTopicPool() {
    const res = await fetchPinkmilkRaw().catch(() => null);
    if (!res?.ok || !res.data) return null;
    const mapped = mapPinkMilkLpJsonToTopics(res.data, 30);
    return mapped.length >= 3 ? { topics: mapped, source: 'lp' } : null;
}

/**
 * @param {Array} pool
 * @param {{ selectedId?: string | null, excludeIds?: string[], count?: number }} opts
 */
export function pickPinkmilkTopicsFromPool(pool, { selectedId = null, excludeIds = [], count = 5 } = {}) {
    const ex = new Set((excludeIds || []).filter(Boolean));
    const list = pool.filter((t) => !ex.has(t.id));
    const out = [];

    if (selectedId) {
        const kept = pool.find((t) => t.id === selectedId);
        if (kept) out.push(kept);
    }

    for (const t of shuffle(list)) {
        if (out.length >= count) break;
        if (out.some((x) => x.id === t.id)) continue;
        out.push(t);
    }

    let n = 0;
    while (out.length < count && n < pool.length) {
        const fill = pool[n % pool.length];
        n += 1;
        if (out.some((x) => x.id === fill.id)) continue;
        out.push(fill);
    }

    return out.slice(0, count);
}

/**
 * Initial load: LP JSON when configured, else static show titles.
 */
export async function loadPinkmilkTopicsInitial() {
    const pooled = await fetchPinkmilkTopicPool();
    if (pooled) {
        return {
            pinkmilkTopics: pickPinkmilkTopicsFromPool(pooled.topics, { count: 5 }),
            pinkmilkTopicPoolSource: 'lp',
        };
    }
    return {
        pinkmilkTopics: pickRandomPinkMilkShows({ count: 5 }),
        pinkmilkTopicPoolSource: 'static',
    };
}

/**
 * Replace non-selected Pink Milk rows (LP pool refetched, or static picker).
 */
export async function regeneratePinkmilkTopics(idea) {
    const selectedId = idea.picks?.pinkmilkId;
    const excludeIds = (idea.pinkmilkTopics || []).filter((x) => x.id !== selectedId).map((x) => x.id);
    const pooled = await fetchPinkmilkTopicPool();
    if (pooled) {
        return {
            pinkmilkTopics: pickPinkmilkTopicsFromPool(pooled.topics, { selectedId, excludeIds, count: 5 }),
            pinkmilkTopicPoolSource: 'lp',
        };
    }
    return {
        pinkmilkTopics: pickRandomPinkMilkShows({ selectedId, excludeIds, count: 5 }),
        pinkmilkTopicPoolSource: 'static',
    };
}
