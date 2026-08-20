'use client';
import { useState, useCallback, useRef } from 'react';
import { Search, X, ChevronRight, Loader2, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SearchResponse, HayAffirmation } from '@/lib/types';

const QUICK_TAGS = [
  'headache', 'back pain', 'anxiety', 'anger', 'depression', 'insomnia',
  'fatigue', 'fear', 'neck', 'stomach', 'heart', 'self-love', 'forgiveness',
  'resentment', 'shame', 'loneliness',
];

function AffirmationCard({ entry, expanded, onToggle }: {
  entry: HayAffirmation;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        'healing-card p-4 cursor-pointer transition-all duration-300 hover:shadow-md',
        expanded && 'ring-2 ring-lavender-300 dark:ring-lavender-600'
      )}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-lavender-700 dark:text-lavender-400">{entry.ailment}</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-sage-100 dark:bg-green-900/30 text-sage-700 dark:text-green-400 rounded-full">{entry.body_part}</span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-purple-400 italic leading-snug">{entry.probable_cause}</p>
        </div>
        <ChevronRight className={cn('w-4 h-4 text-neutral-300 flex-shrink-0 mt-0.5 transition-transform', expanded && 'rotate-90')} />
      </div>

      {expanded && (
        <div className="mt-4 pt-3 border-t border-lavender-100 dark:border-purple-900/30 space-y-3 animate-fade-in">
          <div>
            <p className="text-[11px] font-semibold text-lavender-600 dark:text-lavender-400 uppercase tracking-wide mb-1">Affirmation</p>
            <blockquote className="text-sm font-serif italic text-lavender-700 dark:text-lavender-300 leading-relaxed">
              "{entry.affirmation}"
            </blockquote>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-sage-600 dark:text-green-400 uppercase tracking-wide mb-1">New Thought Pattern</p>
            <p className="text-sm text-neutral-600 dark:text-purple-300">{entry.new_thought_pattern}</p>
          </div>
          {entry.related_emotions.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-1">Related Emotions</p>
              <div className="flex flex-wrap gap-1.5">
                {entry.related_emotions.map(e => (
                  <span key={e} className="symptom-tag text-[11px]">{e}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SymptomSearch() {
  const [query, setQuery]         = useState('');
  const [results, setResults]     = useState<SearchResponse | null>(null);
  const [loading, setLoading]     = useState(false);
  const [expanded, setExpanded]   = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) { setResults(null); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data: SearchResponse = await res.json();
      setResults(data);
      setExpanded(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const onChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 350);
  };

  const clear = () => { setQuery(''); setResults(null); };

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          value={query}
          onChange={e => onChange(e.target.value)}
          placeholder="Search by symptom, emotion, or body part…"
          className="w-full pl-10 pr-10 py-3 rounded-2xl border border-lavender-200 dark:border-purple-800/60 bg-white/80 dark:bg-purple-950/40 text-sm text-neutral-700 dark:text-purple-100 placeholder:text-neutral-400 dark:placeholder:text-purple-600 focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-purple-700 transition-all"
        />
        {query && (
          <button onClick={clear} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick tags */}
      {!query && (
        <div>
          <p className="text-xs text-neutral-400 dark:text-purple-500 mb-2 font-medium">Common searches:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_TAGS.map(tag => (
              <button key={tag} onClick={() => onChange(tag)} className="symptom-tag">
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8 gap-2 text-neutral-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Searching with love…</span>
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div className="space-y-3 animate-slide-up">
          <p className="text-xs text-neutral-400 dark:text-purple-500">
            {results.results.length} result{results.results.length !== 1 ? 's' : ''} for "{results.query}"
          </p>

          {results.results.length === 0 && (
            <div className="healing-card p-6 text-center">
              <Heart className="w-8 h-8 text-lavender-300 mx-auto mb-2" />
              <p className="text-sm text-neutral-500 dark:text-purple-400 italic">No exact matches found. Try different words or browse by emotion.</p>
            </div>
          )}

          {results.results.map(r => (
            <AffirmationCard
              key={r.entry.id}
              entry={r.entry}
              expanded={expanded === r.entry.id}
              onToggle={() => setExpanded(prev => prev === r.entry.id ? null : r.entry.id)}
            />
          ))}

          {results.relatedEntries.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-neutral-400 dark:text-purple-500 uppercase tracking-wide mb-2">Also connected →</p>
              {results.relatedEntries.map(e => (
                <AffirmationCard
                  key={e.id}
                  entry={e}
                  expanded={expanded === e.id}
                  onToggle={() => setExpanded(prev => prev === e.id ? null : e.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
