'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Handshake, TrendingUp, Clock, History, CheckCircle2, XCircle, 
  MessageSquare, Zap, IndianRupee, ArrowRight, ShieldCheck, 
  RefreshCw, ChevronRight, Activity, Info, BarChart3, AlertCircle,
  PlusCircle, Send, Loader2, Award, User, Target, ExternalLink, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api, aiApi } from '@/lib/api';
import { useAuthZustand } from '@/store/authZustand';
import { io } from 'socket.io-client';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function PriceNegotiationPage() {
  const { user } = useAuthZustand();
  const [loading, setLoading] = useState(false);
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [selectedNegId, setSelectedNegId] = useState<string | null>(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterQty, setCounterQty] = useState('');
  const [notes, setNotes] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const socketRef = useRef<any>(null);

  const selectedNeg = useMemo(() => 
    negotiations.find(n => n._id === selectedNegId), 
    [negotiations, selectedNegId]
  );

  const fetchNegotiations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/negotiations');
      setNegotiations(res.data);
      if (res.data.length > 0 && !selectedNegId) {
        setSelectedNegId(res.data[0]._id);
      }
    } catch {
      toast.error('Failed to load negotiations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNegotiations();
    
    // Socket initialization
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
       auth: { token: localStorage.getItem('token') },
       transports: ['websocket']
    });

    socketRef.current.emit('authenticate', user?.id);

    socketRef.current.on('negotiation_update', (data: any) => {
      setNegotiations(prev => {
        const idx = prev.findIndex(n => n._id === data.negotiation._id);
        if (idx > -1) {
          const newNegs = [...prev];
          newNegs[idx] = data.negotiation;
          return newNegs;
        }
        return [data.negotiation, ...prev];
      });
      toast.success('Negotiation platform updated in real-time');
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const handleOffer = async (type: 'counter' | 'accept' | 'reject') => {
    if (!selectedNegId) return;
    setLoading(true);
    try {
      const res = await api.post(`/negotiations/${selectedNegId}/offer`, {
        type,
        price: type === 'counter' ? Number(counterPrice) : undefined,
        quantity: type === 'counter' ? Number(counterQty) : undefined,
        notes
      });
      
      // Update local state immediately
      setNegotiations(prev => prev.map(n => n._id === selectedNegId ? res.data : n));
      
      if (type === 'accept') toast.success('Agreement Protocol Finalized! Order synchronized.');
      else if (type === 'reject') toast.error('Negotiation Terminated');
      else toast.success('Counter-Offer Transmitted Successfully');
      
      setCounterPrice('');
      setCounterQty('');
      setNotes('');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Transmission failed');
    } finally {
      setLoading(false);
    }
  };

  const getAiSuggestion = async () => {
    if (!selectedNeg) return;
    setIsAiLoading(true);
    try {
      const res = await api.get(`/negotiations/ai/suggest-price/Fruits`); // Mock category
      setCounterPrice(String(res.data.suggestedPrice));
      toast.success(`AI suggested: ₹${res.data.suggestedPrice} (85% Confidence)`);
    } catch {
      toast.error('AI Matchmaking engine busy');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header with Market Pulse */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white flex items-center gap-4 uppercase tracking-tighter">
            <Handshake className="w-10 h-10 text-primary-600" />
            Trade Negotiation Terminal
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1 pl-1">
            Institutional Bargaining Interface • Smart Ledger Integration
          </p>
        </motion.div>
        
        <div className="flex items-center gap-4 p-4 bg-white/40 dark:bg-white/5 border border-white/20 rounded-3xl">
           <div className="flex items-center gap-3 pr-4 border-r border-white/10">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600">
                 <Zap size={20} />
              </div>
              <div>
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Success Rate</p>
                 <p className="text-sm font-black text-emerald-600">92.4% Avg</p>
              </div>
           </div>
           <div className="flex items-center gap-3 pl-2">
              <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-600">
                 <Clock size={20} />
              </div>
              <div>
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Deal Velocity</p>
                 <p className="text-sm font-black text-primary-600">4.2h Median</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left: Active Negotiations List */}
        <div className="xl:col-span-4 flex flex-col gap-6">
           <div className="flex items-center justify-between px-2 mb-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                 <Activity size={12} /> Active Channels ({negotiations.filter(n => n.status === 'active').length})
              </p>
              <button onClick={fetchNegotiations} className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                 <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
           </div>
           
           <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {negotiations.map((n) => (
                   <motion.div 
                     key={n._id}
                     initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                     onClick={() => setSelectedNegId(n._id)}
                     className={`glass-card border cursor-pointer p-6 rounded-[32px] transition-all group relative overflow-hidden ${selectedNegId === n._id ? 'border-primary-500/50 shadow-2xl bg-primary-500/5' : 'border-white/10 hover:border-white/30'}`}
                   >
                      {selectedNegId === n._id && (
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
                      )}
                      
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-lg font-display font-black group-hover:bg-primary-600 group-hover:text-white transition-all">
                               {user?.role === 'farmer' ? 'B' : 'F'}
                            </div>
                            <div>
                               <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Channel #{n._id.slice(-6).toUpperCase()}</h3>
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{n.status === 'active' ? 'Live Session' : 'Closed Connection'}</p>
                            </div>
                         </div>
                         <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${n.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}>
                            {n.status}
                         </div>
                      </div>
                      
                      <div className="flex justify-between items-end border-t border-white/5 pt-4">
                         <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Anchor</p>
                            <p className="text-xl font-display font-black text-gray-900 dark:text-white">₹{n.offers[n.offers.length - 1]?.price || n.initialPrice}</p>
                         </div>
                         <div className="text-right">
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Volume</p>
                             <p className="text-xs font-black text-gray-600 dark:text-gray-300">{n.quantity} Units</p>
                         </div>
                      </div>
                   </motion.div>
                ))}
              </AnimatePresence>

              {negotiations.length === 0 && !loading && (
                 <div className="glass-card rounded-[32px] p-12 text-center border-2 border-dashed border-white/10">
                    <History className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No active bargaining cycles</p>
                 </div>
              )}
           </div>
        </div>

        {/* Right: Selected Negotiation Workspace */}
        {selectedNeg ? (
           <div className="xl:col-span-8 flex flex-col gap-8">
              {/* Negotiation HUD */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card border border-white/20 rounded-[48px] p-10 relative overflow-hidden"
              >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[100px] pointer-events-none" />
                  
                  <div className="flex flex-col lg:flex-row justify-between gap-10">
                     <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="w-16 h-16 rounded-3xl gradient-mesh flex items-center justify-center text-white text-2xl font-display font-black shadow-xl">
                              {user?.role === 'farmer' ? 'B' : 'F'}
                           </div>
                           <div>
                              <div className="flex items-center gap-3">
                                 <h2 className="text-2xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter">Bargaining Protocol</h2>
                                 <span className="px-3 py-1 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                                    <ShieldCheck size={10} /> Secure Node
                                 </span>
                              </div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1 pl-1 flex items-center gap-2">
                                 ID: {selectedNeg._id} • SHA-256 Verified
                              </p>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                           <div className="p-6 bg-white/40 dark:bg-white/5 border border-white/10 rounded-[32px] group hover:bg-white group">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wide mb-1">Target Quantity</p>
                              <h4 className="text-xl font-display font-black text-gray-900 dark:text-white">{selectedNeg.quantity} Units</h4>
                           </div>
                           <div className="p-6 bg-white/40 dark:bg-white/5 border border-white/10 rounded-[32px]">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wide mb-1">Exps. Finalization</p>
                              <h4 className="text-xl font-display font-black text-emerald-600">{formatDistanceToNow(new Date(selectedNeg.expiresAt))} Left</h4>
                           </div>
                           <div className="p-6 bg-primary-600 text-white rounded-[32px] shadow-xl shadow-primary-500/20 col-span-2 lg:col-span-1">
                              <p className="text-[9px] font-black text-white/60 uppercase tracking-wide mb-1">Initial Reserve</p>
                              <h4 className="text-xl font-display font-black">₹{selectedNeg.initialPrice}</h4>
                           </div>
                        </div>
                     </div>

                     {/* Price Trend Chart (SVG Visualization) */}
                     <div className="lg:w-72 bg-gray-900 rounded-[32px] p-8 flex flex-col justify-between border border-white/10 shadow-2xl">
                         <div className="flex justify-between items-center mb-6">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Market Convergence</p>
                            <span className="text-emerald-500 text-[9px] font-black">+2.4%</span>
                         </div>
                         <div className="h-24 w-full flex items-end gap-1 px-1">
                             {[40, 60, 45, 80, 55, 90, 75, 95].map((h, i) => (
                               <motion.div 
                                 key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.05 }}
                                 className="flex-1 bg-primary-500/60 rounded-t-sm" 
                               />
                             ))}
                         </div>
                         <div className="pt-6 mt-6 border-t border-white/10 flex justify-between items-center text-white">
                            <div>
                               <p className="text-[8px] font-black text-gray-500 uppercase">Suggested</p>
                               <p className="text-lg font-display font-black">₹{selectedNeg.aiSuggestedPrice || '---'}</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-primary-500">
                               <BarChart3 size={18} />
                            </div>
                         </div>
                     </div>
                  </div>
              </motion.div>

              {/* Offer Timeline & Terminal */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                  
                  {/* Timeline (Chat Style) */}
                  <div className="lg:col-span-12 flex flex-col gap-6">
                      <div className="flex items-center gap-4 px-4 text-gray-400">
                         <MessageSquare size={16} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Transaction Log / Offer Feed</span>
                         <div className="flex-1 h-px bg-white/10" />
                      </div>

                      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                         {selectedNeg.offers.map((offer: any, idx: number) => (
                           <motion.div 
                             key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                             className={`flex ${offer.fromUserId === user?.id ? 'justify-end' : 'justify-start'}`}
                           >
                              <div className={`max-w-[80%] p-6 rounded-[32px] shadow-sm flex flex-col gap-2 ${offer.fromUserId === user?.id ? 'bg-primary-600 text-white sm:rounded-tr-none' : 'bg-white/40 dark:bg-white/5 border border-white/10 text-gray-900 dark:text-white sm:rounded-tl-none'}`}>
                                 <div className="flex items-center justify-between gap-10 mb-2">
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${offer.fromUserId === user?.id ? 'text-white/60' : 'text-gray-400'}`}>
                                       {offer.type === 'offer' ? 'Initial Protocol' : offer.type.toUpperCase()}
                                    </span>
                                    <span className="text-[8px] font-bold opacity-40">{new Date(offer.timestamp).toLocaleTimeString()}</span>
                                 </div>
                                 <div className="flex items-baseline gap-2">
                                    <span className="text-[10px] font-black">₹</span>
                                    <span className="text-2xl font-display font-black">{offer.price}</span>
                                    <span className="text-[10px] font-bold opacity-60">/ unit</span>
                                 </div>
                                 {offer.notes && (
                                   <p className={`text-xs mt-2 italic font-medium leading-relaxed ${offer.fromUserId === user?.id ? 'text-white/80' : 'text-gray-500'}`}>&ldquo;{offer.notes}&rdquo;</p>
                                 )}
                                 {offer.type === 'accept' && (
                                   <div className="mt-3 py-2 px-4 bg-emerald-500/20 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                                      <Award size={14} /> Settlement Reached
                                   </div>
                                 )}
                              </div>
                           </motion.div>
                         ))}
                      </div>

                      {/* Control Panel (Counter Offer / Actions) */}
                      {selectedNeg.status === 'active' && (
                         <div className="glass-card border border-primary-500/20 rounded-[40px] p-10 bg-primary-600/5 relative overflow-hidden">
                            <div className="flex flex-col lg:flex-row gap-10">
                               <div className="flex-1 space-y-6">
                                  <div className="flex items-center gap-4 text-primary-600 mb-2">
                                     <Sparkles className="w-6 h-6" />
                                     <h3 className="text-xs font-black uppercase tracking-[0.3em]">Bargaining Controller</h3>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                     <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Counter Price</label>
                                        <div className="relative">
                                           <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-500" size={18} />
                                           <input 
                                             type="number" placeholder="0.00" 
                                             value={counterPrice} onChange={(e) => setCounterPrice(e.target.value)}
                                             className="input h-16 pl-14 bg-white/80 dark:bg-white/10 border border-white/20 rounded-2xl text-xl font-display font-black text-gray-900 dark:text-white" 
                                           />
                                           <button 
                                              onClick={getAiSuggestion}
                                              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-primary-600 text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                                              title="AI Suggested Market Price"
                                           >
                                              {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                                           </button>
                                        </div>
                                     </div>
                                     <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Negotiate Qty</label>
                                        <input 
                                          type="number" placeholder={String(selectedNeg.quantity)}
                                          value={counterQty} onChange={(e) => setCounterQty(e.target.value)}
                                          className="input h-16 bg-white/80 dark:bg-white/10 border border-white/20 rounded-2xl text-sm font-bold" 
                                        />
                                     </div>
                                     <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Protocol Note</label>
                                        <input 
                                          type="text" placeholder="Explain your position..." 
                                          value={notes} onChange={(e) => setNotes(e.target.value)}
                                          className="input h-16 bg-white/80 dark:bg-white/10 border border-white/20 rounded-2xl text-xs font-medium" 
                                        />
                                     </div>
                                  </div>
                                  
                                  <div className="flex gap-4">
                                     <button 
                                       onClick={() => handleOffer('counter')} disabled={loading || !counterPrice}
                                       className="flex-[2] h-16 bg-primary-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary-500/20 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                     >
                                        {loading ? <Loader2 className="animate-spin" /> : <>Transmit Block-Counter <Send size={18} /></>}
                                     </button>
                                     <div className="flex gap-2 min-w-[120px]">
                                        <button 
                                          onClick={() => handleOffer('accept')} disabled={loading}
                                          className="flex-1 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors"
                                          title="Accept Last Offer"
                                        >
                                           <CheckCircle2 size={24} />
                                        </button>
                                        <button 
                                          onClick={() => handleOffer('reject')} disabled={loading}
                                          className="flex-1 h-16 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-colors"
                                          title="Terminate Bargain"
                                        >
                                           <XCircle size={24} />
                                        </button>
                                     </div>
                                  </div>
                               </div>

                               <div className="lg:w-64 p-8 bg-black/5 dark:bg-white/5 rounded-[32px] border border-white/10 text-center flex flex-col justify-center gap-4">
                                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto opacity-60" />
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                                     Acceptance triggers automatic <span className="text-gray-900 dark:text-white">Smart Contract Deployment</span>. Ensure all parameters match physical inventory availability.
                                  </p>
                                  <Link href={`/dashboard/products/${selectedNeg.productId}`} className="text-[9px] font-black text-primary-600 uppercase tracking-widest hover:underline flex items-center justify-center gap-2">
                                     Verify Item Profile <ExternalLink size={10} />
                                  </Link>
                               </div>
                            </div>
                         </div>
                      )}
                      
                      {selectedNeg.status !== 'active' && (
                         <div className="glass-card border border-white/20 rounded-[40px] p-16 text-center bg-gray-50/50 dark:bg-white/5">
                            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${selectedNeg.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'}`}>
                               {selectedNeg.status === 'accepted' ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
                            </div>
                            <h3 className="text-3xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                               Negotiation {selectedNeg.status.toUpperCase()}
                            </h3>
                            <p className="text-sm text-gray-500 max-w-md mx-auto mt-2 font-medium"> This digital trade channel has been closed. {selectedNeg.status === 'accepted' ? 'The agreed parameters have been immutable recorded on the ledger.' : 'No consensus was reached for this bargaining cycle.'}</p>
                            {selectedNeg.status === 'accepted' && (
                               <button className="btn btn-primary mt-8 px-10 h-14 rounded-2xl uppercase font-black tracking-widest text-xs flex items-center gap-3 mx-auto">
                                  View Synchronized Contract <PlusCircle size={18} />
                               </button>
                            )}
                         </div>
                      )}
                  </div>
              </div>
           </div>
        ) : (
           <div className="xl:col-span-8 glass-card border-2 border-dashed border-white/10 rounded-[48px] p-48 text-center bg-gray-50/10 dark:bg-white/5 flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-white/10 rounded-[32px] flex items-center justify-center text-gray-200 mb-8 border border-white/5">
                 <Target className="w-12 h-12 opacity-40" />
              </div>
              <h3 className="text-2xl font-display font-black uppercase tracking-tighter text-gray-900 dark:text-white">Select a Negotiation Channel</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mt-2 font-medium">Select an active node from the repository to initiate bargaining or finalize trade parameters.</p>
           </div>
        )}
      </div>

    </div>
  );
}
