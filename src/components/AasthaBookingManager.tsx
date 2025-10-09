"use client";

import React, { useEffect, useState, useRef } from "react";
import TopBar from "./common/TopBar";
import BottomNav from "./common/BottomNav";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
} from "date-fns";


import { getAPI, setAPIMode, isMockMode } from "../lib/config";



import { ChatMessage as ApiChatMessage, Booking as ApiBooking } from "../lib/api";
type ChatMessage = ApiChatMessage;
type Booking = ApiBooking;

// 💬 Message bubble UI
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
        className={`px-4 py-2 rounded-2xl max-w-[70%] shadow ${isAastha ? "bg-white text-gray-800 rounded-bl-none" : "bg-green-600 text-white rounded-br-none"
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

  // Chat state
  const [mockMode, setMockMode] = useState(isMockMode());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false); // ✅ moved inside component
  const chatRef = useRef<HTMLDivElement | null>(null);

  // Bookings
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [registeredNumber, setRegisteredNumber] = useState(
    localStorage.getItem("registeredNumber") || ""
  );

  const inputRef = useRef<HTMLInputElement | null>(null);


  // Load initial data
  useEffect(() => {
    (async () => {
      const api = getAPI(); // 👈 dynamically picks mock or live API

      try {
        const msgs = await api.fetchChatHistory();
        setMessages(Array.isArray(msgs) ? msgs : []);


        const b = await api.fetchBookingsFromAPI();
        setBookings(b);

        const dates = await api.fetchCalendarData();
        setBookedDates(new Set(dates));
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    })();
  }, []);


  // Auto scroll to bottom when new messages
  useEffect(() => {
    if (chatRef.current) {
      setTimeout(() => {
        chatRef.current!.scrollTop = chatRef.current!.scrollHeight;
      }, 0);
    }
  }, [messages, typing]);

  async function handleSend() {
    const text = input.trim();
    if (!text) return;

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });


    const msgId = Date.now().toString();

    const outgoing: ChatMessage = {
      id: msgId,
      from: "host",
      text,
      time,
      status: "sent", // ✅ mark as sent
    };

    setMessages((prev) => [...prev, outgoing]);
    setInput("");

    // Show typing indicator
    setTyping(true);

    const api = getAPI(); // 👈 fetches correct API version
    const res = await api.sendMessageToBackend(text);


    // Wait 1.5s before showing Aastha's reply
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          from: "aastha",
          text: res.reply,
          time,
        },
      ]);
    }, 1500);
  }
  // 🔐 Registration screen if user not registered
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


  return (
    <div className="min-h-screen flex flex-col pb-16 bg-gray-100">
      <TopBar
        title="Aastha — AI Booking Manager"
        subtitle="Chat with Aastha to manage bookings"
      />
      {/* 🔄 API Mode Toggle */}
      <div className="flex justify-center items-center bg-white py-2 border-b">
        <button
          onClick={() => {
            const newMode = !mockMode;
            setMockMode(newMode);        // 👈 instantly updates UI
            setAPIMode(newMode);         // 👈 updates config + saves in localStorage
            window.location.reload();    // 👈 reloads app to reinitialize API
          }}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition ${mockMode
            ? "bg-yellow-100 text-yellow-700"
            : "bg-green-100 text-green-700"
            }`}
        >
          {mockMode ? "🧪 Mock API Mode" : "🌐 Live API Mode"}
        </button>
      </div>


      <div className="flex-1 overflow-auto">
        {/* CHAT TAB */}
        {tab === "chat" && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto p-4 bg-gray-50" ref={chatRef}>
              {Array.isArray(messages) &&
                messages.map((m) => <MessageBubble key={m.id} m={m} />)}


              {/* Typing Indicator */}
              {typing && (
                <div className="flex justify-start mb-3">
                  <div className="bg-gray-200 px-4 py-2 rounded-2xl text-sm text-gray-600 animate-pulse">
                    Aastha is typing…
                  </div>
                </div>
              )}
            </div>

            {/* Input box */}
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

        {/* BOOKINGS TAB */}
        {tab === "bookings" && (
          <div className="p-4">
            <h2 className="font-semibold text-lg mb-3">Bookings</h2>
            <div className="space-y-3">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                      {b.guest.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{b.guest}</div>
                      <div className="text-xs text-gray-500">
                        {b.checkIn} → {b.checkOut}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${b.status === "Confirmed"
                      ? "bg-green-100 text-green-700"
                      : b.status === "Cancelled"
                        ? "bg-red-100 text-red-700"
                        : b.status === "Checked-in"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CALENDAR TAB */}
        {tab === "calendar" && (
          <div className="p-4">
            <h2 className="font-semibold text-lg mb-4">Calendar</h2>
            <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-600 mb-2">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {(() => {
                const today = new Date();
                const monthStart = startOfMonth(today);
                const monthEnd = endOfMonth(today);
                const start = startOfWeek(monthStart, { weekStartsOn: 0 });
                const end = endOfWeek(monthEnd, { weekStartsOn: 0 });

                const days = eachDayOfInterval({ start, end });

                return days.map((day) => {
                  const dayBookings = bookings.filter((b) => {
                    const checkIn = new Date(b.checkIn);
                    const checkOut = new Date(b.checkOut);
                    return day >= checkIn && day <= checkOut;
                  });

                  return (
                    <div
                      key={day.toISOString()}
                      className={`h-24 p-1 rounded-lg border text-xs relative flex flex-col items-start overflow-hidden ${isSameMonth(day, monthStart)
                        ? "bg-white"
                        : "bg-gray-50 text-gray-400"
                        }`}
                    >
                      <div className="absolute top-1 right-1 text-[10px] text-gray-400">
                        {format(day, "d")}
                      </div>
                      <div className="mt-4 space-y-1 w-full">
                        {dayBookings.map((b) => (
                          <div
                            key={b.id}
                            className={`truncate px-2 py-1 rounded text-[10px] font-medium ${b.status === "Confirmed"
                              ? "bg-green-100 text-green-700"
                              : b.status === "Cancelled"
                                ? "bg-red-100 text-red-700"
                                : b.status === "Checked-in"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                          >
                            {b.guest}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}
      </div>

      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}
