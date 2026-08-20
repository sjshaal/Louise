/**
 * One-time ingestion script — run with:
 *   node scripts/ingest.mjs
 *
 * Loads all 65 Louise Hay affirmations into the RuVector store.
 * Safe to re-run (overwrites existing data).
 */
import { readFileSync, mkdirSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const DB_PATH   = join(ROOT, '.ruvector-db');
const DATA_FILE = join(ROOT, 'data', 'hay-affirmations.json');
const DIMS      = 384;
const NGRAM_SIZES = [2, 3, 4];

// ─── Embedding (mirrors lib/embeddings.ts) ──────────────────────────────────
function charNgrams(text, n) {
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = normalized.split(/\s+/).filter(Boolean);
  const ngrams = [];
  for (const word of words) {
    const padded = `_${word}_`;
    for (let i = 0; i <= padded.length - n; i++) ngrams.push(padded.slice(i, i + n));
  }
  return ngrams;
}

function hashToIndex(s, mod) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return Math.abs(h) % mod;
}

function embed(text) {
  const vec = new Float64Array(DIMS);
  for (const n of NGRAM_SIZES) {
    const ngrams = charNgrams(text, n);
    const weight = 1 / NGRAM_SIZES.length;
    for (const ng of ngrams) vec[hashToIndex(ng, DIMS)] += weight;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return Array.from(vec).map(v => v / norm);
}

function embedEntry(entry) {
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

// ─── Main ───────────────────────────────────────────────────────────────────
console.log('\n🌿 Daily Healer — Data Ingestion\n');
console.log('Loading Louise Hay affirmation data...');

const affirmations = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
console.log(`✓ Loaded ${affirmations.length} affirmations.\n`);

console.log('Computing embeddings...');
const records = affirmations.map((entry, i) => {
  process.stdout.write(`  [${i + 1}/${affirmations.length}] ${entry.ailment.padEnd(30)}\r`);
  return { id: entry.id, vec: embedEntry(entry), meta: entry };
});
console.log('\n✓ Embeddings computed.\n');

if (!existsSync(DB_PATH)) mkdirSync(DB_PATH, { recursive: true });
const store = { hay_affirmations: records, journal_entries: [] };
writeFileSync(join(DB_PATH, 'store.json'), JSON.stringify(store), 'utf-8');

console.log(`✓ Saved ${records.length} vectors to .ruvector-db/store.json`);
console.log('\n✨ Ingestion complete! You can now run: npm run dev\n');

// Print sample
const sample = affirmations[0];
console.log('─── Sample entry ───────────────────────────────');
console.log(`Ailment:    ${sample.ailment}`);
console.log(`Body part:  ${sample.body_part}`);
console.log(`Cause:      ${sample.probable_cause}`);
console.log(`Affirmation: "${sample.affirmation}"`);
console.log('────────────────────────────────────────────────\n');
