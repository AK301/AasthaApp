export type ChatMessage = {
    id: string;
    from: "host" | "aastha";
    text: string;
    time: string;
    status?: "sent" | "delivered" | "seen"; // 👈 new
};

export type Booking = {
    id: string;
    guest: string;
    phone: string;
    checkIn: string;
    checkOut: string;
    status: string;
};

const MOCK_MESSAGES: ChatMessage[] = [
    { id: "1", from: "aastha", text: "Hi! I'm Aastha, your AI booking manager.", time: "10:00" },
];

const MOCK_BOOKINGS: Booking[] = [
    { id: "B1", guest: "Rajesh Kumar", phone: "98765", checkIn: "2025-10-10", checkOut: "2025-10-12", status: "Confirmed" },
];

export async function fetchChatHistory(): Promise<ChatMessage[]> {
    return new Promise((res) => setTimeout(() => res(MOCK_MESSAGES), 300));
}

export async function sendMessageToBackend(text: string): Promise<{ reply: string }> {
    return new Promise((res) =>
        setTimeout(() => res({ reply: `Acknowledged: "${text}" (mock reply)` }), 500)
    );
}

export async function fetchBookingsFromAPI(): Promise<Booking[]> {
    return new Promise((res) => setTimeout(() => res(MOCK_BOOKINGS), 300));
}

export async function fetchCalendarData(): Promise<string[]> {
    return ["2025-10-10", "2025-10-11"];
}



