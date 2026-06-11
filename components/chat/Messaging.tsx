'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Phone } from 'lucide-react';
import { Message, Conversation } from '../../lib/types';
import { mockMessages, mockConversations } from '../../lib/mock-data';
import { formatDate } from '../../lib/utils';
import { t } from '../../lib/i18n';

export default function Messaging() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConversation]);

  const handleSend = () => {
    if (!newMessage.trim() || !activeConversation) return;
    const msg: Message = {
      id: `msg-${Date.now()}`,
      conversationId: activeConversation.id,
      senderId: 'user-3',
      senderName: 'Amit Patel',
      text: newMessage,
      timestamp: new Date().toISOString(),
      read: true,
    };
    setMessages((prev) => ({ ...prev, [activeConversation.id]: [...(prev[activeConversation.id] || []), msg] }));
    setConversations((prev) => prev.map((c) => c.id === activeConversation.id ? { ...c, lastMessage: newMessage, lastMessageTime: new Date().toISOString() } : c));
    setNewMessage('');
  };

  if (activeConversation) {
    const convMessages = messages[activeConversation.id] || [];
    return (
      <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <button onClick={() => setActiveConversation(null)} className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-zinc-600 dark:text-zinc-300"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-indigo-500/20">
            {activeConversation.ownerName.charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{activeConversation.ownerName}</h3>
            <p className="text-[10px] text-zinc-500 truncate">{activeConversation.propertyTitle}</p>
          </div>
          <button className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <Phone className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {convMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderId === 'user-3' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${msg.senderId === 'user-3' ? 'order-2' : ''}`}>
                <div className={`px-4 py-2.5 text-sm ${
                  msg.senderId === 'user-3'
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-2xl rounded-br-md shadow-lg shadow-indigo-500/15'
                    : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-2xl rounded-bl-md shadow-sm border border-zinc-100 dark:border-zinc-700/50'
                }`}>
                  {msg.text}
                </div>
                <p className={`text-[10px] text-zinc-400 mt-1 ${msg.senderId === 'user-3' ? 'text-right' : ''}`}>
                  {formatDate(msg.timestamp)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5 bg-white dark:bg-zinc-800 rounded-2xl px-4 py-2 shadow-sm border border-zinc-100 dark:border-zinc-700/50">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('messages.typeMessage')}
              className="flex-1 bg-transparent outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 font-medium"
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-cyan-500 disabled:from-zinc-300 disabled:to-zinc-300 dark:disabled:from-zinc-700 dark:disabled:to-zinc-700 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-indigo-500/20 disabled:shadow-none"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
      <div className="px-5 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{t('messages.title')}</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900/20 dark:to-cyan-900/20 flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-indigo-400" />
            </div>
            <p className="text-zinc-500 font-medium">No conversations yet</p>
            <p className="text-xs text-zinc-400 mt-1">Start by contacting a property owner!</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConversation(conv)}
              className="w-full px-5 py-4 flex items-center gap-3 hover:bg-white dark:hover:bg-zinc-900 transition-colors border-b border-zinc-100 dark:border-zinc-800/50 text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-indigo-500/15">
                {conv.ownerName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{conv.ownerName}</h3>
                  <span className="text-[10px] text-zinc-400">{formatDate(conv.lastMessageTime)}</span>
                </div>
                <p className="text-[10px] text-zinc-400 truncate">{conv.propertyTitle}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 truncate mt-0.5 font-medium">{conv.lastMessage}</p>
              </div>
              {conv.unreadCount > 0 && (
                <span className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 shadow-lg shadow-indigo-500/30">
                  {conv.unreadCount}
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
