'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Leaf, TrendingUp } from 'lucide-react';
import Container from './Container';

export default function FinalCTASection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-gray-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -left-1/3 w-2/3 h-2/3 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
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
            <div className="relative rounded-3xl border border-white/[0.1] overflow-hidden">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 via-emerald-600/5 to-transparent" />

              {/* Content */}
              <div className="relative p-12 md:p-20 text-center">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-emerald-500/10 border border-emerald-500/30"
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
                  className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
                >
                  Join{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400">
                    ODOP Connect Today
                  </span>
                </motion.h2>

                {/* Subtext */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  viewport={{ once: true }}
                  className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto"
                >
                  Take control of your agricultural business. Connect with buyers, maximize profits, and build a thriving enterprise—all in one platform.
                </motion.p>

                {/* Benefits list */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  viewport={{ once: true }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary-400" />
                    </div>
                    <span className="text-gray-300">30-40% Better Prices</span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-gray-300">Direct Market Access</span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-300">Secure Transactions</span>
                  </div>
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
                    className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-500 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 hover:translate-y-[-2px] group"
                  >
                    <Leaf className="w-5 h-5" />
                    <span>Register as Farmer</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a
                    href="/auth/register?role=buyer"
                    className="inline-flex items-center justify-center gap-2 px-10 py-4 border border-white/20 text-white font-semibold rounded-xl hover:border-primary-400/50 hover:bg-white/5 transition-all group"
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
                  className="mt-8 text-sm text-gray-400"
                >
                  Free to join • No commission on first 5 transactions • Verify your profile and start trading immediately
                </motion.p>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
