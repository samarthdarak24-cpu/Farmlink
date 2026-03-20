'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, ShieldCheck, Download, ExternalLink, 
  Search, Filter, Lock, Eye, 
  CheckCircle, Clock, Trash2, ArrowRight, 
  User, Activity, Target, Zap, 
  ChevronRight, BrainCircuit, Star, 
  Briefcase, Scale, FileCheck, History,
  PenTool, AlertCircle, Bookmark, Share2,
  Cpu, ScrollText, Calendar, Milestone
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function ContractViewingPage() {
  const searchParams = useSearchParams();
  const highlightedId = searchParams.get('id');
  const [selectedContract, setSelectedContract] = useState<any>(null);

  const contracts = [
    { 
      id: 'CON-8291', 
      orderId: 'ORD-122', 
      supplier: 'Nashik Cluster A', 
      status: 'Active', 
      signDate: '2026-03-12', 
      total: 42000, 
      items: '500kg Tomatoes', 
      hash: '0x8f2d...9ea1', 
      doc: 'bulk_contract_8291.pdf',
      clauses: [
        { title: 'Pricing & Weight', Summary: 'Agreed ₹32.50/kg with ±2% weight tolerance at delivery port.' },
        { title: 'Quality Threshold', Summary: 'Moisture content strictly below 18%. Grade-A color required.' },
        { title: 'Force Majeure', Summary: 'Standard agricultural climate exclusions apply with 48h notice.' }
      ],
      milestones: [
        { label: 'Advance Deposit', Status: 'Paid', date: 'Mar 12' },
        { label: 'Induction Phase', Status: 'Processing', date: 'Ongoing' },
        { label: 'Final Settlement', Status: 'Pending', date: 'Apr 02' }
      ]
    },
    { 
      id: 'CON-7721', 
      orderId: 'ORD-125', 
      supplier: 'Pune Grains Node', 
      status: 'Pending Signature', 
      signDate: '2026-03-18', 
      total: 12500, 
      items: '200kg Wheet', 
      hash: '0x7e1c...4b20', 
      doc: 'bulk_contract_7721.pdf',
      clauses: [],
      milestones: []
    },
    { 
      id: 'CON-6610', 
      orderId: 'ORD-130', 
      supplier: 'Satara Organic', 
      status: 'Closed', 
      signDate: '2026-01-20', 
      total: 8500, 
      items: '50kg Organic Onions', 
      hash: '0x9a2b...1c33', 
      doc: 'bulk_contract_6610.pdf',
      clauses: [],
      milestones: []
    },
  ];

  return (
    <div className="space-y-12 pb-48 w-full max-w-7xl mx-auto">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 px-1 shrink-0">
        <div className="space-y-2">
           <div className="flex items-center gap-3">
              <div className="h-2 w-12 bg-indigo-600 rounded-full" />
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-1 leading-none">Institutional Legal Center</p>
           </div>
           <h1 className="text-5xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter transition-all">
             Contract <span className="text-indigo-600">Vault</span>
           </h1>
        </div>

        <div className="flex items-center gap-4 bg-white/40 dark:bg-white/5 p-3 rounded-[32px] border border-white/20 shadow-2xl backdrop-blur-3xl shrink-0">
             <div className="px-8 py-3 border-r border-white/10 text-center">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none opacity-60">Verified Assets</p>
                 <p className="text-2xl font-display font-black text-gray-900 dark:text-white leading-none tracking-tighter">14</p>
             </div>
             <div className="px-8 py-3 text-center text-emerald-500">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none opacity-60">Integrity Check</p>
                 <p className="text-xl font-display font-black leading-none flex items-center gap-3 tracking-tighter"><Lock size={18} /> 100% OK</p>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Contracts List */}
          <div className="xl:col-span-8 flex flex-col gap-8">
              <div className="flex items-center gap-4 border-b border-white/10 pb-8 px-2">
                 <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-600 transition-colors" size={20} />
                    <input type="text" placeholder="Search contract ID, supplier, or order..." className="w-full h-16 pl-16 pr-8 rounded-[32px] bg-white/40 dark:bg-white/5 border border-white/20 focus:border-indigo-500 outline-none transition-all placeholder:text-[10px] placeholder:font-black uppercase tracking-widest text-sm" />
                 </div>
                 <button className="h-16 w-16 rounded-[32px] bg-white/40 dark:bg-white/5 border border-white/20 flex items-center justify-center text-gray-500 hover:text-indigo-600 transition-all"><Filter size={24} /></button>
              </div>

              <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                  {contracts.map((c, idx) => (
                    <motion.div 
                      key={c.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedContract(c)}
                      className={`glass-card border cursor-pointer rounded-[48px] p-8 flex flex-col md:flex-row items-center gap-10 group transition-all relative overflow-hidden shadow-xl ${selectedContract?.id === c.id ? 'bg-white dark:bg-white/10 border-indigo-500/50' : 'bg-white/40 dark:bg-white/5 border-white/20 hover:border-indigo-500/30'}`}
                    >
                       <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
                       
                       <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-500/10 rounded-[28px] shrink-0 flex items-center justify-center text-indigo-600 shadow-inner group-hover:rotate-12 transition-transform">
                          <ScrollText size={32} />
                       </div>

                       <div className="flex-1 space-y-4 text-center md:text-left">
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                             <span className={`text-[9px] font-black px-4 py-1.5 rounded-full border uppercase tracking-widest ${c.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>{c.status}</span>
                             <span className="text-[9px] font-black px-4 py-1.5 bg-gray-100 dark:bg-white/5 text-gray-500 uppercase tracking-widest rounded-full">ID: {c.id}</span>
                             <span className="text-[9px] font-black px-4 py-1.5 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 uppercase tracking-widest rounded-full flex items-center gap-1.5"><ShieldCheck size={10} /> Verified Hash</span>
                          </div>
                          <h3 className="text-2xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none group-hover:text-indigo-600">{c.supplier}</h3>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                             <Bookmark size={12} className="text-indigo-500" /> {c.items} • {c.orderId}
                          </p>
                       </div>

                       <div className="flex flex-col items-center md:items-end gap-2 pr-4">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 opacity-40">Contract Value</p>
                          <p className="text-2xl font-display font-black text-gray-900 dark:text-white leading-none tracking-tighter">₹{c.total.toLocaleString()}</p>
                          <div className="flex items-center gap-2 mt-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                             <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Live Node Synchronized</p>
                          </div>
                       </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
          </div>

          {/* Right Panel: Contract Metadata Intelligence */}
          <div className="xl:col-span-4 h-fit sticky top-24">
             <AnimatePresence mode="wait">
               {selectedContract ? (
                 <motion.div 
                   key={selectedContract.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="glass-card border border-indigo-500/20 rounded-[48px] p-8 bg-indigo-500/5 backdrop-blur-3xl shadow-2xl space-y-10"
                 >
                    <div className="flex items-center justify-between">
                       <h3 className="text-xl font-display font-black uppercase tracking-tight tracking-tighter">Legal <span className="text-indigo-600">Intelligence</span></h3>
                       <button className="p-2 hover:bg-black/5 rounded-full"><Share2 size={18} /></button>
                    </div>

                    {/* AI Clause Summary */}
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-4"><BrainCircuit size={14} className="text-indigo-500" /> Extraction Matrix</h4>
                       {selectedContract.clauses?.length > 0 ? selectedContract.clauses.map((cl: any, i: number) => (
                          <div key={i} className="p-5 bg-white/40 dark:bg-white/5 rounded-2xl border border-white/10 space-y-2 hover:bg-white transition-all shadow-sm">
                             <p className="text-[9px] font-black uppercase tracking-widest text-indigo-600">{cl.title}</p>
                             <p className="text-[11px] font-medium text-gray-600 dark:text-gray-300 leading-relaxed">{cl.Summary}</p>
                          </div>
                       )) : (
                          <div className="p-10 border border-dashed border-white/20 rounded-[32px] text-center opacity-40">
                             <PenTool className="mx-auto mb-4" />
                             <p className="text-[8px] font-black uppercase tracking-widest">Pending Signed Version</p>
                          </div>
                       )}
                    </div>

                    {/* Milestone Tracking */}
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-4"><Milestone size={14} className="text-emerald-500" /> Tranche Progress</h4>
                       <div className="space-y-4">
                          {selectedContract.milestones?.map((m: any, i: number) => (
                             <div key={i} className="flex items-center justify-between p-4 bg-black/5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-4">
                                   <div className={`w-2 h-2 rounded-full ${m.Status === 'Paid' ? 'bg-emerald-500' : 'bg-indigo-500 animate-pulse'}`} />
                                   <p className="text-[10px] font-black uppercase tracking-tight">{m.label}</p>
                                </div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase">{m.date}</p>
                             </div>
                          ))}
                       </div>
                    </div>

                    {/* Secure Handshake Hash */}
                    <div className="p-6 bg-black text-white rounded-[32px] shadow-2xl relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px] pointer-events-none" />
                       <div className="relative z-10 space-y-4">
                          <div className="flex items-center gap-3">
                             <Cpu size={18} className="text-indigo-400" />
                             <p className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-200">Hash Validation</p>
                          </div>
                          <p className="text-[11px] font-mono opacity-60 break-all">{selectedContract.hash}...</p>
                          <button className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-all"><FileCheck size={12} /> Verified Traceable Node</button>
                       </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4 pt-4">
                       <button className="w-full h-16 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all">
                          <Download size={16} /> Institutional PDF Download
                       </button>
                       <button className="w-full h-14 border border-white/20 text-gray-500 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                          <ExternalLink size={14} /> View Raw Meta-Data
                       </button>
                    </div>
                 </motion.div>
               ) : (
                 <div className="h-96 flex flex-col items-center justify-center text-center p-12 bg-white/5 border border-dashed border-white/10 rounded-[48px] opacity-40">
                    <ScrollText size={48} className="mb-6 opacity-20" />
                    <p className="text-xs font-medium uppercase tracking-widest">Select an execution node to view legal intelligence</p>
                 </div>
               )}
             </AnimatePresence>
          </div>

      </div>

    </div>
  );
}
