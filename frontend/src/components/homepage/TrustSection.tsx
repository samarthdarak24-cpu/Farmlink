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

const trustStats = [
  { value: '99.9%', label: 'Transaction Success Rate' },
  { value: '₹0', label: 'Fraud Claims' },
  { value: '24/7', label: 'Support Available' },
];

export default function TrustSection() {
  return (
    <section className="relative section-padding overflow-hidden bg-gradient-to-b from-gray-950 to-gray-950">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-teal-500/5" />
      </div>

      <Container>
        <div className="relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto mb-16 text-center"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
              Built on Trust &{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Security
              </span>
            </h2>
            <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
              Your safety is our priority. We implement industry-leading security measures and verification processes to ensure every transaction is protected.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trustFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative"
                >
                  {/* Card */}
                  <div className="p-7 rounded-2xl border border-white/[0.06] group-hover:border-white/15 transition-all duration-500 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent hover:from-white/[0.05] hover:via-white/[0.02]">
                    {/* Corner accent */}
                    <div className="absolute top-0 left-0 w-1 h-10 bg-gradient-to-b from-emerald-500 to-transparent rounded-r opacity-0 group-hover:opacity-100 transition-all duration-500" />

                    {/* Icon */}
                    <div className="mb-5">
                      <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5">
                        <div className="w-full h-full bg-gray-950 rounded-[6px] flex items-center justify-center group-hover:bg-gray-900/50 transition-colors">
                          <Icon className="w-5 h-5 text-emerald-300" />
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-100 transition-colors">
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
            className="mt-14 p-8 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] via-transparent to-transparent"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              {trustStats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-1.5">{stat.value}</div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
