import type { HayAffirmation } from './types';
import rawData from '../data/hay-affirmations.json';

export const hayAffirmations: HayAffirmation[] = rawData as HayAffirmation[];

export const hayById = new Map<string, HayAffirmation>(
  hayAffirmations.map(e => [e.id, e])
);

export const hayByCategory = hayAffirmations.reduce<Record<string, HayAffirmation[]>>(
  (acc, entry) => {
    (acc[entry.category] ??= []).push(entry);
    return acc;
  },
  {}
);

export const allCategories = [...new Set(hayAffirmations.map(e => e.category))];

export const allBodyParts = [...new Set(hayAffirmations.map(e => e.body_part))];

export function getRelated(entry: HayAffirmation): HayAffirmation[] {
  return entry.related_ailments
    .map(id => hayById.get(id))
    .filter((e): e is HayAffirmation => e !== undefined);
}

export function getDailyAffirmation(seed?: number): HayAffirmation {
  const idx = seed !== undefined
    ? seed % hayAffirmations.length
    : Math.floor(Math.random() * hayAffirmations.length);
  return hayAffirmations[idx];
}

/** Simple keyword search — returns entries ranked by keyword hit count */
export function keywordSearch(query: string, topK = 5): HayAffirmation[] {
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

  const scored = hayAffirmations.map(entry => {
    const haystack = [
      entry.ailment,
      entry.body_part,
      entry.probable_cause,
      entry.affirmation,
      ...entry.keywords,
      ...entry.related_emotions,
      entry.category,
    ].join(' ').toLowerCase();

    const hits = terms.filter(t => haystack.includes(t)).length;
    return { entry, score: hits / Math.max(terms.length, 1) };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(s => s.entry);
}
