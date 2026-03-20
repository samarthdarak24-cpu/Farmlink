'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image as ImageIcon, Mic, MoreVertical, Check, CheckCheck, Sparkles, Handshake, X, ThumbsUp } from 'lucide-react';
import { useAdvancedChat, ChatMessage } from '@/hooks/useAdvancedChat';
import { messagesApi } from '@/lib/api';
import { useAuthZustand } from '@/store/authZustand';

interface ChatRoomProps {
  conversationId: string;
  recipientId: string;
  recipientName: string;
}

export default function ChatRoom({ 
  conversationId: initialConvId, 
  recipientId: initialRecipientId, 
  recipientName: initialRecipientName 
}: ChatRoomProps) {
  const { user } = useAuthZustand();
  const [selectedConv, setSelectedConv] = useState({ 
    id: initialConvId, 
    recipientId: initialRecipientId, 
    name: initialRecipientName 
  });
  const [conversations, setConversations] = useState<any[]>([]);
  
  const { 
    messages, 
    sendMessage, 
    sendTyping, 
    isTyping, 
    onlineStatus, 
    lastSeen 
  } = useAdvancedChat(selectedConv.id, selectedConv.recipientId);
  
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await messagesApi.getConversations();
        setConversations(data || []);
        if (data && data.length > 0 && selectedConv.id === 'demo-conv-id') {
          const first = data[0];
          const recId = first.participants.find((p: string) => p !== user?.id);
          setSelectedConv({ id: first.id, recipientId: recId, name: 'Customer' });
        }
      } catch (e) {
        console.error('Failed to load conversations:', e);
      }
    })();
  }, [user?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ 
        top: scrollRef.current.scrollHeight, 
        behavior: 'smooth' 
      });
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
    sendTyping(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[700px] glass-card border border-white/20 rounded-3xl overflow-hidden bg-white/5 backdrop-blur-xl shadow-2xl">
      {/* Sidebar - Conversation List */}
      <div className="w-full lg:w-80 border-r border-white/10 flex flex-col bg-white/5">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-display font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-500" />
            Chats
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {conversations.length > 0 ? (
            conversations.map((conv) => {
              const recId = conv.participants.find((p: string) => p !== user?.id);
              const isActive = selectedConv.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv({ id: conv.id, recipientId: recId, name: 'Customer' })}
                  className={`w-full p-4 rounded-2xl flex items-center gap-3 transition-all duration-300 ${
                    isActive 
                      ? 'bg-primary-600/20 border border-primary-500/30 text-primary-300' 
                      : 'hover:bg-white/5 text-gray-400 border border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isActive ? 'bg-primary-500 text-white' : 'bg-white/10'}`}>
                    C
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className={`font-bold truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>Customer</p>
                    <p className="text-xs truncate opacity-60">{conv.lastMessage || 'No messages'}</p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-center py-10 px-4">
              <p className="text-sm text-gray-500 opacity-60">No active conversations yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/10 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center border border-primary-500/30">
              <span className="text-primary-700 font-bold">{selectedConv.name[0]}</span>
            </div>
            <div>
              <h3 className="font-display font-bold text-gray-900 dark:text-white leading-tight">{selectedConv.name}</h3>
              <p className="text-xs text-gray-500">
                {onlineStatus === 'online' ? (
                  <span className="text-green-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> online
                  </span>
                ) : (
                  `last seen ${lastSeen ? new Date(lastSeen).toLocaleTimeString() : 'recently'}`
                )}
              </p>
            </div>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Messages area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white/5 bg-opacity-30 relative">
          {/* Subtle Wallpaper Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat" />
          
          <div className="relative z-10 space-y-4">
            {messages.map((msg, idx) => {
              const isMe = msg.senderId === user?.id;
              const isNegotiation = msg.type === 'negotiation';

              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  key={msg.id || idx}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] sm:max-w-[70%] group`}>
                    {isNegotiation ? (
                      <div className={`p-4 rounded-3xl border shadow-2xl backdrop-blur-md ${isMe ? 'bg-primary-900/60 border-primary-500/50 text-white' : 'bg-white/10 border-white/20 text-gray-100'}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <Handshake className="w-5 h-5 text-yellow-500" />
                          <span className="font-display font-bold uppercase tracking-wider text-[10px] opacity-70">Price Negotiation</span>
                        </div>
                        <div className="bg-black/30 rounded-2xl p-4 mb-4 text-center border border-white/5">
                          <p className="text-[10px] text-gray-400 mb-1">Proposed Price</p>
                          <p className="text-3xl font-display font-black text-primary-400">₹{msg.negotiationData?.price}</p>
                        </div>
                        {!isMe && msg.negotiationData?.status === 'pending' && (
                          <div className="flex gap-2">
                            <button className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5">
                              <ThumbsUp className="w-4 h-4" /> Accept
                            </button>
                            <button className="flex-1 bg-red-600/80 hover:bg-red-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5">
                              <X className="w-4 h-4" /> Reject
                            </button>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-3 opacity-60">
                          <span className="text-[9px]">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                          <span className="text-[9px] uppercase font-black tracking-widest text-primary-400">{msg.negotiationData?.status}</span>
                        </div>
                      </div>
                    ) : (
                      <div className={`
                        px-5 py-3 rounded-2xl text-sm shadow-xl border relative transition-all duration-300
                        ${isMe 
                          ? 'bg-gradient-to-br from-primary-600 to-primary-800 text-white border-primary-500/30 rounded-tr-none' 
                          : 'bg-white/10 dark:bg-white/5 text-gray-100 border-white/10 rounded-tl-none backdrop-blur-xl'}
                      `}>
                        <p className="leading-relaxed break-words">{msg.content}</p>
                        <div className="flex items-center justify-end gap-1.5 mt-2 opacity-60">
                          <span className="text-[9px] tracking-tight">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && (
                            <span>
                              {msg.status === 'seen' ? <CheckCheck className="w-3.5 h-3.5 text-sky-300" /> : 
                               msg.status === 'delivered' ? <CheckCheck className="w-3.5 h-3.5" /> : 
                               <Check className="w-3.5 h-3.5" />}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
            
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl rounded-tl-none border border-white/5 shadow-lg">
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Action Bar (Smart Replies) */}
        <div className="p-2 px-4 bg-transparent">
          <AnimatePresence>
            {!input.trim() && !isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex gap-2 overflow-x-auto no-scrollbar pb-2 pt-1"
              >
                {["Is this available?", "Price negotiable?", "How's the quality?", "Expected delivery?"].map((suggest) => (
                  <button
                    key={suggest}
                    onClick={() => { setInput(suggest); handleSend(); }}
                    className="shrink-0 px-4 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-xs text-white hover:bg-primary-600/40 hover:border-primary-500/50 transition-all shadow-2xl flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    {suggest}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input area */}
        <div className="p-4 bg-black/20 backdrop-blur-2xl border-t border-white/10">
          <div className="flex items-center gap-3 bg-white/5 rounded-3xl p-2 pl-4 border border-white/10 shadow-inner">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
              <ImageIcon className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                sendTyping(true);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white placeholder-gray-500 py-2"
            />
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
              <Mic className="w-5 h-5" />
            </button>
            <button 
              disabled={!input.trim()}
              onClick={handleSend}
              className={`p-3 rounded-2xl transition-all shadow-2xl active:scale-95 ${input.trim() ? 'bg-primary-600 text-white' : 'bg-white/5 text-gray-600 cursor-not-allowed'}`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
