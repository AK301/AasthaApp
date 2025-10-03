"use client";

import dynamic from "next/dynamic";

// Dynamically import the main UI so it only runs on the client
const AasthaBookingManager = dynamic(
    () => import("../components/AasthaBookingManager"),
    { ssr: false }
);

export default function HomePage() {
    return (
        <div className="min-h-screen">
            <AasthaBookingManager />
        </div>
    );
}
