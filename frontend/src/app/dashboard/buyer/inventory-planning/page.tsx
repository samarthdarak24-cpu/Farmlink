'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Boxes, Target, Layers, ArrowUpRight, 
  Activity, CheckCircle, Clock, Search, 
  Filter, Package, Globe, ShieldCheck, 
  ChevronRight, ArrowRight, Zap, TrendingUp, 
  BrainCircuit, Info, Cpu
} from 'lucide-react';
import Link from 'next/link';

export default function InventoryPlanningPage() {
  const [stockLevel, setStockLevel] = useState(65);

  const inventory = [
    { id: 'ST-01', item: 'Potato Bulk (Grade A)', current: 1200, target: 1500, unit: 'kg', health: 'Optimal', burnRate: '45kg/day' },
    { id: 'ST-02', item: 'Onion Red (Medium)', current: 400, target: 2000, unit: 'kg', health: 'Critical', burnRate: '80kg/day' },
    { id: 'ST-03', item: 'Tomato Hybrid', current: 800, target: 1000, unit: 'kg', health: 'Normal', burnRate: '25kg/day' },
  ];

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 px-1">
        <div>
          <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-4">
             Inventory <span className="text-indigo-600">Planning</span>
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] pl-1">Strategic Stock Buffer & Deployment Matrix</p>
        </div>
        <div className="flex items-center gap-4 bg-white/40 dark:bg-white/5 p-2 rounded-2xl border border-white/20 shadow-sm backdrop-blur-xl shrink-0">
             <button className="h-10 px-6 rounded-xl bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">Recalculate Buffer</button>
             <button className="h-10 px-6 rounded-xl bg-white/50 dark:bg-white/10 text-[9px] font-black uppercase tracking-widest text-gray-500 border border-white/20 hover:text-indigo-600 transition-all">Audit Vault</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main List */}
          <div className="lg:col-span-8 space-y-8">
              <div className="flex items-center gap-6 mb-4">
                 <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-600 transition-colors" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search vault inventory... " 
                      className="w-full h-16 pl-16 pr-8 rounded-[32px] bg-white dark:bg-white/5 border border-white/20 focus:border-indigo-500 outline-none transition-all placeholder:text-[10px] placeholder:font-black uppercase tracking-widest"
                    />
                 </div>
                 <button className="h-16 w-16 rounded-[32px] bg-white dark:bg-white/5 border border-white/20 flex items-center justify-center text-gray-500 hover:text-indigo-600 transition-all shadow-sm">
                      <Filter size={24} />
                 </button>
              </div>

              <AnimatePresence mode="popLayout">
                {inventory.map((i, idx) => (
                  <motion.div 
                    key={i.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card border border-white/20 rounded-[48px] p-10 flex flex-col group hover:border-indigo-500/30 transition-all overflow-hidden relative shadow-lg"
                  >
                     <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
                     
                     <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10 w-full mb-10 pb-10 border-b border-white/10 border-dashed">
                        <div className="flex items-center gap-8 flex-1 w-full md:w-auto">
                           <div className="w-20 h-20 bg-white dark:bg-white/5 border border-white/10 rounded-[32px] shrink-0 flex items-center justify-center text-indigo-600 shadow-inner group-hover:rotate-12 transition-transform">
                              <Boxes size={32} />
                           </div>
                           <div className="space-y-4 pt-1 w-full text-center md:text-left">
                              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                 <span className={`text-[9px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${i.health === 'Optimal' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : i.health === 'Critical' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>{i.health} Node</span>
                                 <span className="text-[9px] font-black px-3 py-1 bg-gray-100 dark:bg-white/5 text-gray-400 uppercase tracking-widest rounded-full">{i.id}</span>
                              </div>
                              <h3 className="text-2xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none group-hover:text-indigo-600 transition-colors">{i.item}</h3>
                              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 font-bold text-[10px] uppercase tracking-widest text-gray-400 opacity-60">
                                 <span className="flex items-center gap-1.5"><Activity size={12} /> Burn: {i.burnRate}</span>
                                 <span className="flex items-center gap-1.5"><ShieldCheck size={12} /> 100% Tracking</span>
                              </div>
                           </div>
                        </div>

                        <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 leading-none opacity-40 group-hover:opacity-100 transition-opacity">Current Volume</p>
                           <p className="text-4xl font-display font-black text-gray-900 dark:text-white tracking-tighter leading-none">{i.current} <span className="text-sm uppercase opacity-40">{i.unit}</span></p>
                           <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1 opacity-70">Target: {i.target}{i.unit}</p>
                        </div>
                     </div>

                     <div className="space-y-6 relative z-10 w-full mb-4">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                           <span>Stock Fill %</span>
                           <span className={i.current/i.target < 0.3 ? 'text-rose-500' : 'text-emerald-500'}>{Math.round((i.current / i.target) * 100)}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${(i.current/i.target)*100}%` }} className={`h-full ${i.current/i.target < 0.3 ? 'bg-rose-500 shadow-[0_0_15px_0_rgba(244,63,94,0.5)]' : 'bg-emerald-500 shadow-[0_0_15px_0_rgba(16,185,129,0.5)]'}`} />
                        </div>
                        <div className="flex justify-end gap-3">
                           <Link href="/dashboard/buyer/products">
                              <button className="h-12 px-8 bg-black dark:bg-white dark:text-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all">Procure Node</button>
                           </Link>
                           <Link href="/dashboard/buyer/auto-reorder">
                              <button className="h-12 px-6 bg-white dark:bg-white/5 border border-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-indigo-600 transition-all flex items-center justify-center gap-3">
                                 <Zap size={16} /> Auto Reorder
                              </button>
                           </Link>
                        </div>
                     </div>
                  </motion.div>
                ))}
              </AnimatePresence>
          </div>

          {/* Sidebar Planner */}
          <div className="lg:col-span-4 flex flex-col gap-10">
              <div className="glass-card border border-white/20 rounded-[48px] p-10 space-y-10 group relative overflow-hidden bg-gradient-to-br from-indigo-900 to-black text-white shadow-2xl sticky top-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                  
                  <div className="flex items-center gap-4 text-indigo-400 mb-2 pl-1 relative z-10">
                      <BrainCircuit className="w-7 h-7" />
                      <h2 className="text-lg font-display font-black uppercase tracking-tight leading-none">AI Buffer Core</h2>
                  </div>

                  <div className="space-y-8 relative z-10">
                     <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] space-y-6">
                        <div className="flex justify-between items-center text-indigo-100">
                            <p className="text-[10px] font-black uppercase tracking-widest">Inventory Health</p>
                            <span className="text-3xl font-display font-black tracking-tighter">74%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: '74%' }} className="h-full bg-indigo-500 shadow-[0_0_15px_0_rgba(99,102,241,0.5)]" />
                        </div>
                     </div>

                     <div className="space-y-6 pl-2">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Stock Alerts</h3>
                        {[ 
                           { t: 'Shortage Risk', v: 'Onions' },
                           { t: 'Optimal Level', v: 'Potato' },
                           { t: 'Overstock Risk', v: 'None' }
                        ].map((s, i) => (
                           <div key={i} className="flex justify-between items-center group/s">
                              <span className="text-[11px] font-bold text-gray-400 group-hover/s:text-white transition-colors uppercase tracking-widest">{s.t}</span>
                              <span className={`text-[11px] font-display font-black ${s.v === 'Onions' ? 'text-rose-400' : 'text-emerald-400'}`}>{s.v}</span>
                           </div>
                        ))}
                     </div>

                     <div className="p-8 bg-white/5 rounded-[32px] border border-white/5 flex gap-4">
                        <Info size={24} className="text-indigo-400 shrink-0 mt-0.5 opacity-60" />
                        <div>
                           <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2 leading-none">Buffer Logic</p>
                           <p className="text-[9px] text-gray-400 leading-relaxed font-bold lowercase first-letter:uppercase">Buffer recalculations occur every 24h based on institutional burn rate and regional cluster availability.</p>
                        </div>
                     </div>
                  </div>
              </div>
          </div>

      </div>

    </div>
  );
}
