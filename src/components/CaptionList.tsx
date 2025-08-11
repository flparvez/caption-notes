'use client';

import { useState } from 'react';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

interface CaptionListProps {
  noteId: string;
  captions: string[];
}

// Map normal A-Z,a-z to Unicode bold A-Z,a-z (for Facebook support)
const toUnicodeBold = (text: string) => {
  const offsetUpper = 0x1d400 - 65; // Mathematical Bold Capital A
  const offsetLower = 0x1d41a - 97; // Mathematical Bold Small a

  return [...text]
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCodePoint(code + offsetUpper);
      } else if (code >= 97 && code <= 122) {
        return String.fromCodePoint(code + offsetLower);
      }
      return char;
    })
    .join('');
};

// Convert HTML string caption, transform bold tags <b>, <strong> to unicode bold text, keep rest normal
const convertHtmlToFacebookText = (html: string) => {
  const div = document.createElement('div');
  div.innerHTML = html;

  const traverse = (node: ChildNode): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const isBold = el.tagName === 'B' || el.tagName === 'STRONG';

      let text = '';
      el.childNodes.forEach((child) => {
        const childText = traverse(child);
        text += isBold ? toUnicodeBold(childText) : childText;
      });

      // Add newline after <p> or <br>
      if (el.tagName === 'P' || el.tagName === 'BR') {
        text += '\n';
      }
      return text;
    }
    return '';
  };

  return traverse(div).trim();
};

export default function CaptionList({ captions }: CaptionListProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (caption: string, index: number) => {
    try {
      const textToCopy = convertHtmlToFacebookText(caption);

      // Copy fallback: create temp textarea
      const tempTextarea = document.createElement('textarea');
      tempTextarea.value = textToCopy;
      tempTextarea.setAttribute('readonly', '');
      tempTextarea.style.position = 'absolute';
      tempTextarea.style.left = '-9999px';
      document.body.appendChild(tempTextarea);
      tempTextarea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(tempTextarea);

      if (!successful) throw new Error('Copy command unsuccessful');

      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      alert('Failed to copy caption');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {captions.map((caption, i) => {
        const isCopied = copiedIndex === i;
        return (
          <div
            key={i}
            className="relative bg-gradient-to-r from-indigo-50 via-white to-indigo-50 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-shadow prose max-w-none"
          >
            <div dangerouslySetInnerHTML={{ __html: caption }} />

            <button
              onClick={() => handleCopy(caption, i)}
              aria-label="Copy caption"
              className={`
                absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full
                ${isCopied ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}
                shadow-md transition-colors
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              `}
              type="button"
            >
              {isCopied ? <CheckIcon className="w-6 h-6" /> : <ClipboardIcon className="w-6 h-6" />}
            </button>
          </div>
        );
      })}
    </div>
  );
}
