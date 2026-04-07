function hashId(prefix, text) {
  let h = 0;
  const s = String(text);
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return `${prefix}-${Math.abs(h).toString(16)}`;
}

function pickStr(...vals) {
  for (const v of vals) {
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return '';
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
 * All extractable topic rows from dashboard JSON (no fixed count).
 * @param {Record<string, unknown>} data
 */
export function extractPinkMilkCandidates(data) {
  if (!data || typeof data !== 'object') return [];

  const hero = data.hero || data.Hero || {};
  const benefits = data.benefits || data.Benefits || data['Benefits (3 Blocks)'] || [];
  const quote = data.quote || data.Quote || {};
  const cta = data.cta || data.callToAction || data['Call to Action'] || data.ctaShort || {};

  const items = [];

  const introHeading = pickStr(
    hero.introHeading,
    hero.intro_heading,
    hero['Intro Heading'],
    data.introHeading
  );
  const mainHeading = pickStr(
    hero.mainHeading,
    hero.main_heading,
    hero['Main Heading'],
    hero.showName,
    data.showName,
    data['Show Name']
  );
  const subheading = pickStr(hero.subheading, hero.sub_heading, hero['Subheading']);
  const bodyText = pickStr(
    hero.bodyText,
    hero.body_text,
    hero['Body Text'],
    hero.body
  );

  if (mainHeading || introHeading || bodyText) {
    const title = mainHeading || introHeading || 'Pink Milk show';
    const summary = [subheading, bodyText].filter(Boolean).join('\n').slice(0, 520);
    items.push({
      id: hashId('pm', title + summary),
      source: 'Pink Milk',
      title,
      summary: summary || subheading || title,
      url: pickStr(hero.url, data.url) || '#pinkmilk',
    });
  }

  const benefitList = Array.isArray(benefits) ? benefits : benefits.blocks || benefits.items || [];
  let i = 0;
  for (const block of benefitList) {
    if (!block || typeof block !== 'object') continue;
    const h = pickStr(block.heading, block.title, block.heading01, block['Heading 01']);
    const b = pickStr(block.body, block.body01, block.text, block['Body 01']);
    if (!h && !b) continue;
    const title = h || `Benefit ${++i}`;
    const summary = (b || h).slice(0, 520);
    items.push({
      id: hashId('pm', title + summary + i),
      source: 'Pink Milk',
      title,
      summary,
      url: '#pinkmilk',
    });
  }

  const quoteBody = pickStr(quote.body, quote.text, quote['Body']);
  const quoteHead = pickStr(quote.heading, quote.title);
  if (quoteBody || quoteHead) {
    items.push({
      id: hashId('pm', `q-${quoteHead}`),
      source: 'Pink Milk',
      title: quoteHead || 'Quote',
      summary: (quoteBody || quoteHead).slice(0, 520),
      url: '#pinkmilk',
    });
  }

  const ctaHead = pickStr(cta.heading, cta.ctaHeading, cta['CTA Heading']);
  const ctaBody = pickStr(cta.body, cta.ctaBody, cta['CTA Body'], cta.shortIntro);
  if (ctaHead || ctaBody) {
    items.push({
      id: hashId('pm', `cta-${ctaHead}`),
      source: 'Pink Milk',
      title: ctaHead || 'Call to action',
      summary: (ctaBody || ctaHead).slice(0, 520),
      url: '#pinkmilk',
    });
  }

  if (items.length === 0) {
    for (let n = 1; n <= 8; n++) {
      items.push({
        id: hashId('pm', `placeholder-${n}-${Date.now()}`),
        source: 'Pink Milk',
        title: `Content pillar ${n}`,
        summary:
          'Voeg je dashboard JSON toe via PINKMILK_LP_JSON_URL / VITE_PINKMILK_LP_JSON_URL om echte show- en life-thema’s te tonen.',
        url: '#pinkmilk',
      });
    }
  }

  return items;
}

/**
 * Pick 5 Pink Milk rows: keep selected id, exclude other current ids, fill from candidate pool.
 */
export function pickPinkMilkTopics(candidates, { selectedId = null, excludeIds = [], count = 5 } = {}) {
  const ex = new Set(excludeIds.filter(Boolean));
  const uniq = [];
  const seen = new Set();
  for (const c of candidates) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    uniq.push(c);
  }

  const out = [];
  if (selectedId) {
    const kept = uniq.find((c) => c.id === selectedId);
    if (kept) out.push(kept);
  }

  const pool = shuffle(uniq.filter((c) => !ex.has(c.id) && c.id !== selectedId));
  for (const c of pool) {
    if (out.length >= count) break;
    if (out.some((x) => x.id === c.id)) continue;
    out.push(c);
  }

  let rot = 0;
  while (out.length < count) {
    rot += 1;
    out.push({
      id: hashId('pm', `fill-${rot}-${Math.random()}`),
      source: 'Pink Milk',
      title: `Idee ${rot}`,
      summary: 'Gebruik opnieuw genereren voor meer variatie uit je dashboard JSON.',
      url: '#pinkmilk',
    });
  }

  return out.slice(0, count);
}

/** @deprecated use extract + pick */
export function mapPinkMilkDashboardToTopics(data) {
  const c = extractPinkMilkCandidates(data);
  return pickPinkMilkTopics(c, { count: 5 });
}
