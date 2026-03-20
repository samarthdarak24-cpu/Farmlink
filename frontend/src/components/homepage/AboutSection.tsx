'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Globe, Layers, Zap } from 'lucide-react';
import Container from './Container';
import GlassButton from './GlassButton';

export default function AboutSection() {
  return (
    <section id="about" className="py-24 sm:py-32 bg-gray-950 overflow-hidden relative border-t border-white/5">
      <Container>
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          
          {/* Left: Image */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-1/2 relative"
          >
            {/* Image Container with Apple-style rounded corners & shadow */}
            <div className="relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent z-10" />
              {/* Note: using a reliable nature/farmer themed image placeholder */}
              <img 
                src="https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?q=80&w=1600&auto=format&fit=crop" 
                alt="Rural farm" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
              />
              
              {/* Floating Stat Card */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute bottom-8 left-8 right-8 z-20 glass-card bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl flex items-center gap-4 shadow-xl"
              >
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center shrink-0">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-display font-medium text-lg lg:text-xl leading-tight">10,000+ Farmers verified</p>
                  <p className="text-primary-300 text-sm mt-1">Trading securely</p>
                </div>
              </motion.div>
            </div>
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary-900/20 blur-[100px] rounded-full -z-10 pointer-events-none" />
          </motion.div>

          {/* Right: Text */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-1/2 flex flex-col items-start text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border border-primary-500/30 bg-primary-500/10 text-primary-400 text-sm font-semibold tracking-wide uppercase">
              <Zap className="w-4 h-4 fill-primary-400" />
              Our Mission
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight leading-[1.1] mb-8">
              Empowering rural India through technology
            </h2>
            
            <p className="text-gray-400 text-lg sm:text-xl font-light leading-relaxed mb-10 max-w-2xl">
              By eliminating intermediaries and automating the trust process through AI and blockchain, we are giving control back to the producers. Experience a platform where quality dictates value, and payment is always secure.
            </p>

            <ul className="space-y-6 mb-12">
              <li className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary-500" />
                </div>
                <p className="text-gray-300 font-light text-lg">Direct access to commercial bulk buyers nationwide</p>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary-500" />
                </div>
                <p className="text-gray-300 font-light text-lg">Traceable, fraud-resistant smart contracts</p>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary-500" />
                </div>
                <p className="text-gray-300 font-light text-lg">Transparent pricing informed by global market trends</p>
              </li>
            </ul>

            <GlassButton
              href="/about"
              variant="outline"
              className="px-8 py-4 text-white hover:bg-white/5 border-white/20"
            >
              Read our story
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlassButton>
          </motion.div>

        </div>
      </Container>
    </section>
  );
}
