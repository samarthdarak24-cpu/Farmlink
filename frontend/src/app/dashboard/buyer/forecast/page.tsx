'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Target, Zap, 
  Activity, ArrowUpRight, ArrowDownRight, 
  Layers, BrainCircuit, Globe, Package, 
  CreditCard, Search, Filter, RefreshCw, 
  Calendar, CloudRain, Thermometer, Info,
  BarChart3, LayoutDashboard, Share2, Download,
  Timer, BadgeCheck, AlertTriangle, AlertCircle, Gauge,
  Waves, Wind, Sun
} from 'lucide-react';

export default function ForecastDashboardPage() {
  const [activeVar, setActiveVar] = useState('price');

  const priceData = [
    { month: 'Apr', predicted: 4200, actual: 4000, market: 4100 },
    { month: 'May', predicted: 4500, actual: 4600, market: 4300 },
    { month: 'Jun', predicted: 4800, actual: null, market: 4600 },
    { month: 'Jul', predicted: 5100, actual: null, market: 4800 },
    { month: 'Aug', predicted: 5400, actual: null, market: 5000 },
    { month: 'Sep', predicted: 5800, actual: null, market: 5300 },
  ];

  const demandData = [
    { cat: 'Vegetables', current: 850, forecast: 1200 },
    { cat: 'Fruits', current: 600, forecast: 950 },
    { cat: 'Grains', current: 2400, forecast: 2100 },
    { cat: 'Pulses', current: 400, forecast: 550 },
  ];

  return (
    <div className="space-y-12 pb-48 w-full max-w-7xl mx-auto">
      
      {/* Dynamic AI Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 px-1 shrink-0">
        <div className="space-y-2">
           <div className="flex items-center gap-3">
              <div className="h-2 w-12 bg-indigo-600 rounded-full" />
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-1 leading-none">Procurement Intelligence Stack</p>
           </div>
           <h1 className="text-5xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter transition-all">
             Forecast <span className="text-indigo-600">Command Center</span>
           </h1>
        </div>

        <div className="flex items-center gap-4 bg-white/40 dark:bg-white/5 p-3 rounded-[32px] border border-white/20 shadow-2xl backdrop-blur-3xl shrink-0">
             <div className="px-8 py-3 border-r border-white/10 text-center">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none opacity-60">AI Confidence</p>
                 <p className="text-2xl font-display font-black text-emerald-500 leading-none tracking-tighter">98.4%</p>
             </div>
             <button className="h-14 px-8 bg-indigo-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-3">
                <BrainCircuit size={18} /> Execute Inference
             </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Main Predictor Visual */}
          <div className="xl:col-span-8 space-y-10">
              <div className="glass-card border border-white/20 rounded-[48px] p-10 group relative overflow-hidden bg-white/5 shadow-2xl">
                 <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
                 
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h3 className="text-2xl font-display font-black uppercase tracking-tight text-gray-900 dark:text-white">Price Volatility Predictor</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                           <Globe size={12} className="text-indigo-500" /> Multi-Cluster Sourcing Model v4.1
                        </p>
                    </div>
                    <div className="flex items-center gap-3 p-1.5 bg-white/10 rounded-2xl border border-white/10">
                       <button onClick={() => setActiveVar('price')} className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeVar === 'price' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Unit Price (₹)</button>
                       <button onClick={() => setActiveVar('volume')} className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeVar === 'volume' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Lot Volume (MT)</button>
                    </div>
                 </div>

                 <div className="h-[400px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={priceData}>
                          <defs>
                             <linearGradient id="colorInd" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(203, 213, 225, 0.15)" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} textAnchor="end" height={60} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '24px', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: 'white', backdropFilter: 'blur(20px)', boxShadow: '0 10px 30px 0 rgba(0,0,0,0.5)' }} 
                            itemStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: '900', color: 'white' }}
                          />
                          <Area type="monotone" dataKey="predicted" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#colorInd)" />
                          <Line type="monotone" dataKey="month" stroke="#cbd5e1" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                          <Area type="monotone" dataKey="market" stroke="#10b981" strokeWidth={2} fill="transparent" strokeDasharray="8 4" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* Demand Burn-Rate Chart */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="glass-card border border-white/20 rounded-[40px] p-8 shadow-xl space-y-10">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2"><BarChart3 size={16} className="text-indigo-500" /> Consumption Burn-Rate</h4>
                       <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-widest">+12.4% Surge</span>
                    </div>
                    <div className="h-[250px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={demandData}>
                             <XAxis dataKey="cat" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 900, fill: '#64748b' }} />
                             <Bar dataKey="forecast" radius={[8, 8, 0, 0]} barSize={20}>
                                {demandData.map((e, i) => <Cell key={i} fill={i ===  2 ? '#ef4444' : '#6366f1'} />)}
                             </Bar>
                             <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '16px', border: 'none', background: 'black', color: 'white' }} />
                          </BarChart>
                       </ResponsiveContainer>
                    </div>
                    <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl flex gap-4">
                       <AlertTriangle className="text-rose-500 shrink-0" size={20} />
                       <p className="text-[9px] text-gray-500 leading-relaxed font-bold uppercase tracking-tight">AI Warning: Grains category expected to hit critical buffer shortfall by Oct 4.</p>
                    </div>
                 </div>

                 <div className="glass-card border border-white/20 rounded-[40px] p-8 shadow-xl space-y-8">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2"><Globe size={16} className="text-indigo-500" /> Harvest Map (Regional)</h4>
                    <div className="space-y-6">
                       {[ 
                          { r: 'Nashik Cluster', p: 'Tomatoes', status: 'Optimal', yield: '↑ 14%' },
                          { r: 'Pune Node', p: 'Onions', status: 'Slight Delay', yield: '↓ 4%' },
                          { r: 'Satara Vault', p: 'Grains', status: 'Peak Harvest', yield: '↑ 22%' },
                          { r: 'Konkan Hub', p: 'Fruits', status: 'Inducting', yield: 'Stable' }
                       ].map((h, i) => (
                          <div key={i} className="flex justify-between items-center group/h">
                             <div className="space-y-1">
                                <p className="text-[11px] font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">{h.r}</p>
                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{h.p}</p>
                             </div>
                             <div className="text-right">
                                <p className={`text-[10px] font-black uppercase tracking-widest ${h.yield.includes('↑') ? 'text-emerald-500' : h.yield.includes('↓') ? 'text-rose-500' : 'text-indigo-500'}`}>{h.yield}</p>
                                <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest opacity-60">{h.status}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                    <button className="w-full h-11 border border-white/20 rounded-xl text-[8px] font-black uppercase tracking-widest text-gray-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
                       <Map size={14} /> Full Geographical Matrix
                    </button>
                 </div>
              </div>
          </div>

          {/* Sidebar Insights: Optimal Procurement */}
          <div className="xl:col-span-4 space-y-8 h-fit sticky top-24">
              <div className="glass-card border border-white/20 rounded-[48px] p-10 space-y-10 group relative overflow-hidden bg-gradient-to-br from-indigo-900 to-black text-white shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                  
                  <div className="flex items-center gap-4 text-indigo-400 mb-2 pl-1 relative z-10">
                      <Zap className="w-7 h-7 animate-pulse" />
                      <h2 className="text-lg font-display font-black uppercase tracking-tight leading-none">Optimal Buy Window</h2>
                  </div>

                  <div className="space-y-8 relative z-10">
                     <div className="p-8 bg-white/5 border border-white/10 rounded-[32px] text-center space-y-4">
                        <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] opacity-70">Next Strategic Window</p>
                        <p className="text-5xl font-display font-black tracking-tighter leading-none">OCT <span className="text-indigo-400">08-14</span></p>
                        <div className="h-1 w-20 bg-indigo-500 mx-auto rounded-full" />
                     </div>

                     <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">AI Recommendations</h3>
                        <div className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 group/rec hover:bg-white/10 transition-all">
                           <BadgeCheck className="text-emerald-400 shrink-0" size={20} />
                           <div className="space-y-2">
                              <p className="text-[10px] font-black uppercase tracking-widest">Reserve Pulse Node</p>
                              <p className="text-[9px] text-gray-400 leading-relaxed font-bold">Lock unit price now: Expected 15% inflation by mid-November.</p>
                           </div>
                        </div>
                        <div className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 group/rec hover:bg-white/10 transition-all">
                           <AlertCircle className="text-amber-400 shrink-0" size={20} />
                           <div className="space-y-2">
                              <p className="text-[10px] font-black uppercase tracking-widest">Hold Tomato Tender</p>
                              <p className="text-[9px] text-gray-400 leading-relaxed font-bold">Nashik cluster yield surge incoming. Wait for Oct 08 price drop.</p>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <button className="h-14 bg-indigo-600 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">Procure Now</button>
                        <button className="h-14 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all"><Share2 size={16} /></button>
                     </div>
                  </div>
              </div>

              {/* Technical Export */}
              <div className="glass-card border border-white/20 rounded-[40px] p-8 space-y-6 shadow-xl">
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-1">S&OP Export Terminal</h4>
                 <div className="space-y-3">
                    <button className="w-full h-12 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all active:scale-95">
                       <Download size={16} className="text-indigo-600" /> Export Seasonal Model (SOP)
                    </button>
                    <button className="w-full h-12 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all">
                       <FileJson size={16} className="text-indigo-600" /> Raw Inference Data (JSON)
                    </button>
                 </div>
              </div>
          </div>

      </div>

    </div>
  );
}

function Map({ size }: { size: number }) {
  return <Globe size={size} />;
}

function FileJson({ size, className }: { size: number, className?: string }) {
  return <LayoutDashboard size={size} className={className} />;
}
