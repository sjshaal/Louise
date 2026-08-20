import { NextRequest, NextResponse } from 'next/server';
import { hybridSearch, getGraphNeighbors } from '@/lib/ruvector';
import type { SearchResponse } from '@/lib/types';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ error: 'Query too short' }, { status: 400 });
  }

  const results = hybridSearch(q, 6);
  const topEntries = results.slice(0, 3).map(r => r.entry);
  const relatedEntries = getGraphNeighbors(topEntries, 3);

  const response: SearchResponse = { results, query: q, relatedEntries };
  return NextResponse.json(response);
}
