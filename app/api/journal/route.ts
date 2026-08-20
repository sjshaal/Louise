import { NextRequest, NextResponse } from 'next/server';
import { saveJournalEmbedding, searchJournal } from '@/lib/ruvector';
import type { JournalEntry } from '@/lib/types';

export async function POST(req: NextRequest) {
  let body: { content: string; affirmation?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const content = body.content?.trim();
  if (!content || content.length < 5) {
    return NextResponse.json({ error: 'Journal entry too short' }, { status: 400 });
  }

  const entry: JournalEntry = {
    id: `journal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    content,
    affirmation: body.affirmation,
    timestamp: Date.now(),
  };

  saveJournalEmbedding(entry.id, content, {
    content,
    affirmation: body.affirmation ?? null,
    timestamp: entry.timestamp,
  });

  return NextResponse.json({ success: true, entry });
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q) return NextResponse.json({ results: [] });

  const results = searchJournal(q, 5);
  return NextResponse.json({
    results: results.map(r => ({ id: r.id, ...r.meta })),
  });
}
