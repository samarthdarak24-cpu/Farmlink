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

const trustPoints = [
  'Verified Buyers',
  'AI Fair Pricing',
  'Blockchain Tracked',
  'Secure Payments',
];

export default function HeroSection() {
  return (
    <section id="top" className="relative flex items-center justify-center min-h-[100svh] overflow-hidden pt-16 selection:bg-emerald-500/30">
      {/* Background YouTube video — aerial farm footage */}
      <YouTubeBackground
        videoId="aqz-KE-bpKQ"
        overlayOpacity={0.55}
        fallbackImage="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop"
        className="brightness-[0.5] contrast-[1.2] saturate-[1.3]"
      />

      {/* Gradient overlays */}
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
            className="inline-flex items-center gap-2.5 px-5 py-2.5 mt-8 mb-10 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl shadow-emerald-900/10"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-gray-200 uppercase tracking-[0.12em]">
              AI-Powered Agricultural Marketplace
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-white font-display font-extrabold tracking-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[1.05] mb-6"
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
            className="text-gray-300 text-base sm:text-lg md:text-xl max-w-2xl font-light leading-relaxed mb-8"
          >
            India&apos;s most advanced platform connecting farmers directly to verified buyers.
            AI-powered pricing, blockchain traceability, and real-time negotiations.
          </motion.p>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mb-10 text-sm text-gray-300"
          >
            {trustPoints.map((point) => (
              <div key={point} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto"
          >
            <GlassButton
              href="/auth/register?role=farmer"
              variant="primary"
              className="text-white text-base py-4 px-10 min-w-[240px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-xl shadow-emerald-600/30 rounded-2xl group font-bold"
            >
              <Leaf className="w-5 h-5" />
              Start as Farmer
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </GlassButton>
            <GlassButton
              href="/auth/register?role=buyer"
              variant="outline"
              className="text-white text-base py-4 px-10 min-w-[240px] bg-white/5 hover:bg-white/10 border border-white/15 hover:border-emerald-400/40 backdrop-blur-xl rounded-2xl group font-bold transition-all"
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
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-14"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-colors">
                <stat.icon className="w-5 h-5 text-emerald-400" />
                <div className="text-left">
                  <p className="text-lg font-display font-bold text-white leading-tight">{stat.value}</p>
                  <p className="text-[11px] text-gray-400 font-medium">{stat.label}</p>
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
          className="w-1 h-12 rounded-full bg-gradient-to-b from-emerald-500 via-emerald-500/40 to-transparent"
        />
      </motion.div>

      {/* Hero Bottom Mask */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none z-[2]" />
    </section>
  );
}
