'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Leaf, TrendingUp, CheckCircle } from 'lucide-react';
import Container from './Container';

const benefits = [
  { icon: TrendingUp, text: '30-40% Better Prices', color: 'bg-emerald-500/15 text-emerald-400' },
  { icon: Leaf, text: 'Direct Market Access', color: 'bg-teal-500/15 text-teal-400' },
  { icon: CheckCircle, text: 'Secure Transactions', color: 'bg-cyan-500/15 text-cyan-400' },
];

export default function FinalCTASection() {
  return (
    <section className="relative section-padding overflow-hidden bg-gray-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -left-1/3 w-2/3 h-2/3 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
      </div>

      <Container>
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            {/* Main card */}
            <div className="relative rounded-3xl border border-white/[0.08] overflow-hidden">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 via-teal-600/5 to-transparent" />

              {/* Content */}
              <div className="relative p-10 sm:p-14 md:p-18 text-center">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-4 py-2 mb-7 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                >
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-100">Ready to Grow Your Farm Business?</span>
                </motion.div>

                {/* Heading */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  viewport={{ once: true }}
                  className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 leading-tight"
                >
                  Join{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                    ODOP Connect Today
                  </span>
                </motion.h2>

                {/* Subtext */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  viewport={{ once: true }}
                  className="text-base sm:text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
                >
                  Take control of your agricultural business. Connect with buyers, maximize profits, and build a thriving enterprise—all in one platform.
                </motion.p>

                {/* Benefits list */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  viewport={{ once: true }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
                >
                  {benefits.map((b) => (
                    <div key={b.text} className="flex items-center justify-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg ${b.color} flex items-center justify-center`}>
                        <b.icon className="w-4 h-4" />
                      </div>
                      <span className="text-gray-300 text-sm">{b.text}</span>
                    </div>
                  ))}
                </motion.div>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  viewport={{ once: true }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <a
                    href="/auth/register?role=farmer"
                    className="btn btn-primary text-base py-3.5 px-8 group"
                  >
                    <Leaf className="w-5 h-5" />
                    <span>Register as Farmer</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a
                    href="/auth/register?role=buyer"
                    className="btn btn-outline border-white/15 text-white hover:border-emerald-400/40 hover:bg-white/5 text-base py-3.5 px-8 group"
                  >
                    <span>Register as Buyer</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </motion.div>

                {/* Footer note */}
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  viewport={{ once: true }}
                  className="mt-7 text-sm text-gray-500"
                >
                  Free to join • No commission on first 5 transactions • Start trading immediately
                </motion.p>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
