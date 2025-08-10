'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,

  DialogOverlay,
} from '@/components/ui/dialog';
import NoteForm from './NoteForm';
import { useRouter } from 'next/navigation';

import { INote } from '@/models/Note';

async function getNotes(query: string) {
  const res = await fetch(`/api/notes?query=${query}`);
  if (!res.ok) {
    throw new Error('Failed to fetch notes');
  }
  return res.json();
}

export default function NoteList({ query }: { query: string }) {
  const [notes, setNotes] = useState<INote[]>([]);
  const router = useRouter();

  // Track which note is being edited
  const [editingNote, setEditingNote] = useState<INote | null>(null);

  useEffect(() => {
    getNotes(query).then(setNotes);
  }, [query]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      }
    }
  };

  const onEditFinished = () => {
    setEditingNote(null);
    router.refresh();
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Captions</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notes.map((note) => (
            <TableRow key={note._id}>
              <TableCell>{note.productName}</TableCell>
              <TableCell>
                <div className="space-y-3">
                  {note.captions.map((caption, index) => (
                    <div
                      key={index}
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: caption.length > 100 ? caption.slice(0, 100) + '...' : caption,
                      }}
                    />
                  ))}
                </div>
              </TableCell>
              <TableCell className="space-x-2">
                <Button variant="outline" size="sm" onClick={() => setEditingNote(note)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(note._id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Dialog */}
      <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogOverlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />
        <DialogContent
          className="
            fixed
            top-16
            left-1/2
            transform
            -translate-x-1/2
            z-50
            w-[90vw]
            max-w-3xl
            rounded-lg
            bg-white
            p-6
            shadow-lg
            overflow-auto
            max-h-[80vh]
            sm:w-[600px]
          "
        >
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          {editingNote && <NoteForm note={editingNote} onFinished={onEditFinished} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
