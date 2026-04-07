/**
 * Proxy Pink Milk LP JSON. Set PINKMILK_LP_JSON_URL on Vercel to your real export URL.
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const target =
    process.env.PINKMILK_LP_JSON_URL ||
    process.env.VITE_PINKMILK_LP_JSON_URL ||
    '';

  if (!target) {
    res.status(200).json({
      ok: true,
      topics: [],
      source: 'pinkmilk',
      message: 'no_json_url',
    });
    return;
  }

  try {
    const r = await fetch(target, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'PinkMilkSocialEngine/1.0',
      },
      redirect: 'follow',
    });
    if (!r.ok) {
      res.status(502).json({ ok: false, error: 'upstream', status: r.status });
      return;
    }
    const json = await r.json();
    res.status(200).json({ ok: true, data: json, source: 'pinkmilk' });
  } catch (e) {
    console.error('pinkmilk proxy error:', e);
    res.status(500).json({ ok: false, error: 'fetch_failed', message: e.message });
  }
}
