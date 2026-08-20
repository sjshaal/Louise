import { NextRequest, NextResponse } from 'next/server';
import { hybridSearch, getGraphNeighbors } from '@/lib/ruvector';
import type { ChatResponse, SearchResult } from '@/lib/types';

const OPENERS = [
  "With love and compassion, here is what Louise Hay's wisdom suggests for what you're experiencing:",
  "Your willingness to explore this is itself an act of self-love. Let's look at what patterns may be at play:",
  "Thank you for sharing this with openness. Here are the mental patterns and affirmations that may resonate:",
  "You are on a beautiful healing journey. The wisdom of Louise Hay offers this guidance:",
  "Remember: you are always safe, and healing begins the moment you choose to see it differently.",
];

const CLOSERS = [
  "Remember, this is not medical advice — it is an invitation to explore the mind-body connection with curiosity and self-compassion.",
  "Louise Hay reminds us: 'Every thought we think is creating our future.' You have the power to choose new thoughts.",
  "Be gentle with yourself as you sit with these insights. Healing is a journey, not a destination.",
  "You are worthy of healing, love, and all good things. Trust the process.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildHealerResponse(query: string, results: SearchResult[]): string {
  if (results.length === 0) {
    return `${pick(OPENERS)}\n\nI didn't find a specific match for what you described, but Louise Hay's core teaching applies universally: **"I love and approve of myself."** Repeat this affirmation with feeling, and notice what shifts.\n\n${pick(CLOSERS)}`;
  }

  const top = results[0].entry;
  const lines: string[] = [pick(OPENERS), ''];

  lines.push(`**What may be at the root:**`);
  lines.push(`*${top.probable_cause}*`);
  lines.push('');

  if (results.length > 1) {
    lines.push(`**Connected patterns:**`);
    results.slice(1, 3).forEach(r => {
      lines.push(`• **${r.entry.ailment}** — ${r.entry.probable_cause}`);
    });
    lines.push('');
  }

  lines.push(`**Your healing affirmation:**`);
  lines.push(`> "${top.affirmation}"`);
  lines.push('');

  lines.push(`**New thought pattern to practice:**`);
  lines.push(`*${top.new_thought_pattern}*`);
  lines.push('');

  lines.push(`**A gentle journaling prompt:**`);
  lines.push(`Take a quiet moment and ask yourself: *"${buildJournalPrompt(top.probable_cause)}"* Write whatever comes, without judgment.`);
  lines.push('');

  lines.push(pick(CLOSERS));
  return lines.join('\n');
}

function buildJournalPrompt(cause: string): string {
  const lower = cause.toLowerCase();
  if (lower.includes('fear')) return 'What am I truly afraid of, and what would it feel like to be completely safe?';
  if (lower.includes('resentment') || lower.includes('anger')) return 'Who or what am I holding resentment toward, and what would it feel like to release it?';
  if (lower.includes('guilt')) return 'What am I punishing myself for, and can I offer myself the same forgiveness I would give a dear friend?';
  if (lower.includes('love') || lower.includes('approval')) return 'In what ways have I not been approving of myself, and what would unconditional self-love look like?';
  if (lower.includes('support') || lower.includes('unsupported')) return 'Where in my life do I feel unsupported, and how can I begin to support myself?';
  return 'What old belief am I ready to release, and what new, loving thought would I like to take its place?';
}

export async function POST(req: NextRequest) {
  let body: { query: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const query = body.query?.trim();
  if (!query || query.length < 3) {
    return NextResponse.json({ error: 'Query too short' }, { status: 400 });
  }

  const results = hybridSearch(query, 5);
  const top = results[0]?.entry;
  const message = buildHealerResponse(query, results);
  const affirmation = top?.affirmation ?? 'I love and approve of myself. I am safe.';

  const suggestedJournal = top
    ? `Today I explored: "${top.probable_cause}"\n\nMy affirmation: "${top.affirmation}"\n\n`
    : undefined;

  const response: ChatResponse = { message, results, affirmation, suggestedJournal };
  return NextResponse.json(response);
}
