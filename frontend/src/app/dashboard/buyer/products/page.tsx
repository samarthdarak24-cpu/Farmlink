'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Package, ShieldCheck, 
  CheckCircle, ArrowRight, Zap, Target, 
  Layers, ChevronRight, Star, 
  LayoutGrid, List, Plus, ShoppingCart,
  FileText, TrendingUp, History, Globe,
  ArrowLeftRight, Info, AlertCircle,
  Clock, MapPin, Gauge, BrainCircuit,
  Trash2, Send
} from 'lucide-react';
import Link from 'next/link';
import { productsApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProductBrowsingPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [unit, setUnit] = useState<'MT' | 'KG'>('MT');
  const [search, setSearch] = useState('');
  const [compareTray, setCompareTray] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productsApi.getAll();
      setProducts(res.data?.products || [
        { id: 'P1', name: 'Premium Nashik Tomatoes', category: 'Vegetables', price: 32000, unit: 'MT', grade: 'A+', supplier: 'Nashik Node A', trust: 98, moq: 5, capacity: 50, fresh: true },
        { id: 'P2', name: 'Kolhapur Red Onions', category: 'Vegetables', price: 18500, unit: 'MT', grade: 'A', supplier: 'Kolhapur Cluster', trust: 96, moq: 10, capacity: 200, fresh: false },
        { id: 'P3', name: 'Amravati Soya Grains', category: 'Grains', price: 45000, unit: 'MT', grade: 'B+', supplier: 'Vidarbha Grains', trust: 92, moq: 20, capacity: 500, fresh: true },
      ]);
    } catch { toast.error('Cluster sync failed'); }
    finally { setLoading(false); }
  };

  const addToCompare = (p: any) => {
    if (compareTray.find(item => item.id === p.id)) return;
    if (compareTray.length >= 3) {
      toast.error('Decision Lab limited to 3 nodes', { icon: '🔬' });
      return;
    }
    setCompareTray([...compareTray, p]);
    toast.success('Linked to Comparison Tray', { icon: '📊' });
  };

  return (
    <div className="space-y-12 pb-48 w-full max-w-7xl mx-auto">
      
      {/* 1. Header & AI Search Hub */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 px-1 shrink-0">
        <div className="space-y-2">
           <div className="flex items-center gap-3">
              <div className="h-2 w-12 bg-indigo-600 rounded-full" />
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-1 leading-none">Global Inventory Node</p>
           </div>
           <h1 className="text-5xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter transition-all">
             Product <span className="text-indigo-600">Discovery</span>
           </h1>
        </div>

        <div className="flex items-center gap-4 bg-white/40 dark:bg-white/5 p-2 rounded-[32px] border border-white/20 shadow-2xl backdrop-blur-3xl shrink-0">
             <div className="relative group w-96">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-600 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Ask AI: Find Grade-A Tomatoes in Nashik..." 
                  className="w-full h-14 pl-16 pr-8 rounded-full bg-transparent border-none outline-none text-sm font-medium placeholder:text-[10px] placeholder:font-black uppercase tracking-widest"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <div className="flex items-center gap-2 p-1.5 bg-black/5 rounded-full border border-white/10">
                <button onClick={() => setUnit('MT')} className={`h-11 px-6 rounded-full text-[10px] font-black tracking-widest transition-all ${unit === 'MT' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}>MT</button>
                <button onClick={() => setUnit('KG')} className={`h-11 px-6 rounded-full text-[10px] font-black tracking-widest transition-all ${unit === 'KG' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}>KG</button>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Main Browsing Area */}
          <div className="xl:col-span-12 flex flex-col gap-10">
              
              {/* Toolbar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-8 px-2">
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-white/50 dark:bg-white/5 p-1 rounded-2xl border border-white/10 shadow-sm">
                       <button onClick={() => setViewMode('grid')} className={`h-12 w-16 flex items-center justify-center rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-white/10 text-indigo-600 shadow-xl' : 'text-gray-400'}`}><LayoutGrid size={22} /></button>
                       <button onClick={() => setViewMode('list')} className={`h-12 w-16 flex items-center justify-center rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-white/10 text-indigo-600 shadow-xl' : 'text-gray-400'}`}><List size={22} /></button>
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                    <button className="h-12 px-6 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-indigo-600 transition-all"><Filter size={18} /> Advanced Filters</button>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60">Visibility Node: Global</span>
                    <RefreshCw className="text-gray-400 cursor-pointer hover:rotate-180 transition-all duration-700" size={18} />
                 </div>
              </div>

              {/* Product Layout */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {[1,2,3].map(i => <div key={i} className="h-[500px] w-full bg-white/5 animate-pulse rounded-[48px]" />)}
                </div>
              ) : (
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'} gap-10`}>
                  <AnimatePresence mode="popLayout">
                    {products.map((p, idx) => (
                      <motion.div 
                        key={p.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card border border-white/20 rounded-[48px] p-8 space-y-8 group hover:border-indigo-500/30 transition-all shadow-xl relative overflow-hidden"
                      >
                         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
                         
                         {/* Product Image Replacement: High-Fidelity Placeholder */}
                         <div className="aspect-[1.2/1] bg-white dark:bg-white/5 border border-white/10 rounded-[40px] relative overflow-hidden group/img">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent flex items-center justify-center">
                               <Package size={64} className="text-indigo-500/20 group-hover/img:scale-110 transition-transform" />
                            </div>
                            <div className="absolute top-6 left-6 flex flex-col gap-2">
                               <span className="px-5 py-2 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-2xl">GRADE {p.grade}</span>
                               {p.fresh && <span className="px-5 py-2 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-2xl flex items-center gap-2"><Clock size={12} /> HARVEST FRESH</span>}
                            </div>
                            <button onClick={() => addToCompare(p)} className="absolute bottom-6 right-6 h-12 w-12 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl opacity-0 group-hover/img:opacity-100 translate-y-4 group-hover/img:translate-y-0 transition-all"><Plus size={24} /></button>
                         </div>

                         {/* Info Matrix */}
                         <div className="space-y-6">
                            <div className="flex justify-between items-start">
                               <div>
                                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1.5 opacity-70">{p.category} Hub</p>
                                  <h3 className="text-2xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none group-hover:text-indigo-600 transition-colors">{p.name}</h3>
                               </div>
                               <div className="text-right">
                                  <p className="text-2xl font-display font-black text-gray-900 dark:text-white tracking-tighter leading-none">₹{p.price.toLocaleString()}</p>
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 leading-none">Per {unit}</p>
                               </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                               <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-white/5 space-y-1">
                                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">MOQ</p>
                                  <p className="text-[12px] font-black text-gray-900 dark:text-white">{p.moq} {unit}</p>
                               </div>
                               <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-white/5 space-y-1">
                                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Daily Capacity</p>
                                  <p className="text-[12px] font-black text-indigo-600">{p.capacity} {unit}</p>
                               </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                               <div className="flex items-center gap-3 group/sup cursor-pointer">
                                  <div className="h-10 w-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-lg shadow-indigo-500/20">{p.supplier.charAt(0)}</div>
                                  <div>
                                     <p className="text-[10px] font-black uppercase text-gray-900 dark:text-white leading-none mb-1">{p.supplier}</p>
                                     <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1"><ShieldCheck size={10} /> {p.trust}% Trust</p>
                                  </div>
                               </div>
                               <div className="flex gap-2">
                                  <button className="h-11 w-11 bg-white dark:bg-white/5 border border-white/20 rounded-xl flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-all"><ShoppingCart size={18} /></button>
                                  <Link href={`/dashboard/buyer/chat?id=${p.id}`}>
                                    <button className="h-11 px-6 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/10 flex items-center gap-2 hover:scale-105 transition-all">Direct RFQ</button>
                                  </Link>
                               </div>
                            </div>
                         </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
          </div>

          {/* 9. Predictive Comparison Tray (Floating Dock) */}
          <AnimatePresence>
            {compareTray.length > 0 && (
              <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-50 shrink-0"
              >
                 <div className="glass-card border border-indigo-500/30 rounded-[48px] p-6 bg-indigo-600/95 backdrop-blur-3xl shadow-[0_30px_60px_-15px_rgba(79,70,229,0.5)] text-white flex items-center justify-between gap-10">
                    <div className="flex items-center gap-8 pl-4">
                       <div className="bg-white/20 p-4 rounded-3xl"><ArrowLeftRight size={32} /></div>
                       <div>
                          <h4 className="text-xl font-display font-black uppercase tracking-tight tracking-tighter leading-none mb-1">Decision Lab</h4>
                          <p className="text-[9px] font-black text-indigo-200 uppercase tracking-widest leading-none opacity-60">{compareTray.length} Node(s) Selected for Evaluation</p>
                       </div>
                    </div>
                    
                    <div className="flex-1 flex gap-4 overflow-x-auto scrollbar-hide py-2">
                       {compareTray.map(item => (
                          <div key={item.id} className="h-16 w-16 rounded-[20px] bg-white/10 border border-white/20 flex items-center justify-center relative group shrink-0">
                             <span className="text-lg font-black">{item.name.charAt(0)}</span>
                             <button 
                                onClick={() => setCompareTray(tray => tray.filter(t => t.id !== item.id))}
                                className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                                <Trash2 size={10} />
                             </button>
                          </div>
                       ))}
                    </div>

                    <div className="flex items-center gap-4 pr-4">
                       <button onClick={() => setCompareTray([])} className="h-14 px-8 border border-white/20 rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Discard</button>
                       <Link href="/dashboard/buyer/comparison">
                          <button className="h-14 px-10 bg-white text-indigo-600 rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/50 hover:scale-105 transition-all flex items-center gap-3">
                             Execute Alpha Node Analysis <ArrowRight size={16} />
                          </button>
                       </Link>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recently Viewed Widget */}
          <div className="xl:col-span-12 py-20 px-2 space-y-10 border-t border-white/10 mt-20">
             <div className="flex items-center gap-3">
                <History className="text-gray-400" size={18} />
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">Institutional Browsing History</h3>
             </div>
             <div className="flex gap-10 overflow-x-auto scrollbar-hide pb-6">
                {[products[2], products[0]].filter(Boolean).map((p, i) => (
                   <div key={i} className="flex-shrink-0 w-80 bg-white/40 dark:bg-white/5 border border-white/10 p-6 rounded-[32px] flex items-center gap-4 group cursor-pointer hover:border-indigo-500/30 transition-all">
                      <div className="h-16 w-16 bg-black/5 rounded-2xl flex items-center justify-center text-gray-300"><LayoutGrid size={24} /></div>
                      <div>
                         <p className="text-[10px] font-black uppercase text-gray-900 dark:text-white leading-none mb-1.5">{p.name}</p>
                         <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Last viewed: 2h ago</p>
                      </div>
                      <ArrowUpRight size={18} className="ml-auto opacity-0 group-hover:opacity-40" />
                   </div>
                ))}
             </div>
          </div>

      </div>

    </div>
  );
}
