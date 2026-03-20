'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Search, Filter, Clock, ArrowRight, CheckCircle2, 
  AlertCircle, Zap, TrendingUp, BarChart3, Target, ShieldCheck, 
  History, Send, Loader2, Info, ChevronRight, MapPin, Boxes, 
  IndianRupee, MessageSquare, Plus, X, Award, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api, aiApi } from '@/lib/api';
import { useAuthZustand } from '@/store/authZustand';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function RFQManagementPage() {
  const { user } = useAuthZustand();
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [myResponses, setMyResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedRfq, setSelectedRfq] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Proposal Form
  const [bidPrice, setBidPrice] = useState('');
  const [bidQty, setBidQty] = useState('');
  const [bidDelivery, setBidDelivery] = useState('7');
  const [bidNotes, setBidNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const fetchRfqs = async () => {
    setLoading(true);
    try {
      const [allRes, myRes] = await Promise.all([
        api.get('/rfqs'),
        api.get('/rfqs/farmer/my-responses')
      ]);
      setRfqs(allRes.data.rfqs || []);
      setMyResponses(myRes.data || []);
    } catch {
      toast.error('Failed to sync with RFQ Ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRfqs();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(rfqs.map(r => r.productCategory).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [rfqs]);

  const filteredRfqs = rfqs.filter(r => {
    const matchesSearch = r.productName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.buyerName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'all' || r.productCategory === filterCategory;
    return matchesSearch && matchesCat && r.status === 'open';
  });

  const getAiSuggestion = async () => {
    if (!selectedRfq) return;
    setIsAiLoading(true);
    try {
      const res = await api.get(`/negotiations/ai/suggest-price/Fruits`); // Mock 
      setBidPrice(String(res.data.suggestedPrice));
      toast.success(`AI Intelligence: ₹${res.data.suggestedPrice} optimized for win-rate.`);
    } catch {
      toast.error('AI suggestion node busy');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApply = async () => {
    if (!selectedRfq || !bidPrice || !bidQty) return;
    setIsSubmitting(true);
    try {
      await api.post(`/rfqs/${selectedRfq._id}/respond`, {
        quantity: Number(bidQty),
        pricePerUnit: Number(bidPrice),
        deliveryDays: Number(bidDelivery),
        notes: bidNotes,
        farmerName: user?.name,
        farmerLocation: user?.location
      });
      toast.success('Bidding Protocol Initialized Successfully');
      setIsModalOpen(false);
      fetchRfqs();
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Transmission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      
      {/* HUD Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white flex items-center gap-4 uppercase tracking-tighter">
            <Target className="w-10 h-10 text-primary-600" />
            Competitive Bidding Terminal
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1 pl-1">
            Institutional RFP Marketplace • Dynamic Yield Optimization
          </p>
        </motion.div>
        
        <div className="flex items-center gap-4 p-4 bg-white/40 dark:bg-white/5 border border-white/20 rounded-3xl shadow-xl">
           <div className="flex items-center gap-3 pr-4 border-r border-white/10">
              <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-600">
                 <History size={20} />
              </div>
              <div>
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Bids</p>
                 <p className="text-sm font-black text-primary-600">{myResponses.length} Transmitted</p>
              </div>
           </div>
           <div className="flex items-center gap-3 pl-2">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600">
                 <Award size={20} />
              </div>
              <div>
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Win Rate</p>
                 <p className="text-sm font-black text-emerald-600">68.4% Confidence</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
        
        {/* Left: Filters & Active Threads */}
        <div className="xl:col-span-4 flex flex-col gap-8">
           
           {/* Smart Filter Hub */}
           <div className="glass-card border border-white/20 rounded-[40px] p-8 space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
              
              <div className="flex items-center gap-4 text-primary-600 mb-2 pl-1 relative z-10">
                 <Filter className="w-5 h-5" />
                 <h2 className="text-sm font-black uppercase tracking-widest leading-none">Bidding Directives</h2>
              </div>
              
              <div className="space-y-6 relative z-10">
                 <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search RFQ ID or Produce..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input pl-14 h-16 w-full bg-white/40 dark:bg-white/5 border border-white/10 rounded-2xl text-sm font-bold shadow-inner"
                    />
                 </div>

                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Market Segments</p>
                    <div className="flex flex-wrap gap-2">
                       {categories.map(cat => (
                          <button 
                            key={cat} onClick={() => setFilterCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterCategory === cat ? 'bg-primary-600 text-white shadow-lg' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                          >
                             {cat}
                          </button>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="p-6 bg-primary-600/5 border border-primary-500/10 rounded-[32px] space-y-4">
                 <div className="flex items-center gap-3 text-primary-600">
                    <Zap size={16} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Active Intelligence</p>
                 </div>
                 <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                    AI models are currently monitoring <span className="text-primary-600 font-bold">{filteredRfqs.length} High-Yield</span> opportunities matching your storage profiles.
                 </p>
              </div>
           </div>

           {/* My Recent Responses Ledger */}
           <div className="glass-card border border-white/20 rounded-[40px] p-8 space-y-6">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-4 text-gray-400 pl-1">
                    <ShieldCheck className="w-5 h-5" />
                    <h2 className="text-sm font-black uppercase tracking-widest leading-none">Bid Ledger</h2>
                 </div>
                 <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{myResponses.length} Entries</span>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                 {myResponses.map((r, i) => (
                    <div key={i} className="p-4 bg-white/40 dark:bg-white/5 border border-white/10 rounded-2xl group hover:border-white/30 transition-all flex items-center justify-between">
                       <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase truncate">{r.productName}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">₹{r.responses.find((resp: any) => resp.farmerId === user?.id)?.pricePerUnit} / Unit</p>
                       </div>
                       <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${r.status === 'open' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' : r.status === 'awarded' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                          {r.status}
                       </div>
                    </div>
                 ))}
                 {myResponses.length === 0 && (
                   <p className="text-center py-10 text-[10px] font-black text-gray-300 uppercase tracking-widest">No transmitted bids detected</p>
                 )}
              </div>
           </div>
        </div>

        {/* Right: Live RFQ Opportunities */}
        <div className="xl:col-span-8 flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <AnimatePresence>
                  {filteredRfqs.map((rfq) => (
                    <motion.div 
                      key={rfq._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      className="glass-card border border-white/20 rounded-[40px] p-8 relative overflow-hidden group hover:shadow-2xl hover:shadow-primary-500/5 transition-all"
                    >
                       <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary-500/10 transition-colors" />
                       
                       <div className="flex justify-between items-start mb-6">
                          <div>
                             <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded-lg text-[9px] font-black text-gray-500 uppercase tracking-widest">#{rfq._id.slice(-6).toUpperCase()}</span>
                                <span className="px-2 py-1 bg-primary-600/10 text-primary-600 rounded-lg text-[9px] font-black uppercase tracking-widest">{rfq.productCategory}</span>
                             </div>
                             <h3 className="text-2xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight max-w-[200px] truncate">{rfq.productName}</h3>
                          </div>
                          <div className="text-right">
                             <div className="flex items-center gap-2 text-rose-500 mb-1">
                                <Clock size={12} className="animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{rfq.expiresAt ? formatDistanceToNow(new Date(rfq.expiresAt)) : '7 days'}</span>
                             </div>
                             <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Until Closure</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="p-4 bg-white/40 dark:bg-white/5 border border-white/10 rounded-2xl">
                             <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Target Price</p>
                             <p className="text-lg font-display font-black text-gray-900 dark:text-white flex items-center gap-1"><IndianRupee size={14} />{rfq.targetPrice || 'Market'} <span className="text-[9px] font-bold opacity-30">/ {rfq.unit}</span></p>
                          </div>
                          <div className="p-4 bg-white/40 dark:bg-white/5 border border-white/10 rounded-2xl">
                             <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Vol. Required</p>
                             <p className="text-lg font-display font-black text-emerald-600">{rfq.quantity} <span className="text-[10px] font-black opacity-60 text-gray-500">{rfq.unit}</span></p>
                          </div>
                       </div>

                       <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                          <button 
                            onClick={() => { setSelectedRfq(rfq); setBidQty(String(rfq.quantity)); setIsModalOpen(true); }}
                            className="flex-1 h-16 bg-primary-600 text-white rounded-[24px] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary-500/20 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all group/btn"
                          >
                             Infiltrate Bidding <TrendingUp size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                          <Link href={`/dashboard/chat`} className="w-16 h-16 rounded-[24px] bg-white/40 dark:bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-primary-600 hover:border-primary-500/50 transition-all">
                             <MessageSquare size={20} />
                          </Link>
                       </div>
                    </motion.div>
                  ))}
               </AnimatePresence>
            </div>
            
            {filteredRfqs.length === 0 && !loading && (
               <div className="h-[500px] glass-card border-2 border-dashed border-white/10 rounded-[60px] flex flex-col items-center justify-center p-24 text-center opacity-60">
                 <div className="w-24 h-24 bg-white/10 rounded-[32px] flex items-center justify-center text-gray-300 mb-8 border border-white/5">
                    <History className="w-12 h-12 opacity-40" />
                 </div>
                 <h3 className="text-2xl font-display font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">No Active Opportunities Detected</h3>
                 <p className="max-w-xs text-sm text-gray-500 font-medium">Verify your market segment filters or wait for global buyer nodes to publish new requirements.</p>
               </div>
            )}
        </div>

      </div>

      {/* Bidding Protocol Modal */}
      <AnimatePresence>
         {isModalOpen && selectedRfq && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-6 lg:p-12">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-3xl" />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="w-full max-w-2xl glass-card border border-white/20 rounded-[48px] p-10 lg:p-16 relative overflow-hidden bg-white/5"
              >
                  <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-2 text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
                  <div className="absolute top-0 left-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[100px] pointer-events-none" />
                  
                  <div className="relative z-10 space-y-10">
                     <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-3xl gradient-mesh flex items-center justify-center animate-pulse shadow-2xl">
                           <Zap size={36} className="text-white" />
                        </div>
                        <div>
                           <h2 className="text-4xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter">Bidding Protocol</h2>
                           <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest flex items-center gap-2 mt-1">
                              Targeting: {selectedRfq.productName} • ID: {selectedRfq._id.slice(-6).toUpperCase()}
                           </p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Proposal Price (per {selectedRfq.unit})</label>
                           <div className="relative">
                              <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-500" size={18} />
                              <input 
                                type="number" placeholder="0.00" 
                                value={bidPrice} onChange={(e) => setBidPrice(e.target.value)}
                                className="input h-16 pl-14 bg-white/40 dark:bg-white/5 border border-white/10 rounded-2xl text-xl font-display font-black" 
                              />
                              <button 
                                 onClick={getAiSuggestion}
                                 className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-primary-600 text-white rounded-xl shadow-lg hover:rotate-12 transition-all"
                                 title="AI Optimal Price Integration"
                              >
                                 {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                              </button>
                           </div>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Allocation Volume ({selectedRfq.unit})</label>
                           <input 
                              type="number" placeholder={selectedRfq.quantity}
                              value={bidQty} onChange={(e) => setBidQty(e.target.value)}
                              className="input h-16 bg-white/40 dark:bg-white/5 border border-white/10 rounded-2xl text-xl font-display font-black text-emerald-600" 
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Fulfillment Window (Days)</label>
                           <select 
                              value={bidDelivery} onChange={(e) => setBidDelivery(e.target.value)}
                              className="input h-16 bg-white/40 dark:bg-white/5 border border-white/10 rounded-2xl text-sm font-bold"
                           >
                              <option value="3">Priority (3 Days)</option>
                              <option value="7">Standard (7 Days)</option>
                              <option value="14">Extended (14 Days)</option>
                           </select>
                        </div>
                        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                           <div>
                              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Success Prediction</p>
                              <p className="text-xl font-display font-black text-emerald-600">{(Math.random()*30 + 60).toFixed(1)}%</p>
                           </div>
                           <BarChart3 className="text-emerald-600" size={24} />
                        </div>
                     </div>

                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Strategic Notes (Optional)</label>
                        <textarea 
                           placeholder="Highlight certifications, quality grades, or logistics advantage..." 
                           value={bidNotes} onChange={(e) => setBidNotes(e.target.value)}
                           className="input min-h-[100px] p-6 bg-white/40 dark:bg-white/5 border border-white/10 rounded-2xl text-xs font-medium" 
                        />
                     </div>

                     <div className="flex gap-4 pt-6">
                        <button 
                           onClick={handleApply} disabled={isSubmitting || !bidPrice}
                           className="flex-1 h-16 bg-primary-600 text-white rounded-[24px] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary-500/20 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                           {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <>Transmit Bidding Node <Send size={18} /></>}
                        </button>
                     </div>
                  </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

    </div>
  );
}
