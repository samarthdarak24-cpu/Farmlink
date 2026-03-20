'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Database, CloudOff, Cloud, CheckCircle2, AlertTriangle, ShieldCheck, Activity, Zap, Cpu, Server, HardDrive, Network, Layers, Monitor, HelpCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SyncPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncHistory, setSyncHistory] = useState([
    { id: 'h1', node: 'Mumbai-01', action: 'Orders Sync', status: 'success', timestamp: '2 mins ago' },
    { id: 'h2', node: 'Nasik-04', action: 'Product State', status: 'success', timestamp: '1 hour ago' },
    { id: 'h3', node: 'Delhi-03', action: 'Chat Packets', status: 'error', timestamp: '3 hours ago' },
  ]);

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success('PWA Offline Cache Updated');
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <RefreshCw className="w-8 h-8 text-primary-600" />
            Sync Hub (Offline Protocols)
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time synchronization between local memory and the distributed ledger nodes.
          </p>
        </div>
        
        <button 
          onClick={handleManualSync}
          disabled={isSyncing}
          className="btn btn-primary flex items-center gap-3 h-14 px-8 rounded-2xl shadow-xl shadow-primary-500/20 shadow-primary"
        >
          <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
          Force Local Sync
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
        
        {/* Sync Status Cards */}
        <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="glass-card border border-white/20 rounded-[40px] p-8 space-y-8 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                 
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-[32px] bg-emerald-500 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/30">
                            <Cloud className="w-10 h-10 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-display font-black text-emerald-900 dark:text-emerald-400 leading-none">NETWORK ONLINE</h2>
                            <p className="text-emerald-700/80 dark:text-emerald-400/80 text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-1.5">
                                <Activity className="w-4 h-4" />
                                14 Active Nodes Synchronized in Cluster Mumbai-W1
                            </p>
                        </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 pt-4 border-t border-white/10 dark:border-gray-900/50">
                    {[
                        { label: 'Latency Map', value: '42ms', icon: Network },
                        { label: 'Local Store', value: '1.4MB', icon: HardDrive },
                        { label: 'Peer Score', value: '100', icon: ShieldCheck },
                    ].map(m => (
                        <div key={m.label} className="p-4 bg-white/40 dark:bg-black/20 border border-white/20 rounded-2xl">
                             <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1.5">{m.label}</p>
                             <div className="flex items-center gap-2 font-display font-black text-xl text-gray-900 dark:text-white">
                                <m.icon size={16} className="text-primary-500" />
                                {m.value}
                             </div>
                        </div>
                    ))}
                 </div>

                 <div className="p-6 bg-primary-50 dark:bg-primary-900/10 rounded-3xl border border-primary-100 dark:border-primary-800 relative z-10 mt-4">
                    <div className="flex gap-4">
                        <Info className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-1">
                            <p className="text-[10px] font-black text-primary-700 dark:text-primary-300 uppercase tracking-[0.1em]">Protocol: Optimistic Offline Concurrency</p>
                            <p className="text-xs text-secondary-900 dark:text-gray-400 leading-relaxed font-medium">When you perform actions offline, our system securely hashes them locally. Upon connection re-establishment, they are distributive-pushed to the blockchain nodes.</p>
                        </div>
                    </div>
                 </div>
            </div>

            <div className="glass-card border border-white/20 rounded-[40px] p-8 space-y-6">
                 <div>
                    <h3 className="text-xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-3 mb-1">
                        <Activity className="text-primary-500" />
                        Sync Distribution Trail
                    </h3>
                    <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1 opacity-60">Trailing historical sync activity</p>
                 </div>

                 <div className="space-y-3">
                    {syncHistory.map((h, i) => (
                        <div key={h.id} className="flex items-center gap-4 p-4 hover:bg-white/50 dark:hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/20">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${h.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                {h.status === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{h.action}</h4>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{h.node}</span>
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 mt-0.5">{h.status === 'success' ? 'Completed Cryptographic Signature' : 'Error: Handshake Timeout'}</p>
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{h.timestamp}</span>
                        </div>
                    ))}
                 </div>
            </div>
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card border border-white/20 rounded-[40px] p-8 space-y-8 flex-1 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                 
                 <div className="flex items-center gap-4 text-primary-600 mb-2 pl-1 relative z-10">
                    <Cpu className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <h2 className="text-sm font-black uppercase tracking-widest leading-none">Node Tuning</h2>
                 </div>

                 <div className="space-y-6 relative z-10">
                    <div className="p-5 bg-white/40 dark:bg-white/5 border border-white/20 rounded-3xl space-y-4 shadow-sm hover:translate-y-[-4px] transition-transform">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Master Node</span>
                            <span className="text-emerald-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"><CheckCircle2 size={12} /> Root Connected</span>
                        </div>
                        <div className="flex items-center gap-3">
                             <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-primary-600 font-black text-xl">M</div>
                             <div>
                                <p className="text-xs font-black text-gray-900 dark:text-white uppercase">ODOP-DIST-001</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest opacity-60 mt-0.5">Primary Ledger Authority</p>
                             </div>
                        </div>
                    </div>

                    <div className="p-5 bg-white/40 dark:bg-white/5 border border-white/20 rounded-3xl space-y-4 shadow-sm hover:translate-y-[-4px] transition-transform">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Memory Management</span>
                            <span className="text-primary-600 text-[9px] font-black uppercase tracking-widest cursor-pointer hover:underline">Cleanse</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex shadow-inner">
                            <div className="w-[12%] bg-primary-600 rounded-full" />
                            <div className="w-[88%] bg-gray-200 dark:bg-gray-800" />
                        </div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest opacity-60">1.4 MB used out of 50 MB Cache</p>
                    </div>

                    <div className="flex bg-white/30 dark:bg-black/20 p-2 rounded-2xl border border-white/10 w-full">
                        <button className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-primary-600 hover:bg-white/50 dark:hover:bg-white/5 rounded-xl transition-all">Export Local State</button>
                    </div>
                 </div>

                 <div className="p-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col gap-3 opacity-40 hover:opacity-100 transition-opacity relative z-10 mt-auto">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Experimental: PWA Ghost Sync</p>
                    <button className="btn btn-outline h-10 text-[9px] font-black uppercase tracking-widest rounded-xl">Enable Node-Cloning</button>
                 </div>
            </div>
         </div>

      </div>

    </div>
  );
}
