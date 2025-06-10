import { NextRequest, NextResponse } from 'next/server';
import { appendCheckIn } from '@/lib/sheets';

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    await appendCheckIn(name);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error appending check-in:', error);
    return NextResponse.json({ error: 'Failed to append check-in' }, { status: 500 });
  }
} 