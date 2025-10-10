"use client";

import React, { useEffect, useState, useRef } from "react";
import TopBar from "./common/TopBar";
import BottomNav from "./common/BottomNav";
import { getAPI, setAPIMode, isMockMode } from "../lib/config";
import { fetchBookingsListFromBackend } from "../lib/realApi";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
} from "date-fns";

import { ChatMessage as ApiChatMessage, Booking as ApiBooking } from "../lib/api";
type ChatMessage = ApiChatMessage;
type Booking = ApiBooking;

// 💬 Chat bubble UI
function MessageBubble({ m }: { m: ChatMessage }) {
  const isAastha = m.from === "aastha";
  return (
    <div className={`flex items-end mb-3 ${isAastha ? "justify-start" : "justify-end"}`}>
      {isAastha && (
        <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm mr-2">
          A
        </div>
      )}
      <div
        className={`px-4 py-2 rounded-2xl max-w-[70%] shadow ${isAastha
            ? "bg-white text-gray-800 rounded-bl-none"
            : "bg-green-600 text-white rounded-br-none"
          }`}
      >
        <p className="text-sm">{m.text}</p>
        <span
          className={`text-[10px] block mt-1 ${isAastha ? "text-gray-400" : "text-green-200"
            }`}
        >
          {m.time}
        </span>
      </div>
      {!isAastha && (
        <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm ml-2">
          H
        </div>
      )}
    </div>
  );
}

export default function AasthaBookingManager() {
  const [tab, setTab] = useState<"chat" | "bookings" | "calendar">("chat");
  const [mockMode, setMockMode] = useState(isMockMode());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [registeredNumber, setRegisteredNumber] = useState(
    localStorage.getItem("registeredNumber") || ""
  );

  const chatRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // ✅ 1. Load initial data
  useEffect(() => {
    (async () => {
      const api = getAPI();
      try {
        const msgs = await api.fetchChatHistory();
        setMessages(Array.isArray(msgs) ? msgs : []);

        // ✅ 4. Fetch real backend bookings
        const userPhone = localStorage.getItem("registeredNumber") || "919834069861";
        const bookingList = await fetchBookingsListFromBackend(
          "2025-10-10",
          "2025-12-31",
          userPhone
        );

        if (Array.isArray(bookingList)) {
          setBookings(bookingList);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    })();
  }, []);

  // ✅ 2. Auto-scroll when new messages
  useEffect(() => {
    if (chatRef.current) {
      setTimeout(() => {
        chatRef.current!.scrollTop = chatRef.current!.scrollHeight;
      }, 0);
    }
  }, [messages, typing]);

  // ✅ 3. Handle sending messages
  async function handleSend() {
    const text = input.trim();
    if (!text) return;

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const msgId = Date.now().toString();
    const outgoing: ChatMessage = { id: msgId, from: "host", text, time, status: "sent" };

    setMessages((prev) => [...prev, outgoing]);
    setInput("");
    setTyping(true);

    const api = getAPI();
    const res = await api.sendMessageToBackend(text);

    setTimeout(() => {
      setTyping(false);

      const aasthaReply = {
        id: (Date.now() + 1).toString(),
        from: "aastha",
        text: res.reply,
        time,
      };

      setMessages((prev) => [...prev, aasthaReply]);

      // 🧠 Detect if Aastha replied with bookings and auto-switch
      if (res.reply && res.reply.toLowerCase().includes("booking id")) {
        try {
          const matches = [...res.reply.matchAll(
            /\*\*(.*?)\*\*.*?(?:contact number|number|contact)\s*([0-9]*)?.*?booking id\s*\*\*(\d+)\*\*.*?check-in on\s*(?:\*\*)?(\d{1,2}\w*\s+\w+).*?check-out on\s*(?:\*\*)?(\d{1,2}\w*\s+\w+).*?(?:for\s*\*\*(\d+)\*\*\s*guests?)?/gi
          )];

          const parsedBookings = matches.map((m) => ({
            id: m[3],
            customer_name: m[1],
            customer_contact: m[2] || "—",
            start_date: m[4],
            end_date: m[5],
            customer_count: Number(m[6]) || 1,
            status: "Confirmed",
          }));

          if (parsedBookings.length > 0) {
            setBookings(parsedBookings);
            setTab("bookings");
          }
        } catch (err) {
          console.error("⚠️ Could not parse bookings:", err);
        }
      }
    }, 1500);
  }

  // ✅ 4. Registration screen
  if (!registeredNumber) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h2 className="text-xl font-semibold mb-4">Enter your phone number</h2>
        <input
          ref={inputRef}
          type="text"
          className="border rounded px-3 py-2 mb-3 text-center w-64"
          placeholder="Enter number like 919834069861"
        />
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          onClick={() => {
            const number = inputRef.current?.value.trim();
            if (number) {
              localStorage.setItem("registeredNumber", number);
              window.location.reload();
            } else {
              alert("Please enter a valid number.");
            }
          }}
        >
          Register
        </button>
      </div>
    );
  }

  // ✅ 5. Main UI
  return (
    <div className="min-h-screen flex flex-col pb-16 bg-gray-100">
      <TopBar title="Aastha — AI Booking Manager" subtitle="Chat with Aastha to manage bookings" />

      {/* 🔄 API Mode Toggle */}
      <div className="flex justify-center items-center bg-white py-2 border-b">
        <button
          onClick={() => {
            const newMode = !mockMode;
            setMockMode(newMode);
            setAPIMode(newMode);
            window.location.reload();
          }}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition ${mockMode ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
            }`}
        >
          {mockMode ? "🧪 Mock API Mode" : "🌐 Live API Mode"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-auto">
        {tab === "chat" && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto p-4 bg-gray-50" ref={chatRef}>
              {messages.map((m) => (
                <MessageBubble key={m.id} m={m} />
              ))}
              {typing && (
                <div className="flex justify-start mb-3">
                  <div className="bg-gray-200 px-4 py-2 rounded-2xl text-sm text-gray-600 animate-pulse">
                    Aastha is typing…
                  </div>
                </div>
              )}
            </div>
            <div className="p-3 border-t bg-white flex items-center gap-2">
              <input
                className="flex-1 border rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
              />
              <button
                className="p-2 bg-green-600 rounded-full text-white hover:bg-green-700"
                onClick={handleSend}
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* ✅ BOOKINGS TAB */}
        {tab === "bookings" && (
          <div className="p-4">
            <h2 className="font-semibold text-lg mb-3">Bookings</h2>

            {bookings.length === 0 ? (
              <p className="text-gray-500 text-sm">No bookings found.</p>
            ) : (
              <div className="space-y-3">
                {bookings.map((b: any) => (
                  <div
                    key={b.bookings_id || b.id}
                    className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                        {b.customer_name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{b.customer_name}</div>
                        <div className="text-xs text-gray-500">
                          {b.start_date} → {b.end_date}
                        </div>
                        <div className="text-xs text-gray-600">
                          👥 {b.customer_count || 1} guest
                          {b.customer_count > 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                    {b.customer_contact && (
                      <a
                        href={`tel:${b.customer_contact}`}
                        className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-full"
                      >
                        📞 Call Now
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}
