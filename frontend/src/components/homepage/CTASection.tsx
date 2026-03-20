'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Globe, Zap } from 'lucide-react';
import Container from './Container';
import GlassButton from './GlassButton';
import YouTubeBackground from './YouTubeBackground';

export default function CTASection() {
  return (
    <section className="relative flex items-center justify-center min-h-[80svh] overflow-hidden group/cta selection:bg-primary-500/30">
      <YouTubeBackground 
        videoId="vCI2kmFJD_w" 
        overlayOpacity={0.8}
        fallbackImage="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop"
        className="brightness-[0.6] contrast-[1.1]"
      />

      <Container className="relative z-10 text-center py-24 sm:py-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center max-w-4xl mx-auto"
        >
          {/* Subtle Glow Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-primary-500/10 blur-[150px] -z-10 rounded-full" />

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="w-20 h-20 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 flex items-center justify-center mb-10 shadow-3xl group hover:scale-110 transition-transform duration-500 shadow-primary-500/10"
          >
            <Globe className="w-10 h-10 text-primary-400 group-hover:rotate-12 transition-transform duration-500" />
          </motion.div>
          
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-display font-bold text-white tracking-tight leading-[1.05] mb-8">
            The next generation of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-emerald-400 to-primary-600">
              agricultural trade.
            </span>
          </h2>
          
          <p className="text-gray-300 text-lg sm:text-xl md:text-2xl font-light mb-14 max-w-3xl leading-relaxed">
            Eliminate intermediaries. Secure your payments. Scale your business globally with India&apos;s most trusted agri-tech network.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center w-full sm:w-auto">
            <GlassButton
              href="/auth/register"
              variant="primary"
              className="text-white text-lg py-5 px-10 min-w-[240px] rounded-2xl bg-primary-600 hover:bg-primary-500 shadow-2xl shadow-primary-600/30 group"
            >
              Get Started Now
              <Zap className="w-5 h-5 ml-1 fill-white/20" />
            </GlassButton>
            <GlassButton
              href="/marketplace"
              variant="outline"
              className="text-white text-lg py-5 px-10 min-w-[240px] rounded-2xl border-white/20 hover:bg-white/10 hover:border-white/30 backdrop-blur-xl group"
            >
              Explore Products
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </GlassButton>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-16 flex items-center gap-8 justify-center opacity-40 grayscale pointer-events-none"
          >
            <span className="text-xs uppercase tracking-[0.4em] font-bold text-white">Verified by Tier-1 Logistics</span>
          </motion.div>
        </motion.div>
      </Container>
      
      {/* Top transition mask */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-gray-950 to-transparent pointer-events-none" />
      {/* Bottom transition mask */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none" />
    </section>
  );
}
