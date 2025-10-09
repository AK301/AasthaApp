"use client";

import { useEffect, useState } from "react";

type SplashScreenProps = {
    onFinish: () => void; // ✅ tell TS this prop is expected
};

export default function SplashScreen({ onFinish }: SplashScreenProps) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onFinish(); // ✅ call the prop when splash ends
        }, 2000); // 2 sec splash
        return () => clearTimeout(timer);
    }, [onFinish]);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-green-600 text-white z-50">
            {/* Logo */}
            <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center mb-4 shadow-lg">
                <span className="text-green-600 font-bold text-2xl">A</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold">Aastha</h1>
            <p className="text-sm mt-1">AI Booking Manager</p>

            {/* Loading dots */}
            <div className="flex space-x-1 mt-6">
                <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-300"></span>
            </div>
        </div>
    );
}
