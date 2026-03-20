'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Lock, Users, BarChart3 } from 'lucide-react';
import Container from './Container';

const trustFeatures = [
  {
    icon: Lock,
    title: 'Secure Payments',
    description: 'End-to-end encrypted transactions with buyer protection and verified payment methods.',
  },
  {
    icon: Users,
    title: 'Verified Profiles',
    description: 'All buyers undergo KYC verification. Build trust with vetted business partners.',
  },
  {
    icon: BarChart3,
    title: 'Transaction History',
    description: 'Complete audit trail of all transactions. Track orders, payments, and performance metrics.',
  },
  {
    icon: CheckCircle,
    title: '24/7 Support',
    description: 'Round-the-clock customer support to resolve disputes and ensure smooth operations.',
  },
];

export default function TrustSection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-gradient-to-b from-gray-950 to-gray-950">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 via-transparent to-emerald-500/5" />
      </div>

      <Container>
        <div className="relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Built on Trust & <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400">Security</span>
            </h2>
            <p className="text-lg text-gray-300">
              Your safety is our priority. We implement industry-leading security measures and verification processes to ensure every transaction is protected.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {trustFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative"
                >
                  {/* Card */}
                  <div className="p-8 rounded-2xl border border-white/[0.08] group-hover:border-white/15 transition-all duration-500 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent hover:from-white/[0.05] hover:via-white/[0.02]">
                    {/* Corner accent */}
                    <div className="absolute top-0 left-0 w-1 h-12 bg-gradient-to-b from-primary-500 to-transparent rounded-r opacity-0 group-hover:opacity-100 transition-all duration-500" />

                    {/* Icon */}
                    <div className="mb-6">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-emerald-600 p-0.5">
                        <div className="w-full h-full bg-gray-950 rounded-[6px] flex items-center justify-center group-hover:bg-gray-900/50 transition-colors">
                          <Icon className="w-6 h-6 text-primary-300" />
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary-100 transition-colors">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-20 p-8 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] via-transparent to-transparent"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary-400 mb-2">99.9%</div>
                <p className="text-gray-400">Transaction Success Rate</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-400 mb-2">₹0</div>
                <p className="text-gray-400">Fraud Claims</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-400 mb-2">24/7</div>
                <p className="text-gray-400">Support Available</p>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
