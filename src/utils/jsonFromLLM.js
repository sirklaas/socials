/**
 * Extract first JSON object or array from model text (handles ```json fences).
 */
export function extractJson(text) {
  if (!text || typeof text !== 'string') return null;
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();

  const tryParse = (s) => {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  };

  const objStart = t.indexOf('{');
  const objEnd = t.lastIndexOf('}');
  if (objStart !== -1 && objEnd > objStart) {
    const parsed = tryParse(t.slice(objStart, objEnd + 1));
    if (parsed != null) return parsed;
  }

  const arrStart = t.indexOf('[');
  const arrEnd = t.lastIndexOf(']');
  if (arrStart !== -1 && arrEnd > arrStart) {
    const parsed = tryParse(t.slice(arrStart, arrEnd + 1));
    if (parsed != null) return parsed;
  }

  return tryParse(t);
}

export function ensureArray(val, minLen = 0) {
  if (!Array.isArray(val)) return null;
  if (val.length < minLen) return null;
  return val;
}
