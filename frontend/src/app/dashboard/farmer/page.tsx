'use client';

import { motion } from 'framer-motion';
import { 
  BarChart3, Package, ShoppingBag, Truck, FileText, Handshake, 
  ShieldCheck, Star, Users, ArrowUpRight, ArrowDownRight, 
  Zap, Calendar, MapPin, Search, RefreshCw, Send, Activity, Settings, BrainCircuit
} from 'lucide-react';
import Link from 'next/link';
import { useAuthZustand } from '@/store/authZustand';
import { useOfflineCache } from '@/hooks/useOfflineCache';
import { ordersApi, productsApi, rfqApi } from '@/lib/api';

export default function FarmerOverviewPage() {
  const { user } = useAuthZustand();

  const ordersState = useOfflineCache<any[]>('farmer-orders-overview', async () => (await ordersApi.getAll()).data || []);
  const productsState = useOfflineCache<any[]>('farmer-products-overview', async () => (await productsApi.getByFarmer(user?.id || '')).data || []);
  const rfqsState = useOfflineCache<any[]>('farmer-rfqs-overview', async () => (await rfqApi.getAll()).data?.rfqs || []);

  const rfqsRaw = rfqsState.data;
  const rfqs = Array.isArray(rfqsRaw) ? rfqsRaw : (rfqsRaw as any)?.rfqs || [];
  
  const stats = {
    revenue: ordersState.data?.reduce((acc, o) => acc + (o.total || 0), 0) || 12400,
    activeOrders: ordersState.data?.filter(o => o.status === 'pending' || o.status === 'accepted').length || 0,
    inventoryCount: productsState.data?.length || 0,
    openRfqs: rfqs.length || 0,
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-10 pb-20">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-5xl font-display font-black text-gray-900 dark:text-white leading-[1.1] mb-2 uppercase tracking-tighter">
            Digital Farm <br /> Command Center
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
             Authenticated Identity: {user?.name || 'Verified Farmer'} • <Activity size={12} className="text-emerald-500" /> Decentralized Node Active
          </p>
        </motion.div>
        
        <div className="flex items-center gap-4 bg-white/40 dark:bg-white/5 p-2 rounded-[32px] border border-white/20 shadow-sm backdrop-blur-xl">
            <div className="p-4 bg-indigo-600 rounded-[24px] text-white shadow-xl shadow-indigo-500/20">
                <p className="text-[10px] font-black uppercase tracking-widest pl-1 leading-none mb-1 opacity-70 text-indigo-200">Total Liquid Rev</p>
                <p className="text-2xl font-display font-black leading-none">${stats.revenue.toLocaleString()}</p>
            </div>
            <div className="pr-10 pl-4 py-2">
                <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-tight">
                    <ArrowUpRight size={14} /> +12.4%
                </div>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1 opacity-60">Strategic Yield Growth</p>
            </div>
        </div>
      </div>

      {/* Grid Quick Navigation & Quick Stats */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          { label: 'Live Orders', val: stats.activeOrders, href: '/dashboard/farmer/orders', icon: ShoppingBag, color: 'from-blue-600 to-indigo-600 shadow-blue-500/20' },
          { label: 'Managed Stock', val: stats.inventoryCount, href: '/dashboard/farmer/inventory', icon: Package, color: 'from-emerald-600 to-teal-600 shadow-emerald-500/20' },
          { label: 'Strategic Analytics', val: '15 Insights', href: '/dashboard/farmer/analytics', icon: BrainCircuit, color: 'from-fuchsia-600 to-pink-600 shadow-fuchsia-500/20' },
          { label: 'Waitlist Grade', val: '4.8', href: '/dashboard/farmer/reviews', icon: Star, color: 'from-purple-600 to-violet-600 shadow-purple-500/20' },
        ].map((nav, i) => (
          <Link key={nav.label} href={nav.href}>
            <motion.div 
               variants={item}
               whileHover={{ scale: 1.02, y: -4 }}
               className="glass-card border border-white/20 rounded-[40px] p-8 relative overflow-hidden group cursor-pointer h-full"
            >
              <div className={`absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br ${nav.color} opacity-10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700`} />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between">
                   <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${nav.color} flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform`}>
                      <nav.icon size={26} />
                   </div>
                   <ArrowUpRight size={20} className="text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </div>
                <div className="mt-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{nav.label}</p>
                  <p className="text-4xl font-display font-black text-gray-900 dark:text-white">{nav.val}</p>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left: Strategic Insights & Deals */}
        <div className="xl:col-span-8 flex flex-col gap-8">
            <div className="glass-card border border-white/20 rounded-[48px] p-10 min-h-[440px] relative overflow-hidden flex flex-col group">
                 <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 rounded-full blur-[120px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
                 
                 <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none flex items-center gap-4">
                            <Zap className="text-amber-500 fill-amber-500" />
                            Live Market Pulse
                        </h2>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] mt-3 pl-1">Algorithmic Matchmaking Pipeline</p>
                    </div>
                    <button onClick={() => rfqsState.reload()} className="h-12 px-6 rounded-2xl bg-white/50 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest border border-white/20 hover:border-primary-500 transition-all flex items-center gap-3">
                        <RefreshCw size={14} className={rfqsState.loading ? 'animate-spin' : ''} />
                        Rescan Matrix
                    </button>
                 </div>                  <div className="flex-1 space-y-6 relative z-10">
                    {rfqs.slice(0, 3).map((rfq: any, idx: number) => (
                        <motion.div 
                          key={rfq.id || rfq._id} 
                          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                          className="flex flex-col md:flex-row md:items-center gap-6 p-6 rounded-[32px] bg-white/40 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-white/20 shadow-sm transition-all group/item overflow-hidden relative"
                        >
                            <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-primary-500/20 group-hover/item:scale-110 transition-transform">
                                {String(rfq.category || 'R').charAt(0)}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">{rfq.category || 'High Volume Order'}</h4>
                                <div className="flex gap-4 mt-1 font-bold text-[10px] uppercase tracking-widest text-gray-400 opacity-60">
                                   <span className="flex items-center gap-1.5"><MapPin size={12} /> Regional Demand</span>
                                   <span className="flex items-center gap-1.5"><Calendar size={12} /> {rfq.quantity || 500} Units Needed</span>
                                </div>
                            </div>
                            <Link href="/dashboard/rfq">
                                <button className="h-14 w-full md:w-auto px-10 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-700 hover:scale-105 transition-all">Submit Bid</button>
                            </Link>
                        </motion.div>
                    ))}
                    {rfqs.length === 0 && (
                        <div className="py-20 text-center opacity-30 mt-10">
                            <Handshake size={48} className="mx-auto mb-4" />
                            <p className="text-xl font-display font-black uppercase tracking-tighter">No live bids detected in node cache</p>
                        </div>
                    )}
                 </div>

                 <div className="mt-8 pt-6 border-t border-white/10 dark:border-gray-900/50 flex justify-center">
                    <Link href="/dashboard/rfq" className="group flex items-center gap-3 text-primary-600 font-black text-[10px] uppercase tracking-widest hover:underline">
                        Enter RFQ Hall <ArrowUpRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                 </div>
            </div>
        </div>

        {/* Right Sidebar: Quick Actions & Status */}
        <div className="xl:col-span-4 flex flex-col gap-8">
            <div className="glass-card border border-white/20 rounded-[48px] p-10 space-y-8 flex-1 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                
                <div className="flex items-center gap-4 text-emerald-600 mb-2 pl-1 relative z-10">
                    <ShieldCheck className="w-7 h-7 group-hover:rotate-12 transition-transform" />
                    <h2 className="text-lg font-display font-black uppercase tracking-tight leading-none">Security Center</h2>
                </div>

                <div className="space-y-6 relative z-10">
                    <div className="flex items-center justify-between p-6 bg-white/40 dark:bg-white/5 border border-white/20 rounded-[28px] shadow-sm">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">KYC Integrity</p>
                            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">PASSED & SIGNED</p>
                        </div>
                        <ShieldCheck className="text-emerald-500" size={24} />
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Critical Actions</p>
                        <Link href="/dashboard/products">
                            <button className="w-full h-14 bg-white/50 dark:bg-white/5 border border-white/20 rounded-2xl flex items-center px-6 gap-4 hover:border-primary-500 hover:bg-white group transition-all text-left mb-3">
                                <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all">
                                    <Zap size={16} />
                                </div>
                                <span className="text-[10px] font-black uppercase text-gray-900 dark:text-white tracking-widest">Update Market Inventory</span>
                            </button>
                        </Link>
                        <Link href="/dashboard/chat">
                            <button className="w-full h-14 bg-white/50 dark:bg-white/5 border border-white/20 rounded-2xl flex items-center px-6 gap-4 hover:border-indigo-500 hover:bg-white group transition-all text-left mb-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <Send size={16} />
                                </div>
                                <span className="text-[10px] font-black uppercase text-gray-900 dark:text-white tracking-widest">Open Connection Hub</span>
                            </button>
                        </Link>
                        <Link href="/dashboard/settings">
                             <button className="w-full h-14 bg-white/50 dark:bg-white/5 border border-white/20 rounded-2xl flex items-center px-6 gap-4 hover:border-gray-500 hover:bg-white group transition-all text-left">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 flex items-center justify-center group-hover:bg-gray-900 dark:group-hover:bg-white group-hover:text-gray-900 dark:group-hover:text-black transition-all">
                                    <Settings size={16} />
                                </div>
                                <span className="text-[10px] font-black uppercase text-gray-900 dark:text-white tracking-widest">Node Configuration</span>
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[32px] border border-blue-100 dark:border-blue-800 relative z-10">
                    <div className="flex gap-4">
                        <Activity className="w-6 h-6 text-blue-600 shrink-0 mt-0.5 opacity-60" />
                        <div>
                            <p className="text-[10px] font-black text-blue-800 dark:text-blue-400 uppercase tracking-widest mb-1.5">Network Latency Alert</p>
                            <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed font-bold lowercase first-letter:uppercase">Mumbai node reports 18ms latency. Optimization required for real-time logistics sync.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>

    </div>
  );
}
