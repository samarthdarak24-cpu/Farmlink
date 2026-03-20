'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Plus, Search, Calendar, 
  MapPin, CheckCircle, Clock, Trash2, 
  ArrowRight, Activity, Sparkles, Send, 
  ChevronRight, ArrowUpRight, Zap, Target
} from 'lucide-react';
import { rfqApi, productsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function RfqCreationPage() {
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createBusy, setCreateBusy] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [showRfqForm, setShowRfqForm] = useState(false);

  const [draft, setDraft] = useState({
    productCategory: '',
    productName: '',
    quantity: '',
    unit: 'kg',
    notes: '',
    expiresInDays: 7
  });

  useEffect(() => {
    loadRfqs();
    loadCategories();
  }, []);

  const loadRfqs = async () => {
    setLoading(true);
    try {
      const res = await rfqApi.getMyRfqs();
      setRfqs(res.data || []);
    } catch { toast.error('RFQ sync failed'); }
    finally { setLoading(false); }
  };

  const loadCategories = async () => {
    try {
      const res = await productsApi.getCategories();
      setCategories(res.data || []);
    } catch { /* ignored */ }
  };

  const handleCreate = async () => {
    if (!draft.productCategory || !draft.quantity) return;
    setCreateBusy(true);
    try {
      await rfqApi.create({
        ...draft,
        quantity: Number(draft.quantity),
        expiresAt: new Date(Date.now() + draft.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      });
      toast.success('RFQ Broadcast Injected', { icon: '📡' });
      setDraft({ productCategory: '', productName: '', quantity: '', unit: 'kg', notes: '', expiresInDays: 7 });
      setShowRfqForm(false);
      loadRfqs();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'RFQ failed');
    } finally {
      setCreateBusy(false);
    }
  };

  return (
    <div className="space-y-12 pb-24 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div>
          <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter">
             Global <span className="text-amber-500">RFQ Hall</span>
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">Institution Sourcing Broadcast Matrix</p>
        </div>
        {!showRfqForm && (
          <button 
           onClick={() => setShowRfqForm(true)}
           className="h-14 px-10 bg-black dark:bg-white dark:text-black text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all flex items-center gap-3"
          >
             BroadCast New RFQ
             <Plus size={16} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showRfqForm && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="glass-card border-2 border-primary-500/20 rounded-[48px] p-10 relative overflow-hidden group shadow-2xl shadow-primary-500/10"
          >
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[80px] pointer-events-none" />
             
             <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-lg"><Plus size={18} /></div>
                    <h2 className="text-xl font-display font-black uppercase tracking-tight leading-none">Broadcast Parameters</h2>
                </div>
                <button onClick={() => setShowRfqForm(false)} className="text-[10px] font-black uppercase text-gray-400 hover:text-rose-500 transition-colors">Discard Draft</button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-2">Sourcing Category</label>
                    <select 
                        className="w-full h-14 px-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/20 focus:border-primary-500 outline-none transition-all font-black text-[10px] uppercase tracking-widest text-gray-900 dark:text-white"
                        value={draft.productCategory}
                        onChange={(e) => setDraft({ ...draft, productCategory: e.target.value, productName: e.target.value })}
                    >
                        <option value="">Select Category...</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-2">Target Volume</label>
                    <div className="flex gap-3">
                        <input 
                            type="number" 
                            placeholder="Amount"
                            className="flex-1 h-14 px-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/20 focus:border-primary-500 outline-none transition-all font-bold"
                            value={draft.quantity}
                            onChange={(e) => setDraft({ ...draft, quantity: e.target.value })}
                        />
                        <select 
                            className="w-24 h-14 px-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/20 focus:border-primary-500 outline-none transition-all font-black text-[10px] uppercase tracking-widest"
                            value={draft.unit}
                            onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
                        >
                            <option value="kg">KG</option>
                            <option value="ton">TON</option>
                            <option value="quintal">QUINTAL</option>
                        </select>
                    </div>
                </div>
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-2">Network Expiration (Days)</label>
                    <div className="flex items-center gap-4 bg-white/50 dark:bg-white/5 p-2 px-4 border border-white/20 rounded-2xl">
                         <input 
                            type="range" min="1" max="30" 
                            className="flex-1 accent-primary-600 h-2"
                            value={draft.expiresInDays}
                            onChange={(e) => setDraft({ ...draft, expiresInDays: parseInt(e.target.value) })}
                         />
                         <span className="font-display font-black text-gray-900 dark:text-white w-8">{draft.expiresInDays}</span>
                    </div>
                </div>
             </div>

             <div className="mt-8 space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-2">Sourcing Logic & Specific Requirements</label>
                <textarea 
                    placeholder="Describe specific quality requirements, delivery schedule, certification needs..."
                    className="w-full h-32 px-8 py-6 rounded-3xl bg-white/50 dark:bg-white/5 border border-white/20 focus:border-primary-500 outline-none transition-all font-bold text-sm"
                    value={draft.notes}
                    onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                />
             </div>

             <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/10">
                     <Zap size={20} className="text-amber-500" />
                     <p className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-400 tracking-widest leading-none">Broadcast will reach ~450 verified cluster nodes in NASHIK Zone</p>
                 </div>
                 <button 
                   disabled={createBusy || !draft.productCategory || !draft.quantity}
                   onClick={handleCreate}
                   className={`h-16 px-14 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all ${!draft.productCategory || !draft.quantity ? 'bg-gray-100 dark:bg-white/10 text-gray-400' : 'bg-primary-600 text-white shadow-primary-500/30'}`}
                 >
                    {createBusy ? 'Initing Socket...' : 'Inject Broadcast'}
                    <Send size={18} />
                 </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Active Broadcasts */}
          <div className="xl:col-span-8 space-y-6">
              <div className="flex items-center justify-between mb-4 pl-1">
                 <h2 className="text-xl font-display font-black uppercase tracking-tight flex items-center gap-3">
                    <Activity size={18} className="text-indigo-600" /> Status Monitor
                 </h2>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{rfqs.length} Total Nodes Active</p>
              </div>
              
              <AnimatePresence mode="popLayout">
                {rfqs.length > 0 ? (
                  rfqs.map((r, idx) => (
                    <motion.div 
                      key={r.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="glass-card border border-white/20 rounded-[32px] p-6 group hover:border-indigo-500/30 transition-all overflow-hidden relative"
                    >
                       <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg ${idx % 3 === 0 ? 'from-amber-600 to-orange-600' : idx % 3 === 1 ? 'from-indigo-600 to-blue-600' : 'from-emerald-600 to-teal-600'}`}>
                             <FileText size={20} />
                          </div>
                          <div className="flex-1 space-y-1 w-full text-center md:text-left">
                             <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-1">
                                <span className="text-[10px] font-black px-3 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 uppercase tracking-widest">{r.productCategory}</span>
                                <span className="text-[10px] font-black px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase tracking-widest flex items-center gap-1.5"><Clock size={10} /> {new Date(r.expiresAt).toLocaleDateString()} Final</span>
                             </div>
                             <h4 className="text-lg font-display font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none">ID: #{r.id.slice(-8).toUpperCase()}</h4>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-60">Payload: {r.quantity} {r.unit || 'kg'} • {r.notes || 'No Specific Req.'}</p>
                          </div>
                          <div className="flex items-center gap-6 w-full md:w-auto justify-center md:justify-end">
                             <div className="text-center md:text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none opacity-40">Responses</p>
                                <p className="text-2xl font-display font-black text-indigo-600 leading-none">{(r.responses || []).length}</p>
                             </div>
                             <Link href="/dashboard/buyer/proposals">
                                <button className="h-12 px-6 bg-white dark:bg-white/5 border border-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-3 group/btn hover:border-primary-500 translate-all transition-all">
                                    Manage
                                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                             </Link>
                          </div>
                       </div>
                    </motion.div>
                  ))
                ) : !loading ? (
                    <div className="py-20 text-center glass-card border-dashed border-2 border-white/20 rounded-[48px]">
                        <Search size={40} className="mx-auto text-gray-300 mb-6" />
                        <h3 className="text-xl font-display font-black uppercase tracking-tighter text-gray-400">Zero Active Broadcasts</h3>
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mt-2 max-w-sm mx-auto">Inject a new RFQ broadcast into the ODOP matrix to solicit proposals from verified clusters.</p>
                    </div>
                ) : null}
              </AnimatePresence>
          </div>

          <div className="xl:col-span-4 space-y-8">
              <div className="glass-card border border-white/20 rounded-[48px] p-10 space-y-8 group relative overflow-hidden sticky top-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                  
                  <div className="flex items-center gap-4 text-amber-600 mb-2 pl-1">
                      <Sparkles className="w-7 h-7" />
                      <h2 className="text-lg font-display font-black uppercase tracking-tight leading-none">Hall Intelligence</h2>
                  </div>

                  <div className="space-y-6">
                      <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-[32px] border border-indigo-100 dark:border-indigo-800">
                          <p className="text-[9px] font-black text-indigo-800 dark:text-indigo-400 uppercase tracking-[0.2em] mb-3">Sourcing Efficiency</p>
                          <div className="flex items-end gap-3">
                              <span className="text-4xl font-display font-black leading-none text-gray-900 dark:text-white">94%</span>
                              <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1 mb-1"><Target size={12} /> High Trust</span>
                          </div>
                      </div>

                      <div className="space-y-4">
                         <div className="flex items-center gap-4 group/tip">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover/tip:bg-amber-100 group-hover/tip:text-amber-600 transition-all"><Zap size={14} /></div>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-loose">RFQ broadcasts are visible to farmers within 200km radius for logistics optimization.</p>
                         </div>
                         <div className="flex items-center gap-4 group/tip">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover/tip:bg-indigo-100 group-hover/tip:text-indigo-600 transition-all"><Target size={14} /></div>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-loose">Automated cluster matchmaking increases proposal yield by 4.2x compared to manual searches.</p>
                         </div>
                      </div>
                  </div>
              </div>
          </div>

      </div>

    </div>
  );
}
