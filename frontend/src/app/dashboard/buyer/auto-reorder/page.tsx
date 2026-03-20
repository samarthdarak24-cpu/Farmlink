'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, ToggleLeft, ToggleRight, Settings, 
  Search, Filter, Activity, CheckCircle, 
  Clock, Plus, Trash2, ArrowRight, 
  Target, ShieldCheck, Box, RefreshCw, 
  Cpu, Database, Layers
} from 'lucide-react';

export default function AutoReorderLogicPage() {
  const [rules, setRules] = useState([
    { id: 'AR-1', item: 'Tomato Bulk', threshold: 100, reorderQty: 500, status: 'Active', supplier: 'Best Price Cluster' },
    { id: 'AR-2', item: 'Onion Red', threshold: 200, reorderQty: 1000, status: 'Active', supplier: 'Nashik Cluster #02' },
    { id: 'AR-3', item: 'Potato Premium', threshold: 50, reorderQty: 200, status: 'Disabled', supplier: 'Pune Node' },
  ]);

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 px-1">
        <div>
          <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-4">
             Automation <span className="text-amber-500">Command</span>
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] pl-1">Autonomous Stock Replenishment Logic</p>
        </div>
        <div className="flex items-center gap-4 bg-white/40 dark:bg-white/5 p-2 rounded-2xl border border-white/20 shadow-sm backdrop-blur-xl shrink-0">
             <div className="px-6 py-2 border-r border-white/10 text-center">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Rules Active</p>
                 <p className="text-xl font-display font-black text-gray-900 dark:text-white leading-none">2</p>
             </div>
             <button className="h-10 px-6 rounded-xl bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 flex items-center gap-2">
                <Plus size={14} /> New Rule
             </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main List */}
          <div className="lg:col-span-8 flex flex-col gap-10">
              <div className="glass-card border border-white/20 rounded-[48px] p-12 group relative overflow-hidden bg-gradient-to-br from-amber-500/5 to-transparent shadow-xl">
                 <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
                 
                 <div className="text-center mb-12">
                    <div className="w-24 h-24 bg-amber-600 rounded-[32px] flex items-center justify-center text-white mx-auto shadow-2xl shadow-amber-500/30 mb-8 group-hover:rotate-12 transition-transform">
                       <Cpu size={40} className="animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-display font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-2 leading-none">Active Reorder Matrix</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Autonomous Procurement Node Execution</p>
                 </div>

                 <div className="relative z-10 space-y-6">
                    {rules.map((r, idx) => (
                       <motion.div 
                         key={r.id}
                         initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                         className="p-8 bg-white/40 dark:bg-white/5 border border-white/20 rounded-[40px] flex flex-col md:flex-row items-center gap-10 group/item hover:border-amber-500/30 transition-all shadow-sm relative overflow-hidden"
                       >
                          <div className={`absolute top-0 left-0 h-full w-2 ${r.status === 'Active' ? 'bg-amber-500' : 'bg-gray-400'} opacity-40`} />
                          
                          <div className="flex-1 space-y-3 w-full text-center md:text-left">
                             <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <span className={`text-[9px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${r.status === 'Active' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>{r.status} NODE</span>
                                <span className="text-[9px] font-black px-3 py-1 bg-gray-100 dark:bg-white/5 text-gray-400 uppercase tracking-widest rounded-full">{r.id}</span>
                             </div>
                             <h4 className="text-xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none group-hover/item:text-amber-600 transition-colors">{r.item}</h4>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-60">Logic: IF stock {'<'} {r.threshold}kg THEN order {r.reorderQty}kg FROM {r.supplier}</p>
                          </div>

                          <div className="flex items-center gap-8 w-full md:w-auto justify-center md:justify-end">
                             <div className="text-center md:text-right shrink-0">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 leading-none opacity-40">Trigger Point</p>
                                <p className="text-2xl font-display font-black text-gray-900 dark:text-white tracking-tighter leading-none">{r.threshold}kg</p>
                             </div>
                             <div className="flex gap-3">
                                <button className="h-12 w-12 bg-white dark:bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-amber-500 hover:scale-110 active:scale-95 transition-all">
                                   <Settings size={18} />
                                </button>
                                <button className="h-12 w-12 bg-white dark:bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-rose-500 hover:scale-110 active:scale-95 transition-all">
                                   <Trash2 size={18} />
                                </button>
                             </div>
                          </div>
                       </motion.div>
                    ))}

                    <button className="w-full h-20 border-2 border-dashed border-white/20 rounded-[40px] flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:border-amber-500 hover:text-amber-500 transition-all bg-white/10">
                       <Plus size={20} /> Add Automation Clause
                    </button>
                 </div>
              </div>
          </div>

          {/* Sidebar Analytics */}
          <div className="lg:col-span-4 flex flex-col gap-10">
              <div className="glass-card border border-white/20 rounded-[48px] p-10 space-y-10 group relative overflow-hidden bg-gradient-to-br from-amber-900/60 to-black text-white shadow-2xl sticky top-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                  
                  <div className="flex items-center gap-4 text-amber-400 mb-2 pl-1 relative z-10">
                      <Zap className="w-7 h-7" />
                      <h2 className="text-lg font-display font-black uppercase tracking-tight leading-none">Auto-Pulse</h2>
                  </div>

                  <div className="space-y-8 relative z-10">
                     <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] space-y-6">
                        <div className="flex justify-between items-center text-amber-100">
                            <p className="text-[10px] font-black uppercase tracking-widest">Efficiency GAIN</p>
                            <span className="text-3xl font-display font-black tracking-tighter">+24.2%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-amber-500 shadow-[0_0_15px_0_rgba(245,158,11,0.5)]" />
                        </div>
                     </div>

                     <div className="space-y-6 pl-2">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Latest Triggers</h3>
                        {[ 
                           { t: 'ORD-8291 (Automated)', v: '2h ago' },
                           { t: 'Threshold Check #42', v: 'LIVE' },
                           { t: 'Node Sync Success', v: '8m ago' }
                        ].map((s, i) => (
                           <div key={i} className="flex justify-between items-center group/s">
                              <span className="text-[11px] font-bold text-gray-400 group-hover/s:text-white transition-colors uppercase tracking-widest">{s.t}</span>
                              <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">{s.v}</span>
                           </div>
                        ))}
                     </div>

                     <div className="p-8 bg-white/5 rounded-[32px] border border-white/5 flex gap-4">
                        <ShieldCheck size={24} className="text-emerald-400 shrink-0 mt-0.5 opacity-60" />
                        <div>
                           <p className="text-[10px] font-black text-amber-200 uppercase tracking-widest mb-2 leading-none">Security Override</p>
                           <p className="text-[9px] text-gray-400 leading-relaxed font-bold lowercase first-letter:uppercase">Automatic procurement is capped at ₹50K per transaction. Strategic manual approval required for large-volume node replenishment.</p>
                        </div>
                     </div>
                  </div>
              </div>
          </div>

      </div>

    </div>
  );
}
