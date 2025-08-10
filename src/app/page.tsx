'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import { INote } from '@/models/Note';
import Link from 'next/link';

async function fetchNotes(query: string) {
  const res = await fetch(`/api/notes?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to fetch notes');
  return res.json() as Promise<INote[]>;
}

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [notes, setNotes] = useState<INote[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<{ noteId: string; captionIndex: number } | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchNotes(query)
      .then((data) => setNotes(data))
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }, [query]);

  // Copy caption HTML/text to clipboard with feedback
  const handleCopy = async (noteId: string, caption: string, captionIndex: number) => {
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = caption;
      const plainText = tempDiv.innerText || tempDiv.textContent || caption;

      await navigator.clipboard.writeText(plainText);

      setCopiedIndex({ noteId, captionIndex });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      alert('Failed to copy caption');
    }
  };

  return (
    <main className="max-w-7xl mx-auto p-6 sm:p-10">

      <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-10">
     <Link href="/admin" className="hover:underline">
       Admin
      </Link>
      </h1>
      {/* Search Bar */}
      <div className="mb-10 max-w-xl mx-auto">
        <Input
          placeholder="Search notes by product name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="shadow-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          type="search"
          autoComplete="off"
        />
      </div>

      {/* Notes List */}
      {loading ? (
        <div className="text-center text-gray-500">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="text-center text-gray-500">No notes found.</div>
      ) : (
        <div className="space-y-12">
          {notes?.map((note) => (
            <section
              key={note._id}
              className="bg-white rounded-2xl shadow-xl p-8 transition-transform hover:scale-[1.02]"
            >
              <h2 className="text-3xl font-extrabold text-indigo-700 mb-8 border-b-2 border-indigo-300 pb-2">
                {note.productName}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {note?.captions.map((caption, i) => {
                  const isCopied = copiedIndex?.noteId === note._id && copiedIndex.captionIndex === i;
                  return (
                    <div
                      key={i}
                      className="relative bg-gradient-to-r from-indigo-50 via-white to-indigo-50 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-shadow prose max-w-none"
                    >
                      <div dangerouslySetInnerHTML={{ __html: caption }} />

                      <button
                        onClick={() => handleCopy(note._id, caption, i)}
                        aria-label="Copy caption"
                        className={`
                          absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full
                          ${isCopied ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}
                          shadow-md transition-colors
                          focus:outline-none focus:ring-2 focus:ring-indigo-500
                        `}
                      >
                        {isCopied ? (
                          <CheckIcon className="w-6 h-6" />
                        ) : (
                          <ClipboardIcon className="w-6 h-6" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
