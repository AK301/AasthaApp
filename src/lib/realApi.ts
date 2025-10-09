// src/lib/realApi.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3002";

// ✅ Send chat message
export async function sendMessageToBackend(text: string): Promise<{ reply: string }> {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const fromNumber = localStorage.getItem("registeredNumber") || "919834069861";

    try {
        const response = await fetch(`${API_BASE_URL}/test`, {
            method: "POST",
            headers,
            body: JSON.stringify({ from: fromNumber, text }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("❌ Backend error:", response.status, errText);
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        // ✅ handles both 'reply' and 'response' keys
        return { reply: result.reply || result.response || "No reply received" };
    } catch (error) {
        console.error("❌ Network or parsing error:", error);
        return { reply: "⚠️ Error connecting to backend." };
    }
}

// ✅ Fetch chat history (real backend version)
export async function fetchChatHistory(): Promise<any[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/chat-history`);
        const data = await response.json();
        // ensure array shape
        return Array.isArray(data) ? data : data.messages || [];
    } catch (error) {
        console.error("⚠️ Error fetching chat history:", error);
        return [];
    }
}

// ✅ Fetch bookings (real backend version)
export async function fetchBookingsFromAPI(): Promise<any[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`);
        const data = await response.json();
        return Array.isArray(data) ? data : data.bookings || [];
    } catch (error) {
        console.error("⚠️ Error fetching bookings:", error);
        return [];
    }
}

// ✅ Fetch calendar data (optional endpoint)
export async function fetchCalendarData(): Promise<string[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/calendar`);
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("⚠️ Error fetching calendar data:", error);
        return [];
    }
}
