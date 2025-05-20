"use client";

import { useState } from "react";

import { useAuth } from "@/providers/auth-provider";
import { UserMinus, UserPlus, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { CardMember } from "@/types/board.type";

import { useGetBoardMembers } from "@/hooks/board/board";
import {
  useAssignCardMember,
  useGetCardMembers,
  useJoinCard,
  useLeaveCard,
  useRemoveCardMember,
} from "@/hooks/board/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CardMembersProps {
  cardId: number;
  boardId: number;
}

export default function CardMembers({ cardId, boardId }: CardMembersProps) {
  const t = useTranslations("Board.card");
  const { data: members = [] } = useGetCardMembers(cardId);
  const { members: boardMembers = [] } = useGetBoardMembers(boardId);
  const { mutate: joinCard } = useJoinCard();
  const { mutate: leaveCard } = useLeaveCard();
  const { mutate: assignMember } = useAssignCardMember();
  const { mutate: removeMember } = useRemoveCardMember();
  const [isAddingMember, setIsAddingMember] = useState(false);
  const { user } = useAuth();

  const isCurrentUserMember = members.some(
    (member: CardMember) => member.pivot.user_id === Number(user?.id)
  );

  const handleJoinCard = () => {
    joinCard({ cardId });
  };

  const handleLeaveCard = () => {
    leaveCard({ cardId });
  };

  const handleAddMember = (userId: number) => {
    assignMember({ cardId, user_ids: [userId] });
    setIsAddingMember(false);
  };

  const handleRemoveMember = (userId: number) => {
    removeMember({ cardId, userId });
  };

  // Filter out members who are already assigned to the card
  const availableMembers = boardMembers.filter(
    (boardMember) =>
      !members.some(
        (member: CardMember) => member.pivot.user_id === boardMember.users.id
      )
  );

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">Members</p>
          <p className="text-xs text-gray-500">
            {t("detail.members.description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isCurrentUserMember ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleJoinCard}
              className="h-7"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Join
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLeaveCard}
              className="h-7"
            >
              <UserMinus className="mr-2 h-4 w-4" />
              Leave
            </Button>
          )}
          {isCurrentUserMember && (
            <Popover open={isAddingMember} onOpenChange={setIsAddingMember}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-7">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Board Members</h4>
                  <ScrollArea className="h-[200px]">
                    {availableMembers.length > 0 ? (
                      <div className="space-y-2">
                        {availableMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between rounded-md border p-2 hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={
                                    member.users.profile_photo_path || undefined
                                  }
                                  alt={member.users.name}
                                />
                                <AvatarFallback>
                                  {member.users.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">
                                {member.users.name}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddMember(member.users.id)}
                              className="h-7"
                            >
                              Add
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-sm text-gray-500">
                        No available members to add
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {members.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {members.map((member: CardMember) => (
              <div
                key={member.id}
                className="group flex items-center justify-between rounded-md border bg-white p-2 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={member.profile_photo_path || undefined}
                      alt={member.name}
                    />
                    <AvatarFallback>
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{member.name}</span>
                </div>
                {member.pivot.user_id !== Number(user?.id) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.pivot.user_id)}
                    className="h-7 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed p-4 text-center text-sm text-gray-500">
            {t("detail.members.empty")}
          </div>
        )}
      </div>
    </div>
  );
}
