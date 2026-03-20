'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, TrendingUp, TrendingDown, Calendar, 
  MapPin, Wind, CloudRain, Zap, Brain, Activity, 
  Target, Info, RefreshCw, AlertTriangle, ArrowUpRight, 
  Search, Filter, Globe, Sparkles, PieChart, 
  Download, ChevronRight, Gauge, Briefcase, Boxes, 
  CheckCircle2, ShieldAlert
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, ReferenceLine, ComposedChart
} from 'recharts';
import toast from 'react-hot-toast';
import { useAuthZustand } from '@/store/authZustand';
import { api } from '@/lib/api';

// Mock Data for Demand Simulation
const MOCK_DEMAND_SERIES = [
  { day: 'T-30', volume: 120, price: 54 },
  { day: 'T-20', volume: 132, price: 56 },
  { day: 'T-10', volume: 145, price: 52 },
  { day: 'Now', volume: 160, price: 58 },
  { day: 'T+7', volume: 185, price: 62, forecast: true },
  { day: 'T+14', volume: 210, price: 65, forecast: true },
  { day: 'T+30', volume: 195, price: 60, forecast: true },
  { day: 'T+60', volume: 240, price: 72, forecast: true },
  { day: 'T+90', volume: 215, price: 68, forecast: true },
];

const MOCK_SEASONAL_HEAT = [
  { month: 'Jan', demand: 45 }, { month: 'Feb', demand: 52 }, { month: 'Mar', demand: 88 },
  { month: 'Apr', demand: 95 }, { month: 'May', demand: 40 }, { month: 'Jun', demand: 32 },
  { month: 'Jul', demand: 28 }, { month: 'Aug', demand: 45 }, { month: 'Sep', demand: 72 },
  { month: 'Oct', demand: 98 }, { month: 'Nov', demand: 85 }, { month: 'Dec', demand: 60 },
];

