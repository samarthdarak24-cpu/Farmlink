'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Building2, 
  History, ShieldCheck, CreditCard, Award, 
  Settings, LogOut, Camera, Edit2, 
  Globe, Clock, Target, Activity, 
  Layers, Package, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useAuthZustand } from '@/store/authZustand';

export default function BuyerProfileHistoryPage() {
  const { user } = useAuthZustand();
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'security'>('profile');

  const history = [
    { id: 'H-1', date: '2026-03-20', action: 'Bulk Procurement Injection', target: '500kg Tomatoes', status: 'Success' },
    { id: 'H-2', date: '2026-03-18', action: 'RFQ Broadcast', target: 'Pune Grains Cluster', status: 'Active' },
    { id: 'H-3', date: '2026-03-15', action: 'Contract Signature', target: 'Nashik Progressive Hub', status: 'Closed' },
  ];

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto">
      
      {/* Bio Header */}
      <div className="glass-card border border-white/20 rounded-[64px] p-12 bg-gradient-to-br from-indigo-600/10 to-transparent relative overflow-hidden group shadow-2xl">
         <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
         
         <div className="flex flex-col md:flex-row items-center gap-12 relative z-10 w-full">
            <div className="relative group/profile">
               <div className="w-48 h-48 bg-white dark:bg-white/5 border border-white/20 rounded-[56px] flex items-center justify-center text-7xl shadow-2xl group-hover:rotate-6 transition-transform overflow-hidden">
                  <span className="opacity-10 absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-800" />
                  {user?.name?.charAt(0) || 'U'}
               </div>
               <button className="absolute bottom-4 right-4 w-12 h-12 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all border border-indigo-100">
                  <Camera size={20} />
               </button>
            </div>
            
            <div className="flex-1 space-y-6 pt-2 text-center md:text-left">
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <span className="text-[10px] font-black px-4 py-1.5 bg-indigo-500 text-white rounded-full uppercase tracking-widest shadow-lg shadow-indigo-500/20">Institutional Buyer</span>
                  <span className="text-[10px] font-black px-4 py-1.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={14} /> Global GAP Verified</span>
               </div>
               <h1 className="text-5xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{user?.name || 'Authorized Institution'}</h1>
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-10 font-bold text-[12px] uppercase tracking-widest text-gray-400 opacity-60">
                   <span className="flex items-center gap-2.5"><Mail size={16} className="text-indigo-500" /> {user?.email || 'procurement@govt.gov'}</span>
                   <span className="flex items-center gap-2.5"><Building2 size={16} className="text-indigo-500" /> Regional Node #14</span>
                   <span className="flex items-center gap-2.5"><Globe size={16} className="text-indigo-500" /> Nashik, MH</span>
               </div>
            </div>

            <div className="flex gap-4 pt-10 md:pt-0">
               <button className="h-16 px-10 bg-indigo-600 text-white rounded-[28px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                  Edit Profile
                  <Edit2 size={16} />
               </button>
               <button className="h-16 w-16 bg-white dark:bg-white/5 border border-white/20 rounded-[28px] flex items-center justify-center text-gray-400 hover:text-rose-500 transition-all shadow-sm">
                  <LogOut size={24} />
               </button>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Tabs Console */}
          <div className="lg:col-span-8 flex flex-col gap-10">
              <div className="flex items-center gap-2 bg-white/40 dark:bg-white/5 p-2 rounded-[32px] border border-white/20 shadow-sm backdrop-blur-xl w-fit">
                   {(['profile', 'history', 'security'] as const).map(t => (
                      <button 
                         key={t}
                         onClick={() => setActiveTab(t)}
                         className={`h-14 px-10 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                      >
                         {t}
                      </button>
                   ))}
              </div>

              <AnimatePresence mode="wait">
                 {activeTab === 'profile' && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                      className="space-y-10"
                    >
                       <div className="glass-card border border-white/20 rounded-[48px] p-10 space-y-10 shadow-lg">
                          <h3 className="text-2xl font-display font-black uppercase tracking-tight text-gray-900 dark:text-white flex items-center gap-4">
                             Institutional <span className="text-indigo-600">Identity</span>
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                             {[ 
                                { label: 'Govt. Registry ID', value: 'REG-8291-MH' },
                                { label: 'Tax Identification', value: 'TX-1122334455' },
                                { label: 'Primary Node Contact', value: '+91 9988776655' },
                                { label: 'Authorized Signatory', value: 'Dr. Sameer Patil' }
                             ].map((f, i) => (
                                <div key={i} className="space-y-3">
                                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{f.label}</label>
                                   <div className="w-full h-14 px-6 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/10 flex items-center font-bold text-gray-900 dark:text-white">{f.value}</div>
                                </div>
                             ))}
                          </div>
                       </div>
                    </motion.div>
                 )}

                 {activeTab === 'history' && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                       {history.map((h, i) => (
                          <div key={i} className="glass-card border border-white/20 rounded-[40px] p-8 flex flex-col md:flex-row items-center gap-8 group hover:border-indigo-500/30 transition-all shadow-lg">
                             <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0 group-hover:rotate-12 transition-transform shadow-inner">
                                <History size={24} />
                             </div>
                             <div className="flex-1 space-y-2 w-full text-center md:text-left">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">{h.date} • {h.id}</p>
                                <h4 className="text-xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none group-hover:translate-x-1 transition-transform">{h.action}</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-60 underline decoration-indigo-500/30 decoration-2 underline-offset-4">{h.target}</p>
                             </div>
                             <div className="flex items-center gap-4 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                <CheckCircle2 size={12} /> {h.status}
                             </div>
                          </div>
                       ))}
                    </motion.div>
                 )}
              </AnimatePresence>
          </div>

          {/* Sidebar Metrics */}
          <div className="lg:col-span-4 flex flex-col gap-10">
              <div className="glass-card border border-white/20 rounded-[48px] p-10 space-y-10 group relative overflow-hidden bg-gradient-to-br from-indigo-900 to-black text-white shadow-2xl sticky top-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                  
                  <div className="flex items-center gap-4 text-indigo-400 mb-2 pl-1 relative z-10">
                      <Target className="w-7 h-7" />
                      <h2 className="text-lg font-display font-black uppercase tracking-tight leading-none">Global Pulse</h2>
                  </div>

                  <div className="space-y-8 relative z-10">
                     <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] space-y-6">
                        <div className="flex justify-between items-center text-indigo-100">
                            <p className="text-[10px] font-black uppercase tracking-widest">Trust Index</p>
                            <span className="text-3xl font-display font-black tracking-tighter">98%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: '98%' }} className="h-full bg-emerald-500 shadow-[0_0_15px_0_rgba(16,185,129,0.5)]" />
                        </div>
                     </div>

                     <div className="space-y-6 pl-2">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Node Privileges</h3>
                        {[ 
                           { t: 'Bulk Procurement', v: 'Unlocked' },
                           { t: 'Digital Contracting', v: 'Active' },
                           { t: 'AI Forecast Suite', v: 'Unlocked' }
                        ].map((p, i) => (
                           <div key={i} className="flex justify-between items-center group/p">
                              <span className="text-[11px] font-bold text-gray-400 group-hover/p:text-white transition-colors uppercase tracking-widest">{p.t}</span>
                              <div className="flex items-center gap-2 text-emerald-500">
                                 <CheckCircle2 size={12} />
                                 <span className="text-[10px] font-black uppercase">{p.v}</span>
                              </div>
                           </div>
                        ))}
                     </div>

                     <div className="p-8 bg-indigo-500/10 rounded-[32px] border border-white/5 flex gap-4">
                        <Activity size={24} className="text-indigo-400 shrink-0 mt-0.5 opacity-60" />
                        <div>
                           <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2 leading-none">Audit Cycle</p>
                           <p className="text-[9px] text-gray-400 leading-relaxed font-bold lowercase first-letter:uppercase">Next institutional node audit scheduled in 42 days. Ensure compliance ledgers are updated.</p>
                        </div>
                     </div>
                  </div>
              </div>
          </div>

      </div>

    </div>
  );
}
