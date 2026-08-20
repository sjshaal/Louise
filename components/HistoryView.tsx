'use client';
import { useState, useEffect } from 'react';
import { History, Heart, TrendingUp, BookOpen } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { JournalEntry } from '@/lib/types';

interface InsightTheme {
  theme: string;
  count: number;
  affirmation: string;
}

const THEME_MAP: Record<string, { affirmation: string }> = {
  fear:         { affirmation: 'I am safe. I trust life.' },
  anger:        { affirmation: 'I release all anger with love.' },
  resentment:   { affirmation: 'I freely forgive and move forward.' },
  love:         { affirmation: 'I love and approve of myself.' },
  anxiety:      { affirmation: 'I breathe freely and trust the process of life.' },
  guilt:        { affirmation: 'I lovingly release all guilt and choose freedom.' },
  sadness:      { affirmation: 'I allow myself to feel and gently release.' },
  self:         { affirmation: 'I am a divine expression of life.' },
  pain:         { affirmation: 'I release all that no longer serves me.' },
  forgiveness:  { affirmation: 'As I forgive, I set myself free.' },
};

function extractThemes(entries: JournalEntry[]): InsightTheme[] {
  const counts: Record<string, number> = {};
  const text = entries.map(e => e.content + ' ' + (e.affirmation ?? '')).join(' ').toLowerCase();

  for (const theme of Object.keys(THEME_MAP)) {
    const matches = (text.match(new RegExp(theme, 'g')) ?? []).length;
    if (matches > 0) counts[theme] = matches;
  }

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([theme, count]) => ({
      theme,
      count,
      affirmation: THEME_MAP[theme].affirmation,
    }));
}

export function HistoryView() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [themes, setThemes]   = useState<InsightTheme[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('dh-journal');
    if (stored) {
      const parsed = JSON.parse(stored) as JournalEntry[];
      setEntries(parsed);
      setThemes(extractThemes(parsed));
    }
  }, []);

  if (entries.length === 0) {
    return (
      <div className="text-center py-16">
        <History className="w-12 h-12 text-lavender-200 mx-auto mb-3" />
        <p className="font-serif text-lavender-400 text-lg mb-1">Your journey awaits</p>
        <p className="text-sm text-neutral-400 dark:text-purple-500 italic">
          Begin with a journal entry or healing chat — your history will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Healing Insights */}
      {themes.length > 0 && (
        <div className="healing-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-lavender-500" />
            <h2 className="font-serif text-lavender-700 dark:text-lavender-400">Healing Insights</h2>
            <span className="text-[11px] text-neutral-400 dark:text-purple-500">from {entries.length} journal entries</span>
          </div>
          <p className="text-xs text-neutral-400 dark:text-purple-500 mb-3 italic">
            These recurring themes have appeared in your writing. RuVector has noticed these patterns and is learning from them.
          </p>
          <div className="space-y-2.5">
            {themes.map(t => (
              <div key={t.theme} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium text-lavender-700 dark:text-lavender-400 capitalize">{t.theme}</span>
                    <span className="text-xs text-neutral-400">{t.count}×</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-lavender-100 dark:bg-purple-900/40 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-lavender-400 to-sage-400 transition-all duration-700"
                      style={{ width: `${Math.min(100, t.count * 15)}%` }}
                    />
                  </div>
                  <p className="text-[11px] italic text-neutral-400 dark:text-purple-500 mt-0.5">"{t.affirmation}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="healing-card p-4 text-center">
          <BookOpen className="w-5 h-5 text-lavender-400 mx-auto mb-1" />
          <p className="text-2xl font-serif font-bold text-lavender-600 dark:text-lavender-400">{entries.length}</p>
          <p className="text-xs text-neutral-400">Journal Entries</p>
        </div>
        <div className="healing-card p-4 text-center">
          <Heart className="w-5 h-5 text-blush-400 mx-auto mb-1" />
          <p className="text-2xl font-serif font-bold text-blush-500 dark:text-blush-400">{themes.length}</p>
          <p className="text-xs text-neutral-400">Recurring Themes</p>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-500 dark:text-purple-400 mb-3 px-1 flex items-center gap-2">
          <History className="w-4 h-4" /> Entry Timeline
        </h3>
        <div className="space-y-2">
          {entries.map((e, i) => (
            <div key={e.id} className={cn('healing-card p-3 transition-all animate-fade-in')} style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-neutral-600 dark:text-purple-300 line-clamp-2 flex-1">{e.content}</p>
                <span className="text-[10px] text-neutral-400 dark:text-purple-500 whitespace-nowrap flex-shrink-0">{formatDate(e.timestamp)}</span>
              </div>
              {e.affirmation && (
                <p className="text-xs italic text-lavender-500 dark:text-lavender-400 mt-1 border-l-2 border-lavender-200 pl-2">
                  "{e.affirmation}"
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
