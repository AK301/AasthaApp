"use client";

import React, { useEffect, useState, useRef } from "react";
import TopBar from "./common/TopBar";
import BottomNav from "./common/BottomNav";
import {
  fetchChatHistory,
  sendMessageToBackend,
  fetchBookingsFromAPI,
  fetchCalendarData,
  ChatMessage as ApiChatMessage,
  Booking as ApiBooking,
} from "../lib/api";

type ChatMessage = ApiChatMessage;
type Booking = ApiBooking;

function MessageBubble({ m }: { m: ChatMessage }) {
  const isAastha = m.from === "aastha";
  return (
    <div className={`flex ${isAastha ? "justify-start" : "justify-end"} mb-3`}>
      <div
        className={`${isAastha ? "bg-white text-gray-900" : "bg-green-600 text-white"
          } max-w-[75%] p-3 rounded-lg shadow-sm`}
      >
        <div className="text-sm whitespace-pre-wrap">{m.text}</div>
        <div
          className={`text-[11px] mt-1 ${isAastha ? "text-gray-400" : "text-green-200 text-right"
            }`}
        >
          {m.time}
        </div>
      </div>
    </div>
  );
}

export default function AasthaBookingManager() {
  const [tab, setTab] = useState<"chat" | "bookings" | "calendar">("chat");

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const chatRef = useRef<HTMLDivElement | null>(null);

  // Bookings
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const msgs = await fetchChatHistory();
      setMessages(msgs);

      const b = await fetchBookingsFromAPI();
      setBookings(b);

      const dates = await fetchCalendarData();
      setBookedDates(new Set(dates));
    })();
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text) return;

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const outgoing: ChatMessage = {
      id: Date.now().toString(),
      from: "host",
      text,
      time,
    };
    setMessages((prev) => [...prev, outgoing]);
    setInput("");

    const res = await sendMessageToBackend(text);
    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        from: "aastha",
        text: res.reply,
        time,
      },
    ]);
  }

  return (
    <div className="min-h-screen flex flex-col pb-16 bg-gray-100">
      <TopBar
        title="Aastha — AI Booking Manager"
        subtitle="Chat with Aastha to manage bookings"
      />

      <div className="flex-1 overflow-auto">
        {tab === "chat" && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto p-4 bg-gray-50" ref={chatRef}>
              {messages.map((m) => (
                <MessageBubble key={m.id} m={m} />
              ))}
            </div>
            <div className="p-3 border-t bg-white flex gap-2">
              <input
                className="flex-1 border rounded-full px-3 py-2"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
              />
              <button
                className="bg-green-600 text-white px-4 rounded-full"
                onClick={handleSend}
              >
                Send
              </button>
            </div>
          </div>
        )}

        {tab === "bookings" && (
          <div className="p-4">
            <h2 className="font-semibold text-lg mb-2">Bookings</h2>
            {bookings.map((b) => (
              <div key={b.id} className="border p-3 mb-2 rounded bg-white">
                <div className="font-medium">{b.guest}</div>
                <div className="text-sm text-gray-600">
                  {b.checkIn} → {b.checkOut} ({b.status})
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "calendar" && (
          <div className="p-4">
            <h2 className="font-semibold text-lg mb-2">Calendar</h2>
            <div className="text-sm text-gray-600">
              Booked dates: {Array.from(bookedDates).join(", ")}
            </div>
          </div>
        )}
      </div>

      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}
