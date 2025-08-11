import { dbConnect } from '@/lib/db';
import Note from '@/models/Note';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query')?.trim();

  let filter = {};

  if (query) {
    // 1. Split the user's search query into individual words ("terms").
    // The filter(Boolean) removes any empty strings if the user types multiple spaces.
    const terms = query.split(/\s+/).filter(Boolean);

    // 2. Create an array of case-insensitive regular expressions, one for each term.
    const regexTerms = terms.map(term => new RegExp(term, 'i'));

    // 3. Construct the final, powerful filter.
    // This filter finds documents that match one of the two conditions inside $or.
    filter = {
      $or: [
        // Condition A: Find notes where the `productName` contains ALL of the search terms.
        {
          $and: regexTerms.map(regex => ({
            productName: { $regex: regex }
          }))
        },
        // Condition B: Find notes where the `captions` array contains ALL of the search terms.
        {
          $and: regexTerms.map(regex => ({
            captions: { $regex: regex }
          }))
        }
      ]
    };
  }

  // If the query is empty, the filter is `{}` and all notes are returned.
  // Otherwise, the advanced filter is used.
  const notes = await Note.find(filter);

  revalidatePath('/api/notes');

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
