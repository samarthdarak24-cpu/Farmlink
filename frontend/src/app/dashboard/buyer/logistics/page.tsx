'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, Package, Truck, Activity, 
  Zap, Navigation, MapPin, Search, 
  Filter, ShieldCheck, ChevronRight, ArrowRight,
  TrendingUp, Box, Layers, Target, Info, RefreshCw,
  Maximize2, Share2, MoreVertical, Timer,
  AlertCircle, Camera, CheckSquare, History,
  Compass, Phone, ShieldAlert, BadgeCheck,
  LayoutGrid, List, FileText, Download,
  ExternalLink, UserCheck
} from 'lucide-react';
import Link from 'next/link';

export default function LogisticsTrackingPage() {
  const [selectedHub, setSelectedHub] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  const activeShipments = [
    { 
       id: 'SH-8291', 
       carrier: 'National ColdChain Corp', 
       route: 'Nashik > Mumbai > Export Hub 1', 
       progress: 65,
       status: 'In Transit',
       lastNode: 'Thane Sorting Node',
       eta: '4h 12m',
       driver: 'Suresh Raina',
       vehicle: 'MH-12-BQ-4022',
       performance: 98,
       metrics: { temp: '4°C', humidity: '65%', vibration: 'Low' },
       milestones: ['Loaded', 'Dispatched', 'Out for Delivery', 'Arriving'],
       pos: { x: '55%', y: '45%' }
    },
    { 
       id: 'SH-7721', 
       carrier: 'Regional Cluster Logistics', 
       route: 'Ahmednagar > Pune Node', 
       progress: 25,
       status: 'Picked Up',
       lastNode: 'Source Farm Cluster',
       eta: '1d 2h',
       driver: 'Amit Kumar',
       vehicle: 'MH-14-GH-1102',
       performance: 92,
       metrics: { temp: '22°C', humidity: '60%', vibration: 'Medium' },
       milestones: ['Processing', 'Picked Up', 'In Transit', 'Delivery Head'],
       pos: { x: '40%', y: '60%' }
    }
  ];

  const current = activeShipments[selectedHub];

  return (
    <div className="space-y-12 pb-48 w-full max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 px-1 shrink-0">
        <div className="space-y-2">
           <div className="flex items-center gap-3">
              <div className="h-2 w-12 bg-blue-600 rounded-full" />
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-1 leading-none">Multimodal Freight Terminal</p>
           </div>
           <h1 className="text-5xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter transition-all">
             Logistics <span className="text-blue-600">Command</span>
           </h1>
        </div>

        <div className="flex items-center gap-4 bg-white/40 dark:bg-white/5 p-3 rounded-[32px] border border-white/20 shadow-2xl backdrop-blur-3xl shrink-0">
             <div className="px-8 py-3 border-r border-white/10 text-center">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none opacity-60">Active Freight</p>
                 <p className="text-2xl font-display font-black text-gray-900 dark:text-white leading-none tracking-tighter">12</p>
             </div>
             <div className="px-8 py-3 text-center text-emerald-500">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none opacity-60">GPS Sync</p>
                 <p className="text-xl font-display font-black leading-none flex items-center gap-3 tracking-tighter"><div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-emerald-500/20 shadow-2xl" /> Live Node</p>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Main Map Visual (Enhanced) */}
          <div className="xl:col-span-8 flex flex-col gap-10">
              <div className="glass-card border border-white/20 rounded-[48px] p-2 aspect-[16/10] relative overflow-hidden group shadow-2xl bg-slate-900">
                 <div className="absolute inset-0 bg-slate-900 overflow-hidden">
                    {/* High-Fidelity Logistics Grid Visual */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-transparent to-black/80" />
                    {/* Simulated Map Markers */}
                    {activeShipments.map((s, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, x: s.pos.x, y: s.pos.y }}
                        className="absolute cursor-pointer group/marker"
                        onClick={() => setSelectedHub(i)}
                      >
                         <div className={`w-6 h-6 rounded-full border-4 border-white shadow-2xl transition-all ${selectedHub === i ? 'bg-blue-600 scale-150' : 'bg-gray-400 scale-100 hover:scale-125'}`} />
                         <div className={`absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-black text-white text-[8px] font-black rounded-lg whitespace-nowrap opacity-0 group-hover/marker:opacity-100 transition-opacity`}>
                            {s.id} • {s.status}
                         </div>
                      </motion.div>
                    ))}
                 </div>

                 {/* Top Controls Overlay */}
                 <div className="absolute top-8 left-8 right-8 flex justify-between gap-6 pointer-events-none">
                    <div className="p-4 bg-black/80 backdrop-blur-3xl rounded-[28px] border border-white/10 text-white shadow-2xl flex flex-col gap-3 pointer-events-auto min-w-[240px]">
                        <h3 className="text-[10px] font-black uppercase tracking-widest pl-2 mb-1 opacity-60">Freight Nodes</h3>
                        {activeShipments.map((s, i) => (
                           <button 
                             key={s.id} 
                             onClick={() => setSelectedHub(i)}
                             className={`flex items-center justify-between p-3 rounded-xl transition-all border ${selectedHub === i ? 'bg-blue-600/30 border-blue-600 shadow-xl shadow-blue-600/20' : 'bg-white/5 border-transparent hover:border-white/20'}`}
                           >
                              <div className="text-left">
                                 <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{s.id}</p>
                                 <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest opacity-60">{s.carrier}</p>
                              </div>
                              {selectedHub === i && <Activity size={12} className="text-blue-500 animate-pulse" />}
                           </button>
                        ))}
                    </div>

                    <div className="flex flex-col gap-3 pointer-events-auto">
                        <button className="h-12 w-12 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-2xl flex items-center justify-center text-white hover:text-blue-500 transition-all"><Maximize2 size={18} /></button>
                        <button className="h-12 w-12 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-2xl flex items-center justify-center text-white hover:text-blue-500 transition-all"><Share2 size={18} /></button>
                    </div>
                 </div>

                 {/* Corner Badge: Status Update */}
                 <div className="absolute bottom-10 left-10 p-4 bg-emerald-500 text-white rounded-2xl border border-white/20 shadow-2xl shadow-emerald-500/20 pointer-events-none animate-bounce">
                    <div className="flex items-center gap-3">
                       <CheckSquare size={16} />
                       <div className="space-y-0.5">
                          <p className="text-[8px] font-black uppercase tracking-widest leading-none">Latest Checkpoint</p>
                          <p className="text-[10px] font-black uppercase tracking-tight">Thane Node Passed: OK</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Multi-Stage Milestone Strip */}
              <div className="glass-card border border-white/20 rounded-[40px] p-8 shadow-xl space-y-10">
                  <div className="flex items-center justify-between px-2">
                     <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3"><Navigation size={18} className="text-blue-600" /> Transit Milestone Progression</h4>
                     <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{current.route}</p>
                  </div>
                  
                  <div className="relative px-8">
                     <div className="h-1.5 w-full bg-blue-500/10 rounded-full" />
                     <div 
                        className="absolute h-1.5 bg-blue-600 rounded-full transition-all duration-1000 top-[3px]"
                        style={{ width: `${current.progress}%`, left: '32px', right: '32px' }}
                     />
                     <div className="flex justify-between items-center -mt-[11px] relative">
                        {current.milestones.map((m, i) => {
                           const isActive = i <= (current.progress / 33);
                           const isCurrent = i === Math.floor(current.progress / 33);
                           return (
                              <div key={i} className="flex flex-col items-center gap-3 group/m">
                                 <div className={`w-5 h-5 rounded-full border-4 border-white dark:border-[#0f172a] shadow-xl transition-all ${isActive ? 'bg-blue-600 scale-125' : 'bg-gray-200'}`} />
                                 {isCurrent && <div className="absolute w-5 h-5 rounded-full bg-blue-600 animate-ping opacity-60" />}
                                 <p className={`text-[9px] font-black uppercase tracking-widest transition-all ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 opacity-60'}`}>{m}</p>
                              </div>
                           );
                        })}
                     </div>
                  </div>
              </div>
          </div>

          {/* Logistics Workspace: Cargo Intelligence */}
          <div className="xl:col-span-4 h-fit sticky top-24 space-y-8">
             <motion.div 
               key={current.id}
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               className="glass-card border border-blue-500/20 rounded-[48px] p-8 bg-blue-500/5 backdrop-blur-3xl shadow-2xl space-y-10"
             >
                <div className="flex items-center justify-between">
                   <h3 className="text-xl font-display font-black uppercase tracking-tight tracking-tighter italic">Payload <span className="text-blue-600">Sync</span></h3>
                   <div className="flex gap-2">
                      <button className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-gray-400 hover:text-blue-500"><Download size={16} /></button>
                      <button className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-gray-400 hover:text-blue-500"><Activity size={16} /></button>
                   </div>
                </div>

                {/* ETA Engine */}
                <div className="p-8 bg-white/40 dark:bg-white/5 rounded-[40px] border border-white/10 text-center space-y-3 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] relative z-10 opacity-70">Estimated Arrival (AI Corrected)</p>
                   <p className="text-5xl font-display font-black text-blue-600 tracking-tighter leading-none relative z-10 italic">~ {current.eta}</p>
                   <div className="flex items-center justify-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-widest relative z-10"><Timer size={12} /> Live Link v2.0</div>
                </div>

                {/* Driver & Vehicle Auth Node */}
                <div className="space-y-6">
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3 pl-2"><UserCheck size={16} className="text-blue-500" /> Carrier Identity</h4>
                   <div className="p-6 bg-white/40 dark:bg-white/5 rounded-[32px] border border-white/10 flex items-center gap-5 hover:bg-white transition-all shadow-sm group/card">
                      <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white overflow-hidden shadow-xl shadow-blue-600/20 group-hover/card:rotate-6 transition-transform">
                         <MapPin size={32} />
                      </div>
                      <div className="flex-1 space-y-1">
                         <p className="text-sm font-display font-black uppercase text-gray-900 dark:text-white leading-none mb-1">{current.driver}</p>
                         <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 leading-none">{current.vehicle}</p>
                         <div className="flex items-center gap-4 mt-2">
                             <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><Phone size={10} className="text-blue-500" /> CONTACT</span>
                             <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><BadgeCheck size={10} className="text-emerald-500" /> VERIFIED</span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Telemetry Snapshot */}
                <div className="grid grid-cols-3 gap-3">
                   {Object.entries(current.metrics).map(([key, value], i) => (
                      <div key={i} className="bg-white/40 dark:bg-white/5 p-4 rounded-2xl border border-white/5 text-center space-y-1">
                         <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">{key}</p>
                         <p className="text-[10px] font-black uppercase text-indigo-600">{value}</p>
                      </div>
                   ))}
                </div>

                {/* Performance & Scorecard */}
                <div className="pt-6 border-t border-white/10">
                   <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Partner Reliability</h4>
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">{current.performance}%</p>
                   </div>
                   <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${current.performance}%` }} className="h-full bg-emerald-500 shadow-xl" />
                   </div>
                </div>

                {/* Exceptions & Alerts */}
                <div className="space-y-3">
                    <button className="w-full h-14 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all">
                       <Camera size={16} /> Digital PoD Preview
                    </button>
                    <button className="w-full h-14 border border-rose-500/20 text-rose-500 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-500/5 transition-all">
                       <ShieldAlert size={16} /> Flag Transit Exception
                    </button>
                </div>
             </motion.div>

             {/* Documentation Vault */}
             <div className="glass-card border border-white/20 rounded-[40px] p-8 space-y-6 shadow-xl">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-1">Trade Documents</h4>
                <div className="space-y-2">
                   {['E-Way Bill 8211.pdf', 'Lab_Batch_Nashik.pdf', 'Packing_List.pdf'].map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 bg-white/40 dark:bg-white/5 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all group/doc cursor-pointer">
                         <div className="flex items-center gap-3 min-w-0">
                            <FileText size={14} className="text-blue-500" />
                            <p className="text-[9px] font-black uppercase truncate text-gray-900 dark:text-gray-300">{doc}</p>
                         </div>
                         <Download size={12} className="text-gray-400 group-hover/doc:text-blue-500" />
                      </div>
                   ))}
                </div>
             </div>
          </div>

      </div>

    </div>
  );
}
