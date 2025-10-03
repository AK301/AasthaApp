"use client";
import React from "react";

export default function BottomNav({
    tab,
    setTab,
}: {
    tab: "chat" | "bookings" | "calendar";
    setTab: (t: "chat" | "bookings" | "calendar") => void;
}) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex">
            <button
                onClick={() => setTab("chat")}
                className={`flex-1 py-3 ${tab === "chat" ? "text-green-600 font-semibold" : "text-gray-600"
                    }`}
            >
                Chat
            </button>
            <button
                onClick={() => setTab("bookings")}
                className={`flex-1 py-3 ${tab === "bookings" ? "text-green-600 font-semibold" : "text-gray-600"
                    }`}
            >
                Bookings
            </button>
            <button
                onClick={() => setTab("calendar")}
                className={`flex-1 py-3 ${tab === "calendar" ? "text-green-600 font-semibold" : "text-gray-600"
                    }`}
            >
                Calendar
            </button>
        </div>
    );
}
