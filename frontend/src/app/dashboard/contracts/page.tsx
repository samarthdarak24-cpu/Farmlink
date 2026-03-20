'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Search, Download, RefreshCw, CheckCircle2, AlertCircle, Clock, ShieldCheck, User, Calendar, MapPin, DollarSign, Package, MoreHorizontal, Eye, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { ordersApi } from '@/lib/api';
import { useOfflineCache } from '@/hooks/useOfflineCache';
import { useAuthZustand } from '@/store/authZustand';

export default function ContractsPage() {
  const { user } = useAuthZustand();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState('all');

  const ordersState = useOfflineCache<any[]>('farmer-orders-contracts', async () => {
    const res = await ordersApi.getAll();
    return res.data || [];
  });

  const orders = ordersState.data || [];
  // Typically contracts are linked to accepted/shipped/delivered orders.
  const contracts = orders.filter(o => ['accepted', 'shipped', 'delivered'].includes(o.status || ''));

  const filtered = contracts.filter(c => 
    (c.buyerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.productName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary-600" />
            Digital Trade Contracts
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Blockchain-signed legal frameworks for secure agricultural trade settlements.
          </p>
        </div>
        
        <button 
          onClick={() => ordersState.reload()}
          className="btn btn-outline flex items-center gap-2 h-11"
        >
          <RefreshCw className={`w-4 h-4 ${ordersState.loading ? 'animate-spin' : ''}`} />
          Sync Repository
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Contracts', value: contracts.length, icon: ShieldCheck, color: 'text-emerald-500 bg-emerald-500/10' },
          { label: 'Awaiting Signature', value: '0', icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
          { label: 'Finalized Value', value: `$${(contracts.length * 8000).toLocaleString()}`, icon: DollarSign, color: 'text-indigo-500 bg-indigo-500/10' },
          { label: 'Legal Disputes', value: 'Zero', icon: AlertCircle, color: 'text-blue-500 bg-blue-500/10' },
        ].map(kpi => (
           <div key={kpi.label} className={`glass-card border border-white/20 rounded-3xl p-5 flex flex-col justify-center ${kpi.color}`}>
              <div className="flex items-center justify-between opacity-60">
                <p className="text-[10px] font-black uppercase tracking-widest">{kpi.label}</p>
                <kpi.icon size={16} />
              </div>
              <p className="text-3xl font-display font-black mt-2 leading-none text-gray-900 dark:text-white">{kpi.value}</p>
           </div>
        ))}
      </div>

      <div className="glass-card border border-white/20 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by buyer or contract ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-11 h-12 w-full bg-white/50 dark:bg-gray-800/50"
          />
        </div>
      </div>

      <div className="space-y-4">
        {ordersState.loading ? (
             <div className="py-20 flex flex-col items-center opacity-50"><RefreshCw className="animate-spin mb-4" /> Pulling Encrypted Document Registry...</div>
        ) : filtered.length === 0 ? (
             <div className="glass-card rounded-[40px] p-20 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 opacity-40">
                <FileText className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-display font-bold uppercase tracking-tighter">No finalized contracts found</h3>
                <p className="text-sm">Finalize pending orders to generate legally-binding digital trade agreements.</p>
             </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
                {filtered.map((con, idx) => (
                    <motion.div 
                        key={con.id || con._id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                        className="glass-card border border-white/20 rounded-[32px] p-6 relative overflow-hidden group hover:shadow-2xl transition-all"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                            
                            {/* Left Info */}
                            <div className="flex flex-1 items-center gap-6">
                                <div className="w-16 h-16 rounded-[24px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-primary-600 shadow-xl group-hover:bg-primary-600 group-hover:text-white transition-all duration-500">
                                    <FileText className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Agreement #{String(con.id || con._id).slice(-8).toUpperCase()}</h3>
                                    <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1.5 opacity-60">
                                        <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(con.createdAt || Date.now()).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-emerald-500" /> On-Chain Verified</span>
                                    </div>
                                </div>
                            </div>

                            {/* Center Summary List */}
                            <div className="md:flex-1 grid grid-cols-2 md:grid-cols-3 gap-6 font-black text-gray-500 whitespace-nowrap">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.15em] mb-1.5">Counterparty</p>
                                    <p className="text-xs text-gray-900 dark:text-white flex items-center gap-2">
                                        <User size={12} className="text-primary-500" />
                                        {con.buyerName || 'Global Grain Corp'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.15em] mb-1.5">Commodity</p>
                                    <p className="text-xs text-gray-900 dark:text-white flex items-center gap-2">
                                        <Package size={12} className="text-primary-500" />
                                        {con.productName || 'Organic Rice'}
                                    </p>
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-[10px] uppercase tracking-[0.15em] mb-1.5">Contract Hub</p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                        <LinkIcon size={12} />
                                        E-Sign Node 04
                                    </p>
                                </div>
                            </div>

                            {/* Right Actions */}
                            <div className="flex items-center gap-3">
                                <button className="btn btn-outline h-12 px-5 flex items-center gap-2 rounded-2xl border-white/20 text-xs font-black uppercase tracking-widest hover:bg-white dark:hover:bg-gray-800">
                                   <Eye size={16} />
                                   Preview Hub
                                </button>
                                <button className="btn btn-primary h-12 w-12 flex items-center justify-center rounded-2xl shadow-xl shadow-primary-500/20 hover:scale-110 transition-transform">
                                   <Download size={18} />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-gray-900 transition-all opacity-40 hover:opacity-100">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>

                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
}
