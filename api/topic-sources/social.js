import { buffer } from 'node:stream/consumers';
import {
  SOCIAL_FEEDS,
  fetchFeedItems,
  fetchYoutubeTrends24NL,
  uniqueByUrl,
  pickTopics,
  linesFromText,
} from '../lib/topicFeed.js';

async function readJsonBody(req) {
  if (req.method !== 'POST') return {};
  try {
    const buf = await buffer(req);
    return JSON.parse(buf.toString('utf8') || '{}');
  } catch {
    return {};
  }
}

/** Google Trends items often have title only; ensure summary has a few lines. */
function enrichSocialItems(items) {
  return items.map((it) => ({
    ...it,
    summary: it.summary && it.summary.length > 40 ? it.summary : linesFromText(`${it.title}. Trending search topic in Netherlands today.`, 5, 400),
  }));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  let excludeUrls = [];
  let excludeTitles = [];
  let keepUrl = null;

  if (req.method === 'POST') {
    const body = await readJsonBody(req);
    excludeUrls = body.excludeUrls || [];
    excludeTitles = body.excludeTitles || [];
    keepUrl = body.selectedUrl || null;
  } else if (req.query.excludeUrls) {
    try {
      excludeUrls = JSON.parse(req.query.excludeUrls);
    } catch {
      excludeUrls = [];
    }
  }

  try {
    const [batches, ytTrends] = await Promise.all([
      Promise.all(SOCIAL_FEEDS.map((f) => fetchFeedItems(f.url, f.source, f.prefix))),
      fetchYoutubeTrends24NL(),
    ]);
    const merged = uniqueByUrl([...batches.flat(), ...ytTrends]);
    let topics = pickTopics(merged, {
      excludeUrls,
      excludeTitles,
      count: 5,
      keepUrl: keepUrl || null,
    });
    topics = enrichSocialItems(topics);

    res.status(200).json({ ok: true, topics, source: 'social' });
  } catch (e) {
    console.error('social topics error:', e);
    res.status(500).json({ ok: false, error: 'fetch_failed', message: e.message });
  }
}
