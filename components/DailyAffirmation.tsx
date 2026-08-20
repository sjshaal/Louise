'use client';
import { useEffect, useState } from 'react';
import { Flower2, RefreshCw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DailyAffirmationResponse } from '@/lib/types';

export function DailyAffirmation() {
  const [data, setData]       = useState<DailyAffirmationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  const fetch_ = async () => {
    setLoading(true);
    setVisible(false);
    try {
      const res = await fetch('/api/affirmation');
      const json: DailyAffirmationResponse = await res.json();
      setData(json);
      setTimeout(() => setVisible(true), 100);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch_(); }, []);

  return (
    <div className="healing-card p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-lavender-100 to-transparent dark:from-lavender-900/20 rounded-bl-[80px] pointer-events-none" />

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-lavender-100 dark:bg-lavender-900/40 flex items-center justify-center">
            <Flower2 className="w-4 h-4 text-lavender-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-lavender-700 dark:text-lavender-400">Today's Affirmation</h2>
            <p className="text-[11px] text-neutral-400 dark:text-purple-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        <button
          onClick={fetch_}
          className="p-2 rounded-lg hover:bg-lavender-50 dark:hover:bg-purple-950/40 transition-colors text-neutral-400 hover:text-lavender-500"
          title="Refresh affirmation"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </button>
      </div>

      {loading && !data && (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-lavender-100 dark:bg-lavender-900/30 rounded w-3/4" />
          <div className="h-4 bg-lavender-100 dark:bg-lavender-900/30 rounded w-full" />
          <div className="h-4 bg-lavender-100 dark:bg-lavender-900/30 rounded w-2/3" />
        </div>
      )}

      {data && (
        <div className={cn('transition-all duration-700', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2')}>
          <div className="mb-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sage-100 dark:bg-green-900/30 text-sage-700 dark:text-green-400 text-[11px] rounded-full font-medium mb-2">
              <Sparkles className="w-3 h-3" /> {data.entry.ailment}
            </span>
            <blockquote className="affirmation-text">
              "{data.entry.affirmation}"
            </blockquote>
          </div>

          <div className="mt-4 pt-4 border-t border-lavender-100 dark:border-purple-900/30">
            <p className="text-xs text-neutral-500 dark:text-purple-400 italic">{data.personalNote}</p>
          </div>

          {data.entry.probable_cause && (
            <details className="mt-3">
              <summary className="text-xs text-lavender-500 cursor-pointer hover:text-lavender-600 select-none">
                What Louise Hay says about this ↓
              </summary>
              <p className="mt-2 text-xs text-neutral-500 dark:text-purple-400 leading-relaxed italic">
                {data.entry.probable_cause}
              </p>
              <p className="mt-1 text-xs text-sage-600 dark:text-green-400 font-medium">
                New thought: {data.entry.new_thought_pattern}
              </p>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
