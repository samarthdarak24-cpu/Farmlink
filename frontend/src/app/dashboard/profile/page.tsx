'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, MapPin, Phone, Mail, Award, CheckCircle2, AlertCircle, Upload, Save, FileCheck, RefreshCw, Key, Landmark } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthZustand } from '@/store/authZustand';

export default function ProfilePage() {
  const { user, token } = useAuthZustand();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [kycStatus, setKycStatus] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await authApi.getProfile();
        setProfile(res.data);
        
        // Mock KYC status check
        const kycRaw = localStorage.getItem('farmer-kyc');
        if (kycRaw) setKycStatus(JSON.parse(kycRaw));
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleKycSubmit = () => {
    const kyc = { submittedAt: new Date().toISOString(), fileName: 'aadhar_card_verified.pdf', status: 'verified' };
    localStorage.setItem('farmer-kyc', JSON.stringify(kyc));
    setKycStatus(kyc);
    toast.success('KYC Documents submitted successfully');
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><RefreshCw className="w-8 h-8 animate-spin text-primary-500" /></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      <div className="flex items-center gap-4 mb-8">
          <div className="w-24 h-24 rounded-[32px] gradient-mesh flex items-center justify-center text-white text-4xl shadow-2xl relative overflow-hidden group">
               {String(profile?.name || user?.name || 'F').charAt(0)}
               <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Upload className="w-6 h-6" />
               </div>
          </div>
          <div>
              <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-3">
                {profile?.name || user?.name || 'Farmer Profile'}
                {kycStatus?.status === 'verified' && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
              </h1>
              <p className="text-gray-500 font-medium">Verified Farmer • Member since {new Date().getFullYear() - 1}</p>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Profile Form */}
        <div className="md:col-span-7 space-y-6">
           <div className="glass-card border border-white/20 rounded-3xl p-8 space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[100px] pointer-events-none" />
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                   <div className="space-y-2">
                       <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Full Name</label>
                       <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type="text" value={profile?.name || ''} readOnly className="input h-14 pl-12 bg-white/50 dark:bg-gray-800/20 font-semibold" />
                       </div>
                   </div>
                   <div className="space-y-2">
                       <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Primary Email</label>
                       <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type="text" value={profile?.email || ''} readOnly className="input h-14 pl-12 bg-white/50 dark:bg-gray-800/20 font-semibold" />
                       </div>
                   </div>
                   <div className="space-y-2">
                       <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Phone Number</label>
                       <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type="text" value={profile?.phone || '+91 9876543210'} readOnly className="input h-14 pl-12 bg-white/50 dark:bg-gray-800/20 font-semibold" />
                       </div>
                   </div>
                   <div className="space-y-2">
                       <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Farm Location</label>
                       <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type="text" value={profile?.location || 'Nasik, Maharashtra'} readOnly className="input h-14 pl-12 bg-white/50 dark:bg-gray-800/20 font-semibold" />
                       </div>
                   </div>
               </div>

               <div className="pt-6 border-t border-white/10 dark:border-gray-800 relative z-10 flex gap-4">
                   <button className="btn btn-outline flex-1 h-12 flex items-center justify-center gap-2">
                      <Key className="w-4 h-4" />
                      Manage Password
                   </button>
                   <button className="btn btn-primary flex-1 h-12 flex items-center justify-center gap-2 shadow-xl shadow-primary-500/20">
                      <Save className="w-4 h-4" />
                      Update Profile
                   </button>
               </div>
           </div>

           <div className="glass-card border border-white/20 rounded-3xl p-8 space-y-6">
                <div className="flex items-center gap-3 text-emerald-600 pl-1">
                    <Landmark className="w-5 h-5" />
                    <h2 className="text-sm font-black uppercase tracking-widest">Bank Details & Settlements</h2>
                </div>
                <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                            <Landmark className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Primary Bank</p>
                            <p className="text-gray-900 dark:text-white font-black">**** **** 1234 • SBI Bank</p>
                        </div>
                    </div>
                    <button className="text-emerald-600 font-bold text-xs uppercase tracking-widest hover:underline">Change</button>
                </div>
           </div>
        </div>

        {/* KYC Section */}
        <div className="md:col-span-5 space-y-6">
            <div className={`glass-card border-l-8 rounded-3xl p-8 relative overflow-hidden transition-all ${kycStatus?.status === 'verified' ? 'border-emerald-500 bg-emerald-500/5' : 'border-amber-500 bg-amber-500/5'}`}>
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-4">
                       <Shield className={`w-8 h-8 ${kycStatus?.status === 'verified' ? 'text-emerald-600' : 'text-amber-600'}`} />
                       <h2 className={`text-xl font-display font-black uppercase tracking-tight ${kycStatus?.status === 'verified' ? 'text-emerald-900 dark:text-emerald-400' : 'text-amber-900 dark:text-amber-400'}`}>
                         Digital Twin Identity
                       </h2>
                   </div>
                   
                   {kycStatus?.status === 'verified' ? (
                       <div className="space-y-6">
                           <div className="p-4 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-2xl flex items-center gap-3">
                               <FileCheck className="w-5 h-5 text-emerald-600" />
                               <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Identity Successfully Verified via Aadhaar API.</p>
                           </div>
                           <div className="space-y-1 opacity-60">
                               <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Government Doc</p>
                               <p className="text-xs font-bold text-gray-800 dark:text-gray-300">AADHAAR_CARD_PRIMARY.PDF</p>
                           </div>
                           <div className="flex items-center gap-4 py-2 opacity-50 select-none grayscale pointer-events-none">
                               <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center text-[10px] font-bold">DIGI-LOCKER</div>
                               <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center text-[10px] font-bold">GOVT-VERIFIED</div>
                           </div>
                       </div>
                   ) : (
                       <div className="space-y-6">
                           <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed font-medium">Verify your government documents to unlock premium exports, bulk logistics insurance, and digital contracts.</p>
                           <div className="border-2 border-dashed border-amber-200 dark:border-amber-800 rounded-3xl p-8 text-center bg-white/20 hover:bg-white/40 cursor-pointer transition-all flex flex-col items-center justify-center gap-3">
                                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-2xl flex items-center justify-center text-amber-600">
                                   <Upload className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-amber-900 dark:text-amber-400">Upload Aadhaar / PAN</p>
                                    <p className="text-[10px] uppercase font-bold text-amber-500">Max size 5MB (PDF/JPG)</p>
                                </div>
                                <button onClick={handleKycSubmit} className="btn bg-amber-600 text-white hover:bg-amber-700 w-full mt-4 h-12 rounded-2xl font-black uppercase tracking-widest text-xs">Verify Instantly</button>
                           </div>
                       </div>
                   )}
                </div>
            </div>

            <div className="glass-card border border-white/20 rounded-3xl p-6 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-[40px]" />
                 <div className="flex items-center gap-3 text-primary-600 mb-4 pl-1">
                     <Award className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                     <h2 className="text-sm font-black uppercase tracking-widest">Platform Reputation</h2>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div className="text-center p-3 bg-white/30 dark:bg-white/5 rounded-2xl border border-white/20">
                         <p className="text-2xl font-display font-black text-gray-900 dark:text-white">4.8</p>
                         <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Buyer Rating</p>
                     </div>
                     <div className="text-center p-3 bg-white/30 dark:bg-white/5 rounded-2xl border border-white/20">
                         <p className="text-2xl font-display font-black text-gray-900 dark:text-white">100%</p>
                         <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest">On-Time Ship</p>
                     </div>
                 </div>
            </div>
        </div>

      </div>
    </div>
  );
}
