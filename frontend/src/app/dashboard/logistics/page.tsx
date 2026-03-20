'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Search, Filter, RefreshCw, MapPin, Package, CheckCircle2, Clock, Navigation, MoreHorizontal, User, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { logisticsApi } from '@/lib/api';
import { useOfflineCache } from '@/hooks/useOfflineCache';
import { useAuthZustand } from '@/store/authZustand';

export default function LogisticsPage() {
  const { user } = useAuthZustand();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  const logisticsState = useOfflineCache<any[]>('farmer-logistics', async () => {
    const res = await logisticsApi.getAll();
    return res.data || [];
  });

  const shipments = logisticsState.data || [];

  const handleUpdateStatus = async (id: string, status: string, location: string) => {
    setBusyId(id);
    try {
      await logisticsApi.update(id, { status, lastLocation: location });
      toast.success(`Logistics status: ${status}`);
      await logisticsState.reload();
    } catch (e: any) {
      toast.error('Logistics update failed');
    } finally {
      setBusyId(null);
    }
  };

  const filtered = shipments.filter(s => 
    (s.productId?.toString() || '').includes(searchQuery) ||
    (s.status || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Truck className="w-8 h-8 text-emerald-600" />
            Supply Chain Logistics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time transit tracking and cargo optimization for farm-to-table delivery.
          </p>
        </div>
        
        <button 
          onClick={() => logisticsState.reload()}
          className="btn btn-outline flex items-center gap-2 h-11"
        >
          <RefreshCw className={`w-4 h-4 ${logisticsState.loading ? 'animate-spin' : ''}`} />
          Refresh Tracking
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-card bg-emerald-500/10 border-l-8 border-emerald-500 rounded-3xl p-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-2">Active Shipments</h4>
            <p className="text-4xl font-display font-black text-emerald-900 dark:text-emerald-400">{shipments.filter(s => s.status === 'in-transit').length}</p>
        </div>
        <div className="glass-card bg-blue-500/10 border-l-8 border-blue-500 rounded-3xl p-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-400 mb-2">Pending Pickup</h4>
            <p className="text-4xl font-display font-black text-blue-900 dark:text-blue-400">{shipments.filter(s => s.status === 'pending').length}</p>
        </div>
        <div className="glass-card bg-amber-500/10 border-l-8 border-amber-500 rounded-3xl p-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-2">Optimization Score</h4>
            <p className="text-4xl font-display font-black text-amber-900 dark:text-amber-400">92%</p>
        </div>
      </div>

      <div className="glass-card border border-white/20 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Product ID or Status..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-11 h-12 w-full bg-white/50 dark:bg-gray-800/50"
          />
        </div>
      </div>

      <div className="space-y-4">
        {logisticsState.loading ? (
             <div className="py-20 flex flex-col items-center opacity-50"><RefreshCw className="animate-spin mb-4" /> Syncing GPS clusters...</div>
        ) : filtered.length === 0 ? (
             <div className="glass-card rounded-[40px] p-20 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 opacity-40">
                <Navigation className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-display font-bold uppercase tracking-tighter">No logistics data found</h3>
                <p className="text-sm">Active shipments from your orders will appear here automatically.</p>
             </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <AnimatePresence>
                {filtered.map((ship, idx) => (
                    <motion.div 
                        key={ship.id || ship._id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                        className="glass-card border border-white/20 rounded-[32px] p-6 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="flex items-start justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-emerald-600 shadow-xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                                    <Truck className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">Shipment #{String(ship.id || ship._id).slice(-6).toUpperCase()}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                            ship.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-blue-100 text-blue-700 border-blue-200'
                                        }`}>
                                            {ship.status || 'Routing'}
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight flex items-center gap-1">
                                            <ShieldCheck size={10} className="text-emerald-500" /> Insured
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors"><MoreHorizontal size={18} /></button>
                        </div>

                        <div className="grid grid-cols-2 gap-6 py-6 border-y border-white/10 dark:border-gray-900/50 mb-6 font-bold relative z-10">
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest pl-1">Last Node</p>
                                <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                    <MapPin size={12} className="text-primary-500" />
                                    {ship.lastLocation || 'Main Hub 01'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest pl-1">Destination</p>
                                <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                    <Navigation size={12} className="text-emerald-500" />
                                    Buyer Warehouse
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 font-black text-xs">P</div>
                                <p className="text-xs font-black text-gray-500 uppercase tracking-tight">Product ID: {String(ship.productId).slice(0, 8)}</p>
                            </div>
                            <div className="flex gap-2">
                                {['pending', 'in-transit', 'delivered'].map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => handleUpdateStatus(ship.id || ship._id, s, 'Nasik Checkpoint')}
                                        disabled={busyId === (ship.id || ship._id)}
                                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                            ship.status === s 
                                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' 
                                                : 'bg-white/50 dark:bg-gray-800 text-gray-400 border border-white/10 hover:border-emerald-500/50'
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
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
