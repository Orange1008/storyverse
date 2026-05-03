import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { Bold, Italic, List, ListOrdered, Heading2, Quote, Undo, Redo } from 'lucide-react';

const MenuBar = ({ editor, isDark }) => {
  if (!editor) return null;

  const btn = (active) =>
    `p-1.5 rounded transition-colors text-sm ${
      active
        ? isDark ? 'bg-gray-700 text-white' : 'bg-amber-100 text-amber-800'
        : isDark ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-800' : 'text-gray-400 hover:text-gray-700 hover:bg-amber-50'
    }`;

  return (
    <div className={`flex items-center gap-0.5 px-3 py-1.5 border-b ${
      isDark ? 'border-gray-800' : 'border-amber-100'
    }`}>
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive('bold'))} title="Bold">
        <Bold size={14} />
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive('italic'))} title="Italic">
        <Italic size={14} />
      </button>

      <div className={`w-px h-4 mx-1.5 ${isDark ? 'bg-gray-800' : 'bg-amber-100'}`} />

      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive('heading', { level: 2 }))} title="Heading">
        <Heading2 size={14} />
      </button>
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive('blockquote'))} title="Quote">
        <Quote size={14} />
      </button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive('bulletList'))} title="List">
        <List size={14} />
      </button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive('orderedList'))} title="Numbered List">
        <ListOrdered size={14} />
      </button>

      <div className="flex-1" />

      <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={`${btn(false)} disabled:opacity-20`} title="Undo">
        <Undo size={14} />
      </button>
      <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={`${btn(false)} disabled:opacity-20`} title="Redo">
        <Redo size={14} />
      </button>
    </div>
  );
};

const RichTextEditor = ({ content, onChange, isDark }) => {
  const contentRef = useRef(content);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your story here...',
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-4 shadow-md',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      contentRef.current = html;
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: `outline-none min-h-[60vh] font-serif text-[1.15rem] leading-[1.9] ${
          isDark
            ? 'text-gray-300 prose prose-invert prose-p:text-gray-300 prose-headings:text-gray-100 prose-blockquote:border-purple-600 prose-blockquote:text-gray-400'
            : 'text-gray-800 prose prose-p:text-gray-800 prose-headings:text-gray-900 prose-blockquote:border-amber-400 prose-blockquote:text-gray-500'
        } prose-lg max-w-none`,
      },
    },
  });

  // Sync content when parent changes it (chapter switch)
  useEffect(() => {
    if (editor && content !== contentRef.current) {
      editor.commands.setContent(content, false, { preserveWhitespace: 'full' });
      contentRef.current = content;
    }
  }, [content, editor]);

  // Listen for AI insert text event
  useEffect(() => {
    const handleText = (e) => {
      if (editor) editor.chain().focus().insertContent(` ${e.detail} `).run();
    };
    window.addEventListener('ai-insert-text', handleText);
    return () => window.removeEventListener('ai-insert-text', handleText);
  }, [editor]);

  // Listen for AI insert image event
  useEffect(() => {
    const handleImage = (e) => {
      if (editor && e.detail?.url) {
        editor.chain().focus().setImage({ src: e.detail.url, alt: e.detail.alt || 'AI generated image' }).run();
      }
    };
    window.addEventListener('ai-insert-image', handleImage);
    return () => window.removeEventListener('ai-insert-image', handleImage);
  }, [editor]);

  return (
    <div className="space-y-0">
      <MenuBar editor={editor} isDark={isDark} />
      <div
        className="cursor-text py-2"
        onClick={() => editor?.commands.focus()}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;
