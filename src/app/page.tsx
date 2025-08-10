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

// Map normal characters to bold unicode chars for a-z, A-Z
const toBoldUnicode = (text: string) => {
  const offsetUpper = 0x1d400 - 65; // Unicode offset for A
  const offsetLower = 0x1d41a - 97; // Unicode offset for a

  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        // Uppercase A-Z
        return String.fromCodePoint(code + offsetUpper);
      } else if (code >= 97 && code <= 122) {
        // Lowercase a-z
        return String.fromCodePoint(code + offsetLower);
      } else {
        return char;
      }
    })
    .join('');
};

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

  // Convert HTML caption to plain text with bold unicode for bold parts
  const htmlToFacebookBoldText = (html: string) => {
    // Create temp div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Recursive function to parse nodes
    const parseNode = (node: ChildNode): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        let text = '';
        // Check if element is bold type
        const isBold =
          el.tagName === 'STRONG' ||
          el.tagName === 'B' ||
          (el.style && el.style.fontWeight === 'bold');

        for (let i = 0; i < el.childNodes.length; i++) {
          const childText = parseNode(el.childNodes[i]);
          text += isBold ? toBoldUnicode(childText) : childText;
        }

        // Handle line breaks and paragraphs
        if (el.tagName === 'BR' || el.tagName === 'P') {
          text += '\n';
        }

        return text;
      }
      return '';
    };

    return parseNode(tempDiv).trim();
  };

  const handleCopy = async (noteId: string, caption: string, captionIndex: number) => {
    try {
      const formattedText = htmlToFacebookBoldText(caption);
      await navigator.clipboard.writeText(formattedText);
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
          {notes.map((note) => (
            <section
              key={note._id}
              className="bg-white rounded-2xl shadow-xl p-8 transition-transform hover:scale-[1.02]"
            >
              <h2 className="text-3xl font-extrabold text-indigo-700 mb-8 border-b-2 border-indigo-300 pb-2">
                {note.productName}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {note.captions.map((caption, i) => {
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
