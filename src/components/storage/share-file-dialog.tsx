"use client";

import { useState } from "react";

import {
  Copy,
  Globe,
  Link,
  Lock,
  MoreVertical,
  Trash2,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface ShareUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "owner" | "editor" | "viewer";
  pending?: boolean;
}

interface ShareFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  fileType: "file" | "folder";
}

const mockSharedUsers: ShareUser[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://github.com/shadcn.png",
    role: "owner",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "editor",
  },
  {
    id: "3",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    role: "viewer",
    pending: true,
  },
];

export function ShareFileDialog({
  open,
  onOpenChange,
  fileName,
  fileType,
}: ShareFileDialogProps) {
  const [generalAccess, setGeneralAccess] = useState<"restricted" | "anyone">(
    "restricted"
  );
  const [linkPermission, setLinkPermission] = useState<"viewer" | "editor">(
    "viewer"
  );
  const [copyProtection, setCopyProtection] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [message, setMessage] = useState("");
  const [notify, setNotify] = useState(true);
  const [sharedUsers, setSharedUsers] = useState<ShareUser[]>(mockSharedUsers);

  const shareLink = `https://drive.example.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74mHZzOhXBs/view?usp=sharing`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success("Link copied to clipboard");
  };

  const handleAddPeople = () => {
    if (!emailInput.trim()) return;

    const emails = emailInput
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email);

    emails.forEach((email) => {
      const newUser: ShareUser = {
        id: Date.now().toString() + Math.random(),
        name: email.split("@")[0],
        email,
        role: "viewer",
        pending: true,
      };
      setSharedUsers((prev) => [...prev, newUser]);
    });

    setEmailInput("");
    toast.success(`Invitation sent to ${emails.length} people`);
  };

  const handleRemoveUser = (userId: string) => {
    setSharedUsers((prev) => prev.filter((user) => user.id !== userId));
    toast.success("User removed from sharing");
  };

  const handleRoleChange = (userId: string, newRole: ShareUser["role"]) => {
    setSharedUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
    toast.success("Permission updated");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold">
                Share &ldquo;{fileName}&rdquo;
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1 text-sm">
                Share this {fileType} with others or get a shareable link
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 px-6 pb-6">
          {/* Add People Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Add people</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add people by email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddPeople();
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={handleAddPeople}
                disabled={!emailInput.trim()}
                size="sm"
                className="px-4"
              >
                Send
              </Button>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Textarea
                placeholder="Add a message (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[60px] resize-none text-sm"
              />
              <div className="flex items-center space-x-2">
                <Switch
                  id="notify"
                  checked={notify}
                  onCheckedChange={setNotify}
                />
                <Label htmlFor="notify" className="text-sm font-normal">
                  Notify people
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* People with Access */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">People with access</Label>
            <div className="space-y-2">
              {sharedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-muted text-xs">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">
                          {user.name}
                        </span>
                        {user.pending && (
                          <Badge
                            variant="secondary"
                            className="px-2 py-0 text-xs"
                          >
                            Pending
                          </Badge>
                        )}
                      </div>
                      <span className="text-muted-foreground truncate text-xs">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-2">
                    {user.role === "owner" ? (
                      <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
                        <User className="h-4 w-4" />
                        <span className="font-medium">Owner</span>
                      </div>
                    ) : (
                      <Select
                        value={user.role}
                        onValueChange={(value: ShareUser["role"]) =>
                          handleRoleChange(user.id, value)
                        }
                      >
                        <SelectTrigger className="h-8 w-20 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    {user.role !== "owner" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleRemoveUser(user.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* General Access */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">General access</Label>
            <Select
              value={generalAccess}
              onValueChange={(value: "restricted" | "anyone") =>
                setGeneralAccess(value)
              }
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-3">
                  {generalAccess === "restricted" ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Globe className="h-4 w-4" />
                  )}
                  <div className="text-left">
                    <div className="font-medium">
                      {generalAccess === "restricted"
                        ? "Restricted"
                        : "Anyone with the link"}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {generalAccess === "restricted"
                        ? "Only people with access can open"
                        : "Anyone on the internet can view"}
                    </div>
                  </div>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="restricted">
                  <div className="flex items-center gap-3">
                    <Lock className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Restricted</div>
                      <div className="text-muted-foreground text-xs">
                        Only people with access can open
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="anyone">
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Anyone with the link</div>
                      <div className="text-muted-foreground text-xs">
                        Anyone on the internet can view
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {generalAccess === "anyone" && (
              <div className="space-y-3 pt-2">
                <Select
                  value={linkPermission}
                  onValueChange={(value: "viewer" | "editor") =>
                    setLinkPermission(value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      Copy protection
                    </Label>
                    <p className="text-muted-foreground text-xs">
                      Disable downloading, printing, and copying
                    </p>
                  </div>
                  <Switch
                    checked={copyProtection}
                    onCheckedChange={setCopyProtection}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-muted/30 border-t px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Link className="h-4 w-4" />
              <span>Get link</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy link
              </Button>
              <Button
                size="sm"
                onClick={() => onOpenChange(false)}
                className="px-4"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
