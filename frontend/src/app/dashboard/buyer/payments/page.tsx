'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, ShieldCheck, Download, ExternalLink, 
  Search, Filter, Lock, Eye, 
  CheckCircle, Clock, Trash2, ArrowRight, 
  User, Activity, Target, Zap, 
  ChevronRight, BrainCircuit, Star, 
  Wallet, Landmark, ReceiptText, ArrowUpRight, ArrowDownRight,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function PaymentTrackingPage() {
  const [filter, setFilter] = useState<'all' | 'escrow' | 'released' | 'disputed'>('all');

  const payments = [
    { id: 'PAY-8211', orderId: 'ORD-122', supplier: 'Nashik Cluster A', status: 'Escrow Locked', date: '2026-03-20', amount: 42000, method: 'Smart Contract' },
    { id: 'PAY-7790', orderId: 'ORD-118', supplier: 'Pune Grains Node', status: 'Released', date: '2026-03-15', amount: 12500, method: 'Direct Bank' },
    { id: 'PAY-6512', orderId: 'ORD-110', supplier: 'Satara Organic', status: 'In Processing', date: '2026-03-20', amount: 2400, method: 'Smart Contract' },
  ];

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto">
      
      {/* Financial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 px-1">
        <div>
          <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-4">
             Financial <span className="text-emerald-600">Ledger</span>
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] pl-1">Institutional Escrow & Payment Matrix</p>
        </div>
        <div className="flex items-center gap-4 bg-white/40 dark:bg-white/5 p-2 rounded-[32px] border border-white/20 shadow-sm backdrop-blur-xl shrink-0">
             <div className="px-6 py-2 border-r border-white/10 text-center">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Escrow Held</p>
                 <p className="text-xl font-display font-black text-emerald-600 leading-none">₹54,200</p>
             </div>
             <div className="px-6 py-2 text-center text-indigo-500">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Wallet Balance</p>
                 <p className="text-xl font-display font-black leading-none">₹12.4L</p>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Payments Flow */}
          <div className="lg:col-span-8 space-y-8">
              <div className="flex items-center gap-4 bg-white/40 dark:bg-white/5 p-1.5 rounded-2xl border border-white/20 shadow-sm backdrop-blur-xl w-fit">
                   {(['all', 'escrow', 'released', 'disputed'] as const).map(f => (
                      <button 
                         key={f}
                         onClick={() => setFilter(f)}
                         className={`h-12 px-8 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                      >
                         {f}
                      </button>
                   ))}
              </div>

              <AnimatePresence mode="popLayout">
                {payments.map((p, idx) => (
                  <motion.div 
                    key={p.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card border border-white/20 rounded-[48px] p-10 flex flex-col group hover:border-emerald-500/30 transition-all overflow-hidden relative shadow-lg"
                  >
                     <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
                     
                     <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10 w-full mb-8 pb-8 border-b border-white/10 border-dashed">
                        <div className="flex items-center gap-8 flex-1 w-full md:w-auto">
                           <div className="w-16 h-16 bg-white dark:bg-white/5 border border-white/10 rounded-[28px] shrink-0 flex items-center justify-center text-emerald-600 shadow-inner group-hover:rotate-12 transition-transform">
                              <ReceiptText size={28} />
                           </div>
                           <div className="space-y-4 pt-1 w-full text-center md:text-left">
                              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                 <span className={`text-[9px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${p.status === 'Released' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'}`}>{p.status}</span>
                                 <span className="text-[9px] font-black px-3 py-1 bg-gray-100 dark:bg-white/5 text-gray-400 uppercase tracking-widest rounded-full">{p.id}</span>
                              </div>
                              <h3 className="text-xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none group-hover:text-emerald-600 transition-colors">Vendor: {p.supplier}</h3>
                              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 font-bold text-[10px] uppercase tracking-widest text-gray-400 opacity-60">
                                 <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500" /> {p.method}</span>
                                 <span className="flex items-center gap-2"><Calendar size={12} /> {new Date(p.date).toLocaleDateString()}</span>
                                 <span className="flex items-center gap-2"><ArrowRight size={12} /> Ref: {p.orderId}</span>
                              </div>
                           </div>
                        </div>

                        <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 leading-none opacity-40 group-hover:opacity-100 transition-opacity">Payload Value</p>
                           <p className="text-3xl font-display font-black text-gray-900 dark:text-white tracking-tighter leading-none">₹{p.amount.toLocaleString()}</p>
                           <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-1 hover:underline">View Transaction</button>
                        </div>
                     </div>

                     <div className="flex items-center justify-between w-full relative z-10 px-4">
                        <div className="flex items-center gap-6">
                           <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                              <ShieldCheck size={14} /> Smart Contract Valid
                           </div>
                           <div className="w-px h-6 bg-white/10" />
                           <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              <Lock size={14} /> Escrow Protection Active
                           </div>
                        </div>
                        <button className="h-10 w-10 bg-white dark:bg-white/5 border border-white/20 rounded-xl flex items-center justify-center text-gray-400 hover:text-emerald-500 transition-all"><Download size={18} /></button>
                     </div>
                  </motion.div>
                ))}
              </AnimatePresence>
          </div>

          {/* Sidebar Stats */}
          <div className="lg:col-span-4 flex flex-col gap-10">
              <div className="glass-card border border-white/20 rounded-[48px] p-10 space-y-10 group relative overflow-hidden bg-gradient-to-br from-gray-900 to-black text-white shadow-2xl sticky top-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                  
                  <div className="flex items-center gap-4 text-emerald-400 mb-2 pl-1 relative z-10">
                      <Landmark className="w-7 h-7" />
                      <h2 className="text-lg font-display font-black uppercase tracking-tight leading-none">Vault Analysis</h2>
                  </div>

                  <div className="space-y-8 relative z-10 py-6 border-y border-white/10">
                     <div className="flex justify-between items-center group/p text-emerald-100">
                        <span className="text-[10px] font-black uppercase tracking-widest">Total Committed</span>
                        <span className="text-3xl font-display font-black tracking-tighter">₹5.4L</span>
                     </div>
                     <div className="flex justify-between items-center group/p text-emerald-100">
                        <span className="text-[10px] font-black uppercase tracking-widest">Savings Delta</span>
                        <span className="text-xl font-display font-black text-emerald-500 flex items-center gap-2">12.5% <ArrowUpRight size={16} /></span>
                     </div>
                  </div>

                  <div className="space-y-6 pl-2">
                     <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Institutional Wallets</h3>
                     {[ 
                        { t: 'Primary Smart Vault', v: '● 8291' },
                        { t: 'Strategic Reserve', v: '● 4410' },
                        { t: 'Direct Bank Node', v: 'Link Now' }
                     ].map((w, i) => (
                        <div key={i} className="flex justify-between items-center group/w">
                           <span className="text-[11px] font-bold text-gray-400 group-hover/w:text-white transition-colors uppercase tracking-widest">{w.t}</span>
                           <span className={`text-[11px] font-mono text-emerald-400 ${w.v.includes('Link') ? 'underline cursor-pointer' : ''}`}>{w.v}</span>
                        </div>
                     ))}
                  </div>

                  <div className="p-8 bg-white/5 rounded-[32px] border border-white/5 flex gap-4">
                     <Lock size={24} className="text-indigo-400 shrink-0 mt-0.5 opacity-60" />
                     <div>
                        <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2 leading-none">Escrow Policy</p>
                        <p className="text-[9px] text-gray-400 leading-relaxed font-bold lowercase first-letter:uppercase">Institutional funds are held in multi-sig escrow nodes and released only upon QR-based node delivery confirmation.</p>
                     </div>
                  </div>
              </div>
          </div>

      </div>

    </div>
  );
}
