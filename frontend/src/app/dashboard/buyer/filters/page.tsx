'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, Search, MapPin, Tag, SlidersHorizontal, 
  Trash2, Play, ArrowLeft, Activity, Boxes, 
  ArrowUpRight, Sparkles, ChevronRight, Zap
} from 'lucide-react';
import { productsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdvancedFiltersPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    minPrice: '',
    maxPrice: '',
    location: '',
    sortBy: 'newest',
    quality: 'All',
    organic: false,
    bulkOnly: false
  });

  const [resultsCount, setResultsCount] = useState<number | null>(null);
  const [scanBusy, setScanBusy] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await productsApi.getCategories();
      setCategories(res.data || []);
    } catch { /* ignored */ }
  };

  const handleScan = async () => {
    setScanBusy(true);
    try {
      const params: any = {
        category: filters.category !== 'All' ? filters.category : undefined,
        search: filters.search || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        location: filters.location || undefined,
        sortBy: filters.sortBy,
        limit: 1 // just to get the count
      };
      const res = await productsApi.getAll(params);
      setResultsCount(res.data.pagination?.totalItems || 0);
      toast.success('Market Node Synchronized', { icon: '📡' });
    } catch (e) {
      toast.error('Scan Failed');
    } finally {
      setScanBusy(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      minPrice: '',
      maxPrice: '',
      location: '',
      sortBy: 'newest',
      quality: 'All',
      organic: false,
      bulkOnly: false
    });
    setResultsCount(null);
  };

  const applyScan = () => {
    // Navigate with query params (or state, but here we redirect to products with params)
    const q = new URLSearchParams();
    if (filters.category !== 'All') q.set('category', filters.category);
    if (filters.search) q.set('search', filters.search);
    if (filters.minPrice) q.set('minPrice', filters.minPrice);
    if (filters.maxPrice) q.set('maxPrice', filters.maxPrice);
    if (filters.location) q.set('location', filters.location);
    if (filters.sortBy) q.set('sortBy', filters.sortBy);
    
    router.push(`/dashboard/buyer/products?${q.toString()}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      
      {/* Header */}
      <div className="flex items-center gap-6">
          <Link href="/dashboard/buyer/products">
             <button className="h-14 w-14 rounded-2xl bg-white dark:bg-white/5 border border-white/20 flex items-center justify-center text-gray-500 hover:text-primary-600 transition-all shadow-sm">
                <ArrowLeft size={20} />
             </button>
          </Link>
          <div>
            <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
              Sourcing <span className="text-primary-600">Lab</span>
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Precision Metadata Parameter Scanning</p>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Main Filter Console */}
          <div className="md:col-span-8 space-y-10">
              
              {/* Text Param */}
              <div className="glass-card border border-white/20 rounded-[40px] p-8 space-y-8 group relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                 
                 <div className="space-y-4 relative z-10">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-2 flex items-center gap-2">
                       <Search size={14} className="text-primary-600" /> Global Identifier Scan
                    </label>
                    <input 
                      type="text" 
                      placeholder="Product, farmer, or cluster name..."
                      className="w-full h-16 px-8 rounded-3xl bg-white/50 dark:bg-white/5 border-2 border-transparent hover:border-white/40 focus:border-primary-500 outline-none transition-all font-display font-black text-xl text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700 placeholder:font-black tracking-tight"
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-2 flex items-center gap-2">
                           <MapPin size={14} className="text-primary-600" /> Geographic Node
                        </label>
                        <input 
                            type="text" 
                            placeholder="Nashik, MH, India..."
                            className="w-full h-14 px-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/20 focus:border-primary-500 outline-none transition-all font-bold text-sm"
                            value={filters.location}
                            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-2 flex items-center gap-2">
                           <SlidersHorizontal size={14} className="text-primary-600" /> Ranking Logic
                        </label>
                        <select 
                            className="w-full h-14 px-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/20 focus:border-primary-500 outline-none transition-all font-black text-[10px] uppercase tracking-widest text-gray-900 dark:text-white"
                            value={filters.sortBy}
                            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                        >
                            <option value="newest">Freshness (Newest)</option>
                            <option value="price_asc">Efficiency (Price Low)</option>
                            <option value="price_desc">Premium (Price High)</option>
                            <option value="rating_desc">Trust (Highest Rated)</option>
                        </select>
                    </div>
                 </div>
              </div>

              {/* Advanced Matrix */}
              <div className="glass-card border border-white/20 rounded-[40px] p-8 space-y-10 group relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-2 flex items-center gap-2">
                           <Tag size={14} className="text-emerald-500" /> Category Filter
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <button 
                               onClick={() => setFilters({ ...filters, category: 'All' })}
                               className={`h-10 px-5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filters.category === 'All' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white/50 dark:bg-white/5 text-gray-500 border border-white/20'}`}
                            >
                                All
                            </button>
                            {categories.map(c => (
                                <button 
                                   key={c}
                                   onClick={() => setFilters({ ...filters, category: c })}
                                   className={`h-10 px-5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filters.category === c ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white/50 dark:bg-white/5 text-gray-500 border border-white/20'}`}
                                >
                                   {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-2 flex items-center gap-2">
                           <Zap size={14} className="text-amber-500" /> Quality Grade
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {['All', 'A++', 'A+', 'B', 'Bulk'].map(g => (
                                <button 
                                   key={g}
                                   onClick={() => setFilters({ ...filters, quality: g })}
                                   className={`h-12 w-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center ${filters.quality === g ? 'bg-amber-500 text-white shadow-lg' : 'bg-white/50 dark:bg-white/5 text-gray-500 border border-white/20'}`}
                                >
                                   {g}
                                </button>
                            ))}
                        </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-2">Pricing Boundary Matrix (₹)</label>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="relative">
                            <input 
                              type="number" 
                              placeholder="Minimum"
                              className="w-full h-14 pl-12 pr-6 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/20 focus:border-emerald-500 outline-none transition-all font-bold"
                              value={filters.minPrice}
                              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                            />
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600 font-black">₹</div>
                        </div>
                        <div className="relative">
                            <input 
                              type="number" 
                              placeholder="Maximum"
                              className="w-full h-14 pl-12 pr-6 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/20 focus:border-emerald-500 outline-none transition-all font-bold"
                              value={filters.maxPrice}
                              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                            />
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600 font-black">₹</div>
                        </div>
                    </div>
                 </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <button 
                   onClick={() => setFilters({ ...filters, organic: !filters.organic })}
                   className={`h-20 px-8 rounded-[32px] border transition-all flex items-center justify-between group ${filters.organic ? 'bg-emerald-600/10 border-emerald-600/30' : 'bg-white/40 dark:bg-white/5 border-white/20'}`}
                 >
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${filters.organic ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-white/10 text-emerald-500'}`}>
                           <Sparkles size={18} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-200">Organic Certified</span>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${filters.organic ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300'}`}>
                       {filters.organic && <div className="w-2 h-2 rounded-full bg-white animate-scale" />}
                    </div>
                 </button>

                 <button 
                    onClick={() => setFilters({ ...filters, bulkOnly: !filters.bulkOnly })}
                    className={`h-20 px-8 rounded-[32px] border transition-all flex items-center justify-between group ${filters.bulkOnly ? 'bg-indigo-600/10 border-indigo-600/30' : 'bg-white/40 dark:bg-white/5 border-white/20'}`}
                 >
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${filters.bulkOnly ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-white/10 text-indigo-500'}`}>
                           <Boxes size={18} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-200">Bulk Ready Nodes</span>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${filters.bulkOnly ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}`}>
                       {filters.bulkOnly && <div className="w-2 h-2 rounded-full bg-white animate-scale" />}
                    </div>
                 </button>
              </div>

          </div>

          {/* Action Sidebar */}
          <div className="md:col-span-4 space-y-8">
              <div className="glass-card border border-white/20 rounded-[48px] p-10 space-y-10 sticky top-10">
                  <div className="text-center">
                      <div className="w-24 h-24 bg-primary-600 rounded-[32px] flex items-center justify-center text-white mx-auto shadow-2xl shadow-primary-500/30 mb-6 group-hover:rotate-12 transition-transform duration-500">
                          <Activity size={40} className={scanBusy ? 'animate-pulse' : ''} />
                      </div>
                      <h3 className="text-2xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-2">Scan Preview</h3>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.4em]">Real-time Market Matrix</p>
                  </div>

                  <div className="py-8 border-y border-white/10 space-y-8">
                     <div className="flex justify-between items-center group/stat">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover/stat:text-primary-600 transition-colors">Target Nodes</span>
                        <span className="text-2xl font-display font-black text-gray-900 dark:text-white leading-none tracking-tighter">
                           {resultsCount !== null ? resultsCount : '---'}
                        </span>
                     </div>
                     <div className="flex justify-between items-center group/stat">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover/stat:text-primary-600 transition-colors">Node Health</span>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Optimized</span>
                     </div>
                  </div>

                  <div className="space-y-4">
                      <button 
                        disabled={scanBusy}
                        onClick={handleScan}
                        className="w-full h-16 bg-white dark:bg-white/5 border border-white/20 rounded-[28px] text-[10px] font-black uppercase tracking-[0.2em] hover:border-emerald-500 hover:text-emerald-500 flex items-center justify-center gap-3 transition-all active:scale-95"
                      >
                         <Play size={16} className="fill-current" />
                         {scanBusy ? 'Scanning Matrix...' : 'Execute Scan'}
                      </button>

                      <button 
                         disabled={scanBusy || resultsCount === null}
                         onClick={applyScan}
                         className={`w-full h-20 rounded-[28px] text-[12px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all shadow-xl active:scale-95 ${resultsCount !== null && resultsCount > 0 ? 'bg-primary-600 text-white shadow-primary-500/20' : 'bg-gray-100 dark:bg-white/10 text-gray-400 pointer-events-none opacity-40'}`}
                      >
                         Lock & View Nodes
                         <ArrowUpRight size={20} />
                      </button>

                      <button 
                         onClick={resetFilters}
                         className="w-full h-14 bg-white/50 dark:bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-rose-500 transition-all flex items-center justify-center gap-3"
                      >
                         <Trash2 size={14} /> Wipe Parameters
                      </button>
                  </div>

                  <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-[32px] border border-amber-100 dark:border-amber-900/40">
                      <div className="flex gap-4">
                          <Zap size={20} className="text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-[9px] text-amber-800 dark:text-amber-400 leading-relaxed font-black uppercase tracking-widest">
                             Pro Tip: Use 'Geographic Node' to filter clusters near export corridors and reduce logistics overhead by ~15%.
                          </p>
                      </div>
                  </div>
              </div>
          </div>

      </div>

    </div>
  );
}
