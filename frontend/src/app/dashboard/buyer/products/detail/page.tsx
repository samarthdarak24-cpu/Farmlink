'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, MapPin, User, Package, Zap, 
  ArrowLeft, ShoppingCart, BarChart3, Clock, 
  CheckCircle2, Star, Share2, Info, ChevronRight,
  TrendingUp, Activity, Scale, Box, Truck, BarChart
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { productsApi, buyerCartApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

function ProductDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(50);
  const [activeTab, setActiveTab] = useState<'origin' | 'specs' | 'blockchain' | 'pricing'>('origin');

  const priceHistory = [
    { day: 'Mar 1', price: 28, mandi: 29 },
    { day: 'Mar 5', price: 30, mandi: 31 },
    { day: 'Mar 10', price: 32, mandi: 30 },
    { day: 'Mar 15', price: 31, mandi: 32 },
    { day: 'Current', price: 30, mandi: 33 },
    { day: 'Forecast', price: 29, mandi: 34 },
  ];

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await productsApi.getById(id as string);
      setProduct(res.data);
      if (res.data?.moq) setQuantity(res.data.moq);
    } catch (e: any) {
      toast.error('Product node fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    try {
      await buyerCartApi.addItem(id as string, quantity);
      toast.success(`${product.name} synchronized with pipeline`, {
        icon: '🛒',
        style: { borderRadius: '24px', fontWeight: 'black', textTransform: 'uppercase', fontSize: '10px' }
      });
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to sync cart');
    }
  };

  if (loading) return (
    <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-6 animate-pulse text-gray-400">
        <Zap className="w-12 h-12 text-indigo-500 animate-bounce" />
        <p className="text-[10px] font-black uppercase tracking-widest">Hydrating Product Node Matrix...</p>
    </div>
  );
  
  if (!product) return <div className="p-20 text-center font-black uppercase text-gray-400 tracking-widest text-sm">Node offline or invalid target ID.</div>;

  const currentPrice = quantity >= 500 ? product.price * 0.95 : product.price;

  return (
    <div className="space-y-12 pb-32">
      {/* Header Navigation */}
      <div className="flex items-center justify-between px-1">
        <Link href="/dashboard/buyer/products" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={16} /> Marketplace Node Map
        </Link>
        <div className="flex items-center gap-4">
           <button className="h-10 w-10 flex items-center justify-center rounded-full bg-white/40 dark:bg-white/5 border border-white/20 hover:bg-white transition-all shadow-sm">
              <Share2 size={16} />
           </button>
           <button className="h-10 px-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
              <ShieldCheck size={14} /> Certified Secure
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Gallery & Interactive Specs */}
        <div className="lg:col-span-7 space-y-10">
           <div className="relative group rounded-[64px] border border-white/20 bg-white/50 dark:bg-white/5 backdrop-blur-3xl overflow-hidden shadow-2xl p-6 md:p-10">
              <div className="aspect-[16/10] rounded-[48px] overflow-hidden bg-gray-100 dark:bg-white/5 relative group">
                  <img src={product.images?.[0] || 'https://via.placeholder.com/1200x800'} alt={product.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <div className="absolute top-8 left-8 flex gap-3">
                      <div className="h-10 px-4 rounded-2xl bg-black/80 backdrop-blur-md text-[9px] font-black uppercase text-indigo-400 border border-white/10 flex items-center gap-2 shadow-2xl">
                          <Package size={14} fill="currentColor" /> Premium Grade Alpha
                      </div>
                  </div>
              </div>
           </div>

           {/* Detail Tabs */}
           <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-gray-100 dark:border-white/5 overflow-x-auto no-scrollbar scrollbar-none pb-1">
                  {['origin', 'specs', 'blockchain', 'pricing'].map((tab) => (
                      <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400'}`}
                      >
                         {tab} Profile
                      </button>
                  ))}
              </div>

              <div className="min-h-[300px]">
                 <AnimatePresence mode="wait">
                    {activeTab === 'origin' && (
                       <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} key="origin" className="glass-card border border-white/10 rounded-[48px] p-8 md:p-10 space-y-8">
                          <div className="flex items-center gap-6">
                             <div className="w-16 h-16 md:w-20 md:h-20 rounded-[28px] md:rounded-[32px] bg-indigo-600 text-white flex items-center justify-center shadow-2xl"><User size={32} /></div>
                             <div>
                                <h3 className="text-2xl font-display font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none mb-2">{product.farmerName || 'Collective Alpha'}</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 leading-none"><MapPin size={12} /> {product.location || 'Maharashtra Regional Node'} • ODOP Cluster</p>
                             </div>
                             <div className="ml-auto text-right hidden md:block">
                                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Master Supplier</p>
                                <div className="flex items-center gap-1 text-amber-500">
                                   <Star size={14} fill="currentColor" />
                                   <Star size={14} fill="currentColor" />
                                   <Star size={14} fill="currentColor" />
                                   <Star size={14} fill="currentColor" />
                                   <Star size={14} fill="currentColor" className="opacity-30" />
                                </div>
                             </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/10">
                             {[
                               { l: 'Soil Health', v: 'A1 Grade' },
                               { l: 'District Index', v: 'ODOP-' + String(product.name).charAt(0) },
                               { l: 'Delivery Success', v: '99.2%' },
                               { l: 'Node Status', v: 'Active' },
                             ].map((s, i) => (
                                <div key={i}>
                                   <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{s.l}</p>
                                   <p className="text-xs font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">{s.v}</p>
                                </div>
                             ))}
                          </div>
                          <div className="p-8 bg-indigo-500/5 rounded-[32px] border border-indigo-500/10 flex gap-4 text-indigo-600">
                              <Info size={24} className="shrink-0 mt-0.5" />
                              <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">ODOP Connect verification engine confirms this lot originates from the official cluster zone for certified regional sourcing. Data synchronized via cross-chain protocol.</p>
                          </div>
                       </motion.div>
                    )}

                    {activeTab === 'pricing' && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} key="pricing" className="glass-card border border-white/10 rounded-[48px] p-8 md:p-10 flex flex-col gap-10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                               <h3 className="text-2xl font-display font-black uppercase tracking-tight">Market Convergence Chart</h3>
                               <div className="h-8 px-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black uppercase text-emerald-600 flex items-center gap-2"><BarChart3 size={12} /> Currently -14% vs Mandi Average</div>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={priceHistory}>
                                        <defs>
                                            <linearGradient id="p-id" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(203, 213, 225, 0.2)" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} textAnchor="end" height={60} />
                                        <YAxis hide />
                                        <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 30px 0 rgba(0,0,0,0.1)' }} />
                                        <Area type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#p-id)" />
                                        <Line type="monotone" dataKey="mandi" stroke="#cbd5e1" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    )}
                 </AnimatePresence>
              </div>
           </div>
        </div>

        {/* Action Column / Sidebar */}
        <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-10">
           {/* Procurement Matrix */}
           <div className="glass-card border border-white/20 rounded-[48px] p-10 bg-gradient-to-br from-indigo-950 to-black text-white shadow-2xl space-y-10 group overflow-hidden relative">
               <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
               
               <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                     <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10"><Zap size={20} fill="currentColor" /></div>
                     <h2 className="text-xl font-display font-black uppercase tracking-tight">Sourcing Matrix</h2>
                  </div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Live Inventory Stream</span></div>
               </div>

               <div className="space-y-6 relative z-10 p-8 bg-white/5 rounded-[40px] border border-white/10">
                  <div className="flex justify-between items-end border-b border-white/10 pb-6">
                      <div className="space-y-1">
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Base Rate Protocol</p>
                          <p className="text-5xl font-display font-black tracking-tighter">₹{product.price}<span className="text-lg text-gray-500 tracking-normal opacity-50">/{product.unit}</span></p>
                      </div>
                      <div className="text-right">
                          <p className="text-[10px] font-black text-gray-500 tracking-widest uppercase mb-1 leading-none">Stock Node</p>
                          <p className="text-xs font-black uppercase tracking-tight">{product.quantity} {product.unit} Ready</p>
                      </div>
                  </div>

                  <div className="space-y-4 pt-4">
                      <div className="flex items-center justify-between px-1">
                         <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Procurement Volume</span>
                         <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">MOQ: {product.moq || 50}kg</span>
                      </div>
                      <div className="flex items-center gap-4 bg-white/10 rounded-3xl p-2 border border-white/10">
                         <button onClick={() => setQuantity(Math.max((product.moq || 50), quantity - 50))} className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl font-bold hover:bg-white/20 transition-all active:scale-95 shadow-sm">-</button>
                         <input 
                           type="number" 
                           className="flex-1 bg-transparent border-none text-center font-display font-black text-2xl outline-none" 
                           value={quantity}
                           onChange={(e) => setQuantity(Math.max((product.moq || 50), parseInt(e.target.value) || (product.moq || 50)))}
                         />
                         <button onClick={() => setQuantity(quantity + 50)} className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl font-bold hover:bg-white/20 transition-all active:scale-95 shadow-sm">+</button>
                      </div>
                  </div>

                  <div className="pt-6 border-t border-white/10 flex justify-between items-end text-emerald-400">
                      <div>
                          <p className="text-[10px] font-black tracking-widest uppercase mb-1.5 leading-none">Forensics Output</p>
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-80 leading-none"><TrendingUp size={14} /> Expected Yield: High (+12%)</div>
                      </div>
                      <div className="text-right">
                          <p className="text-[10px] font-black tracking-widest uppercase mb-1 leading-none">Total Payload</p>
                          <p className="text-4xl font-display font-black tracking-tighter leading-none">₹{(currentPrice * quantity).toLocaleString()}</p>
                      </div>
                  </div>
               </div>

               <div className="space-y-4 relative z-10">
                  <button 
                    onClick={addToCart}
                    className="w-full h-20 bg-white text-black rounded-[32px] text-[12px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl transition-all active:scale-95 disabled:opacity-40"
                  >
                     Lock Procurement <ShoppingCart size={20} />
                  </button>
                  <button className="w-full h-14 bg-indigo-500/10 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-indigo-300 flex items-center justify-center gap-3 hover:bg-indigo-500/20 transition-all">
                     <BarChart size={18} /> Request Neural Quote
                  </button>
               </div>

               <div className="p-8 bg-black/40 rounded-[40px] border border-white/5 flex gap-5 relative z-10">
                  <Scale size={24} className="text-indigo-400 shrink-0 mt-0.5 opacity-60" />
                  <div>
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1 opacity-60 leading-none">Trade Policy</p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Bulk pricing protocols applied. Automated discount thresholds detected at 500kg and 1MT supply nodes.</p>
                  </div>
               </div>
           </div>

           {/* Quick Stats Panel */}
           <div className="grid grid-cols-2 gap-6 relative z-10">
               {[
                 { i: Box, l: 'Cluster Stock', v: product.quantity + ' ' + (product.unit || 'kg') },
                 { i: Truck, l: 'Est. Lead Time', v: '48 Hours' },
                 { i: Activity, l: 'Demand Pulse', v: 'High Velocity' },
                 { i: ShieldCheck, l: 'Trace Protocol', v: 'Full Enclave' },
               ].map((item, idx) => (
                  <div key={idx} className="glass-card border border-white/20 rounded-[32px] p-6 space-y-4 bg-white/50 dark:bg-white/5 shadow-xl group hover:border-indigo-500/30 transition-all cursor-crosshair">
                      <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm"><item.i size={24} /></div>
                      <div>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">{item.l}</p>
                         <p className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">{item.v}</p>
                      </div>
                  </div>
               ))}
           </div>
        </div>
      </div>
    </div>
  );
}

export default function RichProductDetailPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center font-black uppercase text-gray-400 tracking-widest">Loading Neural Feed...</div>}>
            <ProductDetailContent />
        </Suspense>
    );
}
