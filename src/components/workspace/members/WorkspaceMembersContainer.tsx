"use client";

import { useState } from "react";

import { format } from "date-fns";
import { AlertCircle, MoreHorizontal, Plus, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";

import { Workspace } from "@/types/workspaces.type";

import { useGetWorkspace } from "@/hooks/workspace";
import {
  useAddWorkspaceMember,
  useGetWorkspaceMembers,
  useJoinPublicWorkspace,
  useRemoveWorkspaceMember,
} from "@/hooks/workspace/members";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkspaceMembersContainerProps {
  workspaceId: number;
}

export function WorkspaceMembersContainer({
  workspaceId,
}: WorkspaceMembersContainerProps) {
  const t = useTranslations("Workspace.Members");
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("member");
  const { workspace } = useGetWorkspace(workspaceId);

  const {
    data: members,
    isLoading,
    error,
  } = useGetWorkspaceMembers(workspaceId);
  const addMember = useAddWorkspaceMember(workspaceId);
  const joinWorkspace = useJoinPublicWorkspace(workspaceId);
  const removeMember = useRemoveWorkspaceMember(workspaceId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-[180px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-[250px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  if (!workspace) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-[180px]" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{t("errors.failedToLoad")}</AlertDescription>
      </Alert>
    );
  }

  const handleAddMember = async () => {
    try {
      await addMember.mutateAsync({
        email: newMemberEmail,
        role: newMemberRole,
      });
      setIsAddMemberOpen(false);
      setNewMemberEmail("");
      setNewMemberRole("member");
    } catch (error) {
      console.error("Failed to add member:", error);
    }
  };

  const handleJoinWorkspace = async () => {
    try {
      await joinWorkspace.mutateAsync();
    } catch (error) {
      console.error("Failed to join workspace:", error);
    }
  };

  const handleRemoveMember = async () => {
    try {
      await removeMember.mutateAsync();
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex gap-2">
          {workspace.visibility === "public" &&
            !members?.some((m) => m.users.id === workspace.owner_id) && (
              <Button onClick={handleJoinWorkspace}>
                <UserPlus className="mr-2 h-4 w-4" />
                {t("joinWorkspace")}
              </Button>
            )}
          {members?.some((m) => m.role === "admin") && (
            <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("addMember")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("addMember")}</DialogTitle>
                  <DialogDescription>
                    {t("addMemberDescription")}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">{t("email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">{t("role")}</Label>
                    <Select
                      value={newMemberRole}
                      onValueChange={(value) => setNewMemberRole(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">
                          {t("roles.member")}
                        </SelectItem>
                        <SelectItem value="admin">
                          {t("roles.admin")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddMemberOpen(false)}
                  >
                    {t("cancel")}
                  </Button>
                  <Button onClick={handleAddMember} disabled={!newMemberEmail}>
                    {t("add")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {members?.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{member.users.name}</CardTitle>
                  <CardDescription>{member.users.email}</CardDescription>
                </div>
                {members.some(
                  (m) => m.role === "admin" && m.users.id !== member.users.id
                ) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={handleRemoveMember}
                  >
                    {t("remove")}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground space-y-1 text-sm">
                <div>
                  {t("role")}: {member.role}
                </div>
                <div>
                  {t("joinedAt", {
                    date: format(new Date(member.created_at), "MMM d, yyyy"),
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
