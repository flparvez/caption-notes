'use client';

import { Input } from '@/components/ui/input';

interface SearchBarProps {
  query: string;
  onQueryChange: (newQuery: string) => void;
}

export default function SearchBar({ query, onQueryChange }: SearchBarProps) {
  return (
    <div className="mb-10 max-w-xl mx-auto">
      <Input
        // Updated placeholder text
        placeholder="Search by product name or caption..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="shadow-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
        type="search"
        autoComplete="off"
      />
    </div>
  );
}