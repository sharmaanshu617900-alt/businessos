'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Property, ChatMessage } from '../../lib/types';
import { mockProperties } from '../../lib/mock-data';
import { formatPrice, formatSize } from '../../lib/utils';

interface AiChatProps {
  onClose: () => void;
  onPropertySelect: (property: Property) => void;
}

const suggestedPrompts = [
  'I need a 2BHK under ₹15,000 near metro',
  'Show me plots in Dwarka',
  'Cheapest furnished room in Saket',
  'Compare rent vs buy for ₹20K budget',
  'Find PG near Karol Bagh',
];

function generateAiResponse(query: string): { text: string; properties: Property[] } {
  const q = query.toLowerCase();
  let matchedProperties: Property[] = [];
  let responseText = '';

  const budgetMatch = q.match(/(?:under|below|upto|max|budget)\s*(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i);
  const budget = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, '')) : undefined;
  const bhkMatch = q.match(/(\d)\s*bhk/i);
  const bhk = bhkMatch ? bhkMatch[1] + 'BHK' : undefined;
  const pgMatch = q.includes('pg') || q.includes('hostel');
  const rentMatch = q.includes('rent') || q.includes('rental') || q.includes('room');
  const buyMatch = q.includes('buy') || q.includes('purchase') || q.includes('plot') || q.includes('land');
  const furnishedMatch = q.includes('furnished');
  const compareMatch = q.includes('compare') || q.includes('vs') || q.includes('versus');

  if (compareMatch) {
    const rentOptions = mockProperties.filter((p) => p.listingType === 'rent' && p.status === 'active');
    const saleOptions = mockProperties.filter((p) => p.listingType === 'sale' && p.status === 'active');
    matchedProperties = [...rentOptions.slice(0, 2), ...saleOptions.slice(0, 1)];
    return {
      text: `Here's a comparison of rent vs buy options:\n\n**For Renting:**\n${rentOptions.slice(0, 2).map((p) => `• ${p.title} - ${formatPrice(p.price, p.priceUnit)}`).join('\n')}\n\n**For Buying:**\n${saleOptions.slice(0, 1).map((p) => `• ${p.title} - ${formatPrice(p.price, p.priceUnit)}`).join('\n')}\n\nWith a Rs 20,000/month budget, renting gives you immediate flexibility while buying requires significant upfront investment.`,
      properties: matchedProperties,
    };
  }

  matchedProperties = mockProperties.filter((p) => {
    if (p.status !== 'active') return false;
    if (budget && p.price > budget) return false;
    if (bhk && p.roomConfig !== bhk) return false;
    if (pgMatch && p.roomConfig !== 'PG') return false;
    if (rentMatch && !buyMatch && p.listingType !== 'rent') return false;
    if (buyMatch && !rentMatch && p.listingType !== 'sale') return false;
    if (furnishedMatch && p.furnishedStatus !== 'furnished') return false;
    return true;
  });

  if (matchedProperties.length === 0) {
    matchedProperties = mockProperties.filter((p) => p.status === 'active').slice(0, 3);
    responseText = `I couldn't find an exact match, but here are some great options nearby:\n\n`;
  } else {
    matchedProperties = matchedProperties.slice(0, 3);
    const typeDescription = pgMatch ? 'PG accommodation' : bhk ? `${bhk} apartments` : 'properties';
    responseText = `Found ${matchedProperties.length} ${typeDescription} matching your needs:\n\n`;
  }

  matchedProperties.forEach((p, i) => {
    const features = [p.roomConfig, p.furnishedStatus, p.size ? `${p.size} ${p.sizeUnit}` : null].filter(Boolean).join(' • ');
    responseText += `${i + 1}. **${p.title}**\n   ${p.locality} | ${formatPrice(p.price, p.priceUnit)}\n   ${features}\n\n`;
  });    responseText += `Want me to filter further or compare these options?`;
  return { text: responseText, properties: matchedProperties };
}

export default function AiChat({ onClose, onPropertySelect }: AiChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      text: "Hi! I'm your AI property assistant.\n\nDescribe what you're looking for in Hindi or English, and I'll find the best options for you. Try something like:\n\n• \"I need a 2BHK under ₹15,000\"\n• \"Show me plots in Dwarka\"\n• \"Compare rent vs buy options\"",
      timestamp: new Date().toISOString(),
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;
    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: 'user', text: messageText, timestamp: new Date().toISOString() }]);
    setInput('');
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1500));
    const response = generateAiResponse(messageText);
    setMessages((prev) => [...prev, { id: `assistant-${Date.now()}`, role: 'assistant', text: response.text, timestamp: new Date().toISOString(), properties: response.properties }]);
    setIsTyping(false);
  };

  return (
    <div className="absolute inset-0 z-[1001] flex flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Luxury Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500">
        <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-white">AI Property Assistant</h2>
          <p className="text-[10px] text-white/70 font-medium">Hindi & English • AI-powered</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : ''}`}>
              <div className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-2xl rounded-br-md shadow-lg shadow-indigo-500/20'
                  : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-2xl rounded-bl-md shadow-sm border border-zinc-100 dark:border-zinc-700/50'
              }`}>
                {msg.text}
              </div>
              {msg.properties && msg.properties.length > 0 && (
                <div className="mt-3 space-y-2">
                  {msg.properties.map((prop) => (
                    <button
                      key={prop.id}
                      onClick={() => onPropertySelect(prop)}
                      className="w-full text-left p-3 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700/50 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="flex gap-3">
                        <img src={prop.photos[0]} alt={prop.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{prop.title}</p>
                          <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            {prop.locality}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-bold text-gradient">{formatPrice(prop.price, prop.priceUnit)}</span>
                            <span className="text-xs text-zinc-400">•</span>
                            <span className="text-xs text-zinc-500">{formatSize(prop.size, prop.sizeUnit)}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <p className={`text-[10px] text-zinc-400 mt-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="px-5 py-3.5 bg-white dark:bg-zinc-800 rounded-2xl rounded-bl-md shadow-sm border border-zinc-100 dark:border-zinc-700/50">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {suggestedPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="px-3.5 py-2 text-xs bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 rounded-xl font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all border border-indigo-100 dark:border-indigo-800/30 shadow-sm"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Luxury Input */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2.5 bg-white dark:bg-zinc-800 rounded-2xl px-4 py-2 shadow-sm border border-zinc-100 dark:border-zinc-700/50">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe what you need..."
            className="flex-1 bg-transparent outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 font-medium"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 disabled:from-zinc-300 disabled:to-zinc-300 dark:disabled:from-zinc-700 dark:disabled:to-zinc-700 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-indigo-500/20 disabled:shadow-none"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
