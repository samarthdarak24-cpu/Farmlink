'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Leaf, ShieldCheck, Tag } from 'lucide-react';
import Container from './Container';
import GlassButton from './GlassButton';

const showcaseProducts = [
  {
    id: 1,
    name: 'Premium Alphonso Mangoes',
    category: 'Fruits',
    price: '₹140 / kg',
    quality: 'Grade A+',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=800&auto=format&fit=crop',
    farmer: 'Rajesh Orchards',
  },
  {
    id: 2,
    name: 'Organic Turmeric Finger',
    category: 'Spices',
    price: '₹95 / kg',
    quality: 'Grade A',
    image: 'https://images.unsplash.com/photo-1615486511484-92e172054db9?auto=format&fit=crop&q=80&w=800',
    farmer: 'Kerala Spices Co.',
  },
  {
    id: 3,
    name: 'Export Quality Basmati Rice',
    category: 'Grains',
    price: '₹120 / kg',
    quality: 'Grade A',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&q=80&w=800',
    farmer: 'Punjab Agri Hub',
  },
  {
    id: 4,
    name: 'Fresh Red Tomatoes',
    category: 'Vegetables',
    price: '₹35 / kg',
    quality: 'Grade B+',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=800&auto=format&fit=crop',
    farmer: 'Nashik Farms',
  },
] as const;

export default function ProductShowcaseSection() {
  return (
    <section id="products" className="py-24 sm:py-32 bg-gray-950 relative overflow-hidden">
      <Container className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight"
            >
              Direct from the source
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-gray-400 text-lg sm:text-xl font-light"
            >
              Sample our marketplace. Every batch is graded by AI and tracked on-chain for complete transparency.
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GlassButton
              href="/marketplace"
              variant="outline"
              className="text-white hover:bg-white/5 border-white/20 whitespace-nowrap"
            >
              Explore Market
              <ArrowRight className="w-4 h-4" />
            </GlassButton>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {showcaseProducts.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden hover:bg-white/[0.04] transition-colors duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80 z-10" />
              
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={p.image} 
                  alt={p.name} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                
                {/* Quality Badge */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-gray-950/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full shadow-lg">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary-400" />
                  <span className="text-xs font-bold text-white tracking-wide uppercase">{p.quality}</span>
                </div>
              </div>

              <div className="relative z-20 p-6 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <Leaf className="w-3 h-3 text-primary-500" />
                  {p.category}
                </div>
                
                <h3 className="text-lg font-display font-semibold text-white tracking-tight leading-snug">
                  {p.name}
                </h3>
                
                <p className="text-sm text-gray-500 font-light truncate">
                  By {p.farmer}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-primary-400 font-bold text-xl tracking-tight flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-primary-500/70" />
                    {p.price}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
