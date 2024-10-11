import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/../auth";
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await auth(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, isSaved } = await req.json();

  try {
    const flashcard = await db.flashcard.update({
      where: { id },
      data: { isSaved },
    });

    return NextResponse.json({ success: true, flashcard });
  } catch (error) {
    console.error('Error saving flashcard:', error);
    return NextResponse.json({ error: 'Error saving flashcard' }, { status: 500 });
  }
}
