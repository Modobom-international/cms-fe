"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import { WorkspaceMember } from "@/types/workspaces.type";

import {
  useAddBoardMember,
  useGetBoardMembers,
  useGetBoards,
  useRemoveBoardMember,
} from "@/hooks/board/board";
import { useGetUserList } from "@/hooks/user";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BoardMembersClientProps {
  boardId: number;
  workspaceId: string;
}

export default function BoardMembersClient({
  boardId,
  workspaceId,
}: BoardMembersClientProps) {
  const t = useTranslations("Board");
  const { boards, isLoading: isLoadingBoards } = useGetBoards(workspaceId);
  const { members, isLoading: isLoadingMembers } = useGetBoardMembers(boardId);
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [search, setSearch] = useState("");

  const addMemberMutation = useAddBoardMember();
  const removeMemberMutation = useRemoveBoardMember();
  const { data: userResponse } = useGetUserList(1, 100, search);

  const board = boards?.find((b) => b.id === boardId);
  const isLoading = isLoadingBoards || isLoadingMembers;

  // Filter out users who are already members
  const availableUsers = userResponse?.success
    ? userResponse.data.data.filter(
        (user) =>
          !members?.some(
            (member) => member.users.id.toString() === user.id.toString()
          )
      )
    : [];

  if (isLoading) {
    return (
      <div className="space-y-4 p-8">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>{t("errors.boardNotFound")}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleAddMember = () => {
    if (!selectedMember) return;

    addMemberMutation.mutate(
      {
        boardId,
        userId: parseInt(selectedMember),
      },
      {
        onSuccess: () => {
          setSelectedMember("");
        },
      }
    );
  };

  const handleRemoveMember = (memberId: number) => {
    removeMemberMutation.mutate({
      boardId,
      memberId,
    });
  };

  return (
    <div className="space-y-4 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("members")}</h2>
          <p className="text-muted-foreground">{t("manageBoardMembers")}</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t("selectMember")} />
            </SelectTrigger>
            <SelectContent>
              {availableUsers.map((user) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAddMember} disabled={!selectedMember}>
            {t("addMember")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("currentMembers", { count: members?.length || 0 })}
          </CardTitle>
          <CardDescription>{t("membersDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("email")}</TableHead>
                <TableHead>{t("role")}</TableHead>
                <TableHead>{t("joined")}</TableHead>
                <TableHead className="text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={member.users.profile_photo_path || undefined}
                          alt={member.users.name}
                        />
                        <AvatarFallback>
                          {member.users.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span>{member.users.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{member.users.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{member.role}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(member.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      {t("remove")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
