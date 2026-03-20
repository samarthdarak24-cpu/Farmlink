'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Globe, Languages, Shield, Bell, Key, Save, Moon, Sun, Monitor, HelpCircle, ChevronRight, CheckCircle2, RefreshCw, Zap, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [lang, setLang] = useState('English');
  const [theme, setTheme] = useState('dark');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Your preferences have been synchronized cross-node.');
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary-600" />
            Control Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Customize your digital workspace and management protocols.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="glass-card border border-white/20 rounded-[40px] p-8 space-y-8 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                 
                 <div className="space-y-10 relative z-10">
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 text-primary-600 mb-2 pl-1 relative z-10">
                            <Languages className="w-5 h-5" />
                            <h2 className="text-xs font-black uppercase tracking-widest leading-none">Language Protocol</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {['English', 'Hindi', 'Marathi', 'Gujarati', 'Spanish', 'French'].map(l => (
                                <button 
                                    key={l}
                                    onClick={() => setLang(l)}
                                    className={`h-14 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest ${
                                        lang === l ? 'bg-primary-600 text-white border-primary-600 shadow-xl shadow-primary-500/30' : 'bg-white/50 dark:bg-gray-800/10 border-white/10 text-gray-400 hover:border-primary-500/50'
                                    }`}
                                >
                                    <Globe size={14} className={lang === l ? 'animate-pulse' : ''} />
                                    {l}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-3 text-primary-600 mb-2 pl-1">
                            <Moon className="w-5 h-5" />
                            <h2 className="text-xs font-black uppercase tracking-widest leading-none">Aesthetic Systems</h2>
                        </div>
                        <div className="flex bg-white/30 dark:bg-black/20 p-2 rounded-2xl border border-white/10 w-fit">
                            {[
                                { id: 'light', icon: Sun },
                                { id: 'dark', icon: Moon },
                                { id: 'system', icon: Monitor },
                            ].map(t => (
                                <button 
                                    key={t.id}
                                    onClick={() => setTheme(t.id)}
                                    className={`px-8 py-3 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                                        theme === t.id ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' : 'text-gray-500 hover:text-gray-900 group'
                                    }`}
                                >
                                    <t.icon size={16} />
                                    {t.id}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center justify-between p-6 bg-white/40 dark:bg-white/5 border border-white/20 rounded-3xl group cursor-pointer hover:bg-white/60 transition-all">
                             <div className="flex items-center gap-5">
                                 <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl flex items-center justify-center text-indigo-600">
                                     <Bell size={20} />
                                 </div>
                                 <div>
                                     <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Notification Pulse</h3>
                                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Push alerts, Email Digest, Matrix Updates</p>
                                 </div>
                             </div>
                         </div>
                    </section>
                    
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="btn btn-primary h-14 w-full flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest shadow-2xl shadow-primary-500/20"
                    >
                        {saving ? <RefreshCw className="animate-spin" /> : <Save size={18} />}
                        Confirm Global Settings
                    </button>
                 </div>
            </div>
         </div>

         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card border border-white/20 rounded-[40px] p-8 space-y-8 flex-1 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                 
                 <div className="flex items-center gap-4 text-emerald-600 mb-2 pl-1 relative z-10">
                    <Shield className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <h2 className="text-sm font-black uppercase tracking-widest leading-none">Identity Shield</h2>
                 </div>

                 <div className="space-y-6 relative z-10">
                    <div className="p-5 bg-white/40 dark:bg-white/5 border border-white/20 rounded-3xl">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Two-Factor Pass</span>
                            <span className="text-emerald-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"><CheckCircle2 size={12} /> Active</span>
                        </div>
                        <button className="text-xs font-black text-primary-600 uppercase tracking-widest hover:underline">Revoke Access Hub</button>
                    </div>

                    <div className="p-5 bg-white/40 dark:bg-white/5 border border-white/20 rounded-3xl">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Matrix Key Pair</span>
                            <span className="text-gray-300 text-[9px] font-black uppercase tracking-widest">Legacy RSA</span>
                        </div>
                        <button className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-2">
                             Rotate Keys <Zap size={12} />
                        </button>
                    </div>
                 </div>

                 <div className="mt-auto border-t border-white/10 pt-8 pt-auto">
                    <button className="group flex items-center gap-3 text-red-500 hover:text-red-400 transition-colors w-full p-2">
                        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
                            <Trash2 size={18} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">Request Account Erasure</span>
                    </button>
                 </div>
            </div>
         </div>

      </div>

    </div>
  );
}
