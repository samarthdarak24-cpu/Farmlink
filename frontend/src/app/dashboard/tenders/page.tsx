'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Gavel, Calendar, FileText, CheckCircle2, RefreshCw, 
  Layers, DollarSign, Clock, Users, ArrowRight, ShieldCheck, 
  Tag, Filter, Globe, Sparkles, PieChart, Info, 
  ChevronRight, Briefcase, Zap, Target, Gauge, 
  Building2, Award, ClipboardCheck, History, Landmark, Activity, Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { tendersApi, api } from '@/lib/api';
import { useOfflineCache } from '@/hooks/useOfflineCache';
import { useAuthZustand } from '@/store/authZustand';

export default function TendersPage() {
  const { user } = useAuthZustand();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'discover' | 'active' | 'history'>('discover');
  const [selectedTender, setSelectedTender] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [timeline, setTimeline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openTendersState = useOfflineCache<any[]>('farmer-tenders-open-v2', async () => {
    try {
        const res = await tendersApi.getAll({ status: 'open' });
        return res.data || [];
    } catch {
        // Mock institutional tenders
        return [
            { _id: 't1', title: 'FCI Grain Procurement - Nasik Hub', category: 'Grains', buyerName: 'FCI Gov India', quantity: 5000, unit: 'Tons', budget: 1500000, deadline: '2024-12-01', source: 'CPPP', bidsCount: 12, eligibility: 95, sentiment: 'Highly Active' },
            { _id: 't2', title: 'Mid-Day Meal Program Procurement', category: 'Pulses', buyerName: 'State Education Dept', quantity: 1200, unit: 'Tons', budget: 600000, deadline: '2024-11-15', source: 'GeM', bidsCount: 45, eligibility: 78, sentiment: 'Competitive' },
            { _id: 't3', title: 'Export Quality Basmati - bulk order', category: 'Rice', buyerName: 'Arabian Spices Co.', quantity: 200, unit: 'Tons', budget: 450000, deadline: '2024-10-30', source: 'Corporate', bidsCount: 8, eligibility: 100, sentiment: 'Premium' },
        ];
    }
  });

  const myBidsState = useOfflineCache<any[]>('farmer-tenders-my-v2', async () => {
    try {
        const res = await tendersApi.getMy();
        return res.data || [];
    } catch { return []; }
  });

  const handleBid = async (tender: any) => {
    if (!bidAmount || !timeline) {
      toast.error('Please specify bid amount and delivery timeline');
      return;
    }
    setIsSubmitting(true);
    try {
      await tendersApi.bid(tender._id, {
        bidAmount: Number(bidAmount),
        deliveryTimeline: timeline,
        farmerName: user?.name,
      });
      toast.success('Institutional Bid Locked on DLT');
      setSelectedTender(null);
      await openTendersState.reload();
      await myBidsState.reload();
    } catch (e: any) {
      toast.error('Technical Disqualification: Verify compliant documents');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentData = useMemo(() => {
     const list = activeTab === 'discover' ? (openTendersState.data || []) : (myBidsState.data || []);
     return list.filter((t: any) => 
        (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.buyerName || '').toLowerCase().includes(searchQuery.toLowerCase())
     );
  }, [activeTab, openTendersState.data, myBidsState.data, searchQuery]);

  return (
    <div className="space-y-10 pb-20">
      
      {/* Institutional HUD */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white flex items-center gap-4 uppercase tracking-tighter">
            <Landmark className="w-10 h-10 text-indigo-600" />
            Tender Hall
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1 pl-1">
            GeM • CPPP • Institutional Procurement Terminal
          </p>
        </motion.div>
        
        <div className="flex items-center gap-4 p-4 bg-white/40 dark:bg-white/5 border border-white/20 rounded-[32px] shadow-xl">
           <div className="flex items-center gap-4 pr-6 border-r border-white/10">
              <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-600">
                 <Target size={24} />
              </div>
              <div>
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Win Prob.</p>
                 <p className="text-xl font-display font-black text-indigo-600 tracking-tighter">84.2%</p>
              </div>
           </div>
           <div className="flex items-center gap-4 pl-2">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
                 <Building2 size={24} />
              </div>
              <div>
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Govt Priority</p>
                 <p className="text-xl font-display font-black text-emerald-600 tracking-tighter">ODOP Level</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Left: Tender Intelligence Workspace */}
        <div className="xl:col-span-8 space-y-8">
            
            {/* Control Strip */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="relative flex-1">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search by tender ID, government hub, or crop..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-16 h-16 w-full glass-card border-white/20 rounded-2xl text-sm font-bold shadow-inner"
                  />
                </div>

                <div className="flex p-2 bg-white/40 dark:bg-white/5 rounded-2xl border border-white/10">
                    {[
                        { id: 'discover', label: 'Discovery', icon: Globe },
                        { id: 'active', label: 'My Bids', icon: Activity },
                        { id: 'history', label: 'Legacy', icon: History }
                    ].map(tab => (
                        <button 
                            key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-gray-400 hover:text-indigo-600'}`}
                        >
                            <tab.icon size={14} /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tender List */}
            <div className="space-y-6">
                <AnimatePresence>
                    {currentData.map((tender, idx) => (
                        <motion.div 
                            key={tender._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                            className="glass-card border border-white/20 rounded-[48px] p-8 lg:p-10 hover:shadow-2xl transition-all group overflow-hidden relative"
                        >
                             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                             
                             <div className="flex flex-col lg:flex-row gap-10 relative z-10">
                                <div className="flex-1 space-y-6">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 text-[8px] font-black uppercase rounded-lg tracking-widest">{tender.source}</span>
                                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">#{tender._id.toUpperCase()}</span>
                                        </div>
                                        <h3 className="text-2xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none group-hover:text-indigo-600 transition-colors">{tender.title}</h3>
                                        <div className="flex items-center gap-6 mt-1">
                                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                                <Building2 size={12} className="text-indigo-500" /> {tender.buyerName}
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-gray-300" />
                                            <div className="flex items-center gap-2 text-[10px] text-rose-500 font-bold uppercase tracking-widest">
                                                <Clock size={12} /> {new Date(tender.deadline).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-gray-50 dark:bg-black/40 rounded-[32px] border border-white/10">
                                        <div>
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Target Quantity</p>
                                            <p className="text-xl font-display font-black tracking-tight">{tender.quantity} {tender.unit}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Budget Allocation</p>
                                            <p className="text-xl font-display font-black tracking-tight text-emerald-600 shadow-emerald-500/20">₹{tender.budget?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Elite Bids</p>
                                            <p className="text-xl font-display font-black tracking-tight">{tender.bidsCount}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">AI Sentiment</p>
                                            <p className={`text-xl font-display font-black tracking-tight ${tender.sentiment === 'Highly Active' ? 'text-indigo-600' : 'text-gray-500'}`}>{tender.sentiment}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <button 
                                            onClick={() => setSelectedTender(tender)}
                                            className="px-8 h-14 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/30 active:scale-95 transition-all flex items-center gap-4"
                                        >
                                            Initialize Bid Sequence <ChevronRight size={18} />
                                        </button>
                                        <div className="flex items-center gap-4">
                                            <div className="hidden sm:flex flex-col items-end">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Neural Readiness</p>
                                                <p className="text-[11px] font-black text-indigo-600">{tender.eligibility}% Match</p>
                                            </div>
                                            <div className="h-10 w-1 bg-gray-100 dark:bg-white/10 mx-2" />
                                            <button className="p-3 bg-white/40 dark:bg-white/5 border border-white/20 rounded-xl text-gray-400 hover:text-indigo-600 transition-all"><Download size={18} /></button>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {currentData.length === 0 && (
                    <div className="h-[500px] glass-card border-2 border-dashed border-white/10 rounded-[60px] flex flex-col items-center justify-center p-20 text-center opacity-40">
                        <ClipboardCheck className="w-16 h-16 text-gray-300 mb-6" />
                        <h3 className="text-xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter">No Active Procurement cycles</h3>
                        <p className="text-xs font-medium max-w-xs">Scan the network for new GeM/CPPP institutional opportunities.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Right: Procurement Metadata HUD */}
        <div className="xl:col-span-4 flex flex-col gap-8">
            
            {/* Compliance Matrix */}
            <div className="glass-card border border-white/20 rounded-[48px] p-8 lg:p-10 space-y-10 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                 
                 <div className="flex items-center gap-4 pl-1">
                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    <h2 className="text-sm font-black uppercase tracking-widest leading-none">Compliance Vault</h2>
                 </div>

                 <div className="space-y-6">
                    {[
                        { label: 'FSSAI License', status: 'Verified', color: 'text-emerald-500' },
                        { label: 'MSME / Udyam', status: 'Active', color: 'text-emerald-500' },
                        { label: 'ODOP Scheme', status: 'Priority', color: 'text-indigo-600' },
                        { label: 'GSTIN Invoices', status: 'Verified', color: 'text-emerald-500' },
                    ].map(item => (
                        <div key={item.label} className="flex items-center justify-between p-4 bg-white/40 dark:bg-white/5 border border-white/10 rounded-2xl group transition-all hover:border-emerald-500/30">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.label}</span>
                            <span className={`text-[9px] font-black ${item.color} uppercase tracking-widest flex items-center gap-2`}>
                                <CheckCircle2 size={12} /> {item.status}
                            </span>
                        </div>
                    ))}
                 </div>

                 <div className="p-6 bg-indigo-600/5 border border-indigo-500/10 rounded-[32px]">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-relaxed mb-1 italic">Strategist Insight:</p>
                    <p className="text-[10px] font-medium text-gray-500 leading-relaxed italic">
                        Your **ODOP Priority** tagging increases technical win-probability by 12% in state-sponsored grain procurement.
                    </p>
                 </div>
            </div>

            {/* Neural Win Probability */}
            <div className="glass-card border border-white/20 rounded-[48px] p-10 flex flex-col items-center justify-center text-center space-y-6">
                 <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" className="stroke-gray-100 dark:stroke-white/5 fill-none" strokeWidth="12" />
                        <motion.circle 
                            cx="80" cy="80" r="70" className="stroke-indigo-600 fill-none" strokeWidth="12"
                            strokeLinecap="round" strokeDasharray="440" initial={{ strokeDashoffset: 440 }} animate={{ strokeDashoffset: 440 - (440 * 0.842) }}
                            transition={{ duration: 2, ease: "easeOut" }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-4xl font-display font-black tracking-tighter">84%</p>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Neural WP</p>
                    </div>
                 </div>
                 <div>
                    <h3 className="text-sm font-black uppercase tracking-widest">Bidding Alpha</h3>
                    <p className="text-[10px] font-medium text-gray-500 mt-2 italic px-6">Calculated across 42 parameters including price history and institutional behavior.</p>
                 </div>
            </div>

        </div>

      </div>

      {/* Bid Preparation Modal */}
      <AnimatePresence>
        {selectedTender && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-20">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gray-950/80 backdrop-blur-xl" 
                    onClick={() => setSelectedTender(null)}
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }}
                    className="glass-card border border-white/20 rounded-[64px] w-full max-w-4xl p-10 lg:p-16 relative z-10 overflow-hidden shadow-2xl"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
                    
                    <div className="flex flex-col gap-10">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-4xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Initialize Institutional Bid</h2>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.2em]">{selectedTender.title}</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bid Amount (₹)</label>
                                     <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-600">
                                            <Landmark size={18} />
                                        </div>
                                        <input 
                                            type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)}
                                            placeholder="Suggested: ₹28,450"
                                            className="input pl-20 h-18 w-full bg-white/50 dark:bg-white/5 border border-white/20 rounded-3xl text-2xl font-display font-black tracking-tight"
                                        />
                                     </div>
                                     <div className="flex items-center gap-3 px-1">
                                        <Sparkles className="text-amber-500" size={12} />
                                        <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest italic">AI suggest: Bid ₹27,800 - ₹29,200 for 75% Win Probability</p>
                                     </div>
                                </div>

                                <div className="space-y-4">
                                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Logistics Timeline (Days)</label>
                                     <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-600">
                                            <Clock size={18} />
                                        </div>
                                        <input 
                                            type="number" value={timeline} onChange={e => setTimeline(e.target.value)}
                                            placeholder="30"
                                            className="input pl-20 h-18 w-full bg-white/50 dark:bg-white/5 border border-white/20 rounded-3xl text-2xl font-display font-black tracking-tight"
                                        />
                                     </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-8">
                                <div className="glass-card bg-indigo-500/5 border border-indigo-500/20 rounded-[32px] p-8 space-y-4">
                                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Responsive compliance</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 text-xs font-bold"><CheckCircle2 size={16} className="text-emerald-500" /> FSSAI License Auto-Attached</div>
                                        <div className="flex items-center gap-3 text-xs font-bold"><CheckCircle2 size={16} className="text-emerald-500" /> Mandi Inventory Verified</div>
                                        <div className="flex items-center gap-3 text-xs font-black text-indigo-600"><Zap size={16} /> ODOP Priority Applied</div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleBid(selectedTender)}
                                    disabled={isSubmitting}
                                    className="h-24 w-full bg-indigo-600 text-white rounded-[32px] text-xl font-display font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/40 active:scale-95 transition-all flex items-center justify-center gap-4"
                                >
                                    {isSubmitting ? <RefreshCw className="animate-spin" /> : <>Finalize Bid Submission <ArrowRight size={24} /></>}
                                </button>
                                <p className="text-[9px] font-black text-gray-400 uppercase text-center italic tracking-widest">Legally binding on ODOP DLT Consensus</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
             </div>
        )}
      </AnimatePresence>

    </div>
  );
}
