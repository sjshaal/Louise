import { NextRequest, NextResponse } from 'next/server';
import { recordFeedback } from '@/lib/ruvector';
import type { FeedbackPayload } from '@/lib/types';

export async function POST(req: NextRequest) {
  let body: FeedbackPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.resultId || typeof body.helpful !== 'boolean') {
    return NextResponse.json({ error: 'Missing resultId or helpful flag' }, { status: 400 });
  }

  recordFeedback(body.resultId, body.helpful);
  return NextResponse.json({ success: true });
}
