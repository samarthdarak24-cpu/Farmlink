'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Star, Globe, ShieldCheck, 
  Search, Filter, CheckCircle, Clock, 
  Truck, ArrowRight, Zap, Target, 
  Layers, Package, ChevronRight, Scale, 
  Trash2, Plus, ArrowLeftRight
} from 'lucide-react';
import Link from 'next/link';

export default function SupplierComparisonPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>(['S1', 'S2']);

  const suppliers = [
    { id: 'S1', name: 'Nashik Cluster A', rating: 4.9, priceIdx: '₹38.5/kg', logistic: '2h Hub', trust: 98, categories: ['Veg', 'Fruit'], capacity: '500T/m' },
    { id: 'S2', name: 'Pune Grains Node', rating: 4.7, priceIdx: '₹42.2/kg', logistic: '4h Hub', trust: 96, categories: ['Grain', 'Oil'], capacity: '1200T/m' },
    { id: 'S3', name: 'Satara Organic Hub', rating: 4.6, priceIdx: '₹55.0/kg', logistic: '6h Hub', trust: 97, categories: ['Organic'], capacity: '120T/m' },
  ];

  const compareList = suppliers.filter(s => selectedIds.includes(s.id));

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 px-1">
        <div>
          <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-4">
             Decision <span className="text-indigo-600">Lab</span>
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] pl-1">Supplier Comparison & Alpha Node Analysis</p>
        </div>
        <div className="flex items-center gap-4 bg-white/40 dark:bg-white/5 p-2 rounded-2xl border border-white/20 shadow-sm backdrop-blur-xl shrink-0">
             <div className="px-6 py-2 border-r border-white/10 text-center">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Nodes Linked</p>
                 <p className="text-xl font-display font-black text-gray-900 dark:text-white leading-none">{selectedIds.length}</p>
             </div>
             <button onClick={() => setSelectedIds([])} className="h-10 px-6 rounded-xl bg-white/50 dark:bg-white/10 text-[9px] font-black uppercase tracking-widest text-gray-500 border border-white/20 hover:text-rose-500 transition-all">Clear Matrix</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Comparison Matrix */}
          <div className="lg:col-span-12 flex flex-col gap-10">
              <div className="glass-card border border-white/20 rounded-[48px] p-2 overflow-x-auto shadow-2xl relative">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                         <tr>
                            <th className="p-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] bg-gray-50 dark:bg-white/5 rounded-tl-[40px] border-r border-white/20">Parameter Matrix</th>
                            {compareList.map((s, i) => (
                               <th key={s.id} className={`p-10 min-w-[300px] bg-white dark:bg-white/5 border-r border-white/20 last:border-0 ${i === compareList.length - 1 ? 'rounded-tr-[40px]' : ''}`}>
                                  <div className="flex items-center gap-6">
                                     <div className="w-16 h-16 rounded-2xl bg-indigo-500 text-white flex items-center justify-center text-xl font-black shadow-xl shadow-indigo-500/20">{s.name.charAt(0)}</div>
                                     <div className="flex-1">
                                        <p className="text-xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">{s.name}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                           <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5"><ShieldCheck size={12} /> Trusted Node</span>
                                        </div>
                                     </div>
                                  </div>
                               </th>
                            ))}
                            {compareList.length < 3 && (
                               <th className="p-10 bg-gray-50 dark:bg-white/5 flex flex-col items-center justify-center border-l border-white/10 opacity-40 hover:opacity-100 transition-opacity rounded-tr-[40px]">
                                   <button className="h-16 w-16 bg-white dark:bg-white/10 border-2 border-dashed border-gray-300 rounded-[28px] flex items-center justify-center text-gray-400"><Plus size={32} /></button>
                                   <p className="text-[9px] font-black uppercase mt-4 tracking-widest">Link Node</p>
                               </th>
                            )}
                         </tr>
                      </thead>
                      <tbody>
                         <tr className="border-t border-white/20">
                            <td className="p-10 font-display font-black text-gray-900 dark:text-white uppercase tracking-tight bg-gray-50 dark:bg-white/5 border-r border-white/20">Reputation Level</td>
                            {compareList.map(s => (
                               <td key={s.id} className="p-10 border-r border-white/20 last:border-0">
                                   <div className="flex items-center gap-2">
                                      <Star size={16} className="text-amber-500 fill-amber-500" />
                                      <span className="text-2xl font-display font-black text-gray-900 dark:text-white tracking-tighter">{s.rating}</span>
                                      <span className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Global Rank</span>
                                   </div>
                               </td>
                            ))}
                         </tr>
                         <tr className="border-t border-white/20 bg-gray-50/50 dark:bg-white/5">
                            <td className="p-10 font-display font-black text-gray-900 dark:text-white uppercase tracking-tight bg-gray-50 dark:bg-white/5 border-r border-white/20">Price Node Efficiency</td>
                            {compareList.map(s => (
                               <td key={s.id} className="p-10 border-r border-white/20 last:border-0">
                                   <span className="text-2xl font-display font-black text-indigo-600 tracking-tighter">{s.priceIdx}</span>
                               </td>
                            ))}
                         </tr>
                         <tr className="border-t border-white/20">
                            <td className="p-10 font-display font-black text-gray-900 dark:text-white uppercase tracking-tight bg-gray-50 dark:bg-white/5 border-r border-white/20">Logistics Latency</td>
                            {compareList.map(s => (
                               <td key={s.id} className="p-10 border-r border-white/20 last:border-0">
                                   <div className="flex items-center gap-3 font-black text-[12px] uppercase text-gray-500 tracking-widest">
                                      <Truck size={18} className="text-blue-500" />
                                      {s.logistic}
                                   </div>
                               </td>
                            ))}
                         </tr>
                         <tr className="border-t border-white/20 bg-gray-50/50 dark:bg-white/5">
                            <td className="p-10 font-display font-black text-gray-900 dark:text-white uppercase tracking-tight bg-gray-50 dark:bg-white/5 border-r border-white/20">Blockchain Trust Score</td>
                            {compareList.map(s => (
                               <td key={s.id} className="p-10 border-r border-white/20 last:border-0 px-20">
                                   <div className="space-y-3">
                                      <div className="flex justify-between items-center text-[9px] font-black uppercase text-emerald-500 tracking-widest">
                                         <span>Score</span>
                                         <span>{s.trust}%</span>
                                      </div>
                                      <div className="h-1.5 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
                                         <div className="h-full bg-emerald-500" style={{ width: `${s.trust}%` }} />
                                      </div>
                                   </div>
                               </td>
                            ))}
                         </tr>
                         <tr className="border-t border-white/20 h-40">
                            <td className="p-10 bg-gray-50 dark:bg-white/5 border-r border-white/20"></td>
                            {compareList.map(s => (
                               <td key={s.id} className="p-10 border-r border-white/20 last:border-0 text-center">
                                   <Link href="/dashboard/buyer/products">
                                      <button className="h-16 w-full bg-indigo-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all flex items-center justify-center gap-3">
                                         Lock Node
                                         <ArrowRight size={16} />
                                      </button>
                                   </Link>
                               </td>
                            ))}
                         </tr>
                      </tbody>
                  </table>
              </div>

              {/* Insights Bottom */}
              <div className="glass-card border border-white/20 rounded-[48px] p-10 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent relative overflow-hidden group shadow-xl">
                 <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-8">
                       <div className="w-20 h-20 bg-indigo-500/10 rounded-[32px] flex items-center justify-center text-indigo-600 border border-indigo-500/20 shadow-inner group-hover:rotate-12 transition-transform">
                          <Scale size={40} />
                       </div>
                       <div>
                          <h3 className="text-2xl font-display font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">Alpha Node Suggestion</h3>
                          <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] font-bold mt-2">AI Optimal Matching Logic</p>
                       </div>
                    </div>
                    <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-900/10">
                       <p className="text-[11px] text-emerald-800 dark:text-emerald-400 font-bold leading-relaxed uppercase tracking-widest">
                          Suggestion: Nashik Cluster A provides 14% better price/logistics ratio compared to Pune Node for current destination Mumbai.
                       </p>
                    </div>
                 </div>
              </div>
          </div>

      </div>

    </div>
  );
}
