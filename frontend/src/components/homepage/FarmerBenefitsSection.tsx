'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  ShieldCheck,
  Users,
  Zap,
  BarChart3,
  Leaf,
  MapPin,
  Clock,
} from 'lucide-react';
import Container from './Container';
import SectionHeading from './SectionHeading';

const benefits = [
  {
    icon: TrendingUp,
    title: 'Better Prices',
    description: 'Get 30-40% better prices by eliminating middlemen. Sell directly to verified buyers at competitive rates.',
    color: 'from-emerald-500 to-green-600',
  },
  {
    icon: Users,
    title: 'Verified Buyers',
    description: 'Access verified, vetted buyers across industries. Build long-term relationships with trusted partners.',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Transactions',
    description: 'All transactions are protected. Secure payment gateways and dispute resolution support included.',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    icon: Zap,
    title: 'Real-time Chat',
    description: 'Communicate directly with buyers. Live negotiations, instant confirmations, and order tracking.',
    color: 'from-orange-500 to-red-600',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track your sales, trends, and performance. Data-driven insights for better decision making.',
    color: 'from-pink-500 to-rose-600',
  },
  {
    icon: MapPin,
    title: 'Wide Market Reach',
    description: 'Expand beyond your local market. Connect with buyers nationwide and internationally.',
    color: 'from-teal-500 to-blue-600',
  },
];

export default function FarmerBenefitsSection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-gray-950">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 via-transparent to-transparent pointer-events-none" />

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
            <SectionHeading title="Why Farmers Choose ODOP Connect" />
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              Empowering farmers with tools, connections, and opportunities to grow their business and maximize profits.
            </p>
          </motion.div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative"
                >
                  {/* Card background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 group-hover:border-white/20 transition-all duration-500 opacity-0 group-hover:opacity-100" />

                  {/* Content */}
                  <div className="relative p-8 h-full flex flex-col rounded-2xl border border-white/[0.05] group-hover:border-white/10 transition-all duration-500 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent hover:from-white/[0.05] hover:via-white/[0.02] hover:to-transparent">
                    {/* Icon background glow */}
                    <div
                      className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500`}
                    />

                    {/* Icon */}
                    <div className="relative mb-6">
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${benefit.color} p-0.5`}
                      >
                        <div className="w-full h-full bg-gray-950 rounded-[10px] flex items-center justify-center group-hover:bg-gray-900/50 transition-colors">
                          <Icon className="w-7 h-7 text-white fill-white/20" />
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary-100 transition-colors">
                      {benefit.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-400 text-sm leading-relaxed flex-grow group-hover:text-gray-300 transition-colors">
                      {benefit.description}
                    </p>

                    {/* Arrow indicator */}
                    <div className="mt-6 flex items-center text-primary-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Learn more</span>
                      <svg
                        className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
