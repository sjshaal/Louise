/**
 * Local embedding engine using character n-grams + TF-IDF weighting.
 * Produces 384-dimensional vectors — no API keys, works offline.
 */

const DIMS = 384;
const NGRAM_SIZES = [2, 3, 4];

function charNgrams(text: string, n: number): string[] {
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = normalized.split(/\s+/).filter(Boolean);
  const ngrams: string[] = [];
  for (const word of words) {
    const padded = `_${word}_`;
    for (let i = 0; i <= padded.length - n; i++) {
      ngrams.push(padded.slice(i, i + n));
    }
  }
  return ngrams;
}

function hashToIndex(s: string, mod: number): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return Math.abs(h) % mod;
}

export function embed(text: string): number[] {
  const vec = new Float64Array(DIMS);

  for (const n of NGRAM_SIZES) {
    const ngrams = charNgrams(text, n);
    const weight = 1 / NGRAM_SIZES.length;
    for (const ng of ngrams) {
      const idx = hashToIndex(ng, DIMS);
      vec[idx] += weight;
    }
  }

  // L2-normalize
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return Array.from(vec).map(v => v / norm);
}

/** Cosine similarity between two normalized vectors */
export function cosineSim(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot; // vectors are already L2-normalized
}

/** Embed a Louise Hay entry into a rich semantic string */
export function embedEntry(entry: {
  ailment: string;
  body_part: string;
  probable_cause: string;
  affirmation: string;
  keywords: string[];
  related_emotions: string[];
  category: string;
}): number[] {
  // Weight ailment & keywords more by repeating them
  const text = [
    entry.ailment, entry.ailment,
    entry.body_part,
    entry.probable_cause,
    ...entry.keywords, ...entry.keywords,
    ...entry.related_emotions,
    entry.category,
    entry.affirmation,
  ].join(' ');
  return embed(text);
}
