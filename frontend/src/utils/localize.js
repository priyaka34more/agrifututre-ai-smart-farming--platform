// Utility to localize result-level payloads that may contain multilingual fields
// Supported patterns:
// - { en: '...', hi: '...', mr: '...' } -> returns value for requested lang with fallbacks
// - nested objects/arrays are traversed and localized

function isLangMap(value) {
  return (
    value && typeof value === 'object' && !Array.isArray(value) &&
    (Object.prototype.hasOwnProperty.call(value, 'en') || Object.prototype.hasOwnProperty.call(value, 'hi') || Object.prototype.hasOwnProperty.call(value, 'mr'))
  );
}

function localizeValue(value, lang) {
  if (value == null) return value;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;

  if (isLangMap(value)) {
    return value[lang] || value.en || value.hi || value.mr || Object.values(value)[0] || '';
  }

  if (Array.isArray(value)) {
    return value.map((v) => localizeValue(v, lang));
  }

  if (typeof value === 'object') {
    return localizeObject(value, lang);
  }

  return value;
}

function localizeObject(obj, lang) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = Array.isArray(obj) ? [] : {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = localizeValue(v, lang);
  }
  return out;
}

export default function localize(payload, lang = 'en') {
  if (!payload) return payload;
  return localizeValue(payload, lang);
}

export { localizeObject, localizeValue, localize };
