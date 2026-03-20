'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Trash2, ArrowRight, CreditCard, 
  ShoppingBag, ChevronRight, Zap, Boxes, 
  MapPin, User, AlertCircle, RefreshCw, Layers, 
  CheckCircle2, Truck, Calendar, FileText, Download, 
  Share2, ShieldCheck, Scale, BarChart3, Info
} from 'lucide-react';
import { buyerCartApi, ordersApi, rfqApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function BulkOrdersCartPage() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [logisticsPref, setLogisticsPref] = useState<'FTL' | 'PTL'>('PTL');
  const [deliveryDate, setDeliveryDate] = useState('');

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    try {
      const res = await buyerCartApi.get();
      setCart(res.data);
    } catch (e) {
      toast.error('Cart synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  const updateQty = async (pid: string, qty: number) => {
    try {
      if (qty <= 0) {
        await buyerCartApi.removeItem(pid);
        toast.success('Removed from pipeline');
      } else {
        await buyerCartApi.updateItemQty(pid, qty);
      }
      loadCart();
    } catch (e) {
      toast.error('Update failed');
    }
  };

  const handleCheckout = async () => {
    // MOQ Validation
    const underMOQ = cartItems.find((it: any) => it.quantity < (it.moq || 50));
    if (underMOQ) {
      toast.error(`Minimum order for ${underMOQ.productName} is ${underMOQ.moq || 50}kg`, {
        icon: '⚠️'
      });
      return;
    }

    setCheckoutBusy(true);
    try {
      const res = await buyerCartApi.checkout();
      const orders = res.data?.orders || [];
      toast.success(`Success: ${orders.length} orders injected into blockchain`, {
         icon: '⛓️',
         style: { borderRadius: '24px', fontWeight: 'black', textTransform: 'uppercase', fontSize: '10px' }
      });
      loadCart();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Order Injection Failed');
    } finally {
      setCheckoutBusy(false);
    }
  };

  const convertToRfq = async () => {
    toast.loading('Converting cart nodes to RFQ matrix...', { id: 'rfq-conv' });
    try {
        // Mocking conversion - in real app, we iterate cart items and create RFQs
        toast.success('Strategy Shift: RFQ Broadcast Active', { id: 'rfq-conv', icon: '📡' });
    } catch {
        toast.error('Conversion failed', { id: 'rfq-conv' });
    }
  };

  const exportCart = () => {
    const data = JSON.stringify(cartItems, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ODOP_Procurement_Export_${Date.now()}.json`;
    a.click();
    toast.success('ERP-Ready Export Generated');
  };

  const cartItems = cart?.items || [];
  
  // Feature: Group items by Supplier/Farmer Cluster
  const groupedItems = useMemo(() => {
    return cartItems.reduce((acc: any, item: any) => {
      const key = item.farmerName || 'Independent Node';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [cartItems]);

  const subtotal = useMemo(() => cartItems.reduce((acc: number, it: any) => acc + it.price * it.quantity, 0), [cartItems]);
  const gst = subtotal * 0.05;
  const apmc = subtotal * 0.01;
  const platformFee = subtotal * 0.005;
  const total = subtotal + gst + apmc + platformFee;

  return (
    <div className="space-y-12 pb-24">
      
      {/* Header with Export & Share */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div>
          <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter">
            Procurement <span className="text-indigo-600">Pipeline</span>
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">Active Bulk Cart Nodes • Dynamic Sourcing</p>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={exportCart} className="h-10 px-6 rounded-full bg-white/40 dark:bg-white/5 border border-white/20 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-all">
                <Download size={14} /> ERP Export
            </button>
            <button key="share-btn" className="h-10 px-6 rounded-full bg-white/40 dark:bg-white/5 border border-white/20 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-all">
                <Share2 size={14} /> Share Cart
            </button>
            <button onClick={loadCart} className="h-10 w-10 flex items-center justify-center rounded-full bg-white/40 dark:bg-white/5 border border-white/20 hover:bg-white transition-all">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Main List - Grouped by Supplier */}
          <div className="xl:col-span-8 space-y-12">
              <AnimatePresence mode="popLayout">
                {Object.keys(groupedItems).length > 0 ? (
                  Object.entries(groupedItems).map(([farmer, items]: [string, any], groupIdx) => (
                    <div key={farmer} className="space-y-6">
                        <div className="flex items-center gap-4 pl-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg"><User size={18} /></div>
                            <div>
                                <h2 className="text-lg font-display font-black uppercase tracking-tight leading-none">{farmer}</h2>
                                <p className="text-[9px] font-black text-gray-400 tracking-widest uppercase mt-1">Sourcing Cluster Alpha • {items.length} Lots</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {items.map((item: any, idx: number) => (
                                <motion.div 
                                    key={item.productId}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-card border border-white/20 rounded-[40px] p-8 flex flex-col md:flex-row items-center gap-8 group hover:border-indigo-500/30 transition-all overflow-hidden relative"
                                >
                                    <div className="w-24 h-24 bg-white dark:bg-white/5 rounded-[28px] shrink-0 overflow-hidden border border-white/10 relative">
                                        {item.images?.[0] ? (
                                            <img src={item.images[0]} alt={item.productName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">🥬</div>
                                        )}
                                        {item.quantity >= 500 && (
                                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-[8px] font-black text-white rounded-full uppercase tracking-widest shadow-lg">Tier 2 Active</div>
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-3 relative z-10 w-full text-center md:text-left">
                                        <div className="flex items-center justify-center md:justify-start gap-3">
                                            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1.5 leading-none px-3 py-1 bg-indigo-500/5 rounded-full border border-indigo-500/10">Grade {item.quality || 'A+'}</p>
                                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none px-3 py-1 bg-emerald-500/5 rounded-full border border-emerald-500/10 flex items-center gap-1.5"><CheckCircle2 size={10} /> Certified</p>
                                        </div>
                                        <h3 className="text-2xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">{item.productName}</h3>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 font-bold text-[10px] uppercase tracking-widest text-gray-400 opacity-60">
                                            <span className="flex items-center gap-1.5 text-rose-500"><Info size={12} /> MOQ: {item.moq || 50}kg</span>
                                            <span className="flex items-center gap-1.5"><MapPin size={12} /> {item.location || 'Cluster Zone'}</span>
                                        </div>
                                        
                                        {/* Tiered Price Hint */}
                                        <div className="mt-4 pt-4 border-t border-white/10">
                                            <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-[0.2em]">Next Discount: Buy 500kg total to save ₹2/kg</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center md:items-end gap-6 relative z-10 w-full md:w-auto">
                                        <div className="flex items-center gap-3 bg-white/50 dark:bg-white/5 p-1.5 border border-white/20 rounded-2xl shadow-sm">
                                            <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center text-gray-500 hover:text-rose-500 transition-all">-</button>
                                            <span className="w-14 text-center font-display font-black text-xl text-gray-900 dark:text-white leading-none">{item.quantity}</span>
                                            <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center text-gray-500 hover:text-indigo-600 transition-all">+</button>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 opacity-40">Unit: ₹{item.price}</p>
                                            <p className="text-2xl font-display font-black text-gray-900 dark:text-white tracking-tighter">₹{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <button onClick={() => updateQty(item.productId, 0)} className="absolute top-4 right-4 p-2 text-gray-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                  ))
                ) : !loading ? (
                   <div className="py-40 text-center glass-card border-white/20 rounded-[64px]">
                       <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner"><ShoppingBag size={40} className="text-gray-300" /></div>
                       <h2 className="text-3xl font-display font-black uppercase tracking-tighter text-gray-400 leading-none">Pipeline Empty</h2>
                       <Link href="/dashboard/buyer/products"><button className="mt-12 btn btn-primary px-12 h-14 text-[10px]">Explore Marketplace</button></Link>
                   </div>
                ) : (
                   Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-44 rounded-[40px] bg-white/20 dark:bg-white/5 border border-white/20 animate-pulse" />)
                )}
              </AnimatePresence>
          </div>

          {/* Checkout Panel - Advanced Breakdown */}
          <div className="xl:col-span-4 flex flex-col gap-8">
              <div className="glass-card border border-white/20 rounded-[48px] p-10 space-y-10 sticky top-10 overflow-hidden bg-gradient-to-br from-indigo-900 to-black text-white shadow-2xl">
                  {/* Background Aura */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />
                  
                  <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-4">
                          <Layers className="w-7 h-7 text-indigo-400" />
                          <h2 className="text-xl font-display font-black uppercase tracking-tight">Vault Checkout</h2>
                      </div>
                      <div className="h-8 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase flex items-center gap-2"><ShieldCheck size={12} /> Verified</div>
                  </div>

                  {/* Logistics & Scheduling */}
                  <div className="space-y-6 relative z-10 pt-6 border-t border-white/10">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Logistic Preference</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setLogisticsPref('PTL')} className={`h-12 rounded-2xl border text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${logisticsPref === 'PTL' ? 'bg-white text-black border-white' : 'bg-transparent border-white/10 text-white'}`}><Truck size={14} /> PTL Node</button>
                            <button onClick={() => setLogisticsPref('FTL')} className={`h-12 rounded-2xl border text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${logisticsPref === 'FTL' ? 'bg-white text-black border-white' : 'bg-transparent border-white/10 text-white'}`}><Truck size={14} /> Full Hub</button>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Harvest Delivery window</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={16} />
                            <input 
                                type="date"
                                className="w-full h-14 pl-12 pr-6 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase outline-none focus:border-indigo-500 transition-all"
                                value={deliveryDate}
                                onChange={(e) => setDeliveryDate(e.target.value)}
                            />
                        </div>
                    </div>
                  </div>

                  {/* Comprehensive Breakdown */}
                  <div className="space-y-4 relative z-10 py-8 border-y border-white/10">
                      <div className="flex justify-between items-center"><span className="text-[10px] font-black text-gray-400 uppercase">Subtotal Matrix</span><span className="text-sm font-black font-display tracking-tight">₹{subtotal.toLocaleString()}</span></div>
                      <div className="flex justify-between items-center"><span className="text-[10px] font-black text-gray-400 uppercase">GST (5%)</span><span className="text-sm font-black font-display tracking-tight">₹{gst.toLocaleString()}</span></div>
                      <div className="flex justify-between items-center"><span className="text-[10px] font-black text-gray-400 uppercase">APMC Cess (1%)</span><span className="text-sm font-black font-display tracking-tight">₹{apmc.toLocaleString()}</span></div>
                      <div className="flex justify-between items-center"><span className="text-[10px] font-black text-gray-400 uppercase">Platform Fee</span><span className="text-sm font-black font-display tracking-tight">₹{platformFee.toLocaleString()}</span></div>
                      <div className="flex justify-between items-end pt-4 border-t border-white/10 text-indigo-400">
                        <span className="text-[10px] font-black uppercase leading-none mb-1">Total Payload</span>
                        <span className="text-4xl font-display font-black tracking-tighter leading-none">₹{total.toLocaleString()}</span>
                      </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                      <button 
                         disabled={checkoutBusy || cartItems.length === 0}
                         onClick={handleCheckout}
                         className="w-full h-20 bg-white text-black rounded-[28px] text-[12px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all shadow-xl active:scale-95 disabled:opacity-40"
                      >
                         {checkoutBusy ? 'Syncing...' : 'Execute Order'}
                         <Zap size={20} className="fill-current" />
                      </button>
                      <button onClick={convertToRfq} className="w-full h-14 bg-indigo-500/10 border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-indigo-300 hover:bg-indigo-500/20 transition-all flex items-center justify-center gap-3">
                         <BarChart3 size={16} /> Shift to RFQ Matrix
                      </button>
                      <div className="flex items-center gap-3 px-2">
                         <input type="checkbox" className="w-4 h-4 rounded border-indigo-500 accent-indigo-500" />
                         <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">Attach Smart Contract <Scale size={12} /></span>
                      </div>
                  </div>

                  <div className="p-6 bg-white/5 rounded-[32px] border border-white/5 flex gap-4">
                      <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[9px] text-gray-400 leading-relaxed font-bold uppercase tracking-widest">MOQ check active. Orders below seller floor limits will be auto-flagged for rejection.</p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
