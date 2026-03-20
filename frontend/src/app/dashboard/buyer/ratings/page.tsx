'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Search, Filter, ShieldCheck, 
  CheckCircle, MessageSquare, ArrowRight, 
  Activity, Award, User, Target, 
  ChevronRight, Zap, TrendingUp, Info
} from 'lucide-react';
import Link from 'next/link';

export default function SupplierRatingsPage() {
  const [search, setSearch] = useState('');

  const suppliers = [
    { id: 'S1', name: 'Nashik Progressive Cluster', rating: 4.9, reviews: 142, category: 'Vegetables', clusters: 12, trustScore: 98, level: 'Premium' },
    { id: 'S2', name: 'Konkan Mango Export Node', rating: 4.8, reviews: 89, category: 'Fruits', clusters: 4, trustScore: 99, level: 'Institutional' },
    { id: 'S3', name: 'Pune Grains Syndicate', rating: 4.7, reviews: 210, category: 'Grains', clusters: 18, trustScore: 96, level: 'Standard' },
    { id: 'S4', name: 'Satara Organic Hub', rating: 4.6, reviews: 76, category: 'Organic', clusters: 6, trustScore: 97, level: 'Premium' },
  ];

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 px-1">
        <div>
          <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-4">
             Node <span className="text-amber-500">Reputation</span>
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] pl-1">Global Supplier Trust & Rating Matrix</p>
        </div>
        <div className="flex items-center gap-4 flex-1 max-w-xl">
           <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-amber-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search cluster reputation... " 
                className="w-full h-16 pl-16 pr-8 rounded-[32px] bg-white dark:bg-white/5 border border-white/20 shadow-sm focus:border-amber-500 outline-none transition-all placeholder:text-[10px] placeholder:font-black placeholder:uppercase placeholder:tracking-widest"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <button className="h-16 w-16 rounded-[32px] bg-white dark:bg-white/5 border border-white/20 flex items-center justify-center text-gray-500 hover:text-amber-600 transition-all shadow-sm">
                <Filter size={24} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Main List */}
          <div className="xl:col-span-8 space-y-8">
              <AnimatePresence mode="popLayout">
                {suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map((s, idx) => (
                  <motion.div 
                    key={s.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card border border-white/20 rounded-[48px] p-10 flex flex-col md:flex-row items-center gap-10 group hover:border-amber-500/30 transition-all overflow-hidden relative shadow-lg"
                  >
                     <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
                     
                     <div className="flex items-center gap-8 flex-1 w-full md:w-auto">
                        <div className="w-24 h-24 bg-white dark:bg-white/5 border border-white/10 rounded-[32px] shrink-0 flex items-center justify-center text-white shadow-inner group-hover:scale-105 transition-transform">
                           <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl font-black shadow-xl shadow-amber-500/20">
                              {s.name.charAt(0)}
                           </div>
                        </div>
                        <div className="space-y-4 pt-1 w-full text-center md:text-left">
                           <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                              <span className="text-[9px] font-black px-3 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 uppercase tracking-widest rounded-full">{s.level} NODE</span>
                              <span className="text-[9px] font-black px-3 py-1 bg-gray-100 dark:bg-white/5 text-gray-400 uppercase tracking-widest rounded-full">{s.category} Spec</span>
                              <span className="text-[9px] font-black px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase tracking-widest rounded-full flex items-center gap-1.5"><ShieldCheck size={10} /> Certified</span>
                           </div>
                           <h3 className="text-2xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none group-hover:text-amber-600 transition-colors">{s.name}</h3>
                           <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 font-bold text-[10px] uppercase tracking-widest text-gray-400 opacity-60">
                              <span className="flex items-center gap-1.5"><Star size={12} className="text-amber-500 fill-amber-500" /> {s.rating} Score</span>
                              <span className="flex items-center gap-1.5"><MessageSquare size={12} /> {s.reviews} Audits</span>
                              <span className="flex items-center gap-1.5"><Activity size={12} /> {s.clusters} Nodes</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-col items-center md:items-end gap-6 w-full md:w-auto">
                        <div className="text-center md:text-right">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 leading-none opacity-40 group-hover:opacity-100 transition-opacity">Trust Grade</p>
                           <p className="text-4xl font-display font-black text-gray-900 dark:text-white tracking-tighter leading-none">{s.trustScore}%</p>
                        </div>
                        <Link href="/dashboard/buyer/products">
                           <button className="h-12 px-6 bg-white dark:bg-white/5 border border-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-3 group/btn hover:border-amber-500 transition-all shadow-sm">
                               Explore Inventory
                               <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-all" />
                           </button>
                        </Link>
                     </div>
                  </motion.div>
                ))}
              </AnimatePresence>
          </div>

          {/* Sidebar Insights */}
          <div className="xl:col-span-4 space-y-8">
              <div className="glass-card border border-white/20 rounded-[48px] p-10 space-y-10 group relative overflow-hidden bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-2xl shadow-amber-600/20 sticky top-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                  
                  <div className="flex items-center gap-4 mb-2 pl-1 relative z-10">
                      <Award className="w-7 h-7 text-amber-100" />
                      <h2 className="text-xl font-display font-black uppercase tracking-tight leading-none">Trust Analytics</h2>
                  </div>

                  <div className="space-y-8 relative z-10 py-6 border-y border-white/10">
                     <div className="flex justify-between items-center group/p text-amber-100">
                        <span className="text-[10px] font-black uppercase tracking-widest">Global Rep Mean</span>
                        <span className="text-2xl font-display font-black tracking-tighter">4.82</span>
                     </div>
                     <div className="flex justify-between items-center group/p text-amber-100">
                        <span className="text-[10px] font-black uppercase tracking-widest">Identity Auth</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 100% Secure</span>
                     </div>
                     <div className="flex justify-between items-center group/p text-amber-100 pt-4 border-t border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-widest">Network Health</span>
                        <span className="text-4xl font-display font-black tracking-tighter leading-none">99.4%</span>
                     </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                      <button className="w-full h-16 bg-white text-amber-800 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all">
                         Download Reputation Ledger
                      </button>
                      <div className="p-6 bg-white/10 rounded-[32px] border border-white/10 flex gap-4">
                          <Info size={20} className="text-amber-100 shrink-0 mt-0.5 opacity-60" />
                          <p className="text-[9px] text-amber-100 leading-relaxed font-bold lowercase first-letter:uppercase">Ratings are aggregated from blockchain handshakes and verified logistics nodes only.</p>
                      </div>
                  </div>
              </div>
          </div>

      </div>

    </div>
  );
}
