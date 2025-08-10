'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Toggle } from '@/components/ui/toggle';
import { Bold, Italic, List, ListOrdered, Strikethrough } from 'lucide-react';

// Toolbar component remains the same
const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border border-input bg-transparent rounded-md p-1 flex items-center gap-1">
      <Toggle
        size="sm"
        pressed={editor.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('italic')}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('strike')}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('bulletList')}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('orderedList')}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>
    </div>
  );
};

// The Main Rich Text Editor Component
const RichTextEditor = ({ value, onChange }: { value: string; onChange: (richText: string) => void }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        horizontalRule: false,
        codeBlock: false,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'rounded-md border min-h-[150px] border-input bg-background p-4 prose dark:prose-invert',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    // ---- THE FIX IS HERE ----
    // This tells Tiptap to wait for the client-side to render completely
    // before it tries to render the editor's content, avoiding the SSR mismatch.
    immediatelyRender: false,
    // -------------------------
  });

  return (
    <div className="flex flex-col justify-stretch gap-2">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;