'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { INote } from '@/models/Note';

import SearchBar from '@/components/Search';
import CaptionList from '@/components/CaptionList';

async function fetchNotes(query: string) {
  const res = await fetch(`/api/notes?query=${(query)}`);
  if (!res.ok) throw new Error('Failed to fetch notes');
  return res.json() as Promise<INote[]>;
}

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [notes, setNotes] = useState<INote[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchNotes(query)
      .then(setNotes)
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <main className="max-w-7xl mx-auto p-6 sm:p-10">
      <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-10">
        <Link href="/admin" className="hover:underline">
          Admin
        </Link>
      </h1>

      <SearchBar query={query} onQueryChange={setQuery} />
      {/* <SearchBar query={query} onQueryChange={setQuery} /> */}

      {loading ? (
        <div className="text-center text-gray-500">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="text-center text-gray-500">No notes found.</div>
      ) : (
        <div className="space-y-12">
          {notes.map((note) => (
            <section
              key={note._id}
              className="bg-white rounded-2xl shadow-xl p-8 transition-transform hover:scale-[1.02]"
            >
              <h2 className="text-3xl font-extrabold text-indigo-700 mb-8 border-b-2 border-indigo-300 pb-2">
                {note.productName}
              </h2>

              <CaptionList noteId={note._id} captions={note.captions} />
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
