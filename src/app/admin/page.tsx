import { Suspense } from 'react';
import NoteList from '@/components/NoteList';
import SearchBar from '@/components/SearchBar';
import NoteForm from '@/components/NoteForm';
import Link from 'next/link';

// Corrected interface for AdminPageProps
interface AdminPageProps {
  searchParams: Promise<{
    query?: string;
  }>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  // Await the searchParams promise to resolve
  const { query } = await searchParams;
  const queryString = query || '';

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-10">
        <Link href="/" className="hover:underline">
          Home
        </Link>
      </h1>
      <h1 className="text-2xl font-bold mb-4">Note App Admin</h1>
      <NoteForm />
      <div className="mt-8">
        <SearchBar />
        <Suspense fallback={<div>Loading notes...</div>}>
          <NoteList query={queryString} />
        </Suspense>
      </div>
    </main>
  );
}