"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

/* ─── SUGGESTED QUESTIONS ─── */
const SUGGESTED_QUESTIONS = [
  "What decisions did we make yesterday?",
  "What tasks are assigned to me?",
  "Summarize today's meeting.",
  "What did Rahul promise?",
  "Show every discussion about pricing.",
  "What meetings mentioned marketing?",
  "What deadlines are pending?",
];

/* ─── TYPES ─── */
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ id: string; title: string; client: string; date: string; duration?: number | null; summary?: string }>;
  decisions?: Array<{ title: string; description: string; meetingTitle: string; meetingDate: string; meetingId: string }>;
}

/* ─── TYPING EFFECT ─── */
function useTypingEffect(text: string, speed: number = 25) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) { setDisplayedText(""); setIsComplete(true); return; }
    setIsComplete(false);
    setDisplayedText("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setIsComplete(true);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayedText, isComplete };
}

/* ─── MARKDOWN RENDERER (simple) ─── */
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = (key: number) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key} className="space-y-1.5 my-3">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, i) => {
    // Headings
    if (line.startsWith("### ")) {
      flushList(i);
      elements.push(
        <h3 key={i} className="text-[15px] font-semibold text-[#1d1d1f] mt-4 mb-1.5 tracking-tight">
          {line.replace("### ", "")}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      flushList(i);
      elements.push(
        <h2 key={i} className="text-[17px] font-semibold text-[#1d1d1f] mt-5 mb-2 tracking-tight">
          {line.replace("## ", "")}
        </h2>
      );
    } else if (line.startsWith("# ")) {
      flushList(i);
      elements.push(
        <h1 key={i} className="text-[20px] font-semibold text-[#1d1d1f] mt-5 mb-2 tracking-tight">
          {line.replace("# ", "")}
        </h1>
      );
    }
    // List items
    else if (line.match(/^[\d]+\.\s/)) {
      inList = true;
      listItems.push(
        <li key={i} className="flex items-start gap-2 text-[14px] text-[#424245] leading-relaxed">
          <span className="text-[#0071e3] mt-1 flex-shrink-0">•</span>
          <span>{renderInline(line.replace(/^[\d]+\.\s/, ""))}</span>
        </li>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      inList = true;
      listItems.push(
        <li key={i} className="flex items-start gap-2 text-[14px] text-[#424245] leading-relaxed">
          <span className="text-[#86868b] mt-1.5 w-1 h-1 rounded-full bg-[#86868b] flex-shrink-0" />
          <span>{renderInline(line.replace(/^[-*]\s/, ""))}</span>
        </li>
      );
    }
    // Empty line
    else if (line.trim() === "") {
      flushList(i);
    }
    // Regular paragraph
    else {
      flushList(i);
      elements.push(
        <p key={i} className="text-[14px] text-[#424245] leading-relaxed mb-2">
          {renderInline(line)}
        </p>
      );
    }
  });

  flushList(lines.length);
  return elements;
}

function renderInline(text: string) {
  // Bold
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-[#1d1d1f]">{part.slice(2, -2)}</strong>;
    }
    // Italic
    const italicParts = part.split(/(\*[^*]+\*)/g);
    return italicParts.map((ip, j) => {
      if (ip.startsWith("*") && ip.endsWith("*")) {
        return <em key={`${i}-${j}`} className="italic">{ip.slice(1, -1)}</em>;
      }
      return <span key={`${i}-${j}`}>{ip}</span>;
    });
  });
}

/* ═══════════════════════════════════════
   CHAT PAGE
   ═══════════════════════════════════════ */
