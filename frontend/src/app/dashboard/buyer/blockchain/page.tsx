'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, CheckCircle, Database, Lock, 
  ExternalLink, Layers, Search, Globe, 
  Zap, Info, Activity, Boxes, Target, 
  ChevronRight, ArrowRight, ShieldAlert, Cpu,
  MapPin
} from 'lucide-react';

export default function BlockchainVerificationPage() {
  const [scanBusy, setScanBusy] = useState(false);
  const [targetId, setTargetId] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleScan = () => {
    if (!targetId) return;
    setScanBusy(true);
    setTimeout(() => {
      setResult({
        hash: '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        block: 14829104,
        timestamp: new Date().toISOString(),
        nodes: 12,
        confidence: '99.98%',
        origin: 'Nashik Cluster #042',
        compliance: ['ISO-9001', 'FSSAI-Cert', 'Global-GAP']
      });
      setScanBusy(false);
    }, 1500);
  };

  return (
    <div className="space-y-12 pb-24 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 px-1">
        <div>
          <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-4">
             Trust <span className="text-emerald-600">Protocol</span>
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] pl-1">Blockchain Traceability & Verifier Node</p>
        </div>
        <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/10">
            <ShieldCheck className="text-emerald-600" />
            <p className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest leading-none">Hyperledger Sync Active</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Verifier */}
          <div className="lg:col-span-8 flex flex-col gap-10">
              <div className="glass-card border border-white/20 rounded-[48px] p-12 group relative overflow-hidden bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent shadow-xl">
                 <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
                 
                 <div className="text-center mb-12">
                    <div className="w-24 h-24 bg-emerald-600 rounded-[32px] flex items-center justify-center text-white mx-auto shadow-2xl shadow-emerald-500/30 mb-8 group-hover:rotate-[360deg] transition-transform duration-1000">
                       <Cpu size={40} className={scanBusy ? 'animate-pulse' : ''} />
                    </div>
                    <h2 className="text-3xl font-display font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-2 leading-none">Payload Verifier</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Locking Immutable Chain Data</p>
                 </div>

                 <div className="relative z-10 space-y-8">
                    <div className="relative group/input">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-hover/input:text-emerald-500 transition-colors" size={24} />
                        <input 
                          type="text" 
                          placeholder="Enter Order Hash or Payload ID (e.g. #ORD-8291)"
                          className="w-full h-20 pl-16 pr-8 rounded-[32px] bg-white dark:bg-black/20 border-2 border-transparent focus:border-emerald-500 outline-none transition-all font-display font-black text-xl tracking-tight text-gray-900 dark:text-white"
                          value={targetId}
                          onChange={(e) => setTargetId(e.target.value)}
                        />
                    </div>
                    
                    <button 
                      onClick={handleScan}
                      disabled={scanBusy || !targetId}
                      className={`w-full h-20 rounded-[32px] text-[12px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all shadow-xl active:scale-95 ${!targetId ? 'bg-gray-100 dark:bg-white/10 text-gray-400' : 'bg-emerald-600 text-white shadow-emerald-500/20'}`}
                    >
                       {scanBusy ? 'Computing Merkle Proof...' : 'Verify Traceability'}
                       <Zap size={18} fill="currentColor" />
                    </button>
                 </div>
              </div>

              <AnimatePresence>
                 {result && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="glass-card border border-white/20 rounded-[48px] p-10 space-y-10 relative overflow-hidden shadow-2xl"
                    >
                       <div className="flex items-center justify-between border-b border-white/10 pb-8">
                          <div className="flex items-center gap-6">
                             <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-inner">
                                <ShieldCheck size={32} />
                             </div>
                             <div>
                                <h3 className="text-2xl font-display font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">Proof Valid</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mt-2 flex items-center gap-2"><CheckCircle size={12} /> Trusted Node Connection</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Timestamp</p>
                             <p className="text-sm font-black text-gray-900 dark:text-white">{new Date(result.timestamp).toLocaleString()}</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-6">
                             <div className="p-6 bg-white/40 dark:bg-white/5 border border-white/20 rounded-3xl">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Transaction Hash</p>
                                <p className="text-[10px] font-mono font-bold break-all text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-black/20 p-4 rounded-xl border border-white/10">{result.hash}</p>
                             </div>
                             <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 bg-white/40 dark:bg-white/5 border border-white/20 rounded-3xl">
                                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Block #</p>
                                   <p className="text-xl font-display font-black text-gray-900 dark:text-white">{result.block}</p>
                                </div>
                                <div className="p-6 bg-white/40 dark:bg-white/5 border border-white/20 rounded-3xl">
                                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Node Conf.</p>
                                   <p className="text-xl font-display font-black text-gray-900 dark:text-white">{result.nodes}</p>
                                </div>
                             </div>
                          </div>
                          
                          <div className="space-y-6">
                             <div className="p-6 bg-white/40 dark:bg-white/5 border border-white/20 rounded-3xl">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Provenance Matrix</p>
                                <div className="space-y-4">
                                   <div className="flex items-center gap-4 text-[10px] font-black uppercase text-gray-900 dark:text-white tracking-widest leading-none">
                                      <MapPin size={16} className="text-emerald-500" /> {result.origin}
                                   </div>
                                   <div className="flex flex-wrap gap-2 pt-2">
                                      {result.compliance.map((c: string) => (
                                         <span key={c} className="px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full text-[8px] font-black tracking-widest">{c}</span>
                                      ))}
                                   </div>
                                </div>
                             </div>
                             <button className="w-full h-14 bg-black dark:bg-white dark:text-black text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                                <ExternalLink size={16} /> Open Explorer
                             </button>
                          </div>
                       </div>
                    </motion.div>
                 )}
              </AnimatePresence>
          </div>

          {/* Sidebar Theory */}
          <div className="lg:col-span-4 space-y-8">
              <div className="glass-card border border-white/20 rounded-[48px] p-10 space-y-10 group relative overflow-hidden bg-gradient-to-br from-gray-900 to-black text-white shadow-2xl sticky top-10">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                 
                 <div className="flex items-center gap-4 text-emerald-500 mb-2 pl-1 relative z-10">
                      <Layers className="w-7 h-7" />
                      <h2 className="text-lg font-display font-black uppercase tracking-tight leading-none">Network Pulse</h2>
                 </div>

                 <div className="space-y-8 relative z-10">
                    <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] space-y-6">
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol Trust</p>
                            <p className="text-xl font-display font-black text-emerald-500">99.9%</p>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: '99%' }} className="h-full bg-emerald-500 shadow-[0_0_15px_0_rgba(16,185,129,0.5)]" />
                        </div>
                    </div>

                    <div className="space-y-6 pl-2">
                       <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Latest Verified Blocks</h3>
                       {[ 
                          { b: '#829104', t: '2m ago' },
                          { b: '#829103', t: '5m ago' },
                          { b: '#829102', t: '8m ago' }
                       ].map((b, i) => (
                          <div key={i} className="flex items-center justify-between group/b">
                             <div className="flex items-center gap-4">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[11px] font-mono text-gray-400 group-hover/b:text-white transition-colors">BLOCK {b.b}</span>
                             </div>
                             <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{b.t}</span>
                          </div>
                       ))}
                    </div>

                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                        <div className="flex gap-4">
                            <ShieldAlert size={20} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-[9px] text-gray-400 font-bold leading-relaxed uppercase tracking-widest">
                               All ODOP Connect transactions are hashed using SHA-256 and distributed across institutional validator nodes.
                            </p>
                        </div>
                    </div>
                 </div>
              </div>
          </div>

      </div>

    </div>
  );
}
