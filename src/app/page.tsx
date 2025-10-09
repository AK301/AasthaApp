"use client";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import SplashScreen from "../components/Splashscreen";



const AasthaBookingManager = dynamic(
    () => import("../components/AasthaBookingManager"),
    { ssr: false }
);

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("aastha-token");
        if (!token) {
            router.push("/login");
        }
    }, [router]);

    return (
        <div className="min-h-screen">
            <AasthaBookingManager />
        </div>
    );
}
