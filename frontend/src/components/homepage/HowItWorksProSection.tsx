'use client';

import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Users,
  MessageSquare,
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
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Users,
    step: '02',
    title: 'Connect with Buyers',
    description: 'Receive inquiries from verified buyers. Review their profiles and build relationships directly.',
    color: 'from-teal-500 to-cyan-600',
  },
  {
    icon: MessageSquare,
    step: '03',
    title: 'Negotiate & Close Deals',
    description: 'Use real-time chat to negotiate prices and terms. Agree on delivery details and finalize orders.',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    icon: DollarSign,
    step: '04',
    title: 'Receive Secure Payment',
    description: 'Get payment directly through secure transactions. Track orders and build your business profile.',
    color: 'from-amber-500 to-orange-600',
  },
];

export default function HowItWorksProSection() {
  return (
    <section className="relative section-padding overflow-hidden bg-gray-950">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

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
            <SectionHeading title="Your Path to Success" />
            <p className="mt-5 text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Simple 4-step process to start selling and growing your agricultural business
            </p>
          </motion.div>

          {/* Steps */}
          <div className="relative">
            {/* Connecting line (hidden on mobile/tablet) */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent -translate-y-1/2" />

            {/* Vertical connecting line (visible on mobile, hidden on lg) */}
            <div className="lg:hidden absolute top-0 bottom-0 left-6 md:left-8 w-px bg-gradient-to-b from-emerald-500/20 via-emerald-500/10 to-transparent" />

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.12 }}
                    viewport={{ once: true }}
                    className="relative group"
                  >
                    {/* Card */}
                    <div className="relative z-10 p-7 rounded-2xl border border-white/[0.06] group-hover:border-white/15 transition-all duration-500 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent hover:from-white/[0.05] hover:via-white/[0.02]">
                      {/* Glow effect */}
                      <div
                        className={`absolute -inset-8 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-[0.06] blur-3xl transition-opacity duration-500 rounded-full`}
                      />

                      <div className="relative">
                        {/* Step number and icon */}
                        <div className="flex items-start justify-between mb-5">
                          <span className="text-4xl font-bold text-white/10 font-display">
                            {item.step}
                          </span>
                          <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${item.color} p-0.5`}>
                            <div className="w-full h-full bg-gray-950 rounded-[6px] flex items-center justify-center group-hover:bg-gray-900/50 transition-colors">
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-100 transition-colors">
                          {item.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                          {item.description}
                        </p>
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
