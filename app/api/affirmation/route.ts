import { NextRequest, NextResponse } from 'next/server';
import { getDailyAffirmation } from '@/lib/hay-data';
import type { DailyAffirmationResponse } from '@/lib/types';

const PERSONAL_NOTES = [
  "Today is a perfect day to choose a new thought.",
  "Your healing journey begins with one loving breath.",
  "You are exactly where you need to be.",
  "Every moment is a new opportunity to love yourself more deeply.",
  "The love you seek is already within you.",
  "Today, choose to be gentle with yourself.",
  "You deserve all the good that life has to offer.",
  "Your thoughts create your reality — choose thoughts of love.",
  "You are a radiant expression of life itself.",
  "Peace begins with your very next thought.",
];

export async function GET(req: NextRequest) {
  // Use the day-of-year as a deterministic seed so it changes daily
  const now = new Date();
  const seed = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );

  const entry = getDailyAffirmation(seed);
  const personalNote = PERSONAL_NOTES[seed % PERSONAL_NOTES.length];

  const response: DailyAffirmationResponse = { entry, personalNote };
  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
