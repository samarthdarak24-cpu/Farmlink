'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, FileSpreadsheet, FileText, Database, 
  Terminal, Search, Filter, ShieldCheck, 
  CloudDownload, Activity, CheckCircle, Clock, 
  ArrowRight, Zap, Target, Layers, 
  Package, ChevronRight, Globe, Lock, Share2
} from 'lucide-react';

export default function DataExportPage() {
  const [exporting, setExporting] = useState(false);

  const datasets = [
    { id: 'DS-01', name: 'Procurement Ledger (Full Hist)', formats: ['CSV', 'JSON', 'PDF'], size: '4.2MB', date: '2026-03-20', status: 'Ready' },
    { id: 'DS-02', name: 'Strategic Yield Models (Forecast)', formats: ['CSV', 'JSON'], size: '1.8MB', date: '2026-03-20', status: 'Updating' },
    { id: 'DS-03', name: 'Compliance & Audit Logs', formats: ['PDF'], size: '12MB', date: '2026-03-18', status: 'Ready' },
    { id: 'DS-04', name: 'Logistics Chain Performance', formats: ['CSV', 'JSON'], size: '2.5MB', date: '2026-03-15', status: 'Archived' },
  ];

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 px-1">
        <div>
          <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-4">
             Data <span className="text-blue-600">Terminal</span>
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] pl-1">Global Procurement Data Extraction & Export Node</p>
        </div>
        <div className="flex items-center gap-4 bg-white/40 dark:bg-white/5 p-2 rounded-2xl border border-white/20 shadow-sm backdrop-blur-xl shrink-0">
             <div className="px-6 py-2 border-r border-white/10 text-center">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Total Datasets</p>
                 <p className="text-xl font-display font-black text-gray-900 dark:text-white leading-none">42</p>
             </div>
             <button className="h-10 px-6 rounded-xl bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">Refersh Matrix</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main List */}
          <div className="lg:col-span-8 flex flex-col gap-10">
              <div className="glass-card border border-white/20 rounded-[48px] p-12 group relative overflow-hidden bg-gradient-to-br from-blue-500/5 to-transparent shadow-xl">
                 <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
                 
                 <div className="text-center mb-12">
                    <div className="w-24 h-24 bg-blue-600 rounded-[32px] flex items-center justify-center text-white mx-auto shadow-2xl shadow-blue-500/30 mb-8 group-hover:rotate-12 transition-transform">
                       <Database size={40} className="animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-display font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-2 leading-none">Export Data Streams</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Institutional Knowledge Harvesting Matrix</p>
                 </div>

                 <div className="relative z-10 space-y-6">
                    {datasets.map((d, idx) => (
                       <motion.div 
                         key={d.id}
                         initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                         className="p-8 bg-white/40 dark:bg-white/5 border border-white/20 rounded-[40px] flex flex-col md:flex-row items-center gap-10 group/item hover:border-blue-500/30 transition-all shadow-sm relative overflow-hidden"
                       >
                          <div className={`absolute top-0 left-0 h-full w-2 ${d.status === 'Ready' ? 'bg-blue-500' : 'bg-gray-400'} opacity-40`} />
                          
                          <div className="flex-1 space-y-2.5 w-full text-center md:text-left">
                             <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <span className={`text-[9px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${d.status === 'Ready' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>{d.status} MATRIX</span>
                                <span className="text-[9px] font-black px-3 py-1 bg-gray-100 dark:bg-white/5 text-gray-400 uppercase tracking-widest rounded-full">{d.id}</span>
                             </div>
                             <h4 className="text-xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none group-hover/item:text-blue-600 transition-colors uppercase">{d.name}</h4>
                             <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 font-bold text-[10px] uppercase tracking-widest text-gray-400 opacity-60">
                                <span className="flex items-center gap-1.5"><Terminal size={12} /> Size: {d.size}</span>
                                <span className="flex items-center gap-1.5"><Clock size={12} /> Cycle: {d.date}</span>
                             </div>
                          </div>

                          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end">
                             {d.formats.map(f => (
                                <button key={f} className="h-14 px-6 bg-white dark:bg-white/5 border border-white/20 rounded-2xl flex items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm group/btn">
                                   <FileText size={16} className="text-blue-500" />
                                   <span className="text-[10px] font-black uppercase tracking-widest">{f}</span>
                                </button>
                             ))}
                          </div>
                       </motion.div>
                    ))}
                 </div>
              </div>
          </div>

          {/* Sidebar Extraction */}
          <div className="lg:col-span-4 flex flex-col gap-10">
              <div className="glass-card border border-white/20 rounded-[48px] p-10 space-y-10 group relative overflow-hidden bg-gradient-to-br from-gray-900 to-black text-white shadow-2xl sticky top-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                  
                  <div className="flex items-center gap-4 text-blue-400 mb-2 pl-1 relative z-10">
                      <CloudDownload className="w-7 h-7" />
                      <h2 className="text-lg font-display font-black uppercase tracking-tight leading-none">Harvester Pulse</h2>
                  </div>

                  <div className="space-y-8 relative z-10">
                     <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] space-y-6">
                        <div className="flex justify-between items-center text-blue-100">
                            <p className="text-[10px] font-black uppercase tracking-widest">Total Streamed</p>
                            <span className="text-3xl font-display font-black tracking-tighter">142GB</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-blue-500 shadow-[0_0_15px_0_rgba(59,130,246,0.5)]" />
                        </div>
                     </div>

                     <div className="space-y-6 pl-2">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Extraction Status</h3>
                        {[ 
                           { t: 'Live API Hook', v: '99.9% Uptime' },
                           { t: 'CSV Serialization', v: 'Optimized' },
                           { t: 'Vault Integrity', v: 'Verified' }
                        ].map((s, i) => (
                           <div key={i} className="flex justify-between items-center group/s">
                              <span className="text-[11px] font-bold text-gray-400 group-hover/s:text-white transition-colors uppercase tracking-widest">{s.t}</span>
                              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">{s.v}</span>
                           </div>
                        ))}
                     </div>

                     <div className="p-8 bg-white/5 rounded-[32px] border border-white/5 flex gap-4">
                        <Lock size={24} className="text-emerald-400 shrink-0 mt-0.5 opacity-60" />
                        <div>
                           <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2 leading-none">Security Policy</p>
                           <p className="text-[9px] text-gray-400 leading-relaxed font-bold lowercase first-letter:uppercase">All exports are anonymized at node level and watermarked for institutional traceability. SHA-256 checksum provided for all downloads.</p>
                        </div>
                     </div>
                  </div>
              </div>
          </div>

      </div>

    </div>
  );
}
