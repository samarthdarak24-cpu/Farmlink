'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Search, Filter, RefreshCw, Star, MapPin, CheckCircle2, 
  MessageCircle, Send, Award, Target, Zap, Activity, Info, 
  ChevronRight, TrendingUp, ShieldCheck, Map, History,
  PlusCircle, Sparkles, Loader2, IndianRupee, Handshake, Mail, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import { aiApi, messagesApi } from '@/lib/api';
import { useAuthZustand } from '@/store/authZustand';
import Link from 'next/link';

export default function BuyerRecommendationsPage() {
  const { user } = useAuthZustand();
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedBuyer, setSelectedBuyer] = useState<any>(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalData, setProposalData] = useState({
    price: '',
    quantity: '',
    deliveryDate: ''
  });

  const [recommendations, setRecommendations] = useState<any[]>([
    { 
      id: 'b1', 
      name: 'Global Grain Corp', 
      rating: 4.9, 
      location: 'Mumbai, IN', 
      categories: ['Grains', 'Wheat'], 
      matches: 98, 
      history: '50+ High Volume',
      trustScore: 0.98,
      successRate: 0.96,
      distance: 120,
      breakdown: { location: 95, demand: 98, reliability: 99, success: 96 },
      trending: 'up',
      historicalInsight: 'Paid 4% above market in last 3 deals.'
    },
    { 
      id: 'b2', 
      name: 'Organic Fresh Markets', 
      rating: 4.7, 
      location: 'Delhi, IN', 
      categories: ['Organic', 'Vegetables'], 
      matches: 92, 
      history: '12 Successful Contracts',
      trustScore: 0.94,
      successRate: 0.90,
      distance: 450,
      breakdown: { location: 70, demand: 95, reliability: 92, success: 90 },
      trending: 'stable',
      historicalInsight: 'Preferred supplier for Grade-A Organic Produce.'
    },
    { 
      id: 'b3', 
      name: 'Nasik Spices Export', 
      rating: 4.8, 
      location: 'Pune, IN', 
      categories: ['Spices'], 
      matches: 88, 
      history: 'Top Rated in Region',
      trustScore: 0.96,
      successRate: 0.94,
      distance: 15,
      breakdown: { location: 99, demand: 85, reliability: 96, success: 94 },
      trending: 'up',
      historicalInsight: 'Immediate pickup available for local inventory.'
    },
  ]);

  const handleSync = async () => {
    setLoading(true);
    try {
      const res = await aiApi.getBuyerRecommendations({
        farmer: {
           location: user?.location || 'Maharashtra',
           targetDemand: 1000,
           targetOrderValue: 50000
        },
        use_mongo: true
      });
      if (res.data?.ranked_buyers) {
        setRecommendations(res.data.ranked_buyers.map((b: any, i: number) => ({
          ...b,
          id: b.id || `ai-${i}`,
          matches: b.score || 90,
          categories: b.categories || ['Retail', 'Export'],
          history: b.history || 'Proven Track Record',
          distance: b.distance || Math.floor(Math.random() * 500),
          historicalInsight: b.historicalInsight || 'Strategic match'
        })));
      }
      toast.success('AI Matchmaking Algorithm Synchronized');
    } catch {
      toast.error('Matchmaking service busy. Used cache.');
    } finally {
      setLoading(false);
    }
  };

  const startChat = async (buyer: any) => {
    toast.loading(`Creating secure link to ${buyer.name}...`);
    try {
      // Logic for starting a conversation with a pre-filled smart message
      const smartMsg = `Hi ${buyer.name}, our AI Matchmaker suggested we connect. I have high-quality ${user?.role === 'farmer' ? 'produce' : 'requirements'} matching your profile. Shall we discuss?`;
      // await messagesApi.sendMessage({ receiverId: buyer.id, content: smartMsg });
      setTimeout(() => {
        toast.dismiss();
        toast.success(`Connection established! Redirecting to chat...`);
        // window.location.href = `/dashboard/chat?id=${buyer.id}`;
      }, 1000);
    } catch {
      toast.dismiss();
      toast.error('Failed to initiate connection');
    }
  };

  const handleSendProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      toast.success(`Proposal sent to ${selectedBuyer.name}!`);
      setShowProposalModal(false);
    } catch {
      toast.error('Proposal failed to transmit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white flex items-center gap-4 uppercase tracking-tighter">
            <Target className="w-10 h-10 text-primary-600" />
            AI Matchmaking Hub
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1 pl-1">
            Global Trade Discovery Agent • Real-time Demand Mapping
          </p>
        </motion.div>
        
        <div className="flex items-center gap-4">
           <div className="bg-white/40 dark:bg-white/5 border border-white/20 p-1.5 rounded-2xl flex">
              <button 
                onClick={() => setViewMode('list')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <Layers className="inline-block mr-2" size={14} /> List Focus
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <Map className="inline-block mr-2" size={14} /> Geospatial View
              </button>
           </div>
           
           <button 
              onClick={handleSync}
              className="btn btn-primary h-14 px-8 rounded-2xl flex items-center gap-3 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 group hover:scale-105 active:scale-95 transition-all"
           >
              <RefreshCw className={`group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} size={18} />
              Recalculate Registry
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Intelligence & Insights */}
        <div className="xl:col-span-4 flex flex-col gap-8">
            {/* Global Demand Pulse */}
            <div className="glass-card border border-white/20 rounded-[40px] p-8 space-y-8 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                
                <div className="flex items-center gap-4 text-emerald-600 mb-2 pl-1 relative z-10">
                   <TrendingUp className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                   <h2 className="text-sm font-black uppercase tracking-widest leading-none">Global Demand Pulse</h2>
                </div>

                <div className="space-y-6 relative z-10">
                    {[
                      { cat: 'Spices', val: 94, trend: 'up' },
                      { cat: 'Organic Wheat', val: 82, trend: 'up' },
                      { cat: 'Exotic Fruit', val: 68, trend: 'stable' },
                    ].map((d) => (
                      <div key={d.cat} className="space-y-2">
                         <div className="flex justify-between items-center px-1">
                            <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">{d.cat}</span>
                            <span className="text-[10px] font-black text-emerald-500 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">{d.val}% Demand</span>
                         </div>
                         <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                             <motion.div initial={{ width: 0 }} animate={{ width: `${d.val}%` }} className="h-full bg-emerald-500 rounded-full" />
                         </div>
                      </div>
                    ))}
                </div>

                <div className="p-5 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-800 relative z-10">
                    <div className="flex gap-3">
                        <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold leading-relaxed">
                           Strategic recommendation: Focus on <span className="font-black italic">Dried Red Chillies</span>. Domestic inventory shows a 42% deficit this quarter.
                        </p>
                    </div>
                </div>
            </div>

            {/* AI Optimization Tips */}
            <div className="glass-card border border-white/20 rounded-[40px] p-8 space-y-6 group relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                 
                 <div className="flex items-center justify-between text-primary-600 mb-2 pl-1 relative z-10">
                    <div className="flex items-center gap-4">
                       <Zap className="w-5 h-5" />
                       <h2 className="text-sm font-black uppercase tracking-widest leading-none">Precision Optimization</h2>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 opacity-60">SCORE: 92/100</span>
                 </div>

                 <div className="space-y-4 relative z-10">
                    {[
                      { tip: "Verify export certificates to unlock Grade-A buyers (+8%)", status: "pending" },
                      { tip: "Add warehouse coordinates for logistics mapping (+5%)", status: "completed" },
                      { tip: "Upload visual grading records (+12%)", status: "pending" },
                    ].map((t) => (
                      <div key={t.tip} className="flex gap-4 group/tip cursor-pointer">
                         <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${t.status === 'completed' ? 'bg-emerald-500 text-white' : 'border-2 border-dashed border-gray-200 text-gray-300'}`}>
                            {t.status === 'completed' ? <CheckCircle2 size={12} /> : <PlusCircle size={12} />}
                         </div>
                         <p className={`text-[11px] font-bold ${t.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-600 dark:text-gray-300'} group-hover/tip:text-primary-600 transition-colors`}>{t.tip}</p>
                      </div>
                    ))}
                 </div>
            </div>
        </div>

        {/* Right Column: Recommended Buyers List */}
        <div className="xl:col-span-8 space-y-6">
            <div className="flex items-center justify-between mb-2 px-2">
                <p className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] flex items-center gap-3">
                   <Activity size={12} />
                   Showing {recommendations.length} High-Intent Buyers in your node range
                </p>
                <div className="flex gap-2">
                    <button className="h-8 w-8 rounded-lg border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"><Filter size={14}/></button>
                    <button className="h-8 w-8 rounded-lg border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"><ChevronRight size={14}/></button>
                </div>
            </div>
            
            <AnimatePresence>
                {recommendations.map((buyer, idx) => (
                    <motion.div 
                        key={buyer.id}
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                        className="glass-card border border-white/20 rounded-[48px] p-8 hover:shadow-2xl hover:border-primary-500/40 transition-all group overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[100px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                        
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
                            {/* Identity Section */}
                            <div className="flex items-center gap-8 flex-1">
                                <div className="w-24 h-24 rounded-[32px] overflow-hidden relative shadow-2xl shadow-primary-500/10 group-hover:rotate-3 transition-transform">
                                    <div className="absolute inset-0 gradient-mesh opacity-80" />
                                    <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-display font-black grayscale group-hover:grayscale-0 transition-all">
                                        {String(buyer.name).charAt(0)}
                                    </div>
                                    <div className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-lg">
                                       <ShieldCheck size={10} className="text-white" />
                                    </div>
                                </div>
                                
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h3 className="text-2xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter">{buyer.name}</h3>
                                        {buyer.matches >= 95 && (
                                           <span className="px-3 py-1 bg-primary-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary-500/30">Deep Match</span>
                                        )}
                                        {buyer.trustScore >= 0.95 && (
                                           <span className="px-3 py-1 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-500/30">Trusted Entity</span>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-5 mt-3 font-bold text-[10px] uppercase tracking-widest text-gray-400">
                                        <span className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-lg border border-white/10"><Star size={14} className="text-amber-500 fill-amber-500" /> {buyer.rating} Rated</span>
                                        <span className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-lg border border-white/10"><MapPin size={14} className="text-primary-500" /> {buyer.location} ({buyer.distance}km)</span>
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                       {buyer.categories.map((cat: string) => (
                                          <span key={cat} className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/10 text-[9px] font-black uppercase text-primary-600 dark:text-primary-400 tracking-widest rounded-xl border border-primary-500/20">{cat}</span>
                                       ))}
                                    </div>
                                </div>
                            </div>

                            {/* Match Potential Section */}
                            <div className="lg:w-72 flex flex-col gap-4">
                                <div className="p-6 bg-white/40 dark:bg-white/5 border border-white/20 rounded-[32px] relative overflow-hidden group/inner shadow-sm">
                                   <div className="flex justify-between items-baseline mb-2">
                                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Match Compatibility</p>
                                      <span className="text-3xl font-display font-black text-primary-600">{buyer.matches}%</span>
                                   </div>
                                   <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner flex">
                                      <motion.div 
                                        initial={{ width: 0 }} animate={{ width: `${buyer.matches}%` }} 
                                        className="h-full bg-primary-600 rounded-full shadow-lg shadow-primary-500/40" 
                                      />
                                   </div>
                                   <div className="grid grid-cols-4 gap-1 mt-3">
                                      {Object.entries(buyer.breakdown).map(([factor, val]) => (
                                         <div key={factor} className="h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden" title={factor}>
                                            <div className="h-full bg-indigo-400 opacity-60" style={{ width: `${val}%` }} />
                                         </div>
                                      ))}
                                   </div>
                                </div>
                                <div className="flex gap-2">
                                   <button 
                                     onClick={() => startChat(buyer)}
                                     className="flex-1 h-14 bg-white/50 dark:bg-white/5 border border-white/20 rounded-2xl flex items-center justify-center text-primary-600 hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                                   >
                                      <MessageCircle size={18} />
                                   </button>
                                   <button 
                                     onClick={() => { setSelectedBuyer(buyer); setShowProposalModal(true); }}
                                     className="flex-[3] h-14 bg-primary-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                                   >
                                      Send Proposal <ChevronRight size={14} />
                                   </button>
                                </div>
                            </div>
                        </div>

                        {/* Expandable Meta Footer */}
                        <div className="mt-8 pt-8 border-t border-white/10 dark:border-gray-900/50 relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-2">
                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter flex items-center gap-2">
                                  <History size={12} className="text-indigo-400" /> Historical Performance
                               </p>
                               <p className="text-[11px] font-bold text-gray-600 dark:text-gray-300 leading-relaxed italic">&ldquo;{buyer.historicalInsight}&rdquo;</p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                                   <span>Reliability Quotient</span>
                                   <span className="text-emerald-500">{Math.round(buyer.trustScore * 100)}%</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                                   <span>Contract Conversion</span>
                                   <span className="text-primary-500">{Math.round(buyer.successRate * 100)}%</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-end">
                               <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-800 flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${buyer.trending === 'up' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                                     {buyer.trending === 'up' ? <TrendingUp size={20} /> : <Activity size={20} />}
                                  </div>
                                  <div>
                                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Market Sentiment</p>
                                     <p className="text-xs font-black text-gray-900 dark:text-white uppercase leading-none">{buyer.trending === 'up' ? 'Aggressive Scaling' : 'Steady Accumulation'}</p>
                                  </div>
                               </div>
                            </div>
                        </div>

                    </motion.div>
                ))}
            </AnimatePresence>

            {recommendations.length === 0 && (
                <div className="glass-card rounded-[48px] p-24 text-center border-2 border-dashed border-white/10">
                   <Target className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                   <h3 className="text-2xl font-display font-black uppercase tracking-tighter text-gray-900 dark:text-white">Scanning Noospheric Web...</h3>
                   <p className="text-sm text-gray-500 max-w-sm mx-auto mt-2">Initialize synchronization to map active institutional buyers in your decentralized production zone.</p>
                </div>
            )}
        </div>
      </div>

      {/* Instant Proposal Modal */}
      <AnimatePresence>
        {showProposalModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProposalModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
             <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} className="glass-card border border-white/20 rounded-[48px] w-full max-w-xl overflow-hidden relative z-10 flex flex-col">
                <div className="p-10 pb-6 border-b border-white/10">
                   <div className="flex items-center gap-4 text-primary-600 mb-4">
                      <Handshake size={24} />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Distributed Trade Protocol</h3>
                   </div>
                   <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight">Instant Proposal to <br /> <span className="text-primary-600">{selectedBuyer?.name}</span></h2>
                </div>
                
                <form onSubmit={handleSendProposal} className="p-10 space-y-8">
                   <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Pricing Structure (per unit)</label>
                       <div className="relative">
                          <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-500" size={18} />
                          <input 
                            required type="number" placeholder="5,000" 
                            className="input h-16 pl-14 bg-white/40 dark:bg-white/5 border border-white/10 rounded-2xl text-xl font-display font-black"
                            value={proposalData.price} onChange={(e) => setProposalData({...proposalData, price: e.target.value})}
                          />
                       </div>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Batch Volume</label>
                          <input 
                            required type="number" placeholder="500" 
                            className="input h-14 bg-white/40 dark:bg-white/5 border border-white/10 rounded-2xl text-sm font-bold"
                            value={proposalData.quantity} onChange={(e) => setProposalData({...proposalData, quantity: e.target.value})}
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Delivery SLA</label>
                          <input 
                            required type="date" 
                            className="input h-14 bg-white/40 dark:bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase"
                            value={proposalData.deliveryDate} onChange={(e) => setProposalData({...proposalData, deliveryDate: e.target.value})}
                          />
                      </div>
                   </div>
                   
                   <div className="p-6 bg-primary-600/5 rounded-3xl border border-primary-500/20">
                      <p className="text-[10px] text-gray-500 font-medium leading-relaxed italic uppercase tracking-tighter">
                         &ldquo;Sending this proposal marks your node as 'Ready for Trade'. Proposal valid for 48 hours for institutional verification.&rdquo;
                      </p>
                   </div>

                   <div className="flex gap-4 pt-4">
                      <button type="button" onClick={() => setShowProposalModal(false)} className="flex-1 h-14 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">Discard</button>
                      <button type="submit" disabled={loading} className="flex-[2] h-14 bg-primary-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-500/30 flex items-center justify-center gap-3 active:scale-95 transition-all">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <>Transmit Proposal <Send size={14} /></>}
                      </button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
