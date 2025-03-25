"use client";

import { useCallback, useRef } from "react";

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
// Import highlight.js CSS for syntax highlighting
import "highlight.js/styles/github.css";
import { createLowlight } from "lowlight";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo,
  Undo,
} from "lucide-react";

// Create a lowlight instance with specific languages
const lowlight = createLowlight();
lowlight.register("javascript", js);
lowlight.register("typescript", ts);
lowlight.register("css", css);
lowlight.register("python", python);
lowlight.register("html", html);
lowlight.register("xml", html);
lowlight.register("json", json);

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  editable?: boolean;
  placeholder?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  editable = true,
  placeholder = "Add a detailed description...",
}: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable the default code block to use CodeBlockLowlight
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class:
            "rounded-lg max-w-full my-4 shadow-sm hover:shadow-md transition-shadow duration-200",
        },
        allowBase64: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "javascript",
        HTMLAttributes: {
          class: "rounded bg-gray-100 p-2 font-mono text-sm my-2",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!editor || !event.target.files?.length) return;

      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        if (typeof e.target?.result === "string") {
          // Insert image at current cursor position
          editor.chain().focus().setImage({ src: e.target.result }).run();
        }
      };

      reader.readAsDataURL(file);

      // Reset the input value to allow selecting the same file again
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    },
    [editor]
  );

  const addImageFromURL = useCallback(() => {
    if (!editor) return;

    const url = window.prompt("Enter the URL of the image:");

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="rounded border">
      {editable && (
        <div className="flex flex-wrap border-b bg-gray-50 p-1">
          <div className="mr-2 flex">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`mr-1 rounded p-1 ${
                editor.isActive("bold") ? "bg-gray-200" : "hover:bg-gray-200"
              }`}
              title="Bold"
            >
              <Bold size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`mr-1 rounded p-1 ${
                editor.isActive("italic") ? "bg-gray-200" : "hover:bg-gray-200"
              }`}
              title="Italic"
            >
              <Italic size={16} />
            </button>
          </div>

          <div className="mr-2 flex">
            <button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className={`mr-1 rounded p-1 ${
                editor.isActive("heading", { level: 1 })
                  ? "bg-gray-200"
                  : "hover:bg-gray-200"
              }`}
              title="Heading 1"
            >
              <Heading1 size={16} />
            </button>
            <button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={`mr-1 rounded p-1 ${
                editor.isActive("heading", { level: 2 })
                  ? "bg-gray-200"
                  : "hover:bg-gray-200"
              }`}
              title="Heading 2"
            >
              <Heading2 size={16} />
            </button>
          </div>

          <div className="mr-2 flex">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`mr-1 rounded p-1 ${
                editor.isActive("bulletList")
                  ? "bg-gray-200"
                  : "hover:bg-gray-200"
              }`}
              title="Bullet List"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`mr-1 rounded p-1 ${
                editor.isActive("orderedList")
                  ? "bg-gray-200"
                  : "hover:bg-gray-200"
              }`}
              title="Ordered List"
            >
              <ListOrdered size={16} />
            </button>
          </div>

          <div className="mr-2 flex">
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`mr-1 rounded p-1 ${
                editor.isActive("blockquote")
                  ? "bg-gray-200"
                  : "hover:bg-gray-200"
              }`}
              title="Quote"
            >
              <Quote size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`mr-1 rounded p-1 ${
                editor.isActive("codeBlock")
                  ? "bg-gray-200"
                  : "hover:bg-gray-200"
              }`}
              title="Code Block"
            >
              <Code size={16} />
            </button>
            <button
              onClick={setLink}
              className={`mr-1 rounded p-1 ${
                editor.isActive("link") ? "bg-gray-200" : "hover:bg-gray-200"
              }`}
              title="Link"
            >
              <LinkIcon size={16} />
            </button>
            <button
              onClick={() => imageInputRef.current?.click()}
              className="mr-1 rounded p-1 hover:bg-gray-200"
              title="Upload Image"
            >
              <ImageIcon size={16} />
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              title="Image upload"
            />
          </div>

          <div className="flex">
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="mr-1 rounded p-1 hover:bg-gray-200 disabled:opacity-50"
              title="Undo"
            >
              <Undo size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="rounded p-1 hover:bg-gray-200 disabled:opacity-50"
              title="Redo"
            >
              <Redo size={16} />
            </button>
          </div>
        </div>
      )}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-2 [&_img]:mx-auto [&_img]:block [&_img]:max-h-[500px] [&_img]:object-contain"
      />
    </div>
  );
}

