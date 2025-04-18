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
    domain: string;
    status: string;
    time_checked: string;
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
                .listen("RefreshDomain", (e: { message: string; domains: Domain[] }) => {
                    setRefreshMessage(e.message);
                    if (e.domains && e.domains.length > 0) {
                        setNewDomains(e.domains);
                    }
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
                    <DialogTitle>Làm mới danh sách Domain</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    {isRefreshing ? (
                        <div className="flex items-center justify-center">
                            <Spinner />
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-gray-600">{refreshMessage}</p>
                            {newDomains.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-700">Domain mới:</h4>
                                    <ul className="mt-2 space-y-2">
                                        {newDomains.map((domain, index) => (
                                            <li key={index} className="text-sm text-gray-600">
                                                {domain.domain} ({domain.status}, kiểm tra lúc {domain.time_checked})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex justify-end">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isRefreshing}
                    >
                        Đóng
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}