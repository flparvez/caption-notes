'use client';

import { INote } from '@/models/Note';
import dynamic from 'next/dynamic';

// Dynamically import NoteForm with no SSR
const NoteForm = dynamic(() => import('./NoteForm'), { ssr: false });

export default function NoteFormWrapper(props: { note?: INote; onFinished?: () => void }) {
  return <NoteForm {...props} />;
}
