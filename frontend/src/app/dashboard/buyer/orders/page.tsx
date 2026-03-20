'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Truck, CheckCircle, Clock, 
  MapPin, ChevronRight, ArrowRight, Search, 
  Filter, Activity, Boxes, AlertCircle, 
  ExternalLink, ShieldCheck, CreditCard,
  TrendingUp, TrendingDown, Target, Zap, 
  ArrowUpRight, ArrowDownRight, Layers, 
  BrainCircuit, Globe, RefreshCw, FileText, 
  Trash2, Briefcase, Gauge, User, Calendar,
  Navigation, Share2, Download, Info, Timer,
  History, Camera, FileCheck, ClipboardCheck
} from 'lucide-react';
import { ordersApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function OrderTrackingPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'shipped' | 'delivered'>('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await ordersApi.getAll();
      const enriched = (res.data || []).map((o: any) => ({
        ...o,
        edd: 'Tomorrow, Oct 24',
        truckId: 'MH-12-BQ-4022',
        driver: 'Rajesh Kumar',
        logisticsPartner: 'AgriTrans Logistics',
        loadingPhoto: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=200',
        milestones: [
          { phase: 'Order Confirmed', time: 'Oct 20, 10:00 AM', status: 'completed' },
          { phase: 'Quality Verified', time: 'Oct 21, 02:30 PM', status: 'completed' },
          { phase: 'Produce Dispatched', time: 'Oct 22, 09:15 AM', status: 'completed' },
          { phase: 'In Transit', time: 'Ongoing', status: 'active' },
          { phase: 'Final Delivery', time: 'Expected Oct 24', status: 'pending' }
        ]
      }));
      setOrders(enriched);
      if (enriched.length > 0) setSelectedOrder(enriched[0]);
    } catch { toast.error('Order Ledger sync failed'); }
    finally { setLoading(false); }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      filter === 'all' ? true : o.status?.toLowerCase().includes(filter.toLowerCase())
    );
  }, [orders, filter]);

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s.includes('deliver')) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (s.includes('ship')) return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
    if (s.includes('pend')) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
  };

  return (
    <div className="space-y-12 pb-48 w-full max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 px-1 shrink-0">
        <div className="space-y-2">
           <div className="flex items-center gap-3">
              <div className="h-2 w-12 bg-emerald-600 rounded-full" />
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-1 leading-none">Logistics Control Room</p>
           </div>
           <h1 className="text-5xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter transition-all">
             Order <span className="text-emerald-600">Tracking Terminal</span>
           </h1>
        </div>

        <div className="flex items-center gap-4 bg-white/40 dark:bg-white/5 p-3 rounded-[32px] border border-white/20 shadow-2xl backdrop-blur-3xl shrink-0">
             <div className="px-8 py-3 border-r border-white/10 text-center">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none opacity-60">Transit Nodes</p>
                 <p className="text-2xl font-display font-black text-gray-900 dark:text-white leading-none tracking-tighter">{orders.length}</p>
             </div>
             <div className="px-8 py-3 text-center text-emerald-500">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none opacity-60">Ontime Rate</p>
                 <p className="text-xl font-display font-black leading-none flex items-center gap-3 tracking-tighter">94% <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" /></p>
             </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between border-y border-white/10 py-8 px-2">
         <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar max-w-full">
            {(['all', 'pending', 'shipped', 'delivered'] as const).map(f => (
               <button 
                 key={f}
                 onClick={() => setFilter(f)}
                 className={`h-11 px-8 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === f ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'bg-white/5 text-gray-500 border border-white/10'}`}
               >{f} Payloads</button>
            ))}
         </div>
         <div className="flex items-center gap-4">
             <div className="relative group min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-emerald-500 transition-colors" size={16} />
                <input type="text" placeholder="Search Waybill / Node ID..." className="h-12 w-full pl-12 pr-4 bg-white/5 rounded-2xl border border-white/10 outline-none focus:ring-4 focus:ring-emerald-500/10 text-[10px] font-black uppercase tracking-widest" />
             </div>
             <button className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-gray-400"><RefreshCw size={18} /></button>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Order Stream List */}
          <div className="xl:col-span-8 space-y-6">
              <AnimatePresence mode="popLayout">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((o, idx) => (
                    <motion.div 
                      key={o.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => setSelectedOrder(o)}
                      className={`glass-card border cursor-pointer rounded-[48px] p-8 flex flex-col md:flex-row items-center gap-10 group transition-all relative overflow-hidden shadow-xl ${selectedOrder?.id === o.id ? 'bg-white dark:bg-white/10 border-emerald-500/50 shadow-emerald-500/10' : 'bg-white/40 dark:bg-white/5 border-white/20 hover:border-emerald-500/30'}`}
                    >
                       <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none transition-transform duration-1000 group-hover:scale-125" />
                       
                       <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/10 rounded-[32px] shrink-0 flex items-center justify-center text-4xl shadow-inner group-hover:rotate-6 transition-transform">
                          {o.productName?.toLowerCase().includes('tomato') ? '🍅' : o.productName?.toLowerCase().includes('onion') ? '🧅' : '🥬'}
                       </div>

                       <div className="flex-1 space-y-4 text-center md:text-left">
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                             <span className={`text-[9px] font-black px-4 py-1.5 rounded-full border uppercase tracking-widest ${getStatusColor(o.status)}`}>{o.status || 'Active Transition'}</span>
                             <span className="text-[9px] font-black px-4 py-1.5 bg-gray-100 dark:bg-white/5 text-gray-500 uppercase tracking-widest rounded-full">Node: #{String(o.id).slice(-8).toUpperCase()}</span>
                             <span className="text-[9px] font-black px-4 py-1.5 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 uppercase tracking-widest rounded-full flex items-center gap-1.5"><ShieldCheck size={10} /> Certified Transit</span>
                          </div>
                          <h3 className="text-2xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none group-hover:text-emerald-600 transition-colors">Lot: {o.productName}</h3>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                             <MapPin size={12} className="text-rose-500" /> Origin: Nashik, Maharashtra • Destination: Mumbai APMC
                          </p>
                       </div>

                       <div className="flex items-center gap-8 pr-4">
                          <div className="text-right">
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Payload Value</p>
                             <p className="text-2xl font-display font-black text-gray-900 dark:text-white leading-none">₹{o.totalPrice?.toLocaleString()}</p>
                          </div>
                          <ChevronRight className={`text-gray-300 transition-transform ${selectedOrder?.id === o.id ? 'rotate-90 text-emerald-500' : 'group-hover:translate-x-2'}`} />
                       </div>
                    </motion.div>
                  ))
                ) : !loading && (
                   <div className="py-24 text-center opacity-40">
                      <Truck className="w-16 h-16 mx-auto mb-6 text-gray-300" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No matching cargo found</p>
                   </div>
                )}
              </AnimatePresence>
          </div>

          {/* Logistics Workspace (Selected Order Detail) */}
          <div className="xl:col-span-4 h-fit sticky top-24">
             <AnimatePresence mode="wait">
               {selectedOrder ? (
                 <motion.div 
                   key={selectedOrder.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="glass-card border border-emerald-500/20 rounded-[48px] p-8 bg-emerald-500/5 backdrop-blur-3xl shadow-2xl space-y-10"
                 >
                    <div className="flex items-center justify-between">
                       <h3 className="text-xl font-display font-black uppercase tracking-tight">Cargo Node <span className="text-emerald-600">Details</span></h3>
                       <button className="p-2 hover:bg-black/5 rounded-full"><Share2 size={18} /></button>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-8 relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-500/20">
                       {selectedOrder.milestones.map((m: any, i: number) => (
                          <div key={i} className="relative group">
                             <div className={`absolute -left-[30px] top-1 w-4 h-4 rounded-full border-4 border-white dark:border-[#0f172a] shadow-sm z-10 transition-all ${m.status === 'completed' ? 'bg-emerald-500 scale-125' : m.status === 'active' ? 'bg-emerald-500 animate-ping' : 'bg-gray-200'}`} />
                             {m.status === 'active' && <div className="absolute -left-[30px] top-1 w-4 h-4 rounded-full bg-emerald-500 z-10" />}
                             <div>
                                <p className={`text-[11px] font-black uppercase tracking-widest leading-none mb-1 ${m.status === 'completed' ? 'text-gray-900 dark:text-white' : m.status === 'active' ? 'text-emerald-600' : 'text-gray-400'}`}>{m.phase}</p>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{m.time}</p>
                             </div>
                          </div>
                       ))}
                    </div>

                    {/* Logistics Snapshot */}
                    <div className="p-6 bg-white/40 dark:bg-white/5 rounded-[32px] border border-white/10 space-y-6 shadow-inner">
                       <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl overflow-hidden border border-white/20">
                             <img src={selectedOrder.loadingPhoto} alt="Dispatch Proof" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                             <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Dispatch Evidence</p>
                             <button className="text-[9px] font-black text-emerald-600 uppercase flex items-center gap-1.5 hover:underline"><Camera size={12} /> View Gallery</button>
                          </div>
                          <div className="text-right">
                             <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">EDD (AI Sync)</p>
                             <p className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">OCT 24, 2026</p>
                          </div>
                       </div>
                       
                       <div className="h-px bg-white/10" />

                       <div className="grid grid-cols-2 gap-6">
                          <div>
                             <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Vehicle ID</p>
                             <div className="flex items-center gap-2 text-xs font-black uppercase tracking-tight"><Truck size={14} className="text-indigo-400" /> {selectedOrder.truckId}</div>
                          </div>
                          <div>
                             <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Logistics Node</p>
                             <div className="flex items-center gap-2 text-xs font-black uppercase tracking-tight text-emerald-600"><Globe size={14} /> AgriTrans</div>
                          </div>
                       </div>
                    </div>

                    {/* Quick Document Access */}
                    <div className="space-y-3">
                       <button className="w-full h-14 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                          <Navigation size={16} /> Track Live GPS Node
                       </button>
                       <div className="grid grid-cols-2 gap-3">
                          <button className="h-12 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all"><FileText size={14} /> E-Way Bill</button>
                          <button className="h-12 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all"><ClipboardCheck size={14} /> View PoD</button>
                       </div>
                    </div>

                    <div className="pt-2">
                       <button className="w-full h-12 border border-rose-500/20 text-rose-500 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-500/5 transition-all">
                          <AlertCircle size={14} /> Flag Transit Issue
                       </button>
                    </div>
                 </motion.div>
               ) : (
                 <div className="h-96 flex flex-col items-center justify-center text-center p-12 bg-white/5 border border-dashed border-white/10 rounded-[48px] opacity-40">
                    <Target size={48} className="mb-6 opacity-20" />
                    <p className="text-xs font-medium uppercase tracking-widest">Select a payload node to monitor logistics</p>
                 </div>
               )}
             </AnimatePresence>
          </div>

      </div>

      {loading && (
        <div className="py-48 text-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}>
               <RefreshCw className="w-16 h-16 mx-auto mb-6 text-emerald-500 opacity-20" />
            </motion.div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Synchronizing Freight Ledger...</p>
        </div>
      )}

    </div>
  );
}
