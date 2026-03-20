'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, User, Users, Lock, 
  Settings, Search, Filter, Key, 
  CheckCircle, Clock, Trash2, ArrowRight, 
  Activity, Target, Zap, 
  ChevronRight, BrainCircuit, UserPlus, ShieldCheck, MoreVertical
} from 'lucide-react';

export default function RbacManagementPage() {
  const [team, setTeam] = useState([
    { id: 'U1', name: 'Dr. Sameer Patil', role: 'Admin', status: 'Active', permissions: 'Full Matrix' },
    { id: 'U2', name: 'Ankita Shinde', role: 'Procurement Officer', status: 'Active', permissions: 'Sourcing, RFQs' },
    { id: 'U3', name: 'Rahul Varma', role: 'Logistics Manager', status: 'Active', permissions: 'Fulfillment' },
    { id: 'U4', name: 'Priya Reddy', role: 'Financial Auditor', status: 'Review', permissions: 'Payments' },
  ]);

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 px-1">
        <div>
          <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-4">
             Access <span className="text-purple-600">Control</span>
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] pl-1">Role-Based Access Control (RBAC) Node Matrix</p>
        </div>
        <div className="flex items-center gap-4 bg-white/40 dark:bg-white/5 p-2 rounded-2xl border border-white/20 shadow-sm backdrop-blur-xl shrink-0">
             <div className="px-6 py-2 border-r border-white/10 text-center">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Total Nodes</p>
                 <p className="text-xl font-display font-black text-gray-900 dark:text-white leading-none">{team.length}</p>
             </div>
             <button className="h-10 px-6 rounded-xl bg-purple-600 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-purple-500/20">Invite New Node</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main User List */}
          <div className="lg:col-span-8 flex flex-col gap-10">
              <div className="flex items-center gap-6 mb-4">
                 <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-purple-600 transition-colors" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search team member... " 
                      className="w-full h-16 pl-16 pr-8 rounded-[32px] bg-white dark:bg-white/5 border border-white/20 focus:border-purple-500 outline-none transition-all placeholder:text-[10px] placeholder:font-black uppercase tracking-widest"
                    />
                 </div>
                 <button className="h-16 w-16 rounded-[32px] bg-white dark:bg-white/5 border border-white/20 flex items-center justify-center text-gray-500 hover:text-purple-600 transition-all shadow-sm">
                      <Filter size={24} />
                 </button>
              </div>

              <div className="glass-card border border-white/20 rounded-[48px] p-6 space-y-4 shadow-xl overflow-hidden relative">
                 <AnimatePresence mode="popLayout">
                    {team.map((u, idx) => (
                       <motion.div 
                         key={u.id}
                         initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                         className="p-8 bg-white/40 dark:bg-white/5 border border-white/20 rounded-[40px] flex flex-col md:flex-row items-center gap-10 group hover:border-purple-500/30 transition-all relative overflow-hidden shadow-sm"
                       >
                          <div className="w-16 h-16 bg-white dark:bg-white/10 rounded-[28px] shrink-0 flex items-center justify-center text-purple-600 shadow-inner group-hover:rotate-12 transition-transform">
                             <User size={28} />
                          </div>

                          <div className="flex-1 space-y-3 w-full text-center md:text-left">
                             <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <span className="text-[9px] font-black px-3 py-1 bg-purple-500/10 text-purple-600 border border-purple-500/20 uppercase tracking-widest rounded-full">{u.role}</span>
                                <span className={`text-[9px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>{u.status}</span>
                             </div>
                             <h4 className="text-xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none group-hover:text-purple-600 transition-colors">{u.name}</h4>
                             <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 font-bold text-[10px] uppercase tracking-widest text-gray-400 opacity-60">
                                <span className="flex items-center gap-1.5"><Key size={12} /> Perms: {u.permissions}</span>
                                <span className="flex items-center gap-1.5"><ShieldCheck size={12} /> Verified Identity</span>
                             </div>
                          </div>

                          <div className="flex items-center gap-3">
                             <button className="h-12 w-12 bg-white dark:bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-purple-500 transition-all"><Settings size={18} /></button>
                             <button className="h-12 w-12 bg-white dark:bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-rose-500 transition-all"><MoreVertical size={18} /></button>
                          </div>
                       </motion.div>
                    ))}
                 </AnimatePresence>
                 
                 <button className="w-full h-20 border-2 border-dashed border-white/20 rounded-[40px] flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:border-purple-500 hover:text-purple-500 transition-all mt-4 bg-white/5">
                    <UserPlus size={20} /> Inject New Control Node
                 </button>
              </div>
          </div>

          {/* Sidebar Permissions */}
          <div className="lg:col-span-4 flex flex-col gap-10">
              <div className="glass-card border border-white/20 rounded-[48px] p-10 space-y-10 group relative overflow-hidden bg-gradient-to-br from-purple-900 to-black text-white shadow-2xl sticky top-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                  
                  <div className="flex items-center gap-4 text-purple-400 mb-2 pl-1 relative z-10">
                      <Shield className="w-7 h-7" />
                      <h2 className="text-lg font-display font-black uppercase tracking-tight leading-none">Security Schema</h2>
                  </div>

                  <div className="space-y-8 relative z-10 py-6 border-y border-white/10">
                     <div className="flex justify-between items-center group/p text-purple-100">
                        <span className="text-[10px] font-black uppercase tracking-widest">Global Auth Nodes</span>
                        <span className="text-2xl font-display font-black tracking-tighter">12 Active</span>
                     </div>
                     <div className="flex justify-between items-center group/p text-purple-100">
                        <span className="text-[10px] font-black uppercase tracking-widest">Breach Attempts</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 0 Secured</span>
                     </div>
                  </div>

                  <div className="space-y-6 pl-2">
                     <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Access Policy</h3>
                     {[ 
                        { t: 'Smart Contract Sign', v: 'L3 Admin' },
                        { t: 'Payment Release', v: 'L2+ Approver' },
                        { t: 'Inventory Audit', v: 'L1 Manager' }
                     ].map((p, i) => (
                        <div key={i} className="flex justify-between items-center group/p">
                           <span className="text-[11px] font-bold text-gray-400 group-hover/p:text-white transition-colors uppercase tracking-widest">{p.t}</span>
                           <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">{p.v}</span>
                        </div>
                     ))}
                  </div>

                  <div className="p-8 bg-white/5 rounded-[32px] border border-white/5 flex gap-4">
                     <Lock size={24} className="text-purple-400 shrink-0 mt-0.5 opacity-60" />
                     <div>
                        <p className="text-[10px] font-black text-purple-200 uppercase tracking-widest mb-2 leading-none">RBAC Logic</p>
                        <p className="text-[9px] text-gray-400 leading-relaxed font-bold lowercase first-letter:uppercase">Access is strictly governed by institutional cryptographic keys. Multi-factor node authorization enforced for all high-value streams.</p>
                     </div>
                  </div>
              </div>
          </div>

      </div>

    </div>
  );
}
