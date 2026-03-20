'use client';

import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Leaf, CheckCircle, Users, Globe, ShieldCheck } from 'lucide-react';
import Container from './Container';
import GlassButton from './GlassButton';
import YouTubeBackground from './YouTubeBackground';

const stats = [
  { label: 'Active Farmers', value: '12,500+', icon: Users },
  { label: 'Verified Buyers', value: '4,200+', icon: ShieldCheck },
  { label: 'States Covered', value: '28', icon: Globe },
];

export default function HeroSection() {
  return (
    <section id="top" className="relative flex items-center justify-center min-h-[100svh] overflow-hidden pt-16 selection:bg-primary-500/30">
      {/* Background YouTube video — aerial farm footage */}
      <YouTubeBackground 
        videoId="aqz-KE-bpKQ" 
        overlayOpacity={0.55}
        fallbackImage="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop"
        className="brightness-[0.5] contrast-[1.2] saturate-[1.3]"
      />

      {/* Extra gradient overlays for premium depth */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/40 via-transparent to-gray-950" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-emerald-950/30 via-transparent to-emerald-950/30" />

      <Container className="relative z-10 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center max-w-5xl"
        >
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-6 py-3 mt-8 mb-10 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-emerald-900/20"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-sm font-semibold text-gray-200 uppercase tracking-[0.15em]">
              AI-Powered Agricultural Marketplace
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-white font-display font-extrabold tracking-tight text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05] mb-8"
          >
            Farm to Business
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 animate-gradient-x">
              Without Middlemen
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-2 text-gray-300 text-lg sm:text-xl md:text-2xl max-w-3xl font-light leading-relaxed mb-4"
          >
            India&apos;s most advanced platform connecting farmers directly to verified buyers.
            AI-powered pricing, blockchain traceability, and real-time negotiations.
          </motion.p>

          {/* Trust indicators */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-8 mt-8 mb-12 text-sm text-gray-300"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Verified Buyers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>AI Fair Pricing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Blockchain Tracked</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Secure Payments</span>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-5 justify-center w-full sm:w-auto"
          >
            <GlassButton
              href="/auth/register?role=farmer"
              variant="primary"
              className="text-white text-lg py-4 px-12 min-w-[260px] bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-2xl shadow-emerald-600/40 rounded-2xl group font-bold tracking-wide"
            >
              <Leaf className="w-5 h-5" />
              Start as Farmer
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </GlassButton>
            <GlassButton
              href="/auth/register?role=buyer"
              variant="outline"
              className="text-white text-lg py-4 px-12 min-w-[260px] bg-white/5 hover:bg-white/10 border border-white/15 hover:border-emerald-400/50 backdrop-blur-xl rounded-2xl group font-bold tracking-wide transition-all"
            >
              Join as Buyer
              <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </GlassButton>
          </motion.div>

          {/* Live Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mt-16"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
                <stat.icon className="w-5 h-5 text-emerald-400" />
                <div className="text-left">
                  <p className="text-xl font-display font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>

        </motion.div>
      </Container>
      
      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      >
        <span className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-1 h-14 rounded-full bg-gradient-to-b from-emerald-500 via-emerald-500/40 to-transparent"
        />
      </motion.div>

      {/* Hero Bottom Mask */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none z-[2]" />
    </section>
  );
}
