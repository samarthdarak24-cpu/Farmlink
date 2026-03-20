'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Search, Filter, Package, FileText, Mail, 
  Truck, ShieldCheck, CheckCircle, User, Activity, 
  Map, Globe, Shield, Zap, ArrowUpRight, ArrowDownRight,
  TrendingUp, Boxes, Target, CreditCard, Download, 
  BrainCircuit, LayoutDashboard, Share2, MoreVertical,
  Bell, History, Lock, Milestone, BadgeCheck, AlertCircle,
  Clock, Landmark, Navigation, BarChart
} from 'lucide-react';
import Link from 'next/link';
import { useAuthZustand } from '@/store/authZustand';
import { useOfflineCache } from '@/hooks/useOfflineCache';
import { ordersApi, rfqApi, productsApi } from '@/lib/api';

export default function BuyerOverviewPage() {
  const { user } = useAuthZustand();

  const ordersState = useOfflineCache<any[]>('buyer-orders-overview', async () => (await ordersApi.getAll()).data || []);
  const rfqsState = useOfflineCache<any[]>('buyer-rfqs-overview', async () => (await rfqApi.getMyRfqs()).data || []);

  const stats = {
    totalSpend: ordersState.data?.reduce((acc, o) => acc + (o.total || 0), 0) || 54200,
    activeOrders: ordersState.data?.filter(o => o.status === 'pending' || o.status === 'shipment_ready').length || 12,
    openRfqs: rfqsState.data?.length || 4,
    savings: 12.5,
  };

  const negotiationQueue = [
    { title: 'Red-Offer: Nashik Cluster', type: 'Proposal', id: 'PROP-822', urgent: true },
    { title: 'Contract Signature Due', type: 'Legal', id: 'CON-11', urgent: true },
    { title: 'New RFQ Interest (Pune)', type: 'RFQ', id: 'RFQ-90', urgent: false },
  ];

  const menuItems = [
    { name: 'Product Browsing', href: '/dashboard/buyer/products', icon: Search, color: 'from-blue-600 to-indigo-600' },
    { name: 'Bulk Order Console', href: '/dashboard/buyer/cart', icon: Package, color: 'from-fuchsia-600 to-pink-600' },
    { name: 'RFQ Creation', href: '/dashboard/buyer/rfqs', icon: FileText, color: 'from-amber-500 to-orange-600' },
    { name: 'Negotiation Hub (Chat)', href: '/dashboard/buyer/chat', icon: Mail, color: 'from-cyan-600 to-blue-600' },
    { name: 'Proposal Matrix', href: '/dashboard/buyer/proposals', icon: FileText, color: 'from-violet-600 to-purple-600' },
    { name: 'Logistics Command', href: '/dashboard/buyer/logistics', icon: Truck, color: 'from-rose-600 to-pink-600' },
    { name: 'Order Tracking', href: '/dashboard/buyer/orders', icon: Navigation, color: 'from-sky-600 to-indigo-600' },
    { name: 'Legal & Contract Vault', href: '/dashboard/buyer/contracts', icon: FileText, color: 'from-emerald-500 to-green-600' },
    { name: 'Blockchain Traceability', href: '/dashboard/buyer/blockchain', icon: ShieldCheck, color: 'from-yellow-500 to-amber-600' },
    { name: 'Node Reputation', href: '/dashboard/buyer/ratings', icon: CheckCircle, color: 'from-slate-600 to-gray-700' },
    { name: 'Forecast Command', href: '/dashboard/buyer/forecast', icon: BarChart3, color: 'from-indigo-500 to-purple-600' },
    { name: 'Inventory Buffer-Core', href: '/dashboard/buyer/inventory-planning', icon: Boxes, color: 'from-blue-500 to-cyan-600' },
    { name: 'Financial Ledger', href: '/dashboard/buyer/payments', icon: CreditCard, color: 'from-indigo-600 to-blue-700' },
    { name: 'Supplier Comparison', href: '/dashboard/buyer/comparison', icon: Activity, color: 'from-teal-500 to-emerald-600' },
    { name: 'Analytics Dashboard', href: '/dashboard/buyer/analytics', icon: BrainCircuit, color: 'from-fuchsia-500 to-violet-600' },
    { name: 'Auto Reorder', href: '/dashboard/buyer/auto-reorder', icon: Target, color: 'from-pink-500 to-rose-600' },
  ];

  return (
    <div className="space-y-12 pb-48 w-full max-w-7xl mx-auto">
      
      {/* 1. Macro-Procurement Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 px-1 shrink-0">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
           <div className="flex items-center gap-3">
              <div className="h-2 w-12 bg-indigo-600 rounded-full" />
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-1 leading-none">Global Procurement Node v4.0</p>
           </div>
           <h1 className="text-5xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-[1] transition-all pt-2">
             Institutional <br /><span className="text-indigo-600">Overview</span>
           </h1>
        </motion.div>

        <div className="flex items-center gap-4 bg-white/40 dark:bg-white/5 p-3 rounded-[32px] border border-white/20 shadow-2xl backdrop-blur-3xl shrink-0">
             <div className="px-8 py-3 border-r border-white/10 text-center">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none opacity-60">Capital Deployed</p>
                 <p className="text-3xl font-display font-black text-gray-900 dark:text-white leading-none tracking-tighter">₹{stats.totalSpend.toLocaleString()}</p>
             </div>
             <div className="px-8 py-3 text-center text-emerald-500">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none opacity-60">AI Optimized Savings</p>
                 <p className="text-2xl font-display font-black leading-none flex items-center gap-3 tracking-tighter"><TrendingUp size={18} /> {stats.savings}%</p>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Main Content Area */}
          <div className="xl:col-span-8 space-y-12">
              
              {/* 2. Strategic Negotiation Priority Queue */}
              <div className="glass-card border border-white/20 rounded-[48px] p-10 bg-white/5 shadow-2xl space-y-8">
                 <div className="flex items-center justify-between px-2">
                    <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-3"><Bell size={18} /> Strategic Handshake Queue</h3>
                    <Link href="/dashboard/buyer/chat" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">Clear All Nodes</Link>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {negotiationQueue.map((q, i) => (
                       <motion.div 
                         key={q.id}
                         whileHover={{ scale: 1.02 }}
                         className={`p-6 rounded-[32px] border border-white/10 flex flex-col justify-between gap-4 relative overflow-hidden group shadow-lg ${q.urgent ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-black/5'}`}
                       >
                          <div className="space-y-1 relative z-10">
                             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500 opacity-70">{q.type} Control</p>
                             <p className="text-sm font-display font-black uppercase text-gray-900 dark:text-white leading-tight">{q.title}</p>
                          </div>
                          <button className="h-10 w-full bg-black dark:bg-white dark:text-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest relative z-10 hover:shadow-xl transition-all">Intercept</button>
                          {q.urgent && <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />}
                       </motion.div>
                    ))}
                 </div>
              </div>

              {/* 3. Global "Quick-Action" Bar */}
              <div className="flex items-center gap-4 px-2 overflow-x-auto pb-4 scrollbar-hide">
                 {[ 
                   { name: 'Broadcast RFQ', icon: Send, href: '/dashboard/buyer/rfqs' },
                   { name: 'Release Payment', icon: Landmark, href: '/dashboard/buyer/payments' },
                   { name: 'Sync GPS Nodes', icon: Navigation, href: '/dashboard/buyer/logistics' },
                   { name: 'Export Ledger', icon: Download, href: '/dashboard/buyer/analytics' }
                 ].map((a, i) => (
                   <Link key={i} href={a.href} className="flex-shrink-0">
                      <button className="h-14 px-8 bg-white/40 dark:bg-white/5 border border-white/20 rounded-[28px] text-[10px] font-black uppercase tracking-widest flex items-center gap-4 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm">
                         <a.icon size={16} /> {a.name}
                      </button>
                   </Link>
                 ))}
              </div>

              {/* 4. Infrastructure Mapping (Menu Grid) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                 {menuItems.map((nav, i) => (
                    <Link key={i} href={nav.href} className="group">
                       <motion.div 
                         whileHover={{ y: -5 }}
                         className="glass-card border border-white/20 rounded-[32px] p-6 text-center space-y-4 hover:bg-white dark:hover:bg-white/10 shadow-lg relative overflow-hidden"
                       >
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${nav.color} mx-auto flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform`}>
                             <nav.icon size={24} />
                          </div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 group-hover:text-indigo-600">{nav.name}</p>
                       </motion.div>
                    </Link>
                 ))}
              </div>
          </div>

          {/* Sidebar Analytics Hub */}
          <div className="xl:col-span-4 h-fit sticky top-24 space-y-8">
              
              {/* 5. Live Logistics "Glass-Box" Widget */}
              <div className="glass-card border border-blue-500/20 rounded-[48px] p-8 bg-blue-500/5 backdrop-blur-3xl shadow-2xl space-y-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                  <div className="flex items-center justify-between relative z-10">
                     <h3 className="text-sm font-display font-black uppercase tracking-widest flex items-center gap-3"><Navigation size={18} className="text-blue-500" /> Transit Node</h3>
                     <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest animate-pulse">Live Link</span>
                  </div>
                  <div className="aspect-[16/9] bg-slate-900 rounded-[32px] border border-white/10 relative overflow-hidden">
                     {/* Stylized CSS Map Placeholder */}
                     <div className="absolute inset-0 bg-indigo-500/10 opacity-60 grayscale bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:20px_20px]" />
                     <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute h-3 w-3 bg-blue-500 rounded-full border-2 border-white top-1/2 left-1/2 shadow-xl shadow-blue-500" />
                  </div>
                  <div className="space-y-4 relative z-10">
                     <p className="text-[10px] font-black text-white uppercase tracking-tighter">ORD-8291 • In Transit (Nashik Cluster)</p>
                     <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-blue-500" />
                     </div>
                     <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest text-center">~ 4h 12m to Destination Port</p>
                  </div>
              </div>

              {/* 6. AI Price-Volatility Snapshot */}
              <div className="glass-card border border-white/20 rounded-[48px] p-8 space-y-8 shadow-xl">
                 <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3"><Zap size={16} className="text-indigo-500" /> Market Movement</h3>
                    <TrendingUp className="text-emerald-500" size={18} />
                 </div>
                 <div className="p-6 bg-emerald-500/10 rounded-[32px] border border-emerald-500/20 space-y-4">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Optimal Buy Window: <span className="text-gray-900 dark:text-white">Active</span></p>
                    <p className="text-2xl font-display font-black text-gray-900 dark:text-white leading-none tracking-tighter">Tomatoes ↓ 14%</p>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest uppercase">Post-harvest surplus detected in Satara Cluster</p>
                 </div>
              </div>

              {/* 7. Critical Legal & Payment Banner */}
              <div className="p-8 bg-indigo-600 rounded-[48px] text-white shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-[30px] group-hover:scale-150 transition-all" />
                 <div className="flex items-center gap-4 relative z-10">
                    <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center border border-white/20">
                       <Lock size={24} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Security Protocol</p>
                       <p className="text-lg font-display font-black uppercase leading-tight tracking-tighter">Escrow Audit Handshake Due</p>
                    </div>
                 </div>
                 <button className="w-full h-12 bg-white text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest mt-6 shadow-xl relative z-10">Re-verify Node</button>
              </div>

          </div>

      </div>

    </div>
  );
}

function Send({ size }: { size: number }) {
  return <Mail size={size} />;
}
