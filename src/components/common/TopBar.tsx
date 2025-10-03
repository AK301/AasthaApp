"use client";
import React from "react";
import { MoreVertical } from "lucide-react"; // icons for menu

export default function TopBar({
    title,
    subtitle,
}: {
    title: string;
    subtitle?: string;
}) {
    return (
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
            {/* Left: Avatar + Text */}
            <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-lg">
                    A
                </div>
                <div className="leading-tight">
                    <div className="font-semibold text-gray-900">{title}</div>
                    <div className="text-xs text-green-600">{subtitle || "Online"}</div>
                </div>
            </div>

            {/* Right: Options button */}
            <button className="p-2 text-gray-500 hover:text-green-600">
                <MoreVertical size={20} />
            </button>
        </div>
    );
}
