"use client";
import React from "react";

export default function TopBar({
    title,
    subtitle,
}: {
    title: string;
    subtitle?: string;
}) {
    return (
        <div className="bg-white border-b p-4 flex items-center justify-between">
            <div>
                <div className="font-semibold">{title}</div>
                {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
            </div>
        </div>
    );
}
