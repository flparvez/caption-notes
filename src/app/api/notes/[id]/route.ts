import { dbConnect } from '@/lib/db';
import Note from '@/models/Note';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest,  {params}: {params : Promise<{id: string}>} 
) {

   const {id} = (await params)
  await dbConnect();
  const note = await Note.findById(id);
  if (!note) {
    return NextResponse.json({ message: 'Note not found' }, { status: 404 });
  }
  return NextResponse.json(note);
}

export async function PUT(req: NextRequest,  {params}: {params : Promise<{id: string}>} 
) {
  await dbConnect();
  const { productName, captions } = await req.json();
  const { id } = (await params);
  if (!productName || !Array.isArray(captions)) {
    return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
  }

  const updatedNote = await Note.findByIdAndUpdate(
    id,
    { productName, captions },
    { new: true }
  );

  if (!updatedNote) {
    return NextResponse.json({ message: 'Note not found' }, { status: 404 });
  }
  return NextResponse.json(updatedNote);
}

export async function DELETE (req: NextRequest,  {params}: {params : Promise<{id: string}>} 
) {

  const { id } = (await params);
  await dbConnect();
  const deletedNote = await Note.findByIdAndDelete(id);
  if (!deletedNote) {
    return NextResponse.json({ message: 'Note not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Note deleted' });
}
