// Alternative version with explicit list extensions
// You'll need to install: npm install @tiptap/extension-bullet-list @tiptap/extension-ordered-list @tiptap/extension-list-item @tiptap/extension-text-align

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import History from '@tiptap/extension-history';
import TextAlign from '@tiptap/extension-text-align';

const Toolbar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex items-center flex-wrap p-2 border border-gray-300 bg-gray-50 rounded-t-md gap-2">
      <button 
        type="button" 
        onClick={() => editor.chain().focus().toggleBold().run()} 
        className={editor.isActive('bold') ? 'font-bold bg-gray-300 p-2 rounded' : 'font-bold p-2 hover:bg-gray-200 rounded'}
        title="Bold"
      >
        B
      </button>
      <button 
        type="button" 
        onClick={() => editor.chain().focus().toggleItalic().run()} 
        className={editor.isActive('italic') ? 'italic bg-gray-300 p-2 rounded' : 'italic p-2 hover:bg-gray-200 rounded'}
        title="Italic"
      >
        I
      </button>
      <button 
        type="button" 
        onClick={() => editor.chain().focus().toggleUnderline().run()} 
        className={editor.isActive('underline') ? 'underline bg-gray-300 p-2 rounded' : 'underline p-2 hover:bg-gray-200 rounded'}
        title="Underline"
      >
        U
      </button>
      <div className="w-px h-5 bg-gray-300 mx-1"></div>
      <button 
        type="button" 
        onClick={() => editor.chain().focus().setTextAlign('left').run()} 
        className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300 p-2 rounded' : 'p-2 hover:bg-gray-200 rounded'}
        title="Align Left"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2"/>
          <line x1="3" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="2"/>
          <line x1="3" y1="18" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </button>
      <button 
        type="button" 
        onClick={() => editor.chain().focus().setTextAlign('center').run()} 
        className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300 p-2 rounded' : 'p-2 hover:bg-gray-200 rounded'}
        title="Align Center"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="6" y1="6" x2="18" y2="6" stroke="currentColor" strokeWidth="2"/>
          <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2"/>
          <line x1="6" y1="18" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </button>
      <button 
        type="button" 
        onClick={() => editor.chain().focus().setTextAlign('right').run()} 
        className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300 p-2 rounded' : 'p-2 hover:bg-gray-200 rounded'}
        title="Align Right"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2"/>
          <line x1="9" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2"/>
          <line x1="6" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </button>
      <div className="w-px h-5 bg-gray-300 mx-1"></div>
      <button 
        type="button" 
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
        className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-300 p-2 rounded font-semibold' : 'p-2 hover:bg-gray-200 rounded'}
        title="Heading 1"
      >
        H1
      </button>
      <button 
        type="button" 
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
        className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-300 p-2 rounded font-semibold' : 'p-2 hover:bg-gray-200 rounded'}
        title="Heading 2"
      >
        H2
      </button>
      <button 
        type="button" 
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} 
        className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-300 p-2 rounded font-semibold' : 'p-2 hover:bg-gray-200 rounded'}
        title="Heading 3"
      >
        H3
      </button>
      <div className="w-px h-5 bg-gray-300 mx-1"></div>
      <button 
        type="button" 
        onClick={() => editor.chain().focus().toggleBulletList().run()} 
        className={editor.isActive('bulletList') ? 'bg-gray-300 p-2 rounded' : 'p-2 hover:bg-gray-200 rounded'}
        title="Bullet List"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="6" cy="6" r="2" fill="currentColor"/>
          <circle cx="6" cy="12" r="2" fill="currentColor"/>
          <circle cx="6" cy="18" r="2" fill="currentColor"/>
          <line x1="12" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="2"/>
          <line x1="12" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2"/>
          <line x1="12" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </button>
      <button 
        type="button" 
        onClick={() => editor.chain().focus().toggleOrderedList().run()} 
        className={editor.isActive('orderedList') ? 'bg-gray-300 p-2 rounded' : 'p-2 hover:bg-gray-200 rounded'}
        title="Numbered List"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="10" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2"/>
          <line x1="10" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2"/>
          <line x1="10" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2"/>
          <path d="M4 6h1v4" stroke="currentColor" strokeWidth="2"/>
          <path d="M4 10h2" stroke="currentColor" strokeWidth="2"/>
          <path d="M6 18H4c0-1 0-2 1-3s1-1 1-1" stroke="currentColor" strokeWidth="2"/>
          <path d="M4 14h2" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </button>
      <div className="w-px h-5 bg-gray-300 mx-1"></div>
      <button 
        type="button" 
        onClick={() => editor.chain().focus().undo().run()} 
        disabled={!editor.can().undo()}
        className="p-2 hover:bg-gray-200 rounded disabled:opacity-50"
        title="Undo"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 7v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <button 
        type="button" 
        onClick={() => editor.chain().focus().redo().run()} 
        disabled={!editor.can().redo()}
        className="p-2 hover:bg-gray-200 rounded disabled:opacity-50"
        title="Redo"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 7v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3L21 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
};

const TiptapEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Underline,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'bullet-list',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'ordered-list',
        },
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: 'list-item',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
        defaultAlignment: 'left',
      }),
      History,
    ],
    content: content || '<p>Start typing...</p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none p-4 border border-t-0 border-gray-300 rounded-b-md min-h-[150px]',
      },
    },
  });

  React.useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  return (
    <div className="w-full">
      <style>{`
        .ProseMirror ul.bullet-list {
          list-style-type: disc;
          margin-left: 1.5rem;
          padding-left: 0;
        }
        
        .ProseMirror ol.ordered-list {
          list-style-type: decimal;
          margin-left: 1.5rem;
          padding-left: 0;
        }
        
        .ProseMirror li.list-item {
          margin: 0.25rem 0;
          padding-left: 0.25rem;
        }
        
        .ProseMirror h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0 0.5rem 0;
        }
        
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.75rem 0 0.5rem 0;
        }
        
        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.5rem 0 0.25rem 0;
        }
      `}</style>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;