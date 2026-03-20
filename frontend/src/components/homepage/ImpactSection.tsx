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
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: MapPin,
    number: '18',
    label: 'States Covered',
    description: 'Pan-India presence',
    color: 'from-teal-500 to-cyan-600',
  },
  {
    icon: TrendingUp,
    number: '₹50 Cr+',
    label: 'Transaction Value',
    description: 'Total annual marketplace value',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: Award,
    number: '10,000+',
    label: 'Daily Connections',
    description: 'Farmer-buyer interactions',
    color: 'from-violet-500 to-purple-600',
  },
];

export default function ImpactSection() {
  return (
    <section className="relative section-padding overflow-hidden bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-teal-500/5 rounded-full blur-3xl" />
      </div>

      <Container>
        <div className="relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
              Real Impact,{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Real Growth
              </span>
            </h2>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
              Trusted by thousands of farmers across India. Growing every day.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  {/* Card */}
                  <div className="relative p-7 rounded-2xl border border-white/[0.06] group-hover:border-emerald-500/20 transition-all duration-500 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent hover:from-white/[0.05] hover:via-white/[0.02]">
                    {/* Glow effect */}
                    <div
                      className={`absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`}
                    />

                    {/* Content */}
                    <div className="relative">
                      {/* Icon */}
                      <div className="mb-5">
                        <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${stat.color} p-0.5`}>
                          <div className="w-full h-full bg-gray-950 rounded-[6px] flex items-center justify-center group-hover:bg-gray-900/50 transition-colors">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Number */}
                      <h3 className="text-3xl lg:text-4xl font-bold text-white mb-1 group-hover:text-emerald-100 transition-colors">
                        {stat.number}
                      </h3>

                      {/* Label */}
                      <h4 className="text-base font-semibold text-gray-200 mb-1.5 group-hover:text-emerald-100 transition-colors">
                        {stat.label}
                      </h4>

                      {/* Description */}
                      <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
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
            className="mt-16 text-center"
          >
            <p className="text-gray-400 mb-5">
              Join thousands of farmers transforming their business
            </p>
            <a
              href="/auth/register?role=farmer"
              className="btn btn-primary text-base py-3.5 px-8"
            >
              <span>Become a Member</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
