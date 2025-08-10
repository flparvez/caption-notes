import { dbConnect } from '@/lib/db';
import Note from '@/models/Note';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');

  const filter = query ? { productName: { $regex: query, $options: 'i' } } : {};

  const notes = await Note.find(filter);
  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const { productName, captions } = await req.json();

  if (!productName || !Array.isArray(captions)) {
    return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
  }

  const newNote = new Note({ productName, captions });
  await newNote.save();

  return NextResponse.json(newNote, { status: 201 });
}
