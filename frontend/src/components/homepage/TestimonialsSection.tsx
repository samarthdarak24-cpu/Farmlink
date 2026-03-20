'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import Container from './Container';

const testimonials = [
  {
    name: 'Asha Sharma',
    role: 'Smallholder Farmer',
    quote: "ODOP Connect helped me list my harvest with clear specs. Buyers respond faster, and the pricing feels fair because the platform explains the market trends.",
    image: 'https://images.unsplash.com/photo-1579294246067-2f3b6d267104?q=80&w=200&auto=format&fit=crop',
  },
  {
    name: 'Miguel Rodriguez',
    role: 'Procurement Buyer',
    quote: "The traceability and batch details are exactly what we need. We can verify quality signals before we commit—and disputes have dropped to almost zero.",
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop',
  },
  {
    name: 'Priya Desai',
    role: 'Agri-business Partner',
    quote: "We finally have a secure workflow for trade. It's incredibly smooth for both sides, and the marketplace matching algorithm is genuinely efficient.",
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
  },
] as const;

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative section-padding bg-gray-950 overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-900/10 blur-[150px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-900/10 blur-[150px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/3" />

      <Container className="relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight"
          >
            Loved by the community
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-5 text-gray-400 text-base sm:text-lg font-light leading-relaxed"
          >
            Real feedback from farmers and buyers using ODOP Connect to trade with confidence.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: idx * 0.12, type: 'spring', stiffness: 100 }}
              className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-7 lg:p-8 relative group hover:bg-white/[0.05] hover:border-white/15 transition-all duration-300"
            >
              <Quote className="absolute top-7 right-7 w-10 h-10 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors duration-500" />

              <p className="text-gray-300 leading-relaxed font-light text-base mb-7 relative z-10">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3.5 mt-auto pt-5 border-t border-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500 border-2 border-emerald-500/20"
                />
                <div className="min-w-0">
                  <p className="font-display font-bold text-white text-sm truncate">
                    {t.name}
                  </p>
                  <p className="text-xs text-emerald-400 font-medium truncate uppercase tracking-widest mt-0.5">
                    {t.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
