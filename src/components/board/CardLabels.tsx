"use client";

import { Label } from "@/types/board.type";

interface CardLabelsProps {
  labels: Label[];
  className?: string;
}

export default function CardLabels({
  labels,
  className = "",
}: CardLabelsProps) {
  if (!labels?.length) return null;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {labels.map((label) => (
        <div
          key={label.id}
          className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs"
          style={{ backgroundColor: `${label.color}20` }}
        >
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: label.color }}
          />
          <span className="font-medium" style={{ color: label.color }}>
            {label.name}
          </span>
        </div>
      ))}
    </div>
  );
}
