'use client';

import { motion } from 'framer-motion';
import { Sparkles, Users, MessageSquare, LineChart, ShieldCheck, Truck } from 'lucide-react';
import Container from './Container';

const features = [
  {
    icon: Sparkles,
    title: 'AI Product Grading',
    description: 'Instant quality assessment using computer vision to build trust automatically.',
    color: 'from-blue-500/20 to-blue-600/5',
    iconColor: 'text-blue-400',
  },
  {
    icon: Users,
    title: 'Smart Buyer Matching',
    description: 'Connect directly with the right buyers based on demand, distance, and volume needs.',
    color: 'from-primary-500/20 to-primary-600/5',
    iconColor: 'text-primary-400',
  },
  {
    icon: MessageSquare,
    title: 'Real-time Chat',
    description: 'Negotiate securely within the platform, complete with auto-translated messages.',
    color: 'from-purple-500/20 to-purple-600/5',
    iconColor: 'text-purple-400',
  },
  {
    icon: LineChart,
    title: 'Demand Forecasting',
    description: 'AI-driven insights to help you decide when to sell for the best market price.',
    color: 'from-amber-500/20 to-amber-600/5',
    iconColor: 'text-amber-400',
  },
  {
    icon: ShieldCheck,
    title: 'Blockchain Traceability',
    description: 'Immutable supply chain records. Prove provenance from seed to shelf securely.',
    color: 'from-emerald-500/20 to-emerald-600/5',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Truck,
    title: 'Logistics Support',
    description: 'Optimized routing and trusted partner networks to ensure your goods arrive fresh.',
    color: 'from-rose-500/20 to-rose-600/5',
    iconColor: 'text-rose-400',
  },
] as const;

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-32 overflow-hidden bg-gray-950">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-900/10 blur-[120px] rounded-full pointer-events-none" />

      <Container className="relative z-10">
        <div className="max-w-3xl mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-display font-bold text-white tracking-tight leading-[1.1]">
              A powerful suite of tools,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-600">designed for modern agriculture.</span>
            </h2>
            <p className="mt-8 text-gray-400 text-lg sm:text-xl font-light max-w-2xl leading-relaxed">
              We&apos;ve built the infrastructure for the next century of farming. Transparent, traceable, and incredibly efficient.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative"
              >
                {/* Glow effect on hover */}
                <div className={`absolute -inset-0.5 rounded-3xl bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
                
                <div className="relative h-full p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md overflow-hidden transition-all duration-300 group-hover:bg-white/[0.05] group-hover:border-white/20">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className={`w-7 h-7 ${f.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-display font-semibold text-white mb-3 tracking-tight">
                    {f.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed font-light">
                    {f.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
