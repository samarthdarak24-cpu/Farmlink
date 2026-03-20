'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Search, Filter, Box, RefreshCw, CheckCircle2, XCircle, Clock, Truck, User, Calendar, Mail, Zap, Layers, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { samplesApi } from '@/lib/api';
import { useOfflineCache } from '@/hooks/useOfflineCache';
import { useAuthZustand } from '@/store/authZustand';

export default function SampleRequestsPage() {
  const { user } = useAuthZustand();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  const samplesState = useOfflineCache<any[]>('farmer-samples', async () => {
    const res = await samplesApi.getAll();
    return res.data || [];
  });

  const samples = samplesState.data || [];

  const handleUpdate = async (id: string, status: string) => {
    setBusyId(id);
    try {
      await samplesApi.updateStatus(id, status);
      toast.success(`Sample request ${status} successfully`);
      await samplesState.reload();
    } catch (e: any) {
      toast.error('Operation failed. Please try again later.');
    } finally {
      setBusyId(null);
    }
  };

  const filtered = samples.filter(s => {
    const matchesSearch = (s.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.buyerName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || s.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-primary-600" />
            Sample Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage product discovery requests from verified bulk institutional buyers.
          </p>
        </div>
        
        <button 
          onClick={() => samplesState.reload()}
          className="btn btn-outline flex items-center gap-2 h-11"
        >
          <RefreshCw className={`w-4 h-4 ${samplesState.loading ? 'animate-spin' : ''}`} />
          Sync Requests
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Pending Dispatch', value: samples.filter(s => s.status === 'pending').length, icon: Clock, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
          { label: 'Dispatched', value: samples.filter(s => s.status === 'dispatched').length, icon: Truck, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
          { label: 'Completed Lab', value: samples.filter(s => s.status === 'completed').length, icon: Zap, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Total Volume', value: samples.length, icon: Layers, color: 'text-primary-500 bg-primary-500/10 border-primary-500/20' },
        ].map(kpi => (
           <div key={kpi.label} className={`glass-card border-x-4 border-y border-white/20 rounded-2xl p-5 flex flex-col justify-center ${kpi.color}`}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{kpi.label}</p>
                <kpi.icon size={16} />
              </div>
              <p className="text-3xl font-display font-black mt-2 leading-none">{kpi.value}</p>
           </div>
        ))}
      </div>

      <div className="glass-card border border-white/20 rounded-3xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by buyer or crop type..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-11 h-12 w-full bg-white/50 dark:bg-gray-800/50"
          />
        </div>
        
        <div className="flex bg-white/30 dark:bg-black/20 p-1 rounded-2xl border border-white/10 overflow-hidden">
            {['all', 'pending', 'approved', 'dispatched', 'delivered'].map(t => (
               <button 
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-900'}`}
               >
                  {t}
               </button>
            ))}
        </div>
      </div>

      <div className="space-y-6">
        {samplesState.loading ? (
             <div className="py-20 flex flex-col items-center opacity-50"><RefreshCw className="animate-spin mb-4" /> Pulling Cloud Inventory Matrix...</div>
        ) : filtered.length === 0 ? (
             <div className="glass-card rounded-[40px] p-20 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 opacity-40">
                <Box className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-display font-bold uppercase tracking-tighter">No sample requests discovered</h3>
                <p className="text-sm">Requests for trial shipments will appear here when buyers are interested in your quality.</p>
             </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
                {filtered.map((sample, idx) => (
                    <motion.div 
                        key={sample.id || sample._id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                        className="glass-card border border-white/20 rounded-[32px] p-6 relative overflow-hidden flex flex-col group hover:shadow-2xl transition-all"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-[40px] pointer-events-none" />
                        
                        <div className="flex items-start justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl gradient-mesh flex items-center justify-center text-white font-black text-lg shadow-xl shadow-primary-500/20 group-hover:rotate-12 transition-transform duration-500">
                                    {String(sample.productName || 'S').charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">{sample.productName || 'Agricultural Sample'}</h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                                        <Clock className="w-3.5 h-3.5" /> ID: {String(sample.id || sample._id).slice(-8).toUpperCase()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                    sample.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                                    sample.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                    'bg-blue-100 text-blue-700 border-blue-200'
                                }`}>
                                    {sample.status || 'Active'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/10 dark:border-gray-900/50 mb-6 font-bold relative z-10">
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest pl-1">Target Buyer</p>
                                <p className="text-xs text-gray-900 dark:text-white flex items-center gap-2">
                                    <User size={12} className="text-primary-500" />
                                    {sample.buyerName || 'Verified Export Corp'}
                                </p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest pr-1">Discovery Date</p>
                                <p className="text-xs text-gray-900 dark:text-white flex items-center gap-2 justify-end">
                                    <Calendar size={12} className="text-emerald-500" />
                                    {new Date(sample.createdAt || Date.now()).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between relative z-10 gap-3">
                            <div className="flex gap-1.5 overflow-x-auto custom-scrollbar no-scrollbar flex-1 pb-1">
                                {['pending', 'approved', 'dispatched', 'delivered', 'rejected'].map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => handleUpdate(sample.id || sample._id, s)}
                                        disabled={busyId === (sample.id || sample._id)}
                                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                                            sample.status === s 
                                                ? 'bg-primary-600 text-white border-primary-600 shadow-xl shadow-primary-500/30' 
                                                : 'bg-white/50 dark:bg-gray-800 text-gray-500 border-white/10 hover:border-primary-500/50'
                                        }`}
                                    >
                                        {busyId === (sample.id || sample._id) && sample.status !== s ? '...' : s}
                                    </button>
                                ))}
                            </div>
                            <button className="h-9 w-9 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all">
                                <Activity size={16} />
                            </button>
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
