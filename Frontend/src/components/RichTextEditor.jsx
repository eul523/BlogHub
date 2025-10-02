import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

import { useEditorState } from '@tiptap/react';

function MenuBar({ editor, editable }) {
  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isBoldActive: editor?.isActive('bold') ?? false,
      isItalicActive: editor?.isActive('italic') ?? false,
      isBulletListActive: editor?.isActive('bulletList') ?? false,
      isOrderedListActive: editor?.isActive('orderedList') ?? false,
      canBold: editor?.can().chain().focus().toggleBold() ?? false,
      canItalic: editor?.can().chain().focus().toggleItalic() ?? false,
      canBulletList: editor?.can().chain().focus().toggleBulletList() ?? false,
      canOrderedList: editor?.can().chain().focus().toggleOrderedList() ?? false,
    }),
  });

  if (!editor || !editable) return null;

  return (
    <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3 p-2 border-b border-gray-200">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={
          editorState.isBoldActive
            ? "bg-blue-200 dark:bg-blue-700 px-2 py-1 rounded text-sm"
            : "px-2 py-1 rounded text-sm hover:bg-gray-200 dark:hover:bg-[#1E1E1E]"
        }
        disabled={!editorState.canBold}
      >
        Bold
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={
          editorState.isItalicActive
            ? "bg-blue-200 dark:bg-blue-700 px-2 py-1 rounded text-sm"
            : "px-2 py-1 rounded text-sm hover:bg-gray-200 dark:hover:bg-[#1E1E1E]"
        }
        disabled={!editorState.canItalic}
      >
        Italic
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={
          editorState.isBulletListActive
            ? "bg-blue-200 dark:bg-blue-700 px-2 py-1 rounded text-sm"
            : "px-2 py-1 rounded text-sm hover:bg-gray-200 dark:hover:bg-[#1E1E1E]"
        }
        disabled={!editorState.canBulletList}
      >
        Bullet List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={
          editorState.isOrderedListActive
            ? "bg-blue-200 dark:bg-blue-700 px-2 py-1 rounded text-sm"
            : "px-2 py-1 rounded text-sm hover:bg-gray-200 dark:hover:bg-[#1E1E1E]"
        }
        disabled={!editorState.canOrderedList}
      >
        Numbered List
      </button>
    </div>
  );
}



export default function RichTextEditor({ content = "", onUpdate, editable = true }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write something amazing...",
        showOnlyWhenEditable: true,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => onUpdate && onUpdate(editor.getHTML()),
    editorProps: {
      attributes: {
        class: `w-full p-3 rounded-lg ${
          editable
            ? "border min-h-[100px] border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            : ""
        } prose prose-sm sm:prose-base`,
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="rich-text-editor rounded-lg">
      {editable && <MenuBar editor={editor} editable={editable} />}
      <EditorContent editor={editor} />
    </div>
  );
}