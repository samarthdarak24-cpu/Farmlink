'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, DollarSign, Package, ShoppingBag, ArrowUpRight, ArrowDownRight, RefreshCw, BarChart, PieChart, Info, Download } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid, BarChart as ReBarChart, Bar, Cell } from 'recharts';
import { useOfflineCache } from '@/hooks/useOfflineCache';
import { ordersApi, productsApi } from '@/lib/api';

export default function AnalyticsPage() {
  const ordersState = useOfflineCache<any[]>('farmer-orders', async () => {
    const res = await ordersApi.getAll();
    return res.data || [];
  });

  const productsState = useOfflineCache<any[]>('farmer-products', async () => {
    const res = await productsApi.getAll(); // Or get by farmer if filtered
    return res.data || [];
  });

  const orders = ordersState.data || [];
  const products = productsState.data || [];

  const stats = useMemo(() => {
    const totalRev = orders.reduce((acc, o) => acc + Number(o.total || (o.price * o.quantity) || 0), 0);
    const completed = orders.filter(o => o.status === 'delivered').length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const avgOrderVal = orders.length ? totalRev / orders.length : 0;

    return { totalRev, completed, pending, avgOrderVal, count: orders.length };
  }, [orders]);

  const revenueSeries = useMemo(() => {
    const map: Record<string, number> = {};
    const sorted = [...orders].sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    sorted.forEach(o => {
      const date = new Date(o.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
      map[date] = (map[date] || 0) + Number(o.total || (o.price * o.quantity) || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).slice(-10);
  }, [orders]);

  const categorySeries = useMemo(() => {
     const map: Record<string, number> = {};
     orders.forEach(o => {
       const cat = o.productCategory || 'Other';
       map[cat] = (map[cat] || 0) + 1;
     });
     return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary-600" />
            Strategic Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time market insights and sales performance metrics.
          </p>
        </div>
        
        <div className="flex gap-3">
            <button className="btn btn-outline flex items-center gap-2 h-11 border-white/20">
                <Download className="w-4 h-4" />
                Export CSV
            </button>
            <button 
                onClick={() => { ordersState.reload(); productsState.reload(); }}
                className="btn btn-primary flex items-center gap-2 h-11"
            >
                <RefreshCw className={`w-4 h-4 ${(ordersState.loading || productsState.loading) ? 'animate-spin' : ''}`} />
                Sync Data
            </button>
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Total Revenue', value: `$${stats.totalRev.toLocaleString()}`, icon: DollarSign, trend: '+12.5%', color: 'from-emerald-500 to-teal-600 shadow-emerald-500/20' },
           { label: 'Total Orders', value: stats.count, icon: ShoppingBag, trend: '+5.2%', color: 'from-blue-500 to-indigo-600 shadow-indigo-500/20' },
           { label: 'Avg Order Value', value: `$${stats.avgOrderVal.toFixed(0)}`, icon: TrendingUp, trend: '-1.4%', color: 'from-amber-500 to-orange-600 shadow-amber-500/20' },
           { label: 'Pending Deals', value: stats.pending, icon: Package, trend: '4 Active', color: 'from-purple-500 to-violet-600 shadow-purple-500/20' },
         ].map((kpi, idx) => (
           <motion.div 
             key={kpi.label}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: idx * 0.1 }}
             className="glass-card border border-white/20 rounded-[32px] p-6 relative overflow-hidden group hover:scale-[1.02] transition-all"
           >
              <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${kpi.color} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />
              
              <div className="flex items-center justify-between mb-4 relative z-10">
                 <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${kpi.color} flex items-center justify-center text-white shadow-lg`}>
                    <kpi.icon size={22} />
                 </div>
                 <div className={`flex items-center gap-1 text-xs font-bold ${kpi.trend.includes('+') ? 'text-emerald-500' : 'text-amber-500'} bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded-full border border-white/10`}>
                    {kpi.trend.includes('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {kpi.trend}
                 </div>
              </div>

              <div className="relative z-10">
                 <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">{kpi.label}</p>
                 <h3 className="text-3xl font-display font-black text-gray-900 dark:text-white leading-tight">{kpi.value}</h3>
              </div>
           </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         {/* Main Chart */}
         <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="glass-card border border-white/20 rounded-[40px] p-8 space-y-8 min-h-[480px]">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-display font-black text-gray-900 dark:text-white flex items-center gap-3">
                            <TrendingUp className="text-primary-500" />
                            Revenue Projection
                        </h2>
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-tight opacity-70 mt-1">Trailing 10-day market liquidity</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-primary-200 cursor-pointer">Daily</span>
                        <span className="px-3 py-1 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">Weekly</span>
                    </div>
                </div>

                <div className="flex-1 h-[320px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueSeries.length > 0 ? revenueSeries : [{ name: 'N/A', value: 0 }]}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#888', fontWeight: 700 }} 
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#888', fontWeight: 700 }}
                            tickFormatter={(v) => `$${v}`}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.9)' }} 
                            labelStyle={{ fontWeight: 800, color: '#6366f1' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#6366f1" 
                            strokeWidth={4} 
                            fillOpacity={1} 
                            fill="url(#colorValue)" 
                          />
                        </AreaChart>
                     </ResponsiveContainer>
                </div>
            </div>
         </div>

         {/* Sidebar Charts */}
         <div className="lg:col-span-4 flex flex-col gap-6">
             <div className="glass-card border border-white/20 rounded-[40px] p-8 space-y-6 flex-1 min-h-[480px]">
                 <div>
                    <h3 className="text-xl font-display font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <PieChart className="text-emerald-500" />
                        Market Mix
                    </h3>
                    <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mt-1">Orders by Category Share</p>
                 </div>

                 <div className="h-[260px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <ReBarChart data={categorySeries.length > 0 ? categorySeries : [{ name: 'N/A', value: 100 }]} layout="vertical" barSize={12}>
                           <XAxis type="number" hide />
                           <YAxis 
                             dataKey="name" 
                             type="category" 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{ fontSize: 10, fill: '#666', fontWeight: 800 }} 
                             width={100}
                           />
                           <Tooltip 
                             cursor={{ fill: 'transparent' }}
                             contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }} 
                           />
                           <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                              {categorySeries.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                           </Bar>
                        </ReBarChart>
                    </ResponsiveContainer>
                 </div>

                 <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-3xl border border-primary-100 dark:border-primary-800">
                    <div className="flex gap-3">
                        <Info className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-primary-700 dark:text-primary-300 leading-relaxed font-bold uppercase tracking-tight">
                            Insight: <span className="text-gray-600 dark:text-gray-400 font-medium lowercase first-letter:uppercase">Vegetables category accounts for 62% of your monthly volume. Consider diversifying to minimize risk.</span>
                        </p>
                    </div>
                 </div>
             </div>
         </div>

      </div>

    </div>
  );
}
