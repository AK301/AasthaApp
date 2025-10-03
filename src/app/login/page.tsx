"use client";
import React, { useState } from "react";

export default function LoginPage() {
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"phone" | "otp">("phone");

    function sendOtp() {
        if (!phone) {
            alert("Please enter a mobile number");
            return;
        }
        console.log("Mock OTP sent to", phone); // just for debugging
        alert("OTP sent! (for demo, use 1234)");
        setStep("otp");
    }

    function verifyOtp() {
        if (otp === "1234") {
            // save a fake token in localStorage
            localStorage.setItem("aastha-token", "mock-token");
            window.location.href = "/";
        } else {
            alert("Invalid OTP. Try 1234.");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-6 rounded-xl shadow w-full max-w-sm">
                <h1 className="text-xl font-bold mb-4 text-center">Login to Aastha</h1>

                {step === "phone" && (
                    <>
                        <input
                            type="tel"
                            className="w-full border rounded-lg px-3 py-2 mb-3"
                            placeholder="Enter mobile number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                        <button
                            onClick={sendOtp}
                            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                        >
                            Get OTP
                        </button>
                    </>
                )}

                {step === "otp" && (
                    <>
                        <input
                            type="text"
                            className="w-full border rounded-lg px-3 py-2 mb-3"
                            placeholder="Enter OTP (hint: 1234)"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <button
                            onClick={verifyOtp}
                            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                        >
                            Verify OTP
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