export default function DemandForecastingPage() {
  const { user } = useAuthZustand();
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [horizon, setHorizon] = useState('90d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats = useMemo(() => ({
    demandScore: 84,
    priceTrend: 'UP',
    sentiment: 'Bullish',
    oversupplyRisk: 'Low',
    roiProjection: '+18.4%'
  }), []);

  const handleRefreshForecast = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Neural Forecast Synchronized via FastAPI');
    }, 1500);
  };

  return (
    <div className="space-y-10 pb-20">
      
      {/* HUD: Market Intelligence Pulse */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white flex items-center gap-4 uppercase tracking-tighter">
            <TrendingUp className="w-10 h-10 text-primary-600" />
            Demand Forecasting
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1 pl-1">
            Institutional Market Intelligence • Neural Supply Chain Forecasting
          </p>
        </motion.div>
        
        <div className="flex items-center gap-4 p-4 bg-white/40 dark:bg-white/5 border border-white/20 rounded-[32px] shadow-xl">
           <div className="flex items-center gap-4 pr-6 border-r border-white/10">
              <div className="w-12 h-12 bg-primary-600/10 rounded-2xl flex items-center justify-center text-primary-600">
                 <Zap size={24} />
              </div>
              <div>
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Demand Score</p>
                 <p className="text-xl font-display font-black text-primary-600 tracking-tighter">{stats.demandScore}/100</p>
              </div>
           </div>
           <div className="flex items-center gap-4 pl-2">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
                 <Target size={24} />
              </div>
              <div>
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">ROI Outlook</p>
                 <p className="text-xl font-display font-black text-emerald-600 tracking-tighter">{stats.roiProjection}</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Left: Intelligence Stream */}
        <div className="xl:col-span-8 flex flex-col gap-8">
            
            {/* Control Bar */}
            <div className="glass-card border border-white/20 rounded-[48px] p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                    <Search className="w-5 h-5 text-gray-400 ml-4" />
                    <select 
                        className="input h-14 bg-transparent border-none text-sm font-bold uppercase tracking-widest"
                        value={selectedCrop}
                        onChange={(e) => setSelectedCrop(e.target.value)}
                    >
                        {['Wheat', 'Rice', 'Onion', 'Cotton', 'Spices'].map(c => (
                            <option key={c} value={c}>{c} Intelligence Pool</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto px-4">
                    {['7d', '30d', '90d', '6m'].map(t => (
                        <button 
                            key={t} onClick={() => setHorizon(t)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${horizon === t ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white/10'}`}
                        >
                            {t}
                        </button>
                    ))}
                    <div className="w-px h-8 bg-white/10 mx-2" />
                    <button 
                        onClick={handleRefreshForecast}
                        disabled={isRefreshing}
                        className="p-3 bg-white/40 dark:bg-white/5 border border-white/20 rounded-xl text-primary-600 hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                    >
                        <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Main Forecast Chart */}
            <div className="glass-card border border-white/20 rounded-[64px] p-10 lg:p-16 space-y-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-500/5 rounded-full blur-[100px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                    <div>
                        <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter">Neural Demand Projection</h2>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                             <Activity className="text-primary-600" size={12} />
                             LSTM (t+90) Horizon • Confidence: 89.2%
                        </p>
                    </div>
                    <div className="flex gap-10">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Predicted High</p>
                            <p className="text-2xl font-display font-black text-emerald-600 tracking-tighter">240 Units</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price Anchor</p>
                            <p className="text-2xl font-display font-black text-primary-600 tracking-tighter">₹72/kg</p>
                        </div>
                    </div>
                </div>

                <div className="h-[400px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={MOCK_DEMAND_SERIES}>
                            <defs>
                                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis 
                                dataKey="day" axisLine={false} tickLine={false} 
                                tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                            />
                            <YAxis hide />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '16px', color: '#fff' }}
                                itemStyle={{ fontWeight: 'bold' }}
                            />
                            <Area 
                                type="monotone" dataKey="volume" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorVolume)" 
                                animationDuration={2000} dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#2563eb' }}
                            />
                            <ReferenceLine x="Now" stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'NOW', position: 'top', fill: '#f59e0b', fontWeight: 900 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Seasonal Matrix & Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card border border-white/20 rounded-[48px] p-8 space-y-6">
                    <div className="flex items-center justify-between pl-2">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-3">
                            <Calendar size={18} className="text-amber-500" />
                            Seasonal Demand Pulse
                        </h3>
                    </div>
                    
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={MOCK_SEASONAL_HEAT}>
                                <XAxis dataKey="month" hide />
                                <Bar dataKey="demand" radius={[8, 8, 8, 8]}>
                                    {MOCK_SEASONAL_HEAT.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.demand > 80 ? '#10b981' : entry.demand > 50 ? '#3b82f6' : '#94a3b8'} opacity={0.6} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl">
                         <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest leading-relaxed">
                             Insight: Demand for {selectedCrop} peaks in March (Dusshera procurement spike). Consider planting by Mid-November.
                         </p>
                    </div>
                </div>

                <div className="glass-card border border-white/20 rounded-[48px] p-8 space-y-6">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-3 pl-2">
                        <Sparkles size={18} className="text-primary-600" />
                        AI Recommendation Engine
                    </h3>
                    
                    <div className="space-y-4">
                        {[
                            { crop: 'Chickpeas', roi: '+24%', confidence: 92, status: 'Strategic' },
                            { crop: 'Cumin', roi: '+19%', confidence: 85, status: 'Growth' },
                            { crop: 'Mustard', roi: '+15%', confidence: 78, status: 'Stable' }
                        ].map((rec, i) => (
                            <div key={i} className="p-5 bg-white/40 dark:bg-white/5 border border-white/10 rounded-3xl flex items-center justify-between group cursor-pointer hover:border-primary-500/40 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary-600/10 rounded-2xl flex items-center justify-center text-primary-600">
                                        <ArrowUpRight size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-black uppercase tracking-tight">{rec.crop}</p>
                                            <span className="px-2 py-0.5 bg-primary-500/10 text-primary-600 text-[8px] font-black uppercase rounded-md">{rec.status}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Predicted Gain: <span className="text-emerald-500 font-black">{rec.roi}</span></p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-display font-black text-gray-900 dark:text-white leading-none">{rec.confidence}%</p>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Neural Fit</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Right: Neural Sentinel HUD */}
        <div className="xl:col-span-4 flex flex-col gap-8">
            
            {/* Market Sentiment Panel */}
            <div className="glass-card border border-white/20 rounded-[48px] p-8 space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                
                <div className="flex items-center gap-4 pl-1">
                    <Globe className="w-6 h-6 text-emerald-500 animate-spin-slow" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">External Signal Hub</h2>
                </div>

                <div className="space-y-6">
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                            <span>Market Sentiment</span>
                            <span className="text-emerald-500">Bullish</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} animate={{ width: '78%' }} className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 bg-white/40 dark:bg-white/5 border border-white/10 rounded-2xl space-y-1">
                            <CloudRain size={16} className="text-blue-500" />
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">IMD Rainfall</p>
                            <p className="text-[12px] font-black">+14% Optimal</p>
                         </div>
                         <div className="p-4 bg-white/40 dark:bg-white/5 border border-white/10 rounded-2xl space-y-1">
                            <Briefcase size={16} className="text-indigo-500" />
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Policy Pulse</p>
                            <p className="text-[12px] font-black">Export Open</p>
                         </div>
                    </div>
                </div>

                <div className="p-6 bg-primary-600/5 border border-primary-500/10 rounded-[32px] space-y-4">
                    <div className="flex items-center gap-3 text-primary-600">
                        <Info size={14} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Policy Scanner</p>
                    </div>
                    <p className="text-[10px] font-medium text-gray-500 leading-relaxed italic">
                        New export subsidies for {selectedCrop} announced by APMC. Expected to drive an 18% demand surge across neighboring export hubs.
                    </p>
                </div>
            </div>

            {/* Strategy Guard */}
            <div className="glass-card border border-white/20 rounded-[48px] p-8 space-y-6">
                 <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-3 pl-1">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    Strategic Directives
                 </h3>
                 <div className="space-y-3">
                    {[
                        "Increase storage for Week 4 peak surge.",
                        "Lock-in logistics contracts for Q3 peak.",
                        "Optimize grade-A sorting for higher ROI."
                    ].map((text, i) => (
                        <div key={i} className="flex gap-4 p-4 bg-white/40 dark:bg-white/5 border border-white/10 rounded-2xl">
                            <div className="w-5 h-5 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-600 flex-shrink-0">
                                <ArrowRight size={12} />
                            </div>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-tight">{text}</p>
                        </div>
                    ))}
                 </div>
            </div>

            {/* Oversupply Alert Panel */}
            <div className="glass-card border border-rose-500/20 rounded-[48px] p-8 space-y-6 bg-rose-500/5 relative overflow-hidden">
                <div className="flex items-center gap-4 text-rose-500">
                    <ShieldAlert size={20} className="animate-pulse" />
                    <h2 className="text-sm font-black uppercase tracking-widest">Risk Sentinel</h2>
                </div>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-white/60 dark:bg-white/5 border border-white/10 rounded-2xl">
                         <div className="flex items-center gap-3">
                            <Boxes size={16} className="text-rose-500" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Oversupply Risk</span>
                         </div>
                         <span className="text-[10px] font-black text-rose-500">None Detected</span>
                    </div>

                    <p className="text-[10px] text-gray-500 italic font-medium text-center px-4 leading-relaxed">
                        No significant listing volume anomalies detected. Current market supply is perfectly aligned with Trailing 3-Year averages.
                    </p>
                </div>
            </div>

            {/* Price Exit Gauge */}
            <div className="glass-card border border-white/20 rounded-[48px] p-8 space-y-8 flex-1 flex flex-col items-center justify-center text-center">
                 <div className="w-24 h-24 bg-primary-600/10 rounded-[32px] flex items-center justify-center text-primary-600 mb-6">
                    <Gauge size={40} />
                 </div>
                 <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white mb-2 text-center">Profit Target Node</h3>
                    <p className="text-[10px] font-medium text-gray-500 max-w-[200px] mb-6 text-center mx-auto">Based on neural trends, your optimal exit window is in <span className="text-primary-600 font-bold">14-22 days</span>.</p>
                    <button className="h-14 px-10 bg-primary-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary-500/20 active:scale-95 transition-all">Set Exit Alert</button>
                 </div>
            </div>
        </div>

      </div>
    </div>
  );
}

const ArrowRight = ({ size, className }: { size: number; className?: string }) => (
    <div className={className}><ChevronRight size={size} /></div>
);
