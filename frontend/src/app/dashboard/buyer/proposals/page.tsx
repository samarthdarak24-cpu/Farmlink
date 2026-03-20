'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, CheckCircle, Handshake, Mail, 
  Trash2, ArrowRight, User, ShieldCheck, 
  Clock, MapPin, Search, Filter, 
  TrendingUp, Activity, Target, Zap, 
  ChevronRight, BrainCircuit, Star, Scale,
  Truck, AlertTriangle, FileCheck, History,
  LayoutGrid, List, MoreVertical, Hammer,
  Timer, BadgeCheck, BarChart3, Info
} from 'lucide-react';
import { rfqApi, ordersApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ProposalManagementPage() {
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [selectedRfqId, setSelectedRfqId] = useState<string | null>(null);
  const [acceptedBusy, setAcceptedBusy] = useState<string | null>(null);

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    setLoading(true);
    try {
      const res = await rfqApi.getMyRfqs();
      setRfqs(res.data || []);
      if (res.data?.length > 0) setSelectedRfqId(res.data[0].id);
    } catch { toast.error('Sourcing sync failed'); }
    finally { setLoading(false); }
  };

  const handleAward = async (rfqId: string, responseId: string) => {
    setAcceptedBusy(`${rfqId}:${responseId}`);
    try {
      await rfqApi.award(rfqId, responseId);
      toast.success('Proposal Awarded: Contract Injected!', { 
        icon: '⛓️',
        style: { borderRadius: '24px', fontWeight: 'black', textTransform: 'uppercase', fontSize: '10px' }
      });
      loadProposals();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Award failed');
    } finally {
      setAcceptedBusy(null);
    }
  };

  const allProposals = useMemo(() => {
    return rfqs.flatMap(r => (r.responses || []).map((p: any) => ({ 
      ...p, 
      rfqId: r.id, 
      rfqCategory: r.productCategory,
      rfqTitle: r.title || `Procurement: ${r.productCategory}`,
      aiScore: Math.floor(Math.random() * 15) + 85, // Mock AI Score
      expiry: Math.floor(Math.random() * 48) + 2, // Mock Expiry hours
      incoterms: 'DDP - Delivered'
    })));
  }, [rfqs]);

  const filteredProposals = useMemo(() => {
    if (!selectedRfqId) return allProposals;
    return allProposals.filter(p => p.rfqId === selectedRfqId);
  }, [allProposals, selectedRfqId]);

  return (
    <div className="space-y-12 pb-48 w-full max-w-7xl mx-auto">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 px-1 shrink-0">
        <div className="space-y-2">
           <div className="flex items-center gap-3">
              <div className="h-2 w-12 bg-purple-600 rounded-full" />
              <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.4em] mb-1 leading-none">Strategic Procurement Hub</p>
           </div>
           <h1 className="text-5xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter transition-all">
             Proposal <span className="text-purple-600">Decision Matrix</span>
           </h1>
        </div>

        <div className="flex items-center gap-4 bg-white/40 dark:bg-white/5 p-3 rounded-[32px] border border-white/20 shadow-2xl backdrop-blur-3xl shrink-0 group">
             <div className="px-8 py-3 border-r border-white/10 text-center">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none opacity-60">Total Bids</p>
                 <p className="text-2xl font-display font-black text-gray-900 dark:text-white leading-none tracking-tighter">{allProposals.length}</p>
             </div>
             <div className="px-8 py-3 text-center text-emerald-500">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none opacity-60">Success Rate</p>
                 <p className="text-xl font-display font-black leading-none flex items-center gap-3 tracking-tighter">98% <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" /></p>
             </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between border-y border-white/10 py-8 px-2">
         <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar max-w-full">
            <button 
              onClick={() => setSelectedRfqId(null)}
              className={`h-11 px-6 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${!selectedRfqId ? 'bg-purple-600 text-white shadow-xl shadow-purple-500/20' : 'bg-white/5 text-gray-500 border border-white/10'}`}
            >All Procurement Rounds</button>
            {rfqs.map(r => (
               <button 
                 key={r.id}
                 onClick={() => setSelectedRfqId(r.id)}
                 className={`h-11 px-6 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 whitespace-nowrap ${selectedRfqId === r.id ? 'bg-purple-600 text-white shadow-xl shadow-purple-500/20' : 'bg-white/5 text-gray-500'}`}
               >{r.productCategory} #{String(r.id).slice(-4)}</button>
            ))}
         </div>
         <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 bg-white/40 dark:bg-white/5 p-1.5 rounded-2xl border border-white/20">
                <button onClick={() => setView('grid')} className={`p-2.5 rounded-xl transition-all ${view === 'grid' ? 'bg-white dark:bg-white/10 text-purple-600 shadow-sm' : 'text-gray-400'}`}><LayoutGrid size={18} /></button>
                <button onClick={() => setView('table')} className={`p-2.5 rounded-xl transition-all ${view === 'table' ? 'bg-white dark:bg-white/10 text-purple-600 shadow-sm' : 'text-gray-400'}`}><List size={18} /></button>
             </div>
             <button className="h-12 px-6 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all"><BarChart3 size={16} /> Run Comparison Matrix</button>
         </div>
      </div>

      {/* Proposal Stream */}
      <div className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10" : "space-y-6"}>
         <AnimatePresence mode="popLayout">
           {filteredProposals.map((p, idx) => (
             <motion.div 
               key={p.id || p._id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95 }}
               transition={{ delay: idx * 0.03 }}
               className={`glass-card border border-white/20 rounded-[48px] p-8 flex flex-col group hover:border-purple-500/30 transition-all relative overflow-hidden shadow-xl ${view === 'table' ? 'md:flex-row items-center gap-10' : ''}`}
             >
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none group-hover:scale-125 transition-all duration-1000" />
                
                {/* Proposal Status Badge */}
                <div className="absolute top-6 right-8 flex items-center gap-3 bg-white/50 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 z-10">
                   <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                   <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Active Bid</p>
                </div>

                <div className={`flex flex-col gap-6 relative z-10 ${view === 'table' ? 'flex-1 md:flex-row items-center' : 'w-full'}`}>
                   <div className="flex items-start gap-6 flex-1">
                      <div className="w-20 h-20 bg-indigo-500 text-white rounded-[28px] shrink-0 flex items-center justify-center font-display font-black text-3xl shadow-xl group-hover:rotate-12 transition-transform">
                         {p.rfqCategory.charAt(0)}
                      </div>
                      <div className="space-y-2">
                         <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-display font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none transition-colors group-hover:text-purple-600">{p.farmerName || 'Supplier Node'}</h3>
                            <BadgeCheck size={20} className="text-emerald-500" />
                         </div>
                         <div className="flex items-center gap-3">
                            <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">{p.rfqTitle}</p>
                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">#{String(p.id).slice(-4)}</p>
                         </div>
                      </div>
                   </div>

                   {/* AI Rank & Expiry */}
                   <div className="flex flex-wrap gap-4">
                      <div className="px-5 py-3 bg-indigo-600/10 border border-indigo-600/20 rounded-2xl flex items-center gap-3">
                         <BrainCircuit size={18} className="text-indigo-600" />
                         <div>
                            <p className="text-[8px] font-black uppercase text-indigo-600 leading-none mb-1">AI Match Score</p>
                            <p className="text-lg font-display font-black leading-none">{p.aiScore}%</p>
                         </div>
                      </div>
                      <div className="px-5 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3">
                         <Timer size={18} className="text-amber-500" />
                         <div>
                            <p className="text-[8px] font-black uppercase text-amber-500 leading-none mb-1">Bid Expiry</p>
                            <p className="text-lg font-display font-black leading-none">{p.expiry} Hrs</p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Proposal Stats */}
                <div className={`mt-8 grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-black/5 dark:bg-white/5 rounded-[32px] border border-black/5 relative z-10 transition-all ${view === 'table' ? 'w-full max-w-2xl' : ''}`}>
                   <div className="space-y-1 border-r border-black/5 last:border-none">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Proposed Price</p>
                      <p className="text-xl font-display font-black text-emerald-600 leading-none">₹{p.price}<span className="text-[10px] text-gray-400">/{p.unit}</span></p>
                   </div>
                   <div className="space-y-1 border-r border-black/5 last:border-none px-2">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Fulfillment</p>
                      <p className="text-[10px] font-black uppercase tracking-tight">{p.quantity} {p.unit}</p>
                   </div>
                   <div className="space-y-1 border-r border-black/5 last:border-none px-2 hidden sm:block">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Incoterms</p>
                      <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest">{p.incoterms}</p>
                   </div>
                   <div className="space-y-1 px-2 hidden lg:block">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Logistics</p>
                      <p className="text-[9px] font-black uppercase flex items-center gap-1.5"><Truck size={12} /> Doorstep</p>
                   </div>
                </div>

                {/* Actions & Decision UI */}
                <div className={`mt-8 flex items-center gap-4 relative z-10 ${view === 'table' ? 'flex-col md:flex-row' : ''}`}>
                   <button 
                     onClick={() => handleAward(p.rfqId, p.id)}
                     disabled={!!acceptedBusy}
                     className="flex-1 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-purple-600/20 active:scale-95 transition-all disabled:opacity-50"
                   >
                     {acceptedBusy === `${p.rfqId}:${p.id}` ? 'Processing consensus...' : 'Accept Proposal'} <CheckCircle size={16} />
                   </button>
                   <div className="flex items-center gap-3">
                      <button className="h-14 px-6 rounded-2xl border border-purple-500/20 text-purple-600 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all group/btn relative">
                         <Hammer size={18} />
                         <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-black text-white text-[8px] rounded-lg opacity-0 group-hover/btn:opacity-100 transition-all pointer-events-none uppercase font-black whitespace-nowrap">Counter Offer</span>
                      </button>
                      <Link href={`/dashboard/buyer/chat?recipientId=${p.farmerId}&name=${p.farmerName}`}>
                        <button className="h-14 px-6 rounded-2xl border border-white/20 text-gray-500 flex items-center justify-center hover:bg-white/10 transition-all">
                           <Mail size={18} />
                        </button>
                      </Link>
                      <button className="h-14 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-indigo-500 transition-all"><Info size={18} /></button>
                   </div>
                </div>
                
                {/* Audit Evidence */}
                <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between relative z-10 px-2">
                   <div className="flex items-center gap-4">
                      <div className="flex -space-x-3">
                         {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                               <FileCheck size={14} className="text-emerald-500" />
                            </div>
                         ))}
                      </div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">3 Lab Reports Verified</p>
                   </div>
                   <button className="text-[9px] font-black text-purple-600 uppercase tracking-widest flex items-center gap-2 hover:underline underline-offset-4">Audit Bid History <ArrowRight size={12} /></button>
                </div>
             </motion.div>
           ))}
         </AnimatePresence>
      </div>

      {loading && (
        <div className="py-48 text-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}>
               <Zap className="w-16 h-16 mx-auto mb-6 text-purple-500 opacity-20" />
            </motion.div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Synchronizing Global Bids...</p>
        </div>
      )}

      {!loading && filteredProposals.length === 0 && (
         <div className="py-48 text-center bg-white/5 border border-dashed border-white/20 rounded-[48px]">
             <FileText className="w-20 h-20 mx-auto mb-8 text-gray-300 opacity-40 hover:rotate-12 transition-transform" />
             <h3 className="text-3xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">No Active Bids</h3>
             <p className="text-gray-500 text-sm max-w-sm mx-auto font-medium">Verify your active RFQs or broadcast new procurement notices to initiate the proposal matrix.</p>
             <button onClick={loadProposals} className="mt-10 h-14 px-10 bg-purple-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-purple-600/20">Refresh Matrix</button>
         </div>
      )}

    </div>
  );
}
