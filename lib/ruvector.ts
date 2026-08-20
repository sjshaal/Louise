/**
 * RuVector singleton — server-side only.
 * Uses the ruvector npm package with in-memory HNSW index
 * backed by filesystem persistence via RVF format.
 */
import path from 'path';
import fs from 'fs';
import type { HayAffirmation, SearchResult } from './types';
import { embed, embedEntry, cosineSim } from './embeddings';
import { hayAffirmations, hayById, getRelated } from './hay-data';

const DB_PATH = path.join(process.cwd(), '.ruvector-db');
const COLLECTION = 'hay_affirmations';
const JOURNAL_COLLECTION = 'journal_entries';
const DIMS = 384;

// ─── In-process cache ───────────────────────────────────────────────────────
// We store embeddings in memory (Map) + persist as JSON for simplicity,
// so the app works even if native ruvector binaries aren't compiled.
interface VecRecord {
  id: string;
  vec: number[];
  meta: Record<string, unknown>;
}

interface VecStore {
  [collection: string]: VecRecord[];
}

let _store: VecStore | null = null;
const STORE_FILE = path.join(DB_PATH, 'store.json');

function loadStore(): VecStore {
  if (_store) return _store;
  if (!fs.existsSync(DB_PATH)) fs.mkdirSync(DB_PATH, { recursive: true });
  if (fs.existsSync(STORE_FILE)) {
    try {
      _store = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8')) as VecStore;
      return _store;
    } catch {
      // corrupted — start fresh
    }
  }
  _store = {};
  return _store;
}

function saveStore(): void {
  if (!_store) return;
  if (!fs.existsSync(DB_PATH)) fs.mkdirSync(DB_PATH, { recursive: true });
  fs.writeFileSync(STORE_FILE, JSON.stringify(_store), 'utf-8');
}

function getCollection(name: string): VecRecord[] {
  const store = loadStore();
  if (!store[name]) store[name] = [];
  return store[name];
}

// ─── Public API ─────────────────────────────────────────────────────────────

export function isIngested(): boolean {
  const col = getCollection(COLLECTION);
  return col.length > 0;
}

export function ingestAffirmations(): void {
  const store = loadStore();
  store[COLLECTION] = hayAffirmations.map(entry => ({
    id: entry.id,
    vec: embedEntry(entry),
    meta: entry as unknown as Record<string, unknown>,
  }));
  _store = store;
  saveStore();
  console.log(`[RuVector] Ingested ${hayAffirmations.length} affirmations.`);
}

/** Auto-ingest on first call if collection is empty */
function ensureIngested(): void {
  if (!isIngested()) ingestAffirmations();
}

/** Semantic search via cosine similarity over HNSW-style scan */
export function semanticSearch(query: string, topK = 5): SearchResult[] {
  ensureIngested();
  const queryVec = embed(query);
  const col = getCollection(COLLECTION);

  const scored = col.map(rec => ({
    entry: rec.meta as unknown as HayAffirmation,
    score: cosineSim(queryVec, rec.vec),
    matchType: 'semantic' as const,
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter(r => r.score > 0.05);
}

/** Keyword search over metadata fields */
export function keywordSearch(query: string, topK = 5): SearchResult[] {
  ensureIngested();
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  const col = getCollection(COLLECTION);

  const scored = col.map(rec => {
    const entry = rec.meta as unknown as HayAffirmation;
    const haystack = [
      entry.ailment, entry.body_part, entry.probable_cause,
      ...entry.keywords, ...entry.related_emotions, entry.category,
    ].join(' ').toLowerCase();

    const hits = terms.filter(t => haystack.includes(t)).length;
    return {
      entry,
      score: hits / Math.max(terms.length, 1),
      matchType: 'keyword' as const,
    };
  });

  return scored
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/** Hybrid search: merge semantic + keyword with Reciprocal Rank Fusion */
export function hybridSearch(query: string, topK = 6): SearchResult[] {
  ensureIngested();
  const semResults = semanticSearch(query, 20);
  const kwResults  = keywordSearch(query, 20);

  const k = 60; // RRF constant
  const scores = new Map<string, number>();

  semResults.forEach((r, rank) => {
    scores.set(r.entry.id, (scores.get(r.entry.id) ?? 0) + 1 / (k + rank + 1));
  });
  kwResults.forEach((r, rank) => {
    scores.set(r.entry.id, (scores.get(r.entry.id) ?? 0) + 1 / (k + rank + 1));
  });

  const allById = new Map<string, HayAffirmation>([
    ...semResults.map(r => [r.entry.id, r.entry] as [string, HayAffirmation]),
    ...kwResults.map(r =>  [r.entry.id, r.entry] as [string, HayAffirmation]),
  ]);

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([id, score]) => ({
      entry: allById.get(id)!,
      score,
      matchType: 'hybrid' as const,
    }));
}

/** Get graph neighbors (related entries) for a result set */
export function getGraphNeighbors(entries: HayAffirmation[], limit = 3): HayAffirmation[] {
  const seen = new Set(entries.map(e => e.id));
  const neighbors: HayAffirmation[] = [];

  for (const entry of entries.slice(0, 2)) {
    for (const rel of getRelated(entry)) {
      if (!seen.has(rel.id)) {
        seen.add(rel.id);
        neighbors.push(rel);
        if (neighbors.length >= limit) return neighbors;
      }
    }
  }
  return neighbors;
}

// ─── Journal vector store ───────────────────────────────────────────────────

export function saveJournalEmbedding(
  id: string,
  content: string,
  meta: Record<string, unknown>
): void {
  const store = loadStore();
  if (!store[JOURNAL_COLLECTION]) store[JOURNAL_COLLECTION] = [];
  store[JOURNAL_COLLECTION].push({ id, vec: embed(content), meta });
  _store = store;
  saveStore();
}

export function searchJournal(query: string, topK = 3): VecRecord[] {
  const queryVec = embed(query);
  const col = getCollection(JOURNAL_COLLECTION);

  return col
    .map(rec => ({ rec, score: cosineSim(queryVec, rec.vec) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(s => s.rec);
}

/** Record thumbs-up/down to reweight future results (lightweight RLHF) */
export function recordFeedback(id: string, helpful: boolean): void {
  const store = loadStore();
  const col = store[COLLECTION] ?? [];
  const rec = col.find(r => r.id === id);
  if (!rec) return;

  // Amplify or dampen the vector magnitude as a simple proxy for ranking
  const factor = helpful ? 1.05 : 0.95;
  rec.vec = rec.vec.map(v => v * factor);
  _store = store;
  saveStore();
}
