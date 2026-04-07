import crypto from 'node:crypto';
import Parser from 'rss-parser';

const FETCH_HEADERS = {
  'User-Agent': 'PinkMilkSocialEngine/1.0 (topic aggregator)',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

const parser = new Parser({
  timeout: 12000,
  headers: {
    'User-Agent': FETCH_HEADERS['User-Agent'],
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

/** Netherlands YouTube trending list (youtube.trends24.in) — HTML scrape, same idea as NU entertainment RSS. */
const YOUTUBE_TRENDS24_NL = 'https://youtube.trends24.in/netherlands/';

function decodeBasicEntities(s) {
  return String(s)
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/**
 * @returns {Promise<Array<{ id: string, source: string, title: string, summary: string, url: string }>>}
 */
export async function fetchYoutubeTrends24NL(sourceLabel = 'YouTube NL (Trends24)', idPrefix = 'yt24') {
  try {
    const res = await fetch(YOUTUBE_TRENDS24_NL, {
      headers: FETCH_HEADERS,
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.error('YouTube Trends24 NL HTTP', res.status);
      return [];
    }
    const html = await res.text();
    const ol = html.match(/<ol aria-labelledby=group-all class=video-list>([\s\S]*?)<\/ol>/i);
    if (!ol) {
      console.error('YouTube Trends24 NL: no video-list ol found');
      return [];
    }
    const block = ol[1];
    const re =
      /<a href="(https:\/\/(?:www\.)?youtube\.com\/watch\?v=[^"]+)" class=video-link[\s\S]*?<h4 class=vc-title>([^<]*)<\/h4>/gi;
    const out = [];
    let match;
    while ((match = re.exec(block)) !== null) {
      const url = match[1].replace(/^https:\/\/youtube\.com\//, 'https://www.youtube.com/');
      const title = decodeBasicEntities(match[2]).trim().slice(0, 200);
      if (!title) continue;
      if (isDeniedTopic(title)) continue;
      const id = `${idPrefix}-${crypto.createHash('sha256').update(`${url}|${title}`).digest('hex').slice(0, 16)}`;
      const summary = linesFromText(`${title}. Trending YouTube video in Netherlands (youtube.trends24.in).`, 4, 400);
      out.push({ id, source: sourceLabel, title, summary: summary || title, url });
    }
    return out;
  } catch (e) {
    console.error('YouTube Trends24 NL fetch failed:', e.message);
    return [];
  }
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

/** Dutch news columns: entertainment + culture (allowlist; heavy topics filtered). */
export const NEWS_FEEDS = [
  { url: 'https://feeds.nos.nl/noscultuur-en-media', source: 'NOS Cultuur & Media', prefix: 'nos-cult' },
  { url: 'https://www.nu.nl/rss/Entertainment', source: 'nu.nl Entertainment', prefix: 'nu-ent' },
];

/** Google Trends daily RSS for Netherlands (approximation for “social” trending). */
export const SOCIAL_FEEDS = [
  { url: 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=NL', source: 'Google Trends NL', prefix: 'gt' },
];
