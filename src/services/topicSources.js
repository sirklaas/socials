const apiBase = '';

async function postJson(path, body) {
  const res = await fetch(`${apiBase}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchNewsTopics({ excludeUrls = [], excludeTitles = [], selectedUrl = null } = {}) {
  return postJson('/api/topic-sources/news', {
    excludeUrls,
    excludeTitles,
    selectedUrl,
  });
}

export async function fetchSocialTopics({ excludeUrls = [], excludeTitles = [], selectedUrl = null } = {}) {
  return postJson('/api/topic-sources/social', {
    excludeUrls,
    excludeTitles,
    selectedUrl,
  });
}

/**
 * @returns {Promise<{ ok: boolean, data?: object, topics?: [] }>}
 */
export async function fetchPinkmilkRaw() {
  const res = await fetch(`${apiBase}/api/topic-sources/pinkmilk`);
  return res.json();
}
