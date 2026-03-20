'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Star,
  ShoppingCart,
  Heart,
  Award,
  Sparkles,
  MessageCircle,
  Truck,
  Package,
  CheckCircle,
  Share2,
  ShieldCheck,
  ChevronRight,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { productsApi, buyerCartApi } from '@/lib/api';
import { useAuthZustand } from '@/store/authZustand';
import Link from 'next/link';

export default function ProductDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };
  const { user } = useAuthZustand();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const res = await productsApi.getById(id);
        setProduct(res.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add to cart');
      router.push('/auth/login');
      return;
    }
    if (user.role !== 'buyer') {
      toast.error('Only buyers can add items to cart');
      return;
    }
    setAddingToCart(true);
    try {
      await buyerCartApi.addItem(id, quantity);
      toast.success('Added to cart successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleContactFarmer = () => {
    if (!user) {
      toast.error('Please login to contact the farmer');
      router.push('/auth/login');
      return;
    }
    router.push(`/dashboard/${user.role}?chat=${product.farmerId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center">
        <Navbar isDark={false} setIsDark={() => {}} />
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center px-4">
        <Navbar isDark={false} setIsDark={() => {}} />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <X className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Product Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{error || "The product you're looking for doesn't exist or has been removed."}</p>
          <button onClick={() => router.back()} className="btn btn-primary w-full py-4 text-lg">
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-4"
            >
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
                {product.images?.[selectedImage] ? (
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                    🥬
                  </div>
                )}
                
                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {(product.certifications || []).map((cert: string) => (
                    <span key={cert} className="bg-white/90 dark:bg-gray-900/90 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-sm border border-emerald-100/20">
                      {cert}
                    </span>
                  ))}
                </div>

                <div className="absolute top-4 right-4 flex gap-2">
                   <button className="w-10 h-10 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:scale-110 transition-transform">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:scale-110 transition-transform">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {product.images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                        selectedImage === idx ? 'border-emerald-500 shadow-lg scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Content Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <div className="flex items-center gap-2 mb-4">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800">
                  {product.category}
                </span>
                {product.isActive ? (
                  <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-600 bg-cyan-50 dark:bg-cyan-900/30 px-3 py-1.5 rounded-lg border border-cyan-100 dark:border-cyan-800">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                    Available Now
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-800">
                    Sold Out
                  </span>
                )}
              </div>

              <h1 className="text-4xl sm:text-5xl font-display font-black text-gray-900 dark:text-white mb-4 leading-tight">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black shadow-lg">
                    {product.farmerName?.[0]?.toUpperCase() || 'F'}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium leading-none mb-1">Produced by</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                      {product.farmerName || 'Verified Farmer'}
                    </p>
                  </div>
                </div>

                <div className="w-px h-8 bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.farmerRatingAvg || 4.5) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{product.farmerRatingAvg || '4.5'}</span>
                </div>

                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  {product.location}
                </div>
              </div>

              {/* Price Card */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 mb-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                   <Sparkles className="w-24 h-24" />
                </div>
                
                <div className="relative">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-black text-gray-900 dark:text-white">₹{product.price}</span>
                    <span className="text-xl text-gray-500 font-medium">/ {product.unit}</span>
                  </div>
                  
                  {product.aiPriceSuggestion && product.aiPriceSuggestion !== product.price && (
                    <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-800 mt-2">
                      <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        AI Recommended Price: ₹{product.aiPriceSuggestion}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Min Order: 1 {product.unit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Stock: {product.quantity} {product.unit}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Product Description</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
                  {product.description || 'This premium agricultural product is verified for quality and sustainably sourced. Features rich nutritional value and peak freshness, harvested direct from verified farms on the ODOP Connect platform.'}
                </p>
              </div>

              {/* Action Section */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-2xl p-1.5 border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:bg-white dark:hover:bg-gray-700 transition-all font-bold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-16 bg-transparent text-center font-bold text-gray-900 dark:text-white outline-none"
                    title="Quantity"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:bg-white dark:hover:bg-gray-700 transition-all font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.quantity <= 0 || !product.isActive}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {addingToCart ? 'Syncing...' : `Add to Cart — ₹${(product.price * quantity).toLocaleString()}`}
                </button>

                <button
                  onClick={handleContactFarmer}
                  className="p-4 rounded-2xl border-2 border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
                  title="Contact Farmer"
                >
                  <MessageCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/20">
                  <Truck className="w-5 h-5 text-blue-500 mb-2" />
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Fast Shipping</span>
                </div>
                <div className="flex flex-col items-center p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-900/20">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 mb-2" />
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Verified Quality</span>
                </div>
                <div className="flex flex-col items-center p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-900/20">
                  <Award className="w-5 h-5 text-amber-500 mb-2" />
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">ODOP Certified</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
