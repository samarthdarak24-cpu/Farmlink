'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-sm">
          <Link href="/marketplace" className="text-emerald-600 hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-50 dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800">
                {product.images?.[selectedImage] ? (
                   <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">🥬</div>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-emerald-600 font-bold uppercase tracking-widest text-xs mb-2">
                {product.category}
              </span>
              <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold">
                    {product.farmerName?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{product.farmerName || 'Verified Farmer'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  {product.location}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 mb-8">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-black text-gray-900 dark:text-white">₹{product.price}</span>
                  <span className="text-lg text-gray-500">/ {product.unit}</span>
                </div>
                
                {product.aiPriceSuggestion && product.aiPriceSuggestion !== product.price && (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-800">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    AI Suggests: ₹{product.aiPriceSuggestion}
                  </div>
                )}
              </div>

              <div className="prose dark:prose-invert max-w-none mb-8">
                 <h3 className="text-lg font-bold mb-2">Description</h3>
                 <p className="text-gray-600 dark:text-gray-400">
                   {product.description || 'Premium quality agricultural produce. Direct from farm to buyer.'}
                 </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-2xl p-1">
                   <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center">-</button>
                   <input type="number" value={quantity} readOnly className="w-12 text-center bg-transparent font-bold" title="Quantity" />
                   <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center">+</button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || !product.isActive}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20"
                >
                  Add to Cart — ₹{product.price * quantity}
                </button>
                <button onClick={handleContactFarmer} className="p-4 rounded-2xl border-2 border-emerald-100 text-emerald-600">
                   <MessageCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
