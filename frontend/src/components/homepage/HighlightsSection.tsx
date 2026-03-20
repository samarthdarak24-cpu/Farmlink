'use client';

import { motion } from 'framer-motion';
import { Leaf, Cpu, Link as LinkIcon, Truck } from 'lucide-react';
import Container from './Container';

const highlights = [
  {
    icon: Leaf,
    title: 'Direct Trade',
    description: 'Bypass middlemen and connect farmers directly with verified buyers.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=800&auto=format&fit=crop'
  },
  {
    icon: Cpu,
    title: 'AI Intelligence',
    description: 'Real-time price predictions and deep quality assessments.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=800&auto=format&fit=crop' // Tractor/Drone/Tech feel
  },
  {
    icon: LinkIcon,
    title: 'Blockchain Security',
    description: 'Immutable smart contracts guaranteeing transparent payments.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    image: 'https://images.unsplash.com/photo-1639322537231-2f206e06af84?q=80&w=800&auto=format&fit=crop' // abstract blockchain tech
  },
  {
    icon: Truck,
    title: 'Seamless Protocol',
    description: 'End-to-end integrated logistics for fresh, fast delivery.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    image: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?q=80&w=800&auto=format&fit=crop' // Logistics/Transportation
  }
];

export default function HighlightsSection() {
  return (
    <section className="relative py-24 bg-gray-950 z-20">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-[3/4] shadow-2xl"
              >
                {/* Background Image Setup */}
                <div className="absolute inset-0 z-0">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                {/* Heavy dark gradient overlay for text legibility */}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-gray-950/95 via-gray-950/60 to-transparent" />
                
                <div className={`absolute -inset-2 opacity-0 group-hover:opacity-100 transition duration-500 blur-2xl z-20 ${item.bg} pointer-events-none`} />
                
                <div className="relative z-30 h-full flex flex-col justify-end p-6 sm:p-8">
                  <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.border} border backdrop-blur-md flex items-center justify-center mb-6`}>
                    <Icon className={`w-7 h-7 ${item.color}`} />
                  </div>
                  <h3 className="text-2xl font-display font-semibold text-white mb-3 leading-tight tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-gray-300 text-sm font-light leading-relaxed">
                    {item.description}
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
