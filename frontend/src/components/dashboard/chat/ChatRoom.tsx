'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Image as ImageIcon, Mic, MoreVertical, 
  Check, CheckCheck, Sparkles, Handshake, X, 
  ThumbsUp, FileText, Globe, Zap, ShieldCheck,
  Target, AlertCircle, Search, Filter, Paperclip,
  Download, ExternalLink, MessageSquare, Scale,
  Languages, History, Info, ArrowLeftRight, Clock,
  ArrowLeft
} from 'lucide-react';
import { useAdvancedChat, ChatMessage } from '@/hooks/useAdvancedChat';
import { messagesApi } from '@/lib/api';
import { useAuthZustand } from '@/store/authZustand';
import toast from 'react-hot-toast';

interface ChatRoomProps {
  conversationId?: string;
  recipientId?: string;
  recipientName?: string;
}

export default function ChatRoom({ 
  conversationId: initialConvId, 
  recipientId: initialRecipientId, 
  recipientName: initialRecipientName 
}: ChatRoomProps) {
  const { user } = useAuthZustand();
  const [selectedConv, setSelectedConv] = useState<{id?: string, recipientId?: string, name?: string}>({ 
    id: initialConvId, 
    recipientId: initialRecipientId, 
    name: initialRecipientName 
  });
  const [conversations, setConversations] = useState<any[]>([]);
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [translateMode, setTranslateMode] = useState(false);
  const [offerPrice, setOfferPrice] = useState('32.50');
  
  const { 
    messages, 
    sendMessage, 
    sendTyping, 
    isTyping, 
    onlineStatus, 
    lastSeen 
  } = useAdvancedChat(selectedConv.id ?? null, selectedConv.recipientId ?? null);
  
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await messagesApi.getConversations();
        setConversations(data || []);
        if (data && data.length > 0 && (!selectedConv.id || selectedConv.id === 'demo-conv-id')) {
          const first = data[0];
          const recId = first.participants.find((p: string) => p !== user?.id);
          setSelectedConv({ id: first.id, recipientId: recId, name: first.recipientName || 'Nexus Node' });
        }
      } catch (e) { /* ignored */ }
    })();
  }, [user?.id, selectedConv.id]);

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

  const handleNegotiation = () => {
    const msg = `⚡ FORMAL COUNTER-OFFER: Proposed price ₹${offerPrice}/kg for Lot #ODX-21. Terms: 30% advance, 70% delivery.`;
    sendMessage(msg);
    setShowNegotiation(false);
    toast.success('Negotiation payload broadcasted');
  };

  return (
    <div className="flex h-full bg-white/5 backdrop-blur-3xl relative overflow-hidden">
      
      {/* Sidebar - Compact */}
      <div className={`flex flex-col border-r border-white/10 bg-white/5 transition-all duration-500 ${selectedConv.id ? 'hidden lg:flex w-80' : 'w-full'}`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
               <MessageSquare className="w-4 h-4 text-indigo-500" /> Channels
             </h2>
             <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-all border border-white/10"><Filter size={14} /></button>
          </div>
          <div className="relative group">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
             <input type="text" placeholder="Scan Nodes..." className="w-full h-10 pl-10 pr-4 bg-white/5 rounded-xl border border-white/10 outline-none focus:ring-1 focus:ring-indigo-500/50 text-[10px] uppercase font-black tracking-widest transition-all" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
          {conversations.map((conv) => {
            const recId = conv.participants.find((p: string) => p !== user?.id);
            const isActive = selectedConv.id === conv.id;
            const recName = conv.recipientName || 'Nexus Node';
            return (
              <button
                key={conv.id}
                onClick={() => setSelectedConv({ id: conv.id, recipientId: recId, name: recName })}
                className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all duration-300 ${
                  isActive ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-white/10 text-gray-500'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${isActive ? 'bg-white/20' : 'bg-indigo-500/10 text-indigo-500'}`}>
                  {recName.charAt(0)}
                </div>
                <div className="flex-1 text-left min-w-0 pr-2">
                  <p className="font-bold text-[11px] uppercase tracking-tight truncate pb-0.5">{recName}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-60 truncate">Active Node</p>
                </div>
                {isActive && <div className="w-1 h-1 rounded-full bg-white animate-pulse" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace */}
      <div className={`flex-1 flex flex-col bg-white/5 relative h-full min-h-0 ${!selectedConv.id ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* Compact Header */}
        <div className="px-6 py-3 border-b border-white/10 bg-white/5 backdrop-blur-2xl flex items-center justify-between shrink-0">
           <div className="flex items-center gap-4">
              <button onClick={() => setSelectedConv({})} className="lg:hidden p-2 text-gray-500 hover:text-indigo-500 transition-colors"><ArrowLeft size={20} /></button>
              <div className="relative">
                 <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black text-lg">
                    {selectedConv.name?.charAt(0)}
                 </div>
                 <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-[#0f172a] ${onlineStatus ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              </div>
              <div>
                 <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none mb-1">{selectedConv.name}</h3>
                 <div className="flex items-center gap-2">
                    <p className="text-[7px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1"><Target size={8} /> RFQ: ODX-422</p>
                 </div>
              </div>
           </div>
           
           <div className="flex items-center gap-2">
              <button 
                onClick={() => setTranslateMode(!translateMode)}
                className={`h-8 px-3 rounded-lg border flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest transition-all ${translateMode ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white/5 border-white/10 text-gray-500 hover:text-indigo-500'}`}
              >
                 <Languages size={12} /> AI Translate
              </button>
              <button onClick={() => setShowNegotiation(!showNegotiation)} className="h-8 px-4 bg-black text-white rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:scale-105 transition-all">
                 <Handshake size={12} /> Negotiate
              </button>
              <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-white/10 text-gray-400"><MoreVertical size={14} /></button>
           </div>
        </div>

        {/* Message Feed - Optimized */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar"
        >
          {messages.map((msg, idx) => {
            const isMe = msg.senderId === user?.id;
            const isNegotiation = msg.content.includes('COUNTER-OFFER');
            return (
              <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                   <div className={`px-5 py-3 rounded-2xl text-[13px] leading-snug ${
                     isMe 
                       ? 'bg-indigo-600 text-white rounded-tr-none' 
                       : (isNegotiation ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-100 rounded-tl-none' : 'bg-white dark:bg-white/10 border border-white/10 text-gray-900 dark:text-white rounded-tl-none shadow-sm')
                   }`}>
                      <p className="font-bold">{translateMode && !isMe ? `[Translated]: ${msg.content}` : msg.content}</p>
                      
                      {isNegotiation && (
                         <div className="mt-3 p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/20 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                               <Scale size={14} className="text-emerald-500" />
                               <p className="text-[11px] font-black tracking-tighter">₹{offerPrice}/kg</p>
                            </div>
                            <button className="h-7 px-3 bg-emerald-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest">Accept</button>
                         </div>
                      )}
                   </div>
                   <div className="flex items-center gap-2 px-1">
                       <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       {isMe && <CheckCheck size={10} className="text-indigo-400" />}
                   </div>
                </div>
              </div>
            );
          })}
          {isTyping && (
             <div className="flex justify-start">
                <div className="bg-white/10 px-3 py-2 rounded-xl flex gap-1 items-center">
                   {[0, 1, 2].map(i => <div key={i} className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />)}
                </div>
             </div>
          )}
        </div>

        {/* Input Area - Compact */}
        <div className="p-4 border-t border-white/10 bg-white/5 shrink-0">
           <div className="flex items-center gap-3 bg-white/10 rounded-2xl border border-white/10 p-2 shadow-inner group">
              <button className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-white/10 text-gray-500 transition-all"><Paperclip size={16} /></button>
              <input 
                type="text" 
                placeholder="Secure message..." 
                className="flex-1 bg-transparent border-none outline-none text-[13px] font-bold text-gray-900 dark:text-white"
                value={input}
                onChange={(e) => { setInput(e.target.value); sendTyping(true); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className="h-9 px-5 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest disabled:opacity-40 transition-all shadow-lg shadow-indigo-600/20"
              >
                 Send
              </button>
           </div>
           <p className="text-[7px] font-black text-gray-500 uppercase tracking-[0.3em] mt-3 text-center opacity-40">RSA-2048 Encrypted Node-to-Node Stream</p>
        </div>

        {/* Negotiate Modal */}
        <AnimatePresence>
           {showNegotiation && (
              <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xl flex items-center justify-center p-6 text-white">
                 <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-xs bg-gray-900 border border-white/20 rounded-[32px] p-8 shadow-2xl space-y-6">
                    <div className="flex justify-between items-center">
                       <h3 className="text-xl font-display font-black uppercase tracking-tight italic">Delta Offer</h3>
                       <button onClick={() => setShowNegotiation(false)} className="h-8 w-8 bg-white/10 rounded-full flex items-center justify-center"><X size={16} /></button>
                    </div>
                    <div className="space-y-4">
                       <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                          <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest block mb-2">New Unit Bid (₹)</label>
                          <input type="text" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} className="bg-transparent border-none text-3xl font-display font-black text-indigo-500 outline-none w-full" />
                       </div>
                       <button onClick={handleNegotiation} className="w-full h-12 bg-indigo-600 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20">Broadcast Offer</button>
                    </div>
                 </motion.div>
              </div>
           )}
        </AnimatePresence>
      </div>

      {/* Right Snapshot - Slim */}
      <div className="hidden xl:flex w-72 border-l border-white/10 flex-col p-6 space-y-8 bg-white/5">
          <div className="space-y-4">
             <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Delta Analysis</h4>
             <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Response Speed</p>
                <p className="text-sm font-display font-black uppercase">~ 4 MIN</p>
             </div>
             <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1">Contract Odds</p>
                <p className="text-sm font-display font-black uppercase">96% SUCCESS</p>
             </div>
          </div>
          <div className="space-y-4">
             <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Evidence Vault</h4>
             <div className="space-y-2">
                {['Quote_ODX.pdf', 'Lab_Report.jpg'].map((d, i) => (
                   <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer">
                      <div className="flex items-center gap-2 min-w-0">
                         <FileText size={14} className="text-indigo-500" />
                         <p className="text-[9px] font-black uppercase truncate">{d}</p>
                      </div>
                      <Download size={12} className="text-gray-500" />
                   </div>
                ))}
             </div>
          </div>
      </div>

    </div>
  );
}
