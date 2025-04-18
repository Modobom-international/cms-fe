"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useEcho } from "@/components/context/echo";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/global/spinner";

interface Domain {
    message: string;
}

interface RefreshDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    refreshDomains: (data: undefined, options: any) => void;
    isRefreshing: boolean;
    refetch: () => void;
}

export function RefreshDialog({
    isOpen,
    onOpenChange,
    refreshDomains,
    isRefreshing,
    refetch,
}: RefreshDialogProps) {
    const t = useTranslations("DomainPage.table");
    const [refreshMessage, setRefreshMessage] = useState("Đang khởi tạo...");
    const [newDomains, setNewDomains] = useState<Domain[]>([]);
    const echo = useEcho();

    useEffect(() => {
        if (isOpen) {
            setRefreshMessage("Đang gửi yêu cầu làm mới...");
            setNewDomains([]);
            refreshDomains(undefined, {
                onSuccess: () => {
                    setRefreshMessage("Đã gửi yêu cầu, chờ server phản hồi...");
                },
                onError: () => {
                    setRefreshMessage("Lỗi khi gửi yêu cầu làm mới.");
                },
            });
        }
    }, [isOpen, refreshDomains]);

    useEffect(() => {
        if (isOpen) {
            echo
                .channel("domains")
                .listen("RefreshDomain", (e: { message: string; }) => {
                    setRefreshMessage(e.message);
                });

            return () => {
                echo.leaveChannel("domains");
            };
        }
    }, [isOpen]);

    const handleClose = () => {
        onOpenChange(false);
        refetch();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("actions.refresh.title")}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    {isRefreshing ? (
                        <div className="flex items-center justify-center">
                            <Spinner />
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-gray-600">{refreshMessage}</p>
                        </div>
                    )}
                </div>
                <div className="flex justify-end">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isRefreshing}
                    >
                        {t("actions.refresh.title")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}