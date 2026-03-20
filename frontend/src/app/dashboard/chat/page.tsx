'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Search, MessageCircle, User, MessageSquare, Clock, 
  ArrowLeft, RefreshCw, Layers, Sparkles, Filter, Settings,
  Users, CheckCircle2, ShieldCheck, Zap, MoreVertical
} from 'lucide-react';
import { ordersApi, messagesApi } from '@/lib/api';
import { useAuthZustand } from '@/store/authZustand';
import ChatRoom from '@/components/dashboard/chat/ChatRoom';
import { useOfflineCache } from '@/hooks/useOfflineCache';

export default function ChatPage() {
  const { user } = useAuthZustand();
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived'>('all');

  const convsState = useOfflineCache<any[]>('farmer-conversations-v2', async () => {
    try {
      const res = await messagesApi.getConversations();
      return res.data || [];
    } catch {
      return [];
    }
  });

  const conversations = convsState.data || [];

  const filteredConvs = conversations.filter(c => {
    const name = (c.recipientName || 'Buyer').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = name.includes(query);
    if (activeTab === 'unread') return matchesSearch && (c.unreadCounts?.[user?.id || ''] > 0);
    return matchesSearch;
  });

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white flex items-center gap-4 uppercase tracking-tighter">
            <MessageCircle className="w-10 h-10 text-primary-600" />
            Communication Hub
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1 pl-1">
            End-to-End Encrypted Discussions • Institutional Trade Terminals
          </p>
        </motion.div>
        
        <div className="flex items-center gap-3">
           <div className="px-5 py-3 bg-white/40 dark:bg-white/5 border border-white/20 rounded-2xl flex items-center gap-3 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300">Live Trade Node Active</span>
           </div>
           <button 
             onClick={() => convsState.reload()}
             className="p-3 bg-primary-600 text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
           >
             <RefreshCw className={convsState.loading ? 'animate-spin' : ''} size={20} />
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden glass-card border border-white/20 rounded-[48px] shadow-2xl relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Sidebar: Message Threads */}
        <div className={`w-full lg:w-[420px] flex flex-col border-r border-white/10 dark:border-gray-800/50 bg-white/10 dark:bg-gray-900/10 z-10 ${selectedConv ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                   <Users size={12} /> Recent Bargains
                </p>
                <div className="flex gap-2">
                   <button className="p-2 text-gray-400 hover:text-primary-500 transition-colors"><Filter size={14} /></button>
                   <button className="p-2 text-gray-400 hover:text-primary-500 transition-colors"><Settings size={14} /></button>
                </div>
              </div>
              
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search buyer identity or trade ID..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-14 h-16 w-full bg-white/60 dark:bg-white/5 border border-white/10 rounded-2xl text-sm font-bold shadow-inner"
                />
              </div>

              <div className="flex gap-3">
                 {['all', 'unread', 'archived'].map((t: any) => (
                    <button 
                      key={t} onClick={() => setActiveTab(t)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-primary-600 text-white shadow-lg' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                    >
                       {t}
                    </button>
                 ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
               {convsState.loading ? (
                    <div className="py-24 text-center">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}>
                           <RefreshCw className="w-10 h-10 mx-auto mb-4 text-primary-500 opacity-30" />
                        </motion.div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Synchronizing Local Node...</p>
                    </div>
               ) : filteredConvs.length === 0 ? (
                    <div className="py-24 text-center opacity-40 px-10">
                        <MessageSquare className="w-16 h-16 mx-auto mb-6 text-gray-300" />
                        <h4 className="text-lg font-display font-black uppercase tracking-tighter mb-2 text-gray-900 dark:text-white">Quiet Channels</h4>
                        <p className="text-xs font-medium">Verify your RFQ responses or open active orders to initiate negotiations.</p>
                    </div>
               ) : (
                  filteredConvs.map((conv, idx) => {
                    const recName = conv.recipientName || 'Buyer Node';
                    const isSelected = selectedConv?.id === conv.id;
                    const unread = conv.unreadCounts?.[user?.id || ''] || 0;
                    
                    return (
                      <motion.button 
                        key={conv.id}
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                        onClick={() => setSelectedConv({
                           id: conv.id || conv._id,
                           recipientId: conv.participants.find((p: string) => p !== user?.id),
                           recipientName: recName
                        })}
                        className={`w-full p-6 rounded-[32px] flex items-center gap-5 transition-all relative overflow-hidden group border ${
                          isSelected 
                            ? 'bg-primary-600 border-primary-500 shadow-2xl shadow-primary-500/30' 
                            : 'bg-white/40 dark:bg-white/5 border-white/10 hover:border-primary-500/40 hover:bg-white'
                        }`}
                      >
                        <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-display font-black flex-shrink-0 transition-transform group-hover:scale-110 ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}`}>
                           {recName.charAt(0)}
                           {conv.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-gray-900 rounded-full" />
                           )}
                        </div>

                        <div className="flex-1 text-left min-w-0 pr-2">
                          <div className="flex items-center justify-between gap-4 mb-1">
                             <h4 className={`text-sm font-black truncate uppercase tracking-tight ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                               {recName}
                             </h4>
                             {conv.lastMessageAt && (
                                <span className={`text-[9px] font-black shrink-0 ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                                  {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                             )}
                          </div>
                          <p className={`text-[11px] truncate font-medium ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                            {conv.lastMessage || 'Open trade channel...'}
                          </p>
                        </div>
                        
                        {unread > 0 && (
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 bg-rose-500 text-white text-[10px] font-black rounded-lg flex items-center justify-center shadow-lg animate-bounce">
                             {unread}
                          </div>
                        )}
                      </motion.button>
                    );
                  })
               )}
            </div>
        </div>

        {/* Major Chat Workspace */}
        <div className={`flex-1 flex flex-col bg-gray-50/10 dark:bg-black/20 relative z-20 ${!selectedConv ? 'hidden lg:flex' : 'flex'}`}>
           <AnimatePresence mode="wait">
              {selectedConv ? (
                <motion.div 
                  key={selectedConv.id}
                  initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                  className="flex flex-col h-full"
                >
                    {/* Workspace HUD */}
                    <div className="p-6 flex items-center justify-between border-b border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-3xl">
                        <div className="flex items-center gap-6">
                           <button onClick={() => setSelectedConv(null)} className="lg:hidden p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 transition-colors">
                              <ArrowLeft className="w-5 h-5" />
                           </button>
                           <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center text-white font-display font-black text-2xl shadow-xl">
                             {selectedConv.recipientName.charAt(0)}
                           </div>
                           <div>
                              <div className="flex items-center gap-3">
                                 <h4 className="text-xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
                                   {selectedConv.recipientName}
                                 </h4>
                                 <span className="px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest rounded-md shadow-sm">Verified Node</span>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                 <p className="text-[10px] uppercase font-black text-emerald-600 dark:text-emerald-400 tracking-[0.2em] leading-none">Active Stream Syncing</p>
                              </div>
                           </div>
                        </div>

                        <div className="hidden sm:flex items-center gap-6">
                            <div className="text-right">
                               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Contract Status</p>
                               <span className="text-[10px] font-bold text-gray-900 dark:text-white uppercase">Waiting For Consensus</span>
                            </div>
                            <button className="w-12 h-12 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-primary-600 hover:border-primary-500/50 transition-all">
                               <MoreVertical size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Chat Virtual Space */}
                    <div className="flex-1 overflow-hidden relative">
                       <ChatRoom 
                          conversationId={selectedConv.id} 
                          recipientId={selectedConv.recipientId} 
                          recipientName={selectedConv.recipientName} 
                       />
                    </div>
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-80 group relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-500/5 rounded-full blur-[100px] pointer-events-none" />
                   
                   <div className="w-32 h-32 bg-primary-100 dark:bg-white/5 text-primary-600 rounded-[40px] flex items-center justify-center mb-10 border-2 border-dashed border-primary-200 dark:border-white/10 group-hover:rotate-12 transition-transform duration-700">
                      <Zap className="w-16 h-16" />
                   </div>
                   
                   <h3 className="text-4xl font-display font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">Trade Terminal Offline</h3>
                   <p className="max-w-md text-gray-500 text-sm font-medium leading-relaxed">
                      Initialize a direct neural link to manage price negotiations, institutional trade logistics, and blockchain-anchored consensus.
                   </p>
                   
                   <div className="mt-12 flex flex-wrap justify-center gap-4">
                      {[
                        { icon: ShieldCheck, label: 'Encrypted' },
                        { icon: CheckCircle2, label: 'Verified' },
                        { icon: Layers, label: 'Ledger Sync' }
                      ].map((item, i) => (
                        <div key={i} className="px-5 py-2.5 bg-white/50 dark:bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                           <item.icon size={14} className="text-primary-500" /> {item.label}
                        </div>
                      ))}
                   </div>
                </div>
              )}
           </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
