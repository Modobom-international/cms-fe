"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
// Tiptap imports
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
// Highlight.js imports
import "highlight.js/styles/github.css";
import { createLowlight } from "lowlight";
// Lucide icons - grouped by functionality
import {
  // Text formatting
  Bold,
  // Code and links
  Code,
  Heading1,
  Heading2,
  // Image handling
  ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Quote,
  Redo,
  Trash2,
  // History
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

// Memoized toolbar button component
const ToolbarButton = memo(
  ({
    onClick,
    isActive,
    disabled,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`mr-1 rounded p-1 ${
        isActive ? "bg-gray-200" : "hover:bg-gray-200"
      } ${disabled ? "opacity-50" : ""}`}
      title={title}
    >
      {children}
    </button>
  )
);

ToolbarButton.displayName = "ToolbarButton";

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
  const editorRef = useRef<HTMLDivElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isExternalDragging, setIsExternalDragging] = useState(false);
  const [isInternalDragging, setIsInternalDragging] = useState(false);
  const [isImageSelected, setIsImageSelected] = useState(false);

  // Memoized editor configuration
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
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
            "rounded-lg max-w-full my-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group inline-block",
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
    onSelectionUpdate: ({ editor }) => {
      // Check if an image is selected
      const isImageNode = editor.isActive("image");
      setIsImageSelected(isImageNode);
      console.log("Selection updated, image selected:", isImageNode);
    },
  });

  // Add draggable attribute to selected images
  useEffect(() => {
    if (!editor || !editable) return;

    const updateImageDraggable = () => {
      const images = document.querySelectorAll(".ProseMirror img");
      images.forEach((img) => {
        if (isImageSelected) {
          img.setAttribute("draggable", "true");
        } else {
          img.setAttribute("draggable", "false");
        }
      });
    };

    updateImageDraggable();
  }, [editor, isImageSelected, editable]);

  // Memoized event handlers
  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Check if we're currently dragging an internal image
      const isDraggingInternalImage = isImageSelected && isInternalDragging;

      // Check if the drag target is an image element
      const target = e.target as HTMLElement;
      const isTargetImage = target.closest("img") !== null;

      // For external files being dragged in
      if (
        editable &&
        e.dataTransfer.types.includes("Files") &&
        !isTargetImage &&
        !isDraggingInternalImage &&
        !isInternalDragging // Prevent external dragging if we're already dragging internally
      ) {
        setIsExternalDragging(true);
        console.log("External dragging started", {
          target: target.tagName,
          types: Array.from(e.dataTransfer.types),
          isInternalDragging,
          isImageSelected,
        });
      }
      // For internal images being dragged - only when the image is selected
      else if (editable && isImageSelected && isTargetImage) {
        setIsInternalDragging(true);
        setIsExternalDragging(false); // Ensure external dragging is off
        console.log("Internal dragging started", {
          target: target.tagName,
          element: target.closest("img"),
          isImageSelected,
        });
      }
    },
    [editable, isImageSelected, isInternalDragging]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = editorRef.current?.getBoundingClientRect();
    if (rect) {
      const { clientX: x, clientY: y } = e;
      if (
        x <= rect.left ||
        x >= rect.right ||
        y <= rect.top ||
        y >= rect.bottom
      ) {
        setIsExternalDragging(false);
        setIsInternalDragging(false);
        console.log("Dragging ended (left editor area)");
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsExternalDragging(false);
      setIsInternalDragging(false);
      console.log("Drop event occurred", {
        externalDragging: isExternalDragging,
        internalDragging: isInternalDragging,
      });

      if (!editor || !editable) return;

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );

      if (files.length === 0) return;

      files.forEach((file) => {
        setIsUploading(true);
        setUploadProgress(0);

        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(interval);
              return prev;
            }
            return prev + 10;
          });
        }, 100);

        const reader = new FileReader();
        reader.onload = (e) => {
          if (typeof e.target?.result === "string") {
            editor.chain().focus().setImage({ src: e.target.result }).run();
            setUploadProgress(100);
            setTimeout(() => {
              setIsUploading(false);
              setUploadProgress(0);
            }, 500);
          }
        };
        reader.readAsDataURL(file);
      });
    },
    [editor, editable]
  );

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!editor || !event.target.files?.length) return;

      const file = event.target.files[0];
      setIsUploading(true);
      setUploadProgress(0);

      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === "string") {
          editor.chain().focus().setImage({ src: e.target.result }).run();
          setUploadProgress(100);
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
          }, 500);
        }
      };
      reader.readAsDataURL(file);

      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    },
    [editor]
  );

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

  const deleteImage = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().deleteSelection().run();
  }, [editor]);

  const toggleImageSize = useCallback(() => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const node = editor.state.doc.nodeAt(from);

    if (node?.type.name === "image") {
      const currentClass = node.attrs.class || "";
      const isLarge = currentClass.includes("max-w-2xl");

      editor
        .chain()
        .focus()
        .updateAttributes("image", {
          ...node.attrs,
          class: isLarge
            ? "rounded-lg max-w-full my-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
            : "rounded-lg max-w-2xl my-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group",
        })
        .run();
    }
  }, [editor]);

  const addImageFromURL = useCallback(() => {
    if (!editor) return;

    const url = window.prompt("Enter the URL of the image:");

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="rounded border">
      {editable && (
        <div className="flex flex-wrap border-b bg-gray-50 p-1">
          {/* Text formatting buttons */}
          <div className="mr-2 flex">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              title="Bold"
            >
              <Bold size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              title="Italic"
            >
              <Italic size={16} />
            </ToolbarButton>
          </div>

          <div className="mr-2 flex">
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              isActive={editor.isActive("heading", { level: 1 })}
              title="Heading 1"
            >
              <Heading1 size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              isActive={editor.isActive("heading", { level: 2 })}
              title="Heading 2"
            >
              <Heading2 size={16} />
            </ToolbarButton>
          </div>

          <div className="mr-2 flex">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
              title="Bullet List"
            >
              <List size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
              title="Ordered List"
            >
              <ListOrdered size={16} />
            </ToolbarButton>
          </div>

          <div className="mr-2 flex">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive("blockquote")}
              title="Quote"
            >
              <Quote size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive("codeBlock")}
              title="Code Block"
            >
              <Code size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={setLink}
              isActive={editor.isActive("link")}
              title="Link"
            >
              <LinkIcon size={16} />
            </ToolbarButton>
            <div className="mr-2 flex">
              <ToolbarButton
                onClick={() => imageInputRef.current?.click()}
                disabled={isUploading}
                title="Upload Image"
              >
                <ImageIcon size={16} />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded bg-gray-200">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  </div>
                )}
              </ToolbarButton>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                title="Image upload"
              />
            </div>
          </div>

          <div className="flex">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo"
            >
              <Undo size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo"
            >
              <Redo size={16} />
            </ToolbarButton>
          </div>
        </div>
      )}
      <div
        ref={editorRef}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="relative min-h-[200px]"
      >
        <EditorContent
          editor={editor}
          className="prose prose-sm relative max-w-none p-2 [&_img]:inline-block [&_img]:max-h-[500px] [&_img]:object-contain"
        />
        {isExternalDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50/80 backdrop-blur-sm transition-opacity duration-200">
            <div className="rounded-lg border-2 border-dashed border-blue-500 bg-white p-8 text-center shadow-lg">
              <div className="relative">
                <ImageIcon className="mx-auto mb-2 h-12 w-12 text-blue-500" />
                <div className="absolute -inset-2 animate-pulse rounded-full bg-blue-100/50" />
              </div>
              <p className="text-sm font-medium text-gray-700">
                Drop image here
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Supports PNG, JPG, GIF
              </p>
              <div className="mt-2 flex justify-center gap-2">
                <div
                  className="h-1 w-1 animate-bounce rounded-full bg-blue-500"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="h-1 w-1 animate-bounce rounded-full bg-blue-500"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="h-1 w-1 animate-bounce rounded-full bg-blue-500"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}
        {editable && (
          <div
            className="absolute z-50 hidden rounded-lg border bg-white p-1 shadow-lg group-hover:flex"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <ToolbarButton onClick={toggleImageSize} title="Toggle image size">
              <Maximize2 size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={deleteImage} title="Delete image">
              <Trash2 size={16} className="text-red-500" />
            </ToolbarButton>
          </div>
        )}
      </div>
    </div>
  );
}

