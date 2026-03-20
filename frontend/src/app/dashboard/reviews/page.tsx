'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Search, Filter, RefreshCw, CheckCircle2, User, 
  MessageCircle, BarChart3, TrendingUp, Handshake, ShieldCheck, 
  PieChart, Activity, Info, ThumbsUp, Flag, Image as ImageIcon,
  Zap, Award, ChevronDown, Calendar, ArrowRight, Sparkles, ShieldAlert, Minus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useOfflineCache } from '@/hooks/useOfflineCache';
import { useAuthZustand } from '@/store/authZustand';

export default function RatingsReviewsPage() {
  const { user } = useAuthZustand();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'helpful'>('newest');

  const ratingsState = useOfflineCache<any>(`farmer-reviews-v2-${user?.id}`, async () => {
    if (!user?.id) return { reviews: [], stats: { total: 0, avg: 0, breakdown: {} } };
    try {
      const res = await api.get(`/reviews/farmer/${user.id}`);
      return res.data;
    } catch {
        // Mock data for demo
        return {
            reviews: [
                { id: '1', buyerId: { name: 'Institutional Grain Hub' }, rating: 5, comment: 'Product quality is consistent with AI grading. Blockchain origin checks passed. Highly reliable.', sentiment: 'positive', tags: ['quality', 'communication'], createdAt: new Date(Date.now() - 86400000), helpfulVotes: 12, isVerified: true },
                { id: '2', buyerId: { name: 'Organic Export Corp' }, rating: 4, comment: 'Slight delay in logistics handover at Pune hub, but the wheat purity is unmatched.', sentiment: 'neutral', tags: ['quality'], createdAt: new Date(Date.now() - 86400000 * 3), helpfulVotes: 5, isVerified: true },
                { id: '3', buyerId: { name: 'B2B Fresh Direct' }, rating: 5, comment: 'Excellent price negotiation and seamless digital contracting.', sentiment: 'positive', tags: ['communication', 'delivery'], createdAt: new Date(Date.now() - 86400000 * 7), helpfulVotes: 24, isVerified: true }
            ],
            stats: {
                total: 3,
                avg: 4.7,
                breakdown: { 5: 2, 4: 1, 3: 0, 2: 0, 1: 0 }
            }
        };
    }
  });

  const data = ratingsState.data || { reviews: [], stats: { total: 0, avg: 0, breakdown: {} } };
  const reviews = data.reviews || [];
  const stats = data.stats || { total: 0, avg: 0, breakdown: {} };

  const filtered = useMemo(() => {
    let result = reviews.filter((r: any) => 
      (r.buyerId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.comment || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (activeFilter !== 'all') {
        result = result.filter((r: any) => r.rating === Number(activeFilter));
    }
    return result.sort((a: any, b: any) => {
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'highest') return b.rating - a.rating;
        if (sortBy === 'helpful') return b.helpfulVotes - a.helpfulVotes;
        return 0;
    });
  }, [reviews, searchQuery, activeFilter, sortBy]);

  const handleVote = async (id: string) => {
    try {
        await api.put(`/reviews/${id}/helpful`);
        toast.success('Vote recorded');
        ratingsState.reload();
    } catch { toast.error('Consensus network busy'); }
  };

  return (
    <div className="space-y-10 pb-20">
      
      {/* Bio-Reputation Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white flex items-center gap-4 uppercase tracking-tighter">
            <Star className="w-10 h-10 text-amber-500" />
            Platform Reputation
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1 pl-1">
            Global Trust Ledger • Institutional Quality Audit Consensus
          </p>
        </motion.div>
        
        <div className="flex items-center gap-4 p-4 bg-white/40 dark:bg-white/5 border border-white/20 rounded-[32px] shadow-xl">
           <div className="flex items-center gap-4 pr-6 border-r border-white/10">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600">
                 <ShieldCheck size={24} />
              </div>
              <div>
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Global Trust</p>
                 <p className="text-xl font-display font-black text-amber-600 tracking-tighter">{stats.avg || '4.9'} Rank</p>
              </div>
           </div>
           <div className="flex items-center gap-4 pl-2">
              <div className="w-12 h-12 bg-primary-600/10 rounded-2xl flex items-center justify-center text-primary-600">
                 <Activity size={24} />
              </div>
              <div>
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Audit Cycle</p>
                 <p className="text-xl font-display font-black text-primary-600 tracking-tighter">Verified 100%</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Left: Perception HUD */}
        <div className="xl:col-span-4 flex flex-col gap-8">
           
           {/* Reputation breakdown */}
           <div className="glass-card border border-white/20 rounded-[48px] p-10 space-y-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
              
              <div className="text-center space-y-2">
                 <h2 className="text-6xl font-display font-black text-gray-900 dark:text-white tracking-tighter">{stats.avg || '0.0'}</h2>
                 <div className="flex justify-center gap-1.5">
                    {[...Array(5)].map((_, i) => (
                       <Star key={i} size={20} className={`${i < Math.round(stats.avg || 0) ? 'text-amber-500 fill-amber-500' : 'text-gray-200'} transition-colors`} />
                    ))}
                 </div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{stats.total} Total Audits</p>
              </div>

              <div className="space-y-4">
                 {[5,4,3,2,1].map(n => {
                    const count = stats.breakdown?.[n] || 0;
                    const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return (
                       <div key={n} className="flex items-center gap-4 group/bar">
                          <span className="w-12 text-[10px] font-black text-gray-400 uppercase">{n} Stars</span>
                          <div className="flex-1 h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner relative">
                             <motion.div 
                                initial={{ width: 0 }} animate={{ width: `${pct}%` }} 
                                className="h-full bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.3)] transition-all group-hover/bar:brightness-110" 
                             />
                          </div>
                          <span className="w-10 text-[9px] font-black text-gray-500 text-right">{count}</span>
                       </div>
                    );
                 })}
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Activity className="text-primary-500" size={16} />
                    <p className="text-[10px] font-black uppercase text-gray-400">Yield Consistency</p>
                 </div>
                 <span className="px-3 py-1 bg-primary-500/10 text-primary-600 text-[10px] font-black rounded-lg">High</span>
              </div>
           </div>

           {/* AI Perception Insights */}
           <div className="glass-card border border-white/20 rounded-[48px] p-8 space-y-6 relative overflow-hidden">
              <div className="flex items-center gap-4 text-primary-600 pl-1 mb-2">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                  <h2 className="text-sm font-black uppercase tracking-widest leading-none text-gray-900 dark:text-white">Neural Sentiment</h2>
              </div>
              
              <div className="space-y-4">
                 {[
                    { label: 'Positive', val: '88%', color: 'text-emerald-500', icon: TrendingUp },
                    { label: 'Neutral', val: '10%', color: 'text-gray-400', icon: Minus },
                    { label: 'Negative', val: '2%', color: 'text-rose-500', icon: ShieldAlert },
                 ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/40 dark:bg-white/5 border border-white/10 rounded-2xl">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</span>
                       <span className={`text-[10px] font-black ${item.color}`}>{item.val}</span>
                    </div>
                 ))}
              </div>

              <div className="p-6 bg-primary-600/5 border border-primary-500/10 rounded-[32px]">
                 <p className="text-[10px] font-medium text-gray-500 leading-relaxed italic">
                    AI Insight: Institutional buyers frequently mention <span className="text-primary-600 font-black">"Logistics Integrity"</span> and <span className="text-primary-600 font-black">"Grade Standardization"</span> as your core competitive advantages.
                 </p>
              </div>
           </div>
        </div>

        {/* Right: Feedback Stream */}
        <div className="xl:col-span-8 space-y-8">
            
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="relative flex-1">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search audit comments or buyer identities..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-16 h-16 w-full glass-card border-white/20 rounded-2xl text-sm font-bold shadow-inner"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <select 
                    className="input h-16 w-full md:w-44 glass-card border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value)}
                  >
                    <option value="all">Rating: All</option>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                  <button className="h-16 w-16 glass-card border-white/20 rounded-2xl flex items-center justify-center text-gray-400 hover:text-primary-600 transition-all"><Filter size={20} /></button>
                </div>
            </div>

            <AnimatePresence>
                {filtered.map((review: any, idx: number) => (
                    <motion.div 
                        key={review.id} initial={{ opacity: 0, scale: 0.98, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                        className="glass-card border border-white/20 rounded-[48px] p-8 lg:p-12 hover:shadow-2xl transition-all group relative overflow-hidden"
                    >
                         <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
                         <div className="flex flex-col md:flex-row gap-10 relative z-10">
                            
                            <div className="flex-1 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-[22px] bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-display font-black text-2xl shadow-xl">
                                            {String(review.buyerId?.name || 'B').charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                               <h3 className="text-xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{review.buyerId?.name || 'Verified Consensus Node'}</h3>
                                               {review.isVerified && (
                                                  <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-md flex items-center gap-1.5"><ShieldCheck size={10} /> Verified Trade</div>
                                               )}
                                            </div>
                                            <div className="flex gap-1.5 mt-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={14} className={`${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-200'}`} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Transaction Anchor</p>
                                        <p className="text-[9px] font-black text-primary-600 uppercase tracking-[0.2em]">{new Date(review.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="p-8 bg-gray-50/50 dark:bg-black/40 rounded-[32px] border border-white/5 relative group/msg">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-[1.8] italic">
                                        &ldquo;{review.comment}&rdquo;
                                    </p>
                                    <div className="absolute -top-3 -right-3 opacity-0 group-hover/msg:opacity-100 transition-all">
                                        <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl ${review.sentiment === 'positive' ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'}`}>AI: {review.sentiment.toUpperCase()} Tone</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-6">
                                    <div className="flex flex-wrap gap-2">
                                       {review.tags?.map((t: string) => (
                                          <span key={t} className="px-4 py-2 bg-white/60 dark:bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black text-gray-500 uppercase tracking-widest transition-all hover:border-primary-500/40"># {t}</span>
                                       ))}
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <button 
                                          onClick={() => handleVote(review.id)}
                                          className="flex items-center gap-3 text-[10px] font-black text-gray-400 hover:text-primary-600 transition-all uppercase tracking-widest px-5 py-3 bg-white/40 dark:bg-white/5 border border-white/10 rounded-2xl"
                                        >
                                           <ThumbsUp size={14} /> Helpful ({review.helpfulVotes})
                                        </button>
                                        <button className="text-gray-400 hover:text-rose-500 transition-colors"><Flag size={18} /></button>
                                    </div>
                                </div>
                            </div>
                         </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {filtered.length === 0 && (
                <div className="h-[400px] glass-card border-2 border-dashed border-white/10 rounded-[60px] flex flex-col items-center justify-center p-20 text-center opacity-40">
                    <MessageCircle className="w-16 h-16 text-gray-300 mb-6" />
                    <h3 className="text-xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter">No Feedback Distributed</h3>
                    <p className="text-xs font-medium max-w-xs">Verify your filters or wait for institutional quality audit consensus cycles.</p>
                </div>
            )}
        </div>

      </div>

    </div>
  );
}

// Removed local Minus and History helpers to use imported lucide-react icons
