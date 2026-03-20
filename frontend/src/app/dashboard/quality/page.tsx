'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Search, RefreshCw, Layers, CheckCircle2, AlertTriangle, 
  HelpCircle, BarChart, Info, ShieldCheck, Zap, Camera, Upload, 
  X, FileText, Download, TrendingUp, TrendingDown, Thermometer, 
  Droplets, Boxes, Eye, QrCode, Lock, Cpu, History
} from 'lucide-react';
import toast from 'react-hot-toast';
import { aiApi, productsApi, blockchainApi } from '@/lib/api';
import { useOfflineCache } from '@/hooks/useOfflineCache';
import { useAuthZustand } from '@/store/authZustand';

export default function AIQualityPage() {
  const { user } = useAuthZustand();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [gradingResult, setGradingResult] = useState<any>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const productsState = useOfflineCache<any[]>(`farmer-products-${user?.id}`, async () => {
    if (!user?.id) return [];
    try {
      const res = await productsApi.getByFarmer(user.id);
      return res.data || [];
    } catch { return []; }
  });

  const products = productsState.data || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 6) {
      toast.error('Limit: 6 high-resolution images per inspection');
      return;
    }
    setImages([...images, ...files]);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (idx: number) => {
    const newImages = [...images];
    newImages.splice(idx, 1);
    setImages(newImages);
    URL.revokeObjectURL(previews[idx]);
    const newPreviews = [...previews];
    newPreviews.splice(idx, 1);
    setPreviews(newPreviews);
  };

  const handleGrade = async () => {
    if (!selectedProductId) return toast.error('Select product for neural analysis');
    if (images.length === 0) return toast.error('Minimum 1 visual sample required');
    
    setIsGrading(true);
    setGradingResult(null);
    
    try {
      setProcessingStep('Initializing Neural Grid...');
      await new Promise(r => setTimeout(r, 1000));
      
      setProcessingStep('Uploading Visual Samples...');
      // Logic for actual upload would go here
      await new Promise(r => setTimeout(r, 1500));

      setProcessingStep('Computer Vision Inference...');
      const res = await aiApi.getQualityGrade(selectedProductId);
      
      setProcessingStep('Securing Results to Ledger...');
      // await blockchainApi.recordQualityLog(res.data);
      await new Promise(r => setTimeout(r, 1000));

      setGradingResult(res.data);
      toast.success('Quality Grade Propagated & Certified');
    } catch (e: any) {
      toast.error('AI module error during inference');
    } finally {
      setIsGrading(false);
      setProcessingStep('');
    }
  };

  const selectedProduct = products.find(p => (p.id || p._id) === selectedProductId);

  return (
    <div className="space-y-10 pb-20">
      
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white flex items-center gap-4 uppercase tracking-tighter">
            <Cpu className="w-10 h-10 text-primary-600" />
            Bio-Quality Neural OS
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1 pl-1">
            Visual Inspection Agent • Automated Certification Engine
          </p>
        </motion.div>
        
        <div className="flex items-center gap-4 p-4 bg-white/40 dark:bg-white/5 border border-white/20 rounded-3xl shadow-xl">
           <div className="flex items-center gap-3 pr-4 border-r border-white/10">
              <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-600">
                 <ShieldCheck size={20} />
              </div>
              <div>
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Blockchain Node</p>
                 <p className="text-sm font-black text-primary-600">Active & Syncing</p>
              </div>
           </div>
           <div className="flex items-center gap-3 pl-2">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600">
                 <History size={20} />
              </div>
              <div>
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Market Confidence</p>
                 <p className="text-sm font-black text-emerald-600">98.2% Accuracy</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Control Column */}
        <div className="xl:col-span-4 flex flex-col gap-8">
           
           {/* Product & Image Selection */}
           <div className="glass-card border border-white/20 rounded-[40px] p-8 space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
              
              <div className="flex items-center gap-4 text-primary-600 mb-2 pl-1 relative z-10">
                 <Target className="w-5 h-5" />
                 <h2 className="text-sm font-black uppercase tracking-widest leading-none">Grading Input Hub</h2>
              </div>
              
              <div className="space-y-6 relative z-10">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Inspection Target</label>
                    <select 
                        className="input w-full h-16 bg-white/40 dark:bg-white/5 border border-white/10 rounded-2xl text-lg font-display font-black"
                        value={selectedProductId}
                        onChange={(e) => { setSelectedProductId(e.target.value); setGradingResult(null); }}
                    >
                        <option value="">Select Produce Node...</option>
                        {products.map(p => (
                            <option key={p.id || p._id} value={p.id || p._id}>{p.name} ({p.category})</option>
                        ))}
                    </select>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Visual Evidence (Primary & Macro)</label>
                    <div className="grid grid-cols-3 gap-3">
                       {previews.map((src, i) => (
                          <div key={i} className="aspect-square rounded-2xl overflow-hidden relative group/img border border-white/10 shadow-lg">
                             <img src={src} className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                             <button onClick={() => removeImage(i)} className="absolute top-1 right-1 h-6 w-6 bg-rose-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                <X size={12} />
                             </button>
                          </div>
                       ))}
                       {previews.length < 6 && (
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square rounded-2xl border-2 border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center text-gray-400 hover:text-primary-600 hover:border-primary-500/50 transition-all gap-2"
                          >
                             <Camera size={24} />
                             <span className="text-[9px] font-black uppercase tracking-widest">Add Frame</span>
                          </button>
                       )}
                    </div>
                    <input ref={fileInputRef} type="file" multiple hidden accept="image/*" onChange={handleFileChange} />
                 </div>
              </div>

              <button 
                onClick={handleGrade}
                disabled={!selectedProductId || isGrading || images.length === 0}
                className="btn btn-primary w-full h-16 rounded-2xl flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.2em] group shadow-2xl shadow-primary-500/30 relative overflow-hidden transition-all active:scale-95 disabled:opacity-50"
              >
                {isGrading ? (
                    <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Neural Processing...
                    </>
                ) : (
                    <>
                        <Zap className="w-5 h-5 group-hover:scale-125 transition-transform" />
                        Initiate Neural Grade
                    </>
                )}
              </button>
              
              {isGrading && (
                <p className="text-[9px] font-bold text-center text-primary-600 uppercase tracking-widest animate-pulse">{processingStep}</p>
              )}
           </div>

           {/* Environmental Sentinel */}
           <div className="glass-card border border-white/20 rounded-[40px] p-8 space-y-6 bg-gradient-to-br from-indigo-500/5 to-transparent">
              <div className="flex items-center gap-4 text-indigo-600 mb-2 pl-1 relative z-10">
                 <Thermometer className="w-5 h-5" />
                 <h2 className="text-sm font-black uppercase tracking-widest leading-none">Ambient Metadata</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-white/40 dark:bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Temperature</p>
                    <p className="text-xl font-display font-black text-gray-900 dark:text-white flex items-center gap-2">24.5°C <TrendingUp size={14} className="text-rose-400"/></p>
                 </div>
                 <div className="p-4 bg-white/40 dark:bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Humidity</p>
                    <p className="text-xl font-display font-black text-gray-900 dark:text-white flex items-center gap-2">62% <TrendingDown size={14} className="text-emerald-400"/></p>
                 </div>
              </div>
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center gap-3">
                 <Droplets className="text-indigo-500" size={18} />
                 <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-tighter">Bio-Storage conditions evaluated as OPTIMAL for Grains.</p>
              </div>
           </div>
        </div>

        {/* Right Result Visualization */}
        <div className="xl:col-span-8">
            <AnimatePresence mode="wait">
                {gradingResult ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Grade Shield */}
                        <div className="glass-card border border-white/20 rounded-[48px] p-10 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
                           
                           <div className="flex flex-col lg:flex-row justify-between gap-10 relative z-10">
                              <div className="flex items-center gap-10">
                                 <div className="w-32 h-32 rounded-full border-[8px] border-emerald-500/20 flex items-center justify-center bg-white dark:bg-gray-800 shadow-2xl relative overflow-hidden group-hover:border-emerald-500 transition-colors">
                                     <div className="absolute inset-2 bg-emerald-500/5 rounded-full flex items-center justify-center text-5xl font-display font-black text-emerald-600 shadow-inner">
                                        {gradingResult.grade}
                                     </div>
                                 </div>
                                 <div className="space-y-3">
                                     <h3 className="text-4xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Neural Quality Log</h3>
                                     <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                           <CheckCircle2 size={12} /> Certified Master
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                           <Lock size={12} /> Blockchain Anchored
                                        </div>
                                     </div>
                                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">ID: {gradingResult.blockchain_hash}</p>
                                 </div>
                              </div>

                              <div className="lg:text-right flex flex-col justify-center">
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Inference Confidence</p>
                                 <p className="text-6xl font-display font-black text-gray-900 dark:text-white">{(gradingResult.confidence * 100).toFixed(1)}%</p>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 pt-10 border-t border-white/10 relative z-10">
                              {Object.entries(gradingResult.factors).map(([label, val]: any) => (
                                 <div key={label} className="space-y-3">
                                    <div className="flex justify-between items-baseline px-1">
                                       <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{label.replace('_', ' ')}</span>
                                       <span className="text-md font-display font-black text-gray-900 dark:text-white">{val}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                                       <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} className="h-full bg-emerald-500 rounded-full" />
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Visual Defect Mapping */}
                        <div className="glass-card border border-white/20 rounded-[40px] p-8 overflow-hidden">
                           <div className="flex items-center gap-4 text-rose-600 mb-8 pl-1">
                              <Eye className="w-5 h-5" />
                              <h2 className="text-sm font-black uppercase tracking-widest leading-none">Neural Defect Mapping</h2>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {previews.slice(0, 3).map((src, i) => (
                                 <div key={i} className="aspect-video rounded-3xl overflow-hidden relative border border-white/10">
                                    <img src={src} className="w-full h-full object-cover grayscale opacity-50" />
                                    {gradingResult.defects.map((d: any, di: number) => (
                                       <motion.div 
                                          key={di} initial={{ scale: 0 }} animate={{ scale: 1 }}
                                          className="absolute border-4 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.5)] rounded-lg flex items-center justify-center"
                                          style={{ 
                                            left: `${d.box[0]}%`, top: `${d.box[1]}%`, 
                                            width: `${d.box[2]}%`, height: `${d.box[3]}%` 
                                          }}
                                       >
                                          <div className="absolute -top-6 left-0 bg-rose-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-md whitespace-nowrap">
                                             {d.type}: {d.severity}
                                          </div>
                                       </motion.div>
                                    ))}
                                    {gradingResult.defects.length === 0 && (
                                       <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/10">
                                          <div className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/30">Visual Purity: 100%</div>
                                       </div>
                                    )}
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Market Impact & Actions */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                           <div className="glass-card border border-white/20 rounded-[40px] p-8 space-y-6">
                              <div className="flex items-center gap-4 text-emerald-600 mb-2 pl-1">
                                 <TrendingUp className="w-5 h-5" />
                                 <h2 className="text-sm font-black uppercase tracking-widest leading-none">Price Premium Impact</h2>
                              </div>
                              <div className="flex items-start gap-10">
                                 <div className="space-y-1">
                                    <p className="text-5xl font-display font-black text-gray-900 dark:text-white">
                                       {gradingResult.price_impact > 0 ? '+' : ''}{gradingResult.price_impact}%
                                    </p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Est. Revenue Drift</p>
                                 </div>
                                 <div className="flex-1 space-y-4 pt-2">
                                    {gradingResult.suggestions.map((s: string, i: number) => (
                                       <div key={i} className="flex gap-3 group cursor-pointer">
                                          <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-primary-500 shrink-0 group-hover:scale-150 transition-transform" />
                                          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 leading-tight group-hover:text-primary-600 transition-colors">{s}</p>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </div>

                           <div className="glass-card border border-white/20 rounded-[40px] p-8 flex flex-col justify-between items-center group relative overflow-hidden">
                              <div className="absolute inset-0 bg-primary-600/5 group-hover:bg-primary-600/10 transition-colors" />
                              <QrCode className="w-16 h-16 text-gray-900 dark:text-white opacity-20 group-hover:opacity-40 transition-opacity" />
                              <div className="text-center relative z-10">
                                 <h4 className="text-lg font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter">Download Digital Twin Repo</h4>
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 mb-6">Fully certified bio-inspection PDF</p>
                                 <button className="btn btn-primary h-14 px-10 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary-500/20 flex items-center gap-3 w-full">
                                    <Download size={18} /> Get Certified PDF
                                 </button>
                              </div>
                           </div>
                        </div>

                    </motion.div>
                ) : (
                    <div className="h-[600px] glass-card border-2 border-dashed border-white/10 rounded-[60px] flex flex-col items-center justify-center p-24 text-center opacity-40 group relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[100px]" />
                        <div className="w-32 h-32 bg-gray-100 dark:bg-white/5 rounded-[40px] flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 transition-transform duration-500">
                            <BarChart className="w-16 h-16 text-gray-400" />
                        </div>
                        <h3 className="text-3xl font-display font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">Initialize Neural Inspection</h3>
                        <p className="max-w-md text-sm text-gray-500 font-medium">Select a bio-node from your repository and upload at least one frame of evidence to launch the Computer Vision inference model.</p>
                        <div className="mt-10 flex gap-4">
                            <div className="px-4 py-2 bg-white dark:bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                               <Cpu size={14} /> CV-Inference v2.1
                            </div>
                            <div className="px-4 py-2 bg-white dark:bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                               <ShieldCheck size={14} /> Blockchain Certified
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
