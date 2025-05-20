"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { format } from "date-fns";
import hljs from "highlight.js";
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import "highlight.js/styles/github.css";
// Import highlight.js CSS for syntax highlighting
import {
  Clock,
  Download,
  File,
  Image,
  Paperclip,
  Plus,
  Tag,
  Trash2,
  X,
} from "lucide-react";

import {
  Attachment,
  Card,
  ChecklistItem,
  Checklist as ChecklistType,
  Label,
} from "@/types/board.type";

import {
  useAssignCardLabel,
  useCreateCardChecklist,
  useCreateChecklistItem,
  useDeleteChecklistItem,
  useGetCard,
  useGetCardChecklists,
  useGetChecklistItems,
  useRemoveCardLabel,
  useToggleChecklistItem,
  useUpdateCard,
  useUpdateChecklistItem,
} from "@/hooks/board/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import ChecklistComponent from "./Checklist";
import RichTextEditor from "./RichTextEditor";

// Register languages with highlight.js
hljs.registerLanguage("javascript", js);
hljs.registerLanguage("typescript", ts);
hljs.registerLanguage("css", css);
hljs.registerLanguage("python", python);
hljs.registerLanguage("html", html);
hljs.registerLanguage("xml", html);
hljs.registerLanguage("json", json);

interface CardDetailProps {
  card: Card;
  onClose: () => void;
  onUpdate: (updatedCard: Card) => void;
  onDelete: () => void;
}

