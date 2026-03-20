'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Target, Zap, 
  Activity, ArrowUpRight, ArrowDownRight, 
  Layers, BrainCircuit, Globe, Package, 
  CreditCard, Search, Filter, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BuyerAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sourcing' | 'spending' | 'operational' | 'strategic'>('sourcing');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const data = {
    spendTrend: [
      { name: 'Jan', value: 42000 },
      { name: 'Feb', value: 38000 },
      { name: 'Mar', value: 55000 },
      { name: 'Apr', value: 48000 },
      { name: 'May', value: 62000 },
      { name: 'Jun', value: 72000 },
    ],
    categoryShare: [
      { name: 'Vegetables', value: 45, color: '#10b981' },
      { name: 'Grains', value: 30, color: '#6366f1' },
      { name: 'Fruits', value: 15, color: '#f59e0b' },
      { name: 'Others', value: 10, color: '#64748b' },
    ],
    marketComparison: [
      { name: 'Onion', market: 42, farm: 38 },
      { name: 'Potato', market: 28, farm: 22 },
      { name: 'Tomato', market: 35, farm: 32 },
      { name: 'Wheet', market: 21, farm: 19 },
    ]
  };

  const tabs = [
    { id: 'sourcing', name: 'Sourcing Intelligence', icon: Search },
    { id: 'spending', name: 'Spending Analysis', icon: CreditCard },
    { id: 'operational', name: 'Operational Health', icon: Activity },
    { id: 'strategic', name: 'Strategic Forecasting', icon: BrainCircuit },
  ];

  if (loading) return (
     <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 opacity-30">
        <Activity size={48} className="animate-spin text-primary-600" />
        <p className="text-xl font-display font-black uppercase tracking-tighter">Synchronizing Cloud Analytics Matrix...</p>
     </div>
  );

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 px-1">
        <div>
          <h1 className="text-5xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-4">
             Procurement <span className="text-primary-600">Intelligence</span>
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] pl-1">Global Trade Matrix & ROI Analysis</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 bg-white/40 dark:bg-white/5 p-2 rounded-[32px] border border-white/20 shadow-sm backdrop-blur-xl shrink-0">
             {tabs.map(t => (
                <button 
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`h-12 px-6 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white'}`}
                >
                   <span className="flex items-center gap-2">
                      <t.icon size={14} />
                      {t.name}
                   </span>
                </button>
             ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[ 
            { label: 'Total Capital Deployed', value: '₹5.42L', delta: '+12%', icon: CreditCard, color: 'text-blue-600 bg-blue-500/10' },
            { label: 'Sourcing Savings (AI)', value: '18.4%', delta: '+5.2%', icon: Target, color: 'text-emerald-600 bg-emerald-500/10' },
            { label: 'Active Supply Clusters', value: '12', delta: '+2', icon: Globe, color: 'text-purple-600 bg-purple-500/10' },
            { label: 'Fulfillment Health', value: '98.8%', delta: '+0.4%', icon: Activity, color: 'text-amber-500 bg-amber-500/10' },
          ].map((s, i) => (
             <motion.div 
               key={s.label}
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
               className="glass-card border border-white/20 rounded-[40px] p-8 group relative overflow-hidden"
             >
                 <div className="absolute top-0 right-0 w-24 h-24 bg-gray-500/5 rounded-full blur-[40px] pointer-events-none group-hover:scale-110 transition-transform duration-700" />
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white/20 ${s.color}`}>
                    <s.icon size={20} />
                 </div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">{s.label}</p>
                 <div className="flex items-end gap-3">
                    <h3 className="text-3xl font-display font-black text-gray-900 dark:text-white tracking-tighter leading-none">{s.value}</h3>
                    <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1 mb-1"><ArrowUpRight size={10} /> {s.delta}</span>
                 </div>
             </motion.div>
          ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10"
        >
           {/* Section 1: Main Chart Area */}
           <div className="lg:col-span-8 flex flex-col gap-10">
              <div className="glass-card border border-white/20 rounded-[48px] p-10 group relative overflow-hidden shadow-2xl">
                 <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-2xl font-display font-black uppercase tracking-tight text-gray-900 dark:text-white">
                           {activeTab === 'sourcing' ? 'Price Arbitrage Scan' : activeTab === 'spending' ? 'Deployment Stream' : 'Operational Efficiency'}
                        </h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Institution vs Market Variance (Live)</p>
                    </div>
                    <div className="h-10 px-6 rounded-xl bg-gray-100 dark:bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                       <RefreshCw size={12} /> Sync Cluster Delta
                    </div>
                 </div>

                 <div className="h-[400px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                       {activeTab === 'sourcing' ? (
                          <BarChart data={data.marketComparison} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} textAnchor="end" height={60} />
                             <Tooltip 
                                cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} 
                                contentStyle={{ background: 'rgba(255, 255, 255, 0.9)', borderRadius: '24px', border: 'none', boxShadow: '0 10px 30px 0 rgba(0,0,0,0.1)', padding: '20px' }}
                             />
                             <Bar dataKey="market" name="Market Avg" fill="#cbd5e1" radius={[10, 10, 0, 0]} />
                             <Bar dataKey="farm" name="Institution Rate" fill="#6366f1" radius={[10, 10, 0, 0]} />
                          </BarChart>
                       ) : (
                          <AreaChart data={data.spendTrend}>
                             <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <Tooltip contentStyle={{ borderRadius: '24px' }} />
                             <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                          </AreaChart>
                       )}
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>

           {/* Section 2: Distribution or Specifics */}
           <div className="lg:col-span-4 flex flex-col gap-10">
              <div className="glass-card border border-white/20 rounded-[48px] p-10 group relative overflow-hidden h-full flex flex-col">
                 <h3 className="text-xl font-display font-black uppercase tracking-tight text-gray-900 dark:text-white mb-10">Budget Allocation</h3>
                 <div className="flex-1 min-h-[240px] flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                            data={data.categoryShare}
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {data.categoryShare.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                       </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Top Segment</p>
                       <p className="text-2xl font-display font-black text-emerald-500 leading-none">VEG</p>
                    </div>
                 </div>
                 <div className="mt-10 space-y-4">
                    {data.categoryShare.map(c => (
                       <div key={c.name} className="flex items-center justify-between p-4 bg-white/40 dark:bg-white/5 border border-white/20 rounded-2xl group/item">
                          <div className="flex items-center gap-3">
                             <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                             <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-300">{c.name}</span>
                          </div>
                          <span className="text-sm font-black text-gray-900 dark:text-white group-hover/item:translate-x-1 transition-transform">{c.value}%</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </motion.div>
      </AnimatePresence>

      {/* Strategic AI Optimization (Bottom Full Bar) */}
      <div className="glass-card border-2 border-primary-500/20 rounded-[48px] p-10 bg-gradient-to-br from-primary-600/5 to-primary-600/10 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/5 rounded-full blur-[120px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
         
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
            <div className="flex items-center gap-8">
                <div className="w-20 h-20 bg-primary-600 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-primary-500/20 group-hover:rotate-12 transition-transform">
                   <BrainCircuit size={40} />
                </div>
                <div>
                   <h2 className="text-3xl font-display font-black uppercase tracking-tighter text-gray-900 dark:text-white leading-none mb-2">AI Optimization Core</h2>
                   <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] font-bold">Predictive Routing & Sourcing Logic</p>
                </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
               <div className="px-8 py-4 bg-white/80 dark:bg-white/5 rounded-3xl border border-white/20">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Projected Yield</p>
                  <p className="text-2xl font-display font-black text-gray-900 dark:text-white tracking-tighter shadow-sm">+18% Efficiency Next Q</p>
               </div>
               <button className="h-16 px-10 bg-black dark:bg-white dark:text-black text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all">Generate Strategy Audit</button>
            </div>
         </div>
      </div>

    </div>
  );
}
