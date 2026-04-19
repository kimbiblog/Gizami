"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MessageSquare,
  Search,
  Mail,
  AlertCircle,
  Info,
  Flag,
  Check,
  Clock,
  Reply,
  Trash2,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { adminMessages } from "@/lib/adminMockData";

const typeConfig = {
  support: { label: "Support", icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" },
  inquiry: { label: "Inquiry", icon: Info, color: "text-blue-600", bg: "bg-blue-100" },
  report: { label: "Report", icon: Flag, color: "text-amber-600", bg: "bg-amber-100" },
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState(adminMessages);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [replyText, setReplyText] = useState("");

  const filtered = messages.filter((m) => {
    const matchSearch =
      m.from.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || m.type === typeFilter;
    return matchSearch && matchType;
  });

  const activeMessage = messages.find((m) => m.id === activeId);

  const markRead = (id: string) => {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, read: true } : m));
  };

  const handleSelect = (id: string) => {
    setActiveId(id);
    markRead(id);
    setReplyText("");
  };

  const deleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="min-h-screen">
      <AdminHeader title="Messages" subtitle={`${unreadCount} unread messages`} />

      <main className="p-4 sm:p-6 max-w-screen-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden flex flex-col md:flex-row" style={{ minHeight: "calc(100vh - 160px)" }}>
          {/* Left panel – list */}
          <div className="w-full md:w-96 border-b md:border-b-0 md:border-r border-[var(--border)] flex flex-col">
            {/* Search & Filter */}
            <div className="p-4 border-b border-[var(--border)] space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search messages..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--primary)] transition-all"
                />
              </div>
              <div className="flex gap-1.5">
                {["all", "support", "inquiry", "report"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-medium capitalize transition-all ${
                      typeFilter === t
                        ? "bg-[var(--primary)] text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
              {filtered.map((msg) => {
                const typeConf = typeConfig[msg.type];
                return (
                  <button
                    key={msg.id}
                    onClick={() => handleSelect(msg.id)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                      activeId === msg.id ? "bg-[var(--primary)]/5 border-l-2 border-[var(--primary)]" : ""
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-gray-100">
                        <Image src={msg.avatar} alt={msg.from} fill className="object-cover" />
                      </div>
                      {!msg.read && (
                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[var(--primary)] rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${!msg.read ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                          {msg.from}
                        </p>
                        <p className="text-[10px] text-gray-400 flex-shrink-0">{msg.time}</p>
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${!msg.read ? "font-semibold text-gray-700" : "text-gray-500"}`}>
                        {msg.subject}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${typeConf.bg} ${typeConf.color}`}>
                          <typeConf.icon className="w-2.5 h-2.5" />
                          {typeConf.label}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="p-8 text-center">
                  <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No messages found</p>
                </div>
              )}
            </div>
          </div>

          {/* Right panel – message detail */}
          <div className="flex-1 flex flex-col">
            {activeMessage ? (
              <>
                {/* Header */}
                <div className="p-5 border-b border-[var(--border)] flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-gray-800 text-base">{activeMessage.subject}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-gray-500">From: <span className="font-medium text-gray-700">{activeMessage.from}</span></p>
                      <p className="text-xs text-gray-400">·</p>
                      <p className="text-xs text-gray-400">{activeMessage.email}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-400">{activeMessage.time}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => markRead(activeMessage.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMessage(activeMessage.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 p-5 overflow-y-auto">
                  <div className="flex gap-4 mb-6">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                      <Image src={activeMessage.avatar} alt={activeMessage.from} fill className="object-cover" />
                    </div>
                    <div className="bg-gray-50 rounded-2xl rounded-tl-none p-4 flex-1">
                      <p className="text-sm text-gray-700 leading-relaxed">{activeMessage.preview}</p>
                      <p className="text-sm text-gray-700 leading-relaxed mt-3">
                        I would appreciate a quick response as this is affecting my learning progress. Thank you for your time and support.
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed mt-3">
                        Best regards,<br />{activeMessage.from}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reply */}
                <div className="p-4 border-t border-[var(--border)] bg-gray-50">
                  <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
                    <textarea
                      rows={3}
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full p-4 text-sm text-gray-700 outline-none resize-none"
                    />
                    <div className="flex items-center justify-between px-4 py-2.5 border-t border-[var(--border)] bg-gray-50">
                      <p className="text-xs text-gray-400">Reply will be sent to {activeMessage.email}</p>
                      <button
                        disabled={!replyText.trim()}
                        className="btn-primary text-xs py-2 px-4 disabled:opacity-50"
                      >
                        <Reply className="w-3.5 h-3.5" /> Send Reply
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
                <Mail className="w-12 h-12 mb-3 text-gray-200" />
                <p className="font-medium text-gray-500">Select a message to view</p>
                <p className="text-sm mt-1">Click any message on the left to read and reply</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