export default function CardDetail({
  card,
  onClose,
  onUpdate,
  onDelete,
}: CardDetailProps) {
  const { data: cardData } = useGetCard(card.id);
  const { data: checklists = [] } = useGetCardChecklists(card.id);
  const { mutate: updateCard } = useUpdateCard();
  const { mutate: createChecklist } = useCreateCardChecklist();
  const { mutate: assignLabel } = useAssignCardLabel();
  const { mutate: removeLabel } = useRemoveCardLabel();
  const { mutate: createChecklistItem } = useCreateChecklistItem();
  const { mutate: updateChecklistItem } = useUpdateChecklistItem();
  const { mutate: deleteChecklistItem } = useDeleteChecklistItem();
  const { mutate: toggleChecklistItem } = useToggleChecklistItem();

  const [title, setTitle] = useState(cardData?.title || card.title);
  const [description, setDescription] = useState(
    cardData?.description || card.description || ""
  );
  const [dueDate, setDueDate] = useState<string | undefined>(
    cardData?.dueDate || card.dueDate
  );
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    cardData?.checklist || card.checklist || []
  );
  const [attachments, setAttachments] = useState<Attachment[]>(
    cardData?.attachments || card.attachments || []
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug logs for card data changes
  // useEffect(() => {
  //   // console.log("🔄 Card data changed:", cardData);
  // }, [cardData]);

  // Debug logs for local state changes
  // useEffect(() => {
  //     console.log("📝 Local state:", {
  //     title,
  //     description,
  //     dueDate,
  //     checklist,
  //     attachments,
  //   });
  // }, [title, description, dueDate, checklist, attachments]);

  // Update local state when card data changes
  useEffect(() => {
    if (cardData) {
      setTitle(cardData.title);
      setDescription(cardData.description || "");
      setDueDate(cardData.dueDate);
      setChecklist(cardData.checklist || []);
      setAttachments(cardData.attachments || []);
    }
  }, [cardData]);

  const handleChecklistChange = useCallback(
    (checklistId: number, items: ChecklistItem[]) => {
      // Handle individual item changes
      items.forEach((item) => {
        if (item.isNew) {
          // Create new item
          createChecklistItem({
            checklistId,
            cardId: card.id,
            content: item.content,
            completed: item.is_completed === 1,
          });
        } else if (item.isDeleted) {
          // Delete item
          deleteChecklistItem({
            checklistId,
            itemId: item.id,
            cardId: card.id,
          });
        } else if (item.isModified) {
          // Update existing item
          updateChecklistItem({
            checklistId,
            itemId: item.id,
            content: item.content,
            completed: item.is_completed === 1,
            cardId: card.id,
          });
        }
      });
    },
    [createChecklistItem, updateChecklistItem, deleteChecklistItem, card.id]
  );

  const handleToggleChecklistItem = useCallback(
    (checklistId: number, itemId: number) => {
      toggleChecklistItem({
        checklistId,
        itemId,
        cardId: card.id,
      });
    },
    [toggleChecklistItem, card.id]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      // console.log("💾 Submitting card update:", {
      //   id: card.id,
      //   title: title.trim(),
      //   description,
      //   list_id: card.list_id,
      // });
      updateCard({
        id: card.id,
        title: title.trim(),
        description,
        list_id: card.list_id,
      });
      setIsEditing(false);
    }
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDueDate(e.target.value);
  };

  const handleClose = () => {
    if (
      title !== card.title ||
      description !== (card.description || "") ||
      dueDate !== card.dueDate ||
      JSON.stringify(checklist) !== JSON.stringify(card.checklist || []) ||
      JSON.stringify(attachments) !== JSON.stringify(card.attachments || [])
    ) {
      onUpdate({
        ...card,
        title,
        description,
        dueDate,
        checklist,
        attachments,
      });
    }
    onClose();
  };

  // Add logging when description changes
  //   useEffect(() => {
  //     console.log("Description Content:", description);
  //     console.log("Description HTML Structure:", {
  //       html: description,
  //       hasCodeBlocks:
  //         description.includes("<pre") || description.includes("<code"),
  //     });
  //   }, [description]);

  // Apply syntax highlighting to code blocks when not in edit mode
  useEffect(() => {
    if (!isEditing) {
      // Find all code blocks in the rendered content
      const codeBlocks = document.querySelectorAll(".prose pre code");

      // Apply highlighting to each code block
      codeBlocks.forEach((block) => {
        // Get the language from the class name (e.g., "language-javascript")
        const language =
          block.className.match(/language-(\w+)/)?.[1] || "plaintext";

        // Apply highlighting
        hljs.highlightElement(block as HTMLElement);
      });
    }
  }, [isEditing, description]);

  const formatDueDate = (dateString?: string) => {
    if (!dateString) return "No due date";
    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Function to handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Process each file
    Array.from(files).forEach((file) => {
      // Create a URL for the file (this will be temporary in this demo)
      const fileUrl = URL.createObjectURL(file);

      // Create a new attachment
      const newAttachment: Attachment = {
        id: `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        url: fileUrl,
        type: file.type,
        size: file.size,
        createdAt: new Date().toISOString(),
      };

      // Add to attachments
      setAttachments((prev) => [...prev, newAttachment]);
    });

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Function to remove an attachment
  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id));
  };

  // Function to get icon based on file type
  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return <Image size={16} />;
    }
    return <File size={16} />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleCreateChecklist = () => {
    if (newChecklistTitle.trim()) {
      createChecklist({
        cardId: card.id,
        title: newChecklistTitle.trim(),
        items: [],
      });
      setNewChecklistTitle("");
      setIsAddingChecklist(false);
    }
  };

  const handleAssignLabel = (labelId: number) => {
    assignLabel({ cardId: card.id, labelId });
  };

  const handleRemoveLabel = (labelId: number) => {
    removeLabel({ cardId: card.id, labelId });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          {isEditing ? (
            <input
              title="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border p-2 text-xl font-bold"
              autoFocus
            />
          ) : (
            <h2 className="text-xl font-bold">{card.title}</h2>
          )}
          <button
            title="close"
            onClick={handleClose}
            className="rounded-full p-1 hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          {dueDate ? (
            <div className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1">
              <Clock size={14} />
              <span>Due: {formatDueDate(dueDate)}</span>
            </div>
          ) : null}
        </div>

        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <p className="text-sm font-medium text-gray-700">Description</p>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
              >
                Edit
              </button>
            )}
          </div>
          {isEditing ? (
            <RichTextEditor
              content={description}
              onChange={(newContent) => {
                setDescription(newContent);
              }}
            />
          ) : (
            <div
              className="prose prose-sm max-w-none rounded bg-gray-50 p-3"
              dangerouslySetInnerHTML={{
                __html: description || "<p>No description</p>",
              }}
            />
          )}
        </div>

        {isEditing && (
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <div className="flex items-center gap-2">
              <input
                title="due date"
                type="date"
                value={dueDate?.split("T")[0] || ""}
                onChange={handleDueDateChange}
                className="rounded border p-2"
              />
              {dueDate && (
                <button
                  onClick={() => setDueDate(undefined)}
                  className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <p className="text-sm font-medium text-gray-700">Labels</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-7">
                  <Tag className="mr-2 h-4 w-4" />
                  Add Label
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Labels</h4>
                  <div className="space-y-2">
                    {cardData?.labels?.map((label: Label) => (
                      <div
                        key={label.id}
                        className="flex items-center justify-between rounded-md border p-2"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: label.color }}
                          />
                          <span className="text-sm">{label.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveLabel(label.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Checklists</p>
            {!isAddingChecklist ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingChecklist(true)}
                className="h-7"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Checklist
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  value={newChecklistTitle}
                  onChange={(e) => setNewChecklistTitle(e.target.value)}
                  placeholder="Enter checklist title"
                  className="h-7"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateChecklist}
                  className="h-7"
                >
                  Add
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAddingChecklist(false);
                    setNewChecklistTitle("");
                  }}
                  className="h-7"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-4">
            {checklists.map((checklist: ChecklistType) => (
              <ChecklistComponent
                key={checklist.id}
                items={checklist.items}
                onChange={(items: ChecklistItem[]) =>
                  handleChecklistChange(checklist.id, items)
                }
                onToggle={(itemId: number) =>
                  handleToggleChecklistItem(checklist.id, itemId)
                }
              />
            ))}
          </div>
        </div>

        {/* Attachments Section */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Paperclip size={16} className="text-gray-500" />
              <p className="text-sm font-medium text-gray-700">Attachments</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
            >
              <Paperclip size={14} />
              Add
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              title="File attachment upload"
            />
          </div>

          {/* Display Attachments */}
          {attachments.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No attachments yet</p>
          ) : (
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between rounded border bg-gray-50 p-2"
                >
                  <div className="flex items-center gap-2">
                    {getFileIcon(attachment.type)}
                    <div>
                      <p className="text-sm font-medium">{attachment.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(attachment.size)} •
                        {format(new Date(attachment.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={attachment.url}
                      download={attachment.name}
                      className="rounded p-1 hover:bg-gray-200"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download size={16} />
                    </a>
                    <button
                      onClick={() => removeAttachment(attachment.id)}
                      className="rounded p-1 text-red-500 hover:bg-gray-200"
                      title="Remove attachment"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Image Previews for image files */}
          {attachments.filter((a) => a.type.startsWith("image/")).length >
            0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {attachments
                .filter((a) => a.type.startsWith("image/"))
                .map((img) => (
                  <div key={`preview-${img.id}`} className="group relative">
                    <img
                      src={img.url}
                      alt={img.name}
                      className="h-24 w-full rounded border object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/20 group-hover:opacity-100">
                      <a
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-white/90 p-1"
                      >
                        <Image size={16} />
                      </a>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="flex justify-between">
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setTitle(card.title);
                  setDescription(card.description || "");
                  setDueDate(card.dueDate);
                  setChecklist(card.checklist || []);
                  setAttachments(card.attachments || []);
                  setIsEditing(false);
                }}
                className="rounded px-3 py-1 hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300"
            >
              Edit
            </button>
          )}
          <button
            onClick={onDelete}
            className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
