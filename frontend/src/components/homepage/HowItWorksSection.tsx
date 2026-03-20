'use client';

import { motion } from 'framer-motion';
import { UserPlus, Search, Handshake } from 'lucide-react';
import Container from './Container';

const steps = [
  {
    icon: UserPlus,
    title: 'Register',
    description: 'Create your profile in 60 seconds. Tell us if you\'re buying or selling.',
  },
  {
    icon: Search,
    title: 'List or Search',
    description: 'Farmers upload their yield with photos. Buyers explore global inventories.',
  },
  {
    icon: Handshake,
    title: 'Connect & Trade',
    description: 'Use real-time chat to negotiate, confirm terms, and execute securely.',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-gray-950 relative overflow-hidden">
      <Container className="relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight"
          >
            How it works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-gray-400 text-lg sm:text-xl font-light"
          >
            Start trading directly around the world in three simple steps.
          </motion.p>
        </div>

        <div className="relative">
          {/* Desktop Connecting Line */}
          <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10" />
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            style={{ transformOrigin: 'left' }}
            className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-primary-500/50 via-primary-400/80 to-primary-500/50 -z-10" 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-6">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: 0.2 + idx * 0.2 }}
                  className="flex flex-col items-center text-center relative"
                >
                  <div className="w-[120px] h-[120px] rounded-full bg-gray-950 border-4 border-gray-900 flex items-center justify-center mb-8 relative z-10 shadow-2xl">
                    <div className="absolute inset-0 rounded-full bg-primary-500/10 animate-pulse-slow" />
                    <Icon className="w-10 h-10 text-primary-400 relative z-10" />
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm shadow-xl border-2 border-gray-950">
                      {idx + 1}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-display font-semibold text-white mb-4">
                    {s.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed max-w-sm px-4 font-light">
                    {s.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