export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 50);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ─── SEND MESSAGE ───
  const sendMessage = async (question: string) => {
    if (!question.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: question.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setActiveQuestion(null);

    // Scroll after user message
    setTimeout(() => scrollToBottom(), 100);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: question.trim(),
          conversationHistory: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.answer || "I couldn't find an answer based on your meetings.",
        sources: data.sources || [],
        decisions: data.decisions || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I had trouble processing your question. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── HANDLE SUBMIT ───
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // ─── HANDLE SUGGESTED QUESTION ───
  const handleSuggestedQuestion = (q: string, index: number) => {
    setActiveQuestion(index);
    setTimeout(() => sendMessage(q), 100);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <div className="flex-1 flex flex-col max-w-[720px] mx-auto w-full px-5 lg:px-0">
        {/* ========== HEADER ========== */}
        <div className="pt-8 lg:pt-12 pb-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-[22px] lg:text-[24px] font-semibold tracking-tight text-[#1d1d1f]">
              MeetingOS <span className="font-normal text-[#86868b]">AI</span>
            </h1>
            <p className="text-[13px] text-[#86868b] mt-1 font-normal">
              Connected to your meeting memory
            </p>
            <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-[#eafaf1] border border-[#1d8348]/15">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1d8348] animate-pulse" />
              <span className="text-[11px] font-medium text-[#1d8348]">Ready</span>
            </div>
          </motion.div>
        </div>

        {/* ========== CHAT AREA ========== */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto space-y-1 pb-4"
        >
          {/* Welcome / Empty State */}
          {!hasMessages && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="pt-8 pb-6"
            >
              <div className="text-center max-w-md mx-auto">
                <h2 className="text-[20px] font-semibold text-[#1d1d1f] tracking-tight mb-2">
                  Ask anything about your meetings
                </h2>
                <p className="text-[14px] text-[#86868b] leading-relaxed">
                  I&apos;m connected to every transcript, decision, action item, and summary across all your meetings.
                </p>
              </div>

              {/* Suggested Questions */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <motion.button
                    key={q}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => handleSuggestedQuestion(q, i)}
                    className={`text-left px-4 py-3 rounded-xl border text-[13px] leading-snug transition-all duration-200 ${
                      activeQuestion === i
                        ? "bg-[#f5f5f7] border-[#d2d2d7] text-[#1d1d1f]"
                        : "bg-white border-[#e5e5e7] text-[#424245] hover:border-[#c7c7cc] hover:bg-[#fafafa]"
                    }`}
                  >
                    <span className="line-clamp-2">{q}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="py-3"
              >
                {msg.role === "user" ? (
                  /* ─── USER MESSAGE ─── */
                  <div className="flex justify-end">
                    <div className="max-w-[85%] lg:max-w-[75%]">
                      <p className="text-[14px] font-medium text-[#1d1d1f] leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* ─── ASSISTANT MESSAGE ─── */
                  <div>
                    <div className="bg-white rounded-2xl border border-[#e5e5e7] shadow-sm overflow-hidden">
                      <div className="px-5 py-4">
                        <div className="text-[14px] text-[#424245] leading-relaxed space-y-1">
                          <AnswerContent text={msg.content} />
                        </div>
                      </div>

                      {/* Sources */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="border-t border-[#f0f0f2] px-5 py-3 bg-[#fafafa]/50">
                          <p className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider mb-2">
                            Sources
                          </p>
                          <div className="space-y-1.5">
                            {msg.sources.slice(0, 4).map((src, j) => (
                              <Link
                                key={j}
                                href={`/dashboard/meetings/${src.id}`}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white border border-[#e5e5e7] hover:border-[#d2d2d7] hover:bg-[#fafafa] transition-all duration-150 group"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-[12.5px] font-medium text-[#1d1d1f] truncate group-hover:text-[#0071e3] transition-colors">
                                    {src.title}
                                  </p>
                                  <p className="text-[11px] text-[#86868b]">
                                    {src.client} · {src.date}
                                  </p>
                                </div>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[#c7c7cc] group-hover:text-[#0071e3] transition-colors">
                                  <path d="M2.5 9.5L9.5 2.5M9.5 2.5H3.5M9.5 2.5V8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Decisions */}
                      {msg.decisions && msg.decisions.length > 0 && (
                        <div className="border-t border-[#f0f0f2] px-5 py-3">
                          <p className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider mb-2">
                            Related Decisions
                          </p>
                          <div className="space-y-1.5">
                            {msg.decisions.slice(0, 3).map((d, j) => (
                              <div key={j} className="flex items-start gap-2.5 px-3 py-2 rounded-lg bg-white border border-[#e5e5e7]">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#0071e3] mt-1.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[12.5px] font-medium text-[#1d1d1f]">{d.title}</p>
                                  <p className="text-[11px] text-[#86868b]">{d.meetingTitle} · {d.meetingDate}</p>
                                </div>
                                <Link
                                  href={`/dashboard/meetings/${d.meetingId}`}
                                  className="text-[#c7c7cc] hover:text-[#0071e3] transition-colors p-0.5"
                                >
                                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M2.5 9.5L9.5 2.5M9.5 2.5H3.5M9.5 2.5V8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </Link>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* ─── LOADING ─── */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="py-3"
            >
              <div className="bg-white rounded-2xl border border-[#e5e5e7] shadow-sm px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#c7c7cc] animate-bounce" style={{ animationDelay: "0s" }} />
                    <span className="w-2 h-2 rounded-full bg-[#c7c7cc] animate-bounce" style={{ animationDelay: "0.15s" }} />
                    <span className="w-2 h-2 rounded-full bg-[#c7c7cc] animate-bounce" style={{ animationDelay: "0.3s" }} />
                  </div>
                  <span className="text-[13px] text-[#86868b] font-medium">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ========== INPUT ========== */}
        <div className="sticky bottom-0 py-4 bg-gradient-to-t from-[#fafafa] via-[#fafafa] to-transparent">
          <motion.form
            initial={false}
            onSubmit={handleSubmit}
            className="relative"
          >
            <div className="relative bg-white rounded-2xl border border-[#e5e5e7] shadow-sm hover:shadow-md transition-shadow duration-200 focus-within:border-[#c7c7cc] focus-within:shadow-md">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your meetings..."
                disabled={isLoading}
                className="w-full bg-transparent px-5 py-3.5 text-[14px] text-[#1d1d1f] placeholder:text-[#b8b8bc] outline-none font-normal"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-[#1d1d1f] text-white hover:bg-[#2d2d2f] transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 14L14 8L2 2V6.5L10 8L2 9.5V14Z" fill="currentColor" />
                </svg>
              </button>
            </div>
            <p className="text-[11px] text-[#b8b8bc] text-center mt-2">
              MeetingOS AI answers only from your meeting recordings, transcripts, and summaries.
            </p>
          </motion.form>
        </div>
      </div>
    </div>
  );
}

/* ─── ANSWER CONTENT WITH TYPING EFFECT ─── */
function AnswerContent({ text }: { text: string }) {
  const { displayedText, isComplete } = useTypingEffect(text, 15);

  if (!isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, filter: "blur(4px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.3 }}
      >
        {renderMarkdown(displayedText)}
        <span className="inline-block w-1.5 h-4 bg-[#0071e3] ml-0.5 animate-pulse" style={{ verticalAlign: "text-top" }} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(4px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.4 }}
    >
      {renderMarkdown(text)}
    </motion.div>
  );
}
