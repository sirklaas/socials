import { buffer } from 'node:stream/consumers';
import { NEWS_FEEDS, fetchFeedItems, uniqueByUrl, pickTopics } from '../lib/topicFeed.js';

async function readJsonBody(req) {
  if (req.method !== 'POST') return {};
  try {
    const buf = await buffer(req);
    return JSON.parse(buf.toString('utf8') || '{}');
  } catch {
    return {};
  }
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
    const batches = await Promise.all(
      NEWS_FEEDS.map((f) => fetchFeedItems(f.url, f.source, f.prefix))
    );
    const merged = uniqueByUrl(batches.flat());
    const topics = pickTopics(merged, {
      excludeUrls,
      excludeTitles,
      count: 5,
      keepUrl: keepUrl || null,
    });

    res.status(200).json({ ok: true, topics, source: 'news' });
  } catch (e) {
    console.error('news topics error:', e);
    res.status(500).json({ ok: false, error: 'fetch_failed', message: e.message });
  }
}
