'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  Share2,
  ShieldCheck,
  Star,
  MapPin,
  MessageCircle,
  ShoppingCart,
  Truck,
  Package,
  CheckCircle,
  Leaf,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Mock product data for display
const product = {
  id: '1',
  name: 'Premium Alphonso Mangoes',
  category: 'Fruits',
  price: 140,
  unit: 'kg',
  minOrder: '10 kg',
  availableQty: '500 kg',
  quality: 'Grade A+',
  description: 'Hand-picked, naturally ripened Alphonso mangoes from the fertile orchards of Ratnagiri, Maharashtra. Known for their rich aroma, buttery texture, and unmatched sweetness. Organically grown without any chemical treatment.',
  images: [
    'https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1591073113125-e46713c829ed?q=80&w=800&auto=format&fit=crop',
  ],
  farmer: {
    name: 'Rajesh Orchards',
    location: 'Ratnagiri, Maharashtra',
    rating: 4.8,
    reviews: 124,
    verified: true,
    memberSince: '2022',
    totalSales: '2,500+',
  },
  certifications: ['Organic', 'FSSAI'],
  tags: ['Seasonal', 'Premium', 'Export Quality'],
};

const relatedProducts = [
  { id: '2', name: 'Organic Turmeric', price: '₹95/kg', image: 'https://images.unsplash.com/photo-1615486511484-92e172054db9?auto=format&fit=crop&q=80&w=400', farmer: 'Kerala Spices Co.' },
  { id: '3', name: 'Basmati Rice', price: '₹120/kg', image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&q=80&w=400', farmer: 'Punjab Agri Hub' },
  { id: '4', name: 'Fresh Tomatoes', price: '₹35/kg', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=400&auto=format&fit=crop', farmer: 'Nashik Farms' },
];

export default function ProductDetailPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(10);
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar isDark={false} setIsDark={() => {}} />

      <main className="flex-1 pt-20 pb-12">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/marketplace" className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Marketplace
            </Link>
            <span>/</span>
            <span>{product.category}</span>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-medium">{product.name}</span>
          </div>
        </div>

        {/* Product Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Main Image */}
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-[4/3] mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {product.certifications.map((cert) => (
                    <span key={cert} className="badge badge-primary text-xs px-2.5 py-1 bg-white/90 dark:bg-gray-900/90 text-emerald-700 dark:text-emerald-300 rounded-full font-semibold shadow-sm">
                      {cert}
                    </span>
                  ))}
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-md flex items-center justify-center hover:scale-110 transition-transform">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative rounded-xl overflow-hidden w-20 h-20 flex-shrink-0 border-2 transition-all ${
                      selectedImage === idx ? 'border-emerald-500 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col"
            >
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {product.tags.map((tag) => (
                  <span key={tag} className="badge badge-secondary text-xs px-2.5 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{product.farmer.rating}</span>
                  <span className="text-sm text-gray-500">({product.farmer.reviews} reviews)</span>
                </div>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="w-3.5 h-3.5" />
                  {product.farmer.location}
                </span>
              </div>

              {/* Price */}
              <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl p-5 mb-5">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">₹{product.price}</span>
                  <span className="text-gray-500">/ {product.unit}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>Min order: <strong>{product.minOrder}</strong></span>
                  <span>Available: <strong>{product.availableQty}</strong></span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
                {product.description}
              </p>

              {/* Quality */}
              <div className="flex items-center gap-2 mb-6">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Quality: {product.quality}</span>
              </div>

              {/* Quantity Selector & CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-bold"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-16 text-center py-3 border-x border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white font-semibold text-sm focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-bold"
                  >
                    +
                  </button>
                  <span className="px-3 text-sm text-gray-500">{product.unit}</span>
                </div>
                <button className="btn btn-primary flex-1 py-3.5">
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart — ₹{product.price * quantity}
                </button>
              </div>

              <button className="btn btn-outline w-full py-3.5 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 mb-6">
                <MessageCircle className="w-5 h-5" />
                Contact Seller
              </button>

              {/* Delivery Info */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <Truck className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Fast Delivery</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <Package className="w-5 h-5 text-teal-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Secure Pack</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <CheckCircle className="w-5 h-5 text-cyan-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Quality Check</p>
                </div>
              </div>

              {/* Seller Card */}
              <div className="mt-6 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Seller Information</h3>
                  {product.farmer.verified && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                    {product.farmer.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{product.farmer.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {product.farmer.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Member since {product.farmer.memberSince}</p>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{product.farmer.totalSales} sales</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Related Products */}
          <div className="mt-16">
            <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-6">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedProducts.map((p) => (
                <Link key={p.id} href={`/product/${p.id}`} className="card group hover:shadow-lg">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-emerald-600 transition-colors">{p.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">by {p.farmer}</p>
                  <p className="text-base font-bold text-emerald-600 mt-2">{p.price}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
