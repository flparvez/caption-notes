'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic'; // Import dynamic
import { INote } from '@/models/Note';

// Dynamically import the RichTextEditor with SSR turned off
const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
  loading: () => <div>Loading editor...</div>,
});

export default function NoteForm({ note, onFinished }: { note?: INote, onFinished?: () => void }) {
  const [productName, setProductName] = useState(note?.productName || '');
  const [captions, setCaptions] = useState<string[]>(note?.captions || ['<p></p>']);
  const router = useRouter();

  const handleCaptionChange = (index: number, value: string) => {
    const newCaptions = [...captions];
    newCaptions[index] = value;
    setCaptions(newCaptions);
  };

  const addCaption = () => {
    setCaptions([...captions, '<p></p>']);
  };

  const removeCaption = (index: number) => {
    const newCaptions = captions.filter((_, i) => i !== index);
    setCaptions(newCaptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = note ? 'PUT' : 'POST';
    const url = note ? `/api/notes/${note._id}` : '/api/notes';

    const finalCaptions = captions.filter(c => c && c !== '<p></p>');

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productName, captions: finalCaptions }),
    });

    if (res.ok) {
      router.refresh();
      if (onFinished) {
        onFinished();
      } else {
        setProductName('');
        setCaptions(['<p></p>']);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{note ? 'Edit Note' : 'Create Note'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="productName" className="block text-sm font-medium mb-1">
                Product Name
              </label>
              <Input
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Captions</label>
              {captions.map((caption, index) => (
                <div key={index} className="space-y-2 mb-4 p-4 border rounded-lg relative">
                  <RichTextEditor
                    value={caption}
                    onChange={(value) => handleCaptionChange(index, value)}
                  />
                  {captions.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeCaption(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addCaption}>
                Add Caption
              </Button>
            </div>
            <Button type="submit">{note ? 'Update Note' : 'Create Note'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}