'use client';

import { useState } from 'react';
import ChatRoom from '@/components/dashboard/chat/ChatRoom';
import { motion } from 'framer-motion';
import { 
  MessageSquare, Zap, Globe, Target, 
  ShieldCheck, Activity, Search, Filter, 
  MoreVertical, CheckSquare, Clock, Handshake,
  Lock, ArrowLeftRight, MessagesSquare, Share2,
  Cpu
} from 'lucide-react';

export default function BuyerChatPage() {
  return (
    <div className="h-[calc(100vh-120px)] flex flex-col pb-4">
      
      {/* Streamlined Header */}
      <div className="flex items-center justify-between mb-6 px-2 shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
             <Cpu size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter">
              Negotiation <span className="text-indigo-600">Decision Hub</span>
            </h1>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.4em] leading-none mt-1">Institutional Sourcing Protocol v2.4</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
             <div className="px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-full flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Secure Node Sync Active</span>
             </div>
             <div className="px-4 py-2 bg-indigo-500/5 border border-indigo-500/10 rounded-full flex items-center gap-2">
                 <Lock size={12} className="text-indigo-500 opacity-60" />
                 <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">RSA-2048 Encrypted</span>
             </div>
        </div>
      </div>

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 min-h-0 glass-card border border-white/20 rounded-[40px] overflow-hidden shadow-2xl relative bg-white/5"
      >
         <div className="h-full w-full relative z-10">
            <ChatRoom />
         </div>
      </motion.div>

    </div>
  );
}
