import crypto from 'node:crypto';
import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 12000,
  headers: {
    'User-Agent': 'PinkMilkSocialEngine/1.0 (topic aggregator)',
    Accept: 'application/rss+xml, application/xml, text/xml, */*',
  },
});

/** Dutch + English patterns for heavy news we skip (war, violence, murder). */
const DENY_PATTERNS = [
  /\bo(?:o)?rlog\b/i,
  /\bwar\b/i,
  /\brusland\b/i,
  /\boe?ekra?ine\b/i,
  /\b Gaza \b/i,
  /\bmoord\b/i,
  /\bdoodslag\b/i,
  /\bdodelijk\b/i,
  /\baanslag\b/i,
  /\bterror/i,
  /\bsteekpartij\b/i,
  /\bschietpartij\b/i,
  /\bschieten\b.*\bdod/i,
  /\bmisdaad\b/i,
  /\bmurder\b/i,
  /\bkill(?:ed|ing)\b/i,
  /\bstabbing\b/i,
  /\bshooting\b/i,
  /\bexecutie\b/i,
  /\bverkracht/i,
  /\brape\b/i,
  /\bIsis\b/i,
  /\b IS \b/i,
];

export function isDeniedTopic(text) {
  if (!text || typeof text !== 'string') return true;
  const combined = text.toLowerCase();
  return DENY_PATTERNS.some((re) => {
    try {
      return re.test(combined);
    } catch {
      return false;
    }
  });
}

export function stripHtml(html) {
  if (!html) return '';
  return String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function linesFromText(text, maxLines = 6, maxLen = 480) {
  const t = stripHtml(text);
  if (!t) return '';
  let snippet = t.slice(0, maxLen);
  const parts = snippet.split(/(?<=[.!?])\s+/).filter(Boolean);
  const joined = parts.slice(0, maxLines).join(' ');
  return joined || snippet;
}

/**
 * @param {string} idPrefix
 * @param {string} sourceLabel
 * @param {any} item rss-parser item
 */
export function normalizeRssItem(idPrefix, sourceLabel, item) {
  const title = stripHtml(item.title || '').slice(0, 200);
  const rawDesc = item.contentSnippet || item.summary || item.content || '';
  const summary = linesFromText(rawDesc, 6, 520);
  const url = item.link || item.guid || '#';
  const id = `${idPrefix}-${crypto.createHash('sha256').update(`${url}|${title}`).digest('hex').slice(0, 16)}`;
  return {
    id,
    source: sourceLabel,
    title,
    summary: summary || title,
    url,
  };
}

export async function fetchFeedItems(feedUrl, sourceLabel, idPrefix) {
  try {
    const feed = await parser.parseURL(feedUrl);
    const items = feed.items || [];
    const out = [];
    for (const item of items) {
      const norm = normalizeRssItem(idPrefix, sourceLabel, item);
      if (!norm.title) continue;
      if (isDeniedTopic(`${norm.title} ${norm.summary}`)) continue;
      out.push(norm);
    }
    return out;
  } catch (e) {
    console.error(`RSS fetch failed ${sourceLabel}:`, feedUrl, e.message);
    return [];
  }
}

export function uniqueByUrl(items) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    const key = it.url || it.id;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

function exclusionMatch(item, excludeUrls, excludeTitles) {
  const u = item.url || '';
  if (excludeUrls.some((x) => x && u === x)) return true;
  const titleNorm = (item.title || '').trim().toLowerCase();
  if (excludeTitles.some((x) => x && titleNorm === String(x).trim().toLowerCase())) return true;
  return false;
}

/**
 * Pick `count` items after filtering exclusions. Keeps selected item in pool if provided.
 */
export function pickTopics(items, { excludeUrls = [], excludeTitles = [], count = 5, keepUrl = null } = {}) {
  const exU = Array.isArray(excludeUrls) ? excludeUrls : [];
  const exT = Array.isArray(excludeTitles) ? excludeTitles : [];

  const pool = items.filter((it) => {
    if (keepUrl && it.url === keepUrl) return true;
    return !exclusionMatch(it, exU, exT);
  });

  // shuffle (Fisher-Yates)
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  const selected = [];
  if (keepUrl) {
    const kept = arr.find((it) => it.url === keepUrl);
    if (kept) selected.push(kept);
  }
  for (const it of arr) {
    if (selected.length >= count) break;
    if (selected.some((s) => s.url === it.url)) continue;
    selected.push(it);
  }
  return selected.slice(0, count);
}

export const NEWS_FEEDS = [
  { url: 'https://feeds.nos.nl/nosnieuwsalgemeen', source: 'NOS', prefix: 'nos' },
  { url: 'https://www.nu.nl/rss/Algemeen', source: 'nu.nl', prefix: 'nu' },
  { url: 'https://www.ad.nl/home/rss.xml', source: 'AD', prefix: 'ad' },
  { url: 'https://www.telegraaf.nl/rss', source: 'Telegraaf', prefix: 'teleg' },
  { url: 'https://www.nrc.nl/rss/', source: 'NRC', prefix: 'nrc' },
];

/** Google Trends daily RSS for Netherlands (approximation for “social” trending). */
export const SOCIAL_FEEDS = [
  { url: 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=NL', source: 'Google Trends NL', prefix: 'gt' },
];
