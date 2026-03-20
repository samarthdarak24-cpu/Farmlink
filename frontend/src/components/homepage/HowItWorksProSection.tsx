'use client';

import { motion } from 'framer-motion';
import {
  ShoppingCart,
  MessageSquare,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import Container from './Container';
import SectionHeading from './SectionHeading';

const steps = [
  {
    icon: ShoppingCart,
    step: '01',
    title: 'List Your Products',
    description: 'Create your farmer profile and list products with prices, quantity, and images. Showcase what you have to offer.',
    color: 'from-emerald-500 to-green-600',
  },
  {
    icon: Users,
    step: '02',
    title: 'Connect with Buyers',
    description: 'Receive inquiries from verified buyers. Review their profiles and build relationships directly.',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: MessageSquare,
    step: '03',
    title: 'Negotiate & Close Deals',
    description: 'Use real-time chat to negotiate prices and terms. Agree on delivery details and finalize orders.',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    icon: DollarSign,
    step: '04',
    title: 'Receive Secure Payment',
    description: 'Get payment directly through secure transactions. Track orders and build your business profile.',
    color: 'from-orange-500 to-red-600',
  },
];

import { Users } from 'lucide-react';

export default function HowItWorksProSection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-gray-950">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-500/5 via-transparent to-transparent pointer-events-none" />

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
            <SectionHeading title="Your Path to Success" />
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              Simple 4-step process to start selling and growing your agricultural business
            </p>
          </motion.div>

          {/* Steps */}
          <div className="relative">
            {/* Connecting line (hidden on mobile) */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500/30 to-transparent -translate-y-1/2" />

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    viewport={{ once: true }}
                    className="relative group"
                  >
                    {/* Card background */}
                    <div className="relative z-10 p-8 rounded-2xl border border-white/[0.08] group-hover:border-white/15 transition-all duration-500 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent hover:from-white/[0.05] hover:via-white/[0.02]">
                      {/* Glow effect */}
                      <div
                        className={`absolute -inset-10 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500 rounded-full`}
                      />

                      <div className="relative">
                        {/* Step number and icon */}
                        <div className="flex items-start justify-between mb-6">
                          <span className="text-5xl font-bold bg-gradient-to-br from-white/20 to-transparent bg-clip-text text-transparent">
                            {item.step}
                          </span>
                          <div
                            className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} p-0.5`}
                          >
                            <div className="w-full h-full bg-gray-950 rounded-[6px] flex items-center justify-center group-hover:bg-gray-900/50 transition-colors">
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary-100 transition-colors">
                          {item.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                          {item.description}
                        </p>

                        {/* Arrow (for desktop) */}
                        {index < steps.length - 1 && (
                          <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 translate-x-full">
                            <svg
                              className="w-8 h-8 text-primary-500/40 group-hover:text-primary-500/60 transition-colors"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
