'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Search, Filter, Clock, CheckCircle2, Truck, 
  AlertCircle, FileText, RefreshCw, User, Calendar, Tag, 
  ChevronRight, Box, ShieldCheck, Download, MoreVertical, 
  CreditCard, Handshake, ExternalLink, Zap, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ordersApi, blockchainApi } from '@/lib/api';
import { useOfflineCache } from '@/hooks/useOfflineCache';
import { useAuthZustand } from '@/store/authZustand';
import DashboardRealtimeListener from '@/components/dashboard/shared/DashboardRealtimeListener';
import { formatDistanceToNow } from 'date-fns';

export default function AdvancedOrdersPage() {
  const { user } = useAuthZustand();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const ordersState = useOfflineCache<any[]>('farmer-distribution-v1', async () => {
    try {
      const res = await ordersApi.getAll();
      return res.data || [];
    } catch { return []; }
  });

  const orders = ordersState.data || [];

  const stats = useMemo(() => {
    return {
      active: orders.filter(o => ['pending', 'accepted', 'shipped'].includes(o.status)).length,
      revenue: orders.filter(o => o.status === 'delivered').reduce((acc, curr) => acc + (curr.totalAmount || 0), 0),
      shipped: orders.filter(o => o.status === 'shipped').length,
      pending: orders.filter(o => o.status === 'pending').length
    };
  }, [orders]);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    setBusyOrderId(orderId);
    try {
      const res = await ordersApi.updateStatus(orderId, status);
      const updated = res.data;
      toast.success(`Distribution State Updated to ${status.toUpperCase()}`);
      await ordersState.reload();

      // Blockchain Consensus Recording
      if (['shipped', 'delivered'].includes(status)) {
        blockchainApi.recordTransfer({
          productId: updated.productId,
          from: updated.farmerId,
          to: updated.buyerId,
          quantity: updated.quantity,
          orderId: updated._id
        }).catch(() => console.log('Blockchain sync pending...'));
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'State transition failed');
    } finally {
      setBusyOrderId(null);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = String(o.id || o._id).toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (o.productName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusMatrix = (status: string) => {
    const matrix: any = {
      pending: { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock, label: 'Consensus Pending' },
      accepted: { color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Handshake, label: 'Trade Accepted' },
      shipped: { color: 'text-indigo-500', bg: 'bg-indigo-500/10', icon: Truck, label: 'In Transit' },
      delivered: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2, label: 'Legally Finalized' },
      cancelled: { color: 'text-rose-500', bg: 'bg-rose-500/10', icon: AlertCircle, label: 'Transaction Void' },
    };
    return matrix[status] || matrix.pending;
  };

  return (
    <div className="space-y-10 pb-20">
      <DashboardRealtimeListener onOrderUpdate={() => ordersState.reload()} />
      
      {/* Bio-Distribution HUD */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white flex items-center gap-4 uppercase tracking-tighter">
            <Package className="w-10 h-10 text-primary-600" />
            Distribution Terminal
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1 pl-1">
            Institutional Lifecycle Management • Real-time Consensus Tracking
          </p>
        </motion.div>
        
        <div className="flex items-center gap-4 p-4 bg-white/40 dark:bg-white/5 border border-white/20 rounded-[32px] shadow-xl">
           <div className="flex items-center gap-4 pr-6 border-r border-white/10">
              <div className="w-12 h-12 bg-primary-600/10 rounded-2xl flex items-center justify-center text-primary-600">
                 <Zap size={24} />
              </div>
              <div>
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Active Chain</p>
                 <p className="text-xl font-display font-black text-primary-600 tracking-tighter">{stats.active} Nodes</p>
              </div>
           </div>
           <div className="flex items-center gap-4 pl-2">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
                 <Activity size={24} />
              </div>
              <div>
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Finalized Payout</p>
                 <p className="text-xl font-display font-black text-emerald-600 tracking-tighter">₹{stats.revenue.toLocaleString()}</p>
              </div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search orders by ID, Buyer, or Produce Code..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-16 h-16 w-full glass-card border-white/20 rounded-2xl text-sm font-bold shadow-inner"
          />
        </div>

        <div className="flex items-center gap-4">
          <Filter className="w-6 h-6 text-gray-400" />
          <select 
            className="input h-16 w-full lg:w-56 glass-card border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Global Ledger</option>
            {['pending', 'accepted', 'shipped', 'delivered', 'cancelled'].map(s => (
                <option key={s} value={s}>{s.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Left: Orders Stream */}
        <div className="xl:col-span-8 space-y-6">
            <AnimatePresence>
                {filteredOrders.length === 0 ? (
                    <div className="h-[500px] glass-card border-2 border-dashed border-white/10 rounded-[60px] flex flex-col items-center justify-center p-20 text-center opacity-60">
                        <Package className="w-20 h-20 text-gray-300 mb-8" />
                        <h3 className="text-2xl font-display font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">No Distributions Found</h3>
                        <p className="text-sm">Verify your RFQ responses or check active trade negotiation threads.</p>
                    </div>
                ) : (
                    filteredOrders.map((order, idx) => {
                        const m = getStatusMatrix(order.status || 'pending');
                        const isSelected = selectedOrder?._id === order._id;
                        return (
                          <motion.div 
                            key={order._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                            onClick={() => setSelectedOrder(order)}
                            className={`glass-card border border-white/20 rounded-[40px] p-8 hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden ${isSelected ? 'ring-2 ring-primary-500 bg-white/50' : ''}`}
                          >
                             <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/5 rounded-full blur-[80px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                             
                             <div className="flex flex-col lg:flex-row gap-8 relative z-10">
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-primary-600 to-indigo-700 flex items-center justify-center text-white font-display font-black text-2xl shadow-xl">
                                                {String(order.productName || 'P').charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-1">Tx: #{String(order._id).slice(-8).toUpperCase()}</p>
                                                <h3 className="text-2xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight">{order.productName || 'Agri-Product Twin'}</h3>
                                            </div>
                                        </div>
                                        <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${m.bg} ${m.color} border border-white/10 flex items-center gap-2`}>
                                            <m.icon size={14} /> {m.label}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/10">
                                        {[
                                            { label: 'Verified Buyer', val: order.buyerName || 'Consensus Node', icon: User },
                                            { label: 'Volume Unit', val: `${order.quantity} ${order.unit}`, icon: Box },
                                            { label: 'Ledger Value', val: `₹${(order.totalAmount || 0).toLocaleString()}`, icon: CreditCard, color: 'text-emerald-600' },
                                            { label: 'Genesis Date', val: order.createdAt ? formatDistanceToNow(new Date(order.createdAt), { addSuffix: true }) : 'N/A', icon: Calendar }
                                        ].map((item, i) => (
                                            <div key={i} className="space-y-1">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 flex items-center gap-1.5"><item.icon size={10} /> {item.label}</p>
                                                <p className={`text-[11px] font-black truncate uppercase tracking-tight ${item.color || 'text-gray-900 dark:text-white'}`}>{item.val}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="lg:w-64 flex flex-col justify-center gap-3">
                                    <button 
                                      disabled={busyOrderId === order._id || order.status === 'delivered'}
                                      onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order._id, order.status === 'pending' ? 'accepted' : order.status === 'accepted' ? 'shipped' : 'delivered'); }}
                                      className="h-16 bg-primary-600 text-white rounded-[24px] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-primary-500/20 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {busyOrderId === order._id ? <RefreshCw className="w-4 h-4 animate-spin" /> : 
                                         order.status === 'pending' ? 'Authorize Trade' : 
                                         order.status === 'accepted' ? 'Dispatch Node' :
                                         order.status === 'shipped' ? 'Finalize Handover' : 'Fulfillment Complete'}
                                    </button>
                                </div>
                             </div>
                          </motion.div>
                        );
                    })
                )}
            </AnimatePresence>
        </div>

        {/* Right: Distribution Insight Modal (Pinned when selected) */}
        <div className="xl:col-span-4 h-fit sticky top-10">
            <AnimatePresence mode="wait">
                {selectedOrder ? (
                    <motion.div 
                        key={selectedOrder._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                        className="glass-card border border-white/20 rounded-[48px] p-8 space-y-8"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Lifecycle Pulse</h3>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 text-gray-400 hover:text-rose-500 transition-colors"><AlertCircle size={18} /></button>
                        </div>

                        <div className="space-y-8 relative pl-6 border-l-2 border-dashed border-white/10 ml-2">
                             {[
                                { status: 'Verification', time: selectedOrder.createdAt, color: 'emerald', icon: ShieldCheck, sub: 'Consensus Proof generated' },
                                { status: 'Asset Locked', time: selectedOrder.updatedAt, color: 'blue', icon: Box, sub: 'Inventory reserved at warehouse' },
                                { status: 'Transit Active', time: null, color: 'indigo', icon: Truck, sub: 'Logistics node heartbeat detected', active: selectedOrder.status === 'shipped' },
                                { status: 'Settlement', time: null, color: 'amber', icon: CreditCard, sub: 'Escrow release pending signature', active: selectedOrder.status === 'delivered' }
                             ].map((step, i) => (
                                <div key={i} className={`relative group ${!step.time && !step.active ? 'opacity-30' : ''}`}>
                                    <div className={`absolute -left-[35px] top-1 w-6 h-6 rounded-lg ${step.time || step.active ? 'bg-primary-600 shadow-lg' : 'bg-gray-200'} flex items-center justify-center text-white z-10 transition-transform group-hover:scale-125`}>
                                        <step.icon size={12} />
                                    </div>
                                    <div>
                                        <p className={`text-[11px] font-black uppercase tracking-widest ${step.time || step.active ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{step.status}</p>
                                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">{step.sub}</p>
                                        {step.time && (
                                            <p className="text-[8px] font-black text-primary-600 uppercase mt-1 tracking-widest">{formatDistanceToNow(new Date(step.time), { addSuffix: true })}</p>
                                        )}
                                    </div>
                                </div>
                             ))}
                        </div>

                        <div className="p-6 bg-primary-600/5 border border-primary-500/10 rounded-[32px] space-y-4">
                            <div className="flex items-center gap-3 text-primary-600">
                                <Zap size={14} />
                                <p className="text-[10px] font-black uppercase tracking-widest">Trade Consensus</p>
                            </div>
                            <p className="text-[10px] font-medium text-gray-500 leading-relaxed">
                                This transaction is anchored to Block <span className="text-gray-900 dark:text-white font-bold">#482,921</span>. Click below to view the digital manifest and FSSAI health certifications.
                            </p>
                            <div className="flex gap-2">
                                <button className="flex-1 h-10 bg-white dark:bg-white/5 border border-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white hover:text-primary-600 transition-all"><FileText size={12} /> Digital Manifest</button>
                                <button className="h-10 px-4 bg-white dark:bg-white/5 border border-white/20 rounded-xl flex items-center justify-center text-gray-400 hover:text-primary-600 transition-all"><Download size={12} /></button>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button className="flex-1 h-14 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">Support Channel</button>
                            <button className="w-14 h-14 bg-white dark:bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-gray-400 hover:text-primary-600 transition-all"><MoreVertical size={20} /></button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="h-[600px] glass-card border-2 border-dashed border-white/10 rounded-[48px] flex flex-col items-center justify-center p-12 text-center opacity-40">
                        <Activity className="w-12 h-12 mb-6 animate-pulse" />
                        <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Awaiting Node Pulse</h4>
                        <p className="text-[10px] font-medium mt-2">Select a distribution channel from the ledger to inspect its blockchain lifecycle and bio-quality audit trail.</p>
                    </div>
                )}
            </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
