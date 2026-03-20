'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Users, MapPin, Award } from 'lucide-react';
import Container from './Container';

const stats = [
  {
    icon: Users,
    number: '5000+',
    label: 'Farmers Connected',
    description: 'Active farmers on the platform',
    color: 'from-emerald-500 to-green-600',
  },
  {
    icon: MapPin,
    number: '18',
    label: 'States Covered',
    description: 'Pan-India presence',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: TrendingUp,
    number: '₹50 Cr+',
    label: 'Transaction Value',
    description: 'Total annual marketplace value',
    color: 'from-orange-500 to-red-600',
  },
  {
    icon: Award,
    number: '10,000+',
    label: 'Daily Connections',
    description: 'Farmer-buyer interactions',
    color: 'from-purple-500 to-indigo-600',
  },
];

export default function ImpactSection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <Container>
        <div className="relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-20 text-center"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Real Impact,{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-primary-400 bg-clip-text text-transparent">
                Real Growth
              </span>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Trusted by thousands of farmers across India. Growing every day.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative"
                >
                  {/* Animated border */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Card */}
                  <div className="relative p-8 rounded-2xl border border-white/[0.08] group-hover:border-primary-500/30 transition-all duration-500 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent hover:from-white/[0.05] hover:via-white/[0.02]">
                    {/* Glow effect */}
                    <div
                      className={`absolute -top-12 -right-12 w-28 h-28 rounded-full bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-15 blur-3xl transition-opacity duration-500`}
                    />

                    {/* Content */}
                    <div className="relative">
                      {/* Icon */}
                      <div className="mb-6">
                        <div
                          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} p-0.5`}
                        >
                          <div className="w-full h-full bg-gray-950 rounded-[6px] flex items-center justify-center group-hover:bg-gray-900/50 transition-colors">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Number */}
                      <div className="mb-2">
                        <h3 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent group-hover:from-primary-200 group-hover:to-emerald-200 transition-all">
                          {stat.number}
                        </h3>
                      </div>

                      {/* Label */}
                      <h4 className="text-lg font-semibold text-gray-100 mb-2 group-hover:text-primary-100 transition-colors">
                        {stat.label}
                      </h4>

                      {/* Description */}
                      <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                        {stat.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <p className="text-gray-300 mb-6">
              Join thousands of farmers transforming their business
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/auth/register?role=farmer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-500 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50"
              >
                <span>Become a Member</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
