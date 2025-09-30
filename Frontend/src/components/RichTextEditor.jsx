import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

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
      {editable && (
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3 p-2 border-b border-gray-200">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={
              editor.isActive("bold")
                ? "bg-blue-200 px-2 py-1 rounded text-sm"
                : "px-2 py-1 rounded text-sm hover:bg-gray-200"
            }
            disabled={!editor.can().chain().focus().toggleBold().run()}
          >
            Bold
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={
              editor.isActive("italic")
                ? "bg-blue-200 px-2 py-1 rounded text-sm"
                : "px-2 py-1 rounded text-sm hover:bg-gray-200"
            }
            disabled={!editor.can().chain().focus().toggleItalic().run()}
          >
            Italic
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={
              editor.isActive("bulletList")
                ? "bg-blue-200 px-2 py-1 rounded text-sm"
                : "px-2 py-1 rounded text-sm hover:bg-gray-200"
            }
            disabled={!editor.can().chain().focus().toggleBulletList().run()}
          >
            Bullet List
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={
              editor.isActive("orderedList")
                ? "bg-blue-200 px-2 py-1 rounded text-sm"
                : "px-2 py-1 rounded text-sm hover:bg-gray-200"
            }
            disabled={!editor.can().chain().focus().toggleOrderedList().run()}
          >
            Numbered List
          </button>
          
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}