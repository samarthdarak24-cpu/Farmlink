'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, Target, ShoppingBag, 
  Truck, Package, ShieldCheck, Zap, Award, Globe, 
  AlertTriangle, CheckCircle2, ChevronRight, RefreshCw,
  Search, Filter, Download, Calendar, Activity, Sprout,
  BarChart3, PieChart, LineChart, ArrowUpRight, ArrowDownRight,
  BrainCircuit, LayoutDashboard, HelpCircle, Handshake, Users, MapPin
} from 'lucide-react';
import {
  LineChart as ReLineChart, Line, AreaChart, Area, 
  BarChart as ReBarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { aiApi } from '@/lib/api';
import { useAuthZustand } from '@/store/authZustand';
import toast from 'react-hot-toast';

// --- Components ---

const AnalyticsCard = ({ title, icon: Icon, children, className = "" }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`glass-card border border-white/20 rounded-[40px] p-8 relative overflow-hidden group ${className}`}
  >
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Icon size={24} />
          </div>
          <h3 className="text-lg font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">{title}</h3>
        </div>
        <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <HelpCircle size={18} />
        </button>
      </div>
      {children}
    </div>
  </motion.div>
);

const MetricBox = ({ label, value, trend, trendValue, icon: Icon, color = "emerald" }: any) => (
  <div className="flex flex-col gap-2 p-6 rounded-[32px] bg-white/40 dark:bg-white/5 border border-white/20">
    <div className="flex items-center justify-between">
      <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 text-${color}-600 flex items-center justify-center`}>
        <Icon size={20} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-black ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trendValue}%
        </div>
      )}
    </div>
    <div className="mt-2">
      <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{label}</p>
      <p className="text-2xl font-display font-black text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

// --- Main Page ---

export default function StrategicAnalyticsPage() {
  const { user } = useAuthZustand();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user?.id) return;
    const fetchAllAnalytics = async () => {
      setLoading(true);
      try {
        const farmerId = user.id;
        const [
          revenue, profitability, forecast, sentiment, 
          tenders, fulfillment, inventory, logistics,
          growth, benchmark, expansion, risk,
          compliance, digital, sustainable
        ] = await Promise.all([
          aiApi.getRevenueMetrics(farmerId),
          aiApi.getProfitability(farmerId),
          aiApi.getRevenueForecast(farmerId),
          aiApi.getBuyerSentiment(farmerId),
          aiApi.getTenderInsights(farmerId),
          aiApi.getFulfillmentHealth(farmerId),
          aiApi.getInventoryIntelligence(farmerId),
          aiApi.getLogisticsEfficiency(farmerId),
          aiApi.getGrowthIndex(farmerId),
          aiApi.getMarketBenchmarking(farmerId),
          aiApi.getExpansionOpportunities(farmerId),
          aiApi.getRiskProfile(farmerId),
          aiApi.getComplianceStatus(farmerId),
          aiApi.getDigitalFootprint(farmerId),
          aiApi.getSustainabilityScore(farmerId),
        ]);

        setData({
          revenue: revenue.data,
          profitability: profitability.data,
          forecast: forecast.data,
          sentiment: sentiment.data,
          tenders: tenders.data,
          fulfillment: fulfillment.data,
          inventory: inventory.data,
          logistics: logistics.data,
          growth: growth.data,
          benchmark: benchmark.data,
          expansion: expansion.data,
          risk: risk.data,
          compliance: compliance.data,
          digital: digital.data,
          sustainable: sustainable.data,
        });
      } catch (error) {
        console.error("Failed to load analytics:", error);
        toast.error("AI Analytics Service is currently calibrating. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllAnalytics();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-20 gap-8">
        <div className="relative">
          <div className="w-24 h-24 border-8 border-emerald-500/10 border-t-emerald-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <BrainCircuit className="text-emerald-500 animate-pulse" size={32} />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-display font-black uppercase tracking-tighter text-gray-900 dark:text-white">Analyzing Data Nodes</h2>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-2 animate-pulse">Syncing with Decentralized AI Service...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-10 pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 px-1">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
              AI Powered Strategy
             </div>
             <div className="px-3 py-1 bg-indigo-500/10 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
              Real-time Insights
             </div>
          </div>
          <h1 className="text-5xl font-display font-black text-gray-900 dark:text-white leading-none uppercase tracking-tighter">
            Strategic <br /> Intelligence
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-4 flex items-center gap-2">
            Farmer ID: {user?.id?.slice(-8).toUpperCase()} • Node: ASIA-SOUTH-1 • <Activity size={12} className="text-emerald-500" /> Active 
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="glass-card border border-white/20 rounded-[32px] p-6 flex items-center gap-6 shadow-xl shadow-emerald-500/10">
            <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center relative shadow-lg shadow-emerald-500/20">
               <span className="text-xl font-black text-gray-900 dark:text-white">{data.growth.score}</span>
               <div className="absolute -bottom-2 bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Growth</div>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Growth Index Status</p>
              <h4 className="text-lg font-display font-black text-emerald-600 dark:text-emerald-400 uppercase leading-none">{data.growth.badge}</h4>
              <p className="text-[10px] text-gray-500 font-bold mt-2">{data.growth.next_milestone}</p>
            </div>
          </div>
          <div className="glass-card border border-white/20 rounded-[32px] p-6 flex items-center gap-6 shadow-xl shadow-blue-500/10">
             <div className="w-16 h-16 rounded-full border-4 border-blue-500 flex items-center justify-center relative shadow-lg shadow-blue-500/20">
               <span className="text-xl font-black text-gray-900 dark:text-white">{data.sustainable.esg_score}</span>
               <div className="absolute -bottom-2 bg-blue-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">ESG</div>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Impact Score</p>
              <h4 className="text-lg font-display font-black text-blue-600 dark:text-blue-400 uppercase leading-none">{data.sustainable.esg_badge}</h4>
              <p className="text-[10px] text-gray-500 font-bold mt-2">Top 5% Eco-Friendly</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
        {['Overview', 'Financial', 'Market', 'Operations', 'Expansion & Risk'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
              activeTab === tab.toLowerCase() 
                ? 'bg-gray-900 dark:bg-white text-white dark:text-black border-transparent shadow-xl' 
                : 'bg-white/40 dark:bg-white/5 text-gray-400 border-white/20 hover:border-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
        <div className="flex-1" />
        <button className="h-12 w-12 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/20 flex items-center justify-center text-gray-500 hover:text-emerald-500 transition-colors">
          <Download size={20} />
        </button>
      </div>

      {/* Content Sections */}
      <AnimatePresence mode="wait">
        
        {/* FINANCIAL DASHBOARD */}
        {(activeTab === 'overview' || activeTab === 'financial') && (
          <motion.div 
            key="financial"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-8"
          >
            {/* Revenue Analytics Widget */}
            <AnalyticsCard title="Revenue & Financial Analytics" icon={DollarSign} className="xl:col-span-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <MetricBox label="Total Revenue (YTD)" value={`₹${data.revenue.total_revenue.toLocaleString()}`} trend="up" trendValue={data.revenue.growth_rate_yoy} icon={TrendingUp} />
                <MetricBox label="Average Order" value={`₹${data.revenue.avg_order_value.toLocaleString()}`} icon={ShoppingBag} />
                <MetricBox label="Gross Margin" value={`${data.profitability.gross_margin}%`} trend="up" trendValue="4.2" icon={Award} />
              </div>
              
              <div className="h-[300px] w-full mt-10">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Predictive Revenue Forecast (Next 6 Months)</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.forecast.forecast_6m}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                    <XAxis dataKey="month" hide />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', background: 'rgba(255,255,255,0.9)' }} 
                      labelStyle={{ color: '#6B7280', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorAmount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100 dark:border-white/10">
                 <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Revenue by Buyer Type (%)</h5>
                    <div className="flex items-center gap-6">
                       <div className="w-24 h-24">
                          <ResponsiveContainer width="100%" height="100%">
                             <RePieChart>
                                <Pie data={Object.entries(data.revenue.revenue_by_buyer_type).map(([key, value]) => ({ name: key, value }))} innerRadius={30} outerRadius={40} dataKey="value">
                                   {Object.entries(data.revenue.revenue_by_buyer_type).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                             </RePieChart>
                          </ResponsiveContainer>
                       </div>
                       <div className="space-y-2">
                          {Object.entries(data.revenue.revenue_by_buyer_type).map(([key, value]: any, i) => (
                             <div key={key} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                                <span className="text-[10px] font-bold text-gray-500 uppercase">{key}: {value}%</span>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
                 <div className="bg-emerald-500/5 rounded-3xl p-6 border border-emerald-500/10">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-3 flex items-center gap-2">
                       <BrainCircuit size={14} /> AI Optimization Insight
                    </h5>
                    <p className="text-sm font-bold text-gray-700 dark:text-emerald-100 italic leading-relaxed">
                       "Switching to batch logistics for Satara hub could increase net profit by 8.4% this quarter."
                    </p>
                 </div>
              </div>
            </AnalyticsCard>

            {/* Spend widget */}
            <AnalyticsCard title="Spend Intelligence" icon={TrendingDown} className="xl:col-span-4">
               <div className="space-y-6">
                  {Object.entries(data.profitability.cost_breakdown).map(([item, val]: any, i) => (
                    <div key={item}>
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black uppercase text-gray-500">{item}</span>
                          <span className="text-[10px] font-black text-gray-900 dark:text-white">{val}%</span>
                       </div>
                       <div className="h-2 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${val}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className="h-full bg-indigo-500 rounded-full"
                          />
                       </div>
                    </div>
                  ))}
               </div>
               
               <div className="mt-10 pt-8 border-t border-gray-100 dark:border-white/10">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Efficiency Gain Recommendations</h4>
                  <div className="space-y-4">
                     {data.profitability.optimizations.map((opt: any, i: number) => (
                       <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/20 hover:border-emerald-500/30 transition-all">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                             <TrendingUp size={16} />
                          </div>
                          <div>
                             <p className="text-[10px] font-black uppercase text-emerald-600 mb-1">Potential Savings: ₹{opt.savings}</p>
                             <p className="text-[11px] text-gray-500 font-bold">{opt.tip}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </AnalyticsCard>
          </motion.div>
        )}

        {/* MARKET ANALYSIS */}
        {(activeTab === 'overview' || activeTab === 'market') && (
          <motion.div 
            key="market"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-8 my-10"
          >
             {/* Buyer Sentiment Widget */}
             <AnalyticsCard title="Buyer Sentiment & Market Pull" icon={Users} className="xl:col-span-6">
                <div className="flex items-center gap-8 mb-10">
                   <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-4xl font-black text-indigo-600 border border-indigo-500/20 shadow-xl shadow-indigo-500/10">
                      {data.sentiment.average_sentiment}
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Average NLP Sentiment Score</p>
                      <h4 className="text-xl font-display font-black text-gray-900 dark:text-white uppercase">Strong Market Pull</h4>
                      <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-2">{data.sentiment.retention_rate}% Retention Rate</p>
                   </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-10">
                   {data.sentiment.keyword_cloud.map((tag: string) => (
                     <span key={tag} className="px-4 py-2 rounded-xl bg-white/50 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest border border-white/20 text-indigo-600 dark:text-indigo-400">
                        {tag}
                     </span>
                   ))}
                </div>

                <div className="h-px w-full bg-gray-100 dark:bg-white/10 mb-8" />
                
                <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Market Share in Category</h5>
                <div className="flex items-center gap-6">
                   <div className="flex-1 h-3 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${data.sentiment.market_share_in_category}%` }} className="h-full bg-emerald-500" />
                   </div>
                   <span className="text-sm font-black text-gray-900 dark:text-white">{data.sentiment.market_share_in_category}%</span>
                </div>
                <p className="text-[9px] text-gray-500 font-bold mt-2 uppercase tracking-widest text-right">Compared to regional average (1.2%)</p>
             </AnalyticsCard>

             {/* Tender Win-Loss Widget */}
             <AnalyticsCard title="Tender & RFQ Win-Loss Analytics" icon={Target} className="xl:col-span-6">
                <div className="grid grid-cols-2 gap-6 mb-8">
                   <div className="p-6 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/20">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Win Rate</p>
                      <p className="text-4xl font-display font-black">{data.tenders.win_rate}%</p>
                   </div>
                   <div className="p-6 rounded-3xl bg-white/40 dark:bg-white/5 border border-white/20">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Prediction Next Bid</p>
                      <p className="text-4xl font-display font-black text-emerald-500">{data.tenders.win_probability_next_bid}%</p>
                   </div>
                </div>

                <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Root Cause Analysis (Why Bids Failed)</h5>
                <div className="space-y-4">
                   {Object.entries(data.tenders.reason_for_loss).map(([reason, val]: any, i) => (
                      <div key={reason} className="flex items-center gap-4">
                         <span className="text-[10px] font-bold text-gray-500 w-24 uppercase truncate">{reason}</span>
                         <div className="flex-1 h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} className="h-full bg-red-400" />
                         </div>
                         <span className="text-[10px] font-black text-gray-900 dark:text-white">{val}%</span>
                      </div>
                   ))}
                </div>

                <div className="mt-8 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <RefreshCw size={16} className="text-amber-500" />
                      <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400">Bid Strategy Calibration Required</span>
                   </div>
                   <span className="text-[10px] font-black text-amber-700 bg-amber-100 dark:bg-amber-900/40 px-3 py-1 rounded-lg">-{data.tenders.suggested_bid_adjustment}% Price Adjustment</span>
                </div>
             </AnalyticsCard>
          </motion.div>
        )}

        {/* OPERATIONAL WIDGETS */}
        {(activeTab === 'overview' || activeTab === 'operations') && (
           <motion.div 
            key="ops"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-8 my-10"
           >
              {/* Performance Metrics */}
              <div className="xl:col-span-4 space-y-8">
                 <AnalyticsCard title="Fulfillment Health" icon={CheckCircle2}>
                    <MetricBox label="Order Success Rate" value={`${data.fulfillment.fulfillment_rate}%`} icon={Handshake} color="emerald" />
                    <div className="mt-6 space-y-4">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase">
                          <span className="text-gray-400">On-Time Delivery</span>
                          <span className="text-emerald-500">{data.fulfillment.on_time_delivery}%</span>
                       </div>
                       <div className="flex justify-between items-center text-[10px] font-black uppercase">
                          <span className="text-gray-400">Avg Processing Time</span>
                          <span className="text-indigo-500">{data.fulfillment.avg_processing_time_hours}h</span>
                       </div>
                    </div>
                 </AnalyticsCard>

                 <AnalyticsCard title="Logistics & Route" icon={Truck}>
                    <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 mb-4">
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-indigo-600 uppercase">Route Optimization</span>
                          <span className="text-[10px] font-black text-gray-900 dark:text-white">Active</span>
                       </div>
                       <p className="text-[11px] font-bold text-gray-500">{data.logistics.route_optimizations[0].strategy}: Save up to {data.logistics.route_optimizations[0].potential_savings}%</p>
                    </div>
                    <MetricBox label="Reliability Score" value={data.logistics.logistics_reliability_score} icon={Truck} color="blue" />
                 </AnalyticsCard>
              </div>

              {/* Inventory Intelligence Widget */}
              <AnalyticsCard title="AI Inventory Intelligence" icon={Package} className="xl:col-span-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="space-y-6">
                       <div className="flex items-center gap-6">
                          <div className="w-20 h-20 rounded-full border-8 border-amber-500/20 border-t-amber-500 flex items-center justify-center text-xl font-black">{data.inventory.wastage_percentage}%</div>
                          <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Resource Wastage</p>
                             <h4 className="text-lg font-display font-black text-red-500 uppercase leading-none">Minimizing</h4>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <div className="w-20 h-20 rounded-full border-8 border-indigo-500/20 border-t-indigo-500 flex items-center justify-center text-xl font-black">{data.inventory.inventory_turnover_ratio}x</div>
                          <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Turnover Ratio</p>
                             <h4 className="text-lg font-display font-black text-indigo-600 uppercase leading-none">Optimal Alpha</h4>
                          </div>
                       </div>
                    </div>
                    
                    <div className="p-8 rounded-[40px] bg-gray-900 text-white relative overflow-hidden group/alert">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                       <div className="relative z-10">
                          <div className="flex items-center gap-3 text-emerald-400 mb-4">
                             <AlertTriangle size={20} />
                             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Inventory Projection</span>
                          </div>
                          <h3 className="text-2xl font-display font-black mb-1">Stock Out Warning</h3>
                          <p className="text-gray-400 text-sm font-bold">Estimated empty date: <span className="text-white">{data.inventory.predicted_stockout_date}</span></p>
                          <div className="mt-8">
                             <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">AI Recommended Buffer</p>
                             <p className="text-3xl font-display font-black">{data.inventory.smart_stock_level} {data.inventory.units}</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="h-40 w-full bg-gray-50 dark:bg-white/5 rounded-3xl p-6 border border-gray-100 dark:border-white/10 flex items-center justify-center">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] animate-pulse">Advanced Heatmap Visualizing...</p>
                 </div>
              </AnalyticsCard>
           </motion.div>
        )}

        {/* STRATEGIC & RISK */}
        {(activeTab === 'overview' || activeTab === 'expansion & risk') && (
          <motion.div 
            key="strategic"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-8 my-10"
          >
             {/* Expansion Opps */}
             <AnalyticsCard title="Precision Expansion Opportunities" icon={Globe} className="xl:col-span-8">
                <div className="flex flex-col md:flex-row gap-12">
                   <div className="flex-1 space-y-8">
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Recommended Strategy</p>
                         <h4 className="text-4xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight">
                            Pivot to <span className="text-emerald-600">{data.expansion.recommended_next_crop}</span>
                         </h4>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                         <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                            <p className="text-[10px] font-black uppercase mb-1">Estimated ROI</p>
                            <p className="text-2xl font-black">{data.expansion.estimated_roi}%</p>
                         </div>
                         <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400">
                            <p className="text-[10px] font-black uppercase mb-1">Gap Probability</p>
                            <p className="text-2xl font-black">{Math.round(data.expansion.market_gap_probability * 100)}%</p>
                         </div>
                      </div>
                   </div>

                   <div className="w-full md:w-80 space-y-6">
                      <div className="p-6 rounded-[32px] bg-white/40 dark:bg-white/5 border border-white/20">
                         <h5 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Expansion Hotspots</h5>
                         <div className="space-y-3">
                            {data.expansion.expansion_hotspots.map((h: string) => (
                               <div key={h} className="flex items-center gap-3">
                                  <MapPin size={14} className="text-indigo-500" />
                                  <span className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase">{h}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                      <div className="p-6 rounded-[32px] bg-white/40 dark:bg-white/5 border border-white/20">
                         <h5 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Digital Readiness</h5>
                         <div className="flex items-center justify-between">
                            <span className="text-4xl font-display font-black text-indigo-600">{data.digital.digital_adoption_score}</span>
                            <div className="text-right">
                               <p className="text-[10px] font-black uppercase text-gray-500">Trust Index</p>
                               <p className="text-sm font-black text-emerald-500">{data.digital.digital_trust_index * 100}%</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </AnalyticsCard>

             {/* Risk Widget */}
             <AnalyticsCard title="Multi-Hazard Risk Intelligence" icon={ShieldCheck} className="xl:col-span-4">
                <div className="p-8 rounded-[40px] bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-white/5 mb-8">
                   <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Global Risk Exposure</h4>
                      <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-[10px] font-black uppercase">Low Vulnerability</div>
                   </div>
                   <div className="text-6xl font-display font-black text-gray-900 dark:text-white mb-2">{data.risk.overall_risk_score} <span className="text-xl text-gray-400">/ 100</span></div>
                </div>

                <div className="space-y-4">
                   {Object.entries(data.risk.risk_breakdown).map(([risk, val]: any) => (
                      <div key={risk} className="flex flex-col gap-2">
                         <div className="flex justify-between items-center text-[10px] font-black uppercase">
                            <span className="text-gray-400">{risk} Risk</span>
                            <span className={val > 40 ? 'text-red-500' : 'text-emerald-500'}>{val}%</span>
                         </div>
                         <div className="h-1.5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} className={`h-full ${val > 40 ? 'bg-red-500' : 'bg-emerald-500'}`} />
                         </div>
                      </div>
                   ))}
                </div>

                <div className="mt-10">
                   <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Mitigation Protocol</h5>
                   <div className="space-y-3">
                      {data.risk.mitigation_strategies.map((str: string) => (
                         <div key={str} className="flex gap-3 text-[11px] font-bold text-gray-600 dark:text-gray-400 italic">
                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                            {str}
                         </div>
                      ))}
                   </div>
                </div>
             </AnalyticsCard>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Benchmarking Section (Bottom Wide) */}
      <AnalyticsCard title="Dynamic Market Benchmarking" icon={BarChart3}>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mt-4">
            <div className="md:col-span-1 border-r border-gray-100 dark:border-white/10 pr-12">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Your Price Index</p>
               <h4 className="text-5xl font-display font-black text-indigo-600">{data.benchmark.your_price_index}x</h4>
               <p className="text-[10px] text-gray-500 font-bold mt-2 italic">You are priced {Math.round((data.benchmark.your_price_index - 1) * 100)}% above market average (₹{data.benchmark.market_avg_price}).</p>
               
               <div className="mt-10 p-4 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
                  <div className="text-[10px] font-black uppercase text-emerald-600 mb-1">Quality Percentile</div>
                  <div className="text-3xl font-display font-black text-emerald-700">{data.benchmark.your_quality_percentile}th</div>
               </div>
            </div>
            
            <div className="md:col-span-3">
               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <ReBarChart data={data.benchmark.benchmarks}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                        <XAxis dataKey="metric" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9CA3AF' }} />
                        <YAxis hide />
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                        <Bar dataKey="you" name="Your Performance" fill="#10b981" radius={[10, 10, 0, 0]} />
                        <Bar dataKey="market_avg" name="Market Average" fill="#6366f1" radius={[10, 10, 0, 0]} />
                        <Bar dataKey="top_10" name="Top 10% Leaders" fill="#f59e0b" radius={[10, 10, 0, 0]} />
                     </ReBarChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>
      </AnalyticsCard>

      {/* Compliance Footer Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="glass-card border border-white/20 rounded-[40px] p-8 flex items-center justify-between bg-emerald-500/5">
            <div>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Compliance Integrity</p>
               <h4 className="text-2xl font-display font-black text-emerald-600">{data.compliance.compliance_integrity}%</h4>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
               <ShieldCheck size={24} />
            </div>
         </div>
         <div className="glass-card border border-white/20 rounded-[40px] p-8 flex items-center justify-between bg-indigo-500/5">
            <div>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Pending Renewals</p>
               <h4 className="text-2xl font-display font-black text-indigo-600">{data.compliance.pending_renewals.length} Audit</h4>
            </div>
            <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white">
               <Calendar size={24} />
            </div>
         </div>
         <div className="glass-card border border-white/20 rounded-[40px] p-8 flex items-center justify-between bg-amber-500/10">
            <div>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Platform Adoption</p>
               <h4 className="text-2xl font-display font-black text-amber-600">{data.digital.app_usage_frequency} Active</h4>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white">
               <Activity size={24} />
            </div>
         </div>
      </div>

    </div>
  );
}
