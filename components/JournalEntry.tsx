'use client';
import { useState, useEffect } from 'react';
import { BookOpen, Save, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { JournalEntry as JEntry } from '@/lib/types';

const PROMPTS = [
  "What am I feeling in my body right now, and what might it be telling me?",
  "What old belief am I ready to release with love?",
  "In what ways have I been critical of myself today, and how can I choose differently?",
  "What am I grateful for in this moment, however small?",
  "If I could speak to my body with complete love, what would I say?",
  "What would forgiving myself or another look like today?",
  "What new thought pattern would I like to practice this week?",
];

function StoredEntry({ entry }: { entry: JEntry }) {
  return (
    <div className="healing-card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-neutral-400 dark:text-purple-500">{formatDate(entry.timestamp)}</span>
        {entry.affirmation && (
          <span className="text-[10px] px-2 py-0.5 bg-lavender-100 dark:bg-lavender-900/30 text-lavender-600 dark:text-lavender-400 rounded-full flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> has affirmation
          </span>
        )}
      </div>
      <p className="text-sm text-neutral-600 dark:text-purple-300 leading-relaxed line-clamp-4">{entry.content}</p>
      {entry.affirmation && (
        <p className="text-xs font-serif italic text-lavender-600 dark:text-lavender-400 border-l-2 border-lavender-200 pl-2">
          "{entry.affirmation}"
        </p>
      )}
    </div>
  );
}

export function JournalEntryWidget() {
  const [content, setContent]         = useState('');
  const [affirmation, setAffirmation] = useState('');
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [entries, setEntries]         = useState<JEntry[]>([]);
  const [prompt, setPrompt]           = useState('');

  useEffect(() => {
    setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
    const stored = localStorage.getItem('dh-journal');
    if (stored) setEntries(JSON.parse(stored) as JEntry[]);
  }, []);

  const save = async () => {
    if (!content.trim() || saving) return;
    setSaving(true);
    try {
      await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, affirmation: affirmation || undefined }),
      });

      const newEntry: JEntry = {
        id: `j_${Date.now()}`,
        content,
        affirmation: affirmation || undefined,
        timestamp: Date.now(),
      };

      const updated = [newEntry, ...entries].slice(0, 50);
      setEntries(updated);
      localStorage.setItem('dh-journal', JSON.stringify(updated));
      setContent('');
      setAffirmation('');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Write new entry */}
      <div className="healing-card p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-lavender-500" />
          <h2 className="font-serif text-lavender-700 dark:text-lavender-400">Write a journal entry</h2>
        </div>

        <div className="bg-cream-50 dark:bg-purple-950/30 border border-lavender-100 dark:border-purple-900/30 rounded-xl px-4 py-2">
          <p className="text-xs text-neutral-400 dark:text-purple-500 mb-0.5 font-medium">Today's prompt:</p>
          <p className="text-sm italic text-lavender-600 dark:text-lavender-400">{prompt}</p>
        </div>

        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write freely, without judgment. This is your sacred space…"
          rows={6}
          className="w-full resize-none rounded-xl border border-lavender-200 dark:border-purple-800/60 bg-white/80 dark:bg-purple-950/40 px-4 py-3 text-sm text-neutral-700 dark:text-purple-100 placeholder:text-neutral-400 dark:placeholder:text-purple-600 focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-purple-700 transition-all custom-scroll"
        />

        <input
          value={affirmation}
          onChange={e => setAffirmation(e.target.value)}
          placeholder="Your affirmation for today (optional)…"
          className="w-full rounded-xl border border-lavender-200 dark:border-purple-800/60 bg-white/60 dark:bg-purple-950/30 px-4 py-2.5 text-sm italic text-lavender-700 dark:text-lavender-400 placeholder:text-neutral-400 dark:placeholder:text-purple-600 focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-purple-700 transition-all"
        />

        <div className="flex items-center justify-between">
          <p className="text-[11px] text-neutral-400">{content.length} characters</p>
          <button
            onClick={save}
            disabled={!content.trim() || saving}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
              saved
                ? 'bg-sage-100 dark:bg-green-900/30 text-sage-700 dark:text-green-400'
                : 'bg-gradient-to-r from-lavender-500 to-sage-500 text-white shadow-sm hover:shadow-md hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed'
            )}
          >
            {saving  && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saved   && <CheckCircle className="w-3.5 h-3.5" />}
            {!saving && !saved && <Save className="w-3.5 h-3.5" />}
            {saved ? 'Saved with love ✓' : 'Save Entry'}
          </button>
        </div>
      </div>

      {/* Past entries */}
      {entries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-neutral-500 dark:text-purple-400 px-1">Past Entries</h3>
          {entries.map(e => <StoredEntry key={e.id} entry={e} />)}
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-6 text-neutral-400 dark:text-purple-600">
          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm italic">Your healing stories begin here.</p>
        </div>
      )}
    </div>
  );
}
