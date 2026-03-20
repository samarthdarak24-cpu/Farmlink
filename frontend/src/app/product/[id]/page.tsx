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
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { productsApi, buyerCartApi } from '@/lib/api';
import { useAuthZustand } from '@/store/authZustand';

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
    // Navigate to dashboard chat pointing to farmer
    router.push(`/dashboard/${user.role}?chat=${product.farmerId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Navbar isDark={false} setIsDark={() => {}} />
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Navbar isDark={false} setIsDark={() => {}} />
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{error || "The product you're looking for doesn't exist."}</p>
          <button onClick={() => router.back()} className="btn btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <Navbar isDark={false} setIsDark={() => {}} />

      <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-0">
            {/* Image Gallery */}
            <div className="lg:col-span-2 bg-gray-100 dark:bg-gray-900 p-8 flex flex-col items-center justify-center min-h-[400px]">
              {product.images && product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-auto max-h-[500px] object-contain rounded-xl"
                />
              ) : (
                <div className="text-9xl">🥬</div>
              )}
            </div>

            {/* Product Info */}
            <div className="lg:col-span-3 p-8 lg:p-12">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex gap-2 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                      {product.category}
                    </span>
                    {product.isActive ? (
                      <span className="text-xs font-semibold uppercase tracking-wider text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-xs font-semibold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white mb-2">
                    {product.name}
                  </h1>
                </div>
                <button className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Heart className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                    {(product.farmerName || 'F').charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {product.farmerName || 'Farmer'}
                  </span>
                </div>
                {product.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {product.location}
                  </div>
                )}
                {product.qualityGrade && (
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-secondary-500" />
                    Quality: {product.qualityGrade}%
                  </div>
                )}
              </div>

              <div className="mb-8">
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${product.price}
                  </span>
                  <span className="text-lg text-gray-500 mb-1">/{product.unit}</span>
                </div>
                {product.aiPriceSuggestion && product.aiPriceSuggestion !== product.price && (
                  <div className="flex items-center gap-2 text-sm text-secondary-600 bg-secondary-50 dark:bg-secondary-900/30 w-max px-3 py-1.5 rounded-lg border border-secondary-100 dark:border-secondary-800">
                    <Sparkles className="w-4 h-4" />
                    <span>AI suggests ${product.aiPriceSuggestion} / {product.unit}</span>
                  </div>
                )}
              </div>

              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                <p>{product.description || 'No description provided by the farmer for this product.'}</p>
              </div>

              {product.certifications && product.certifications.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.certifications.map((cert: string) => (
                      <span key={cert} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                        <Award className="w-4 h-4 text-green-600" />
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-8 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 w-max">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white text-xl px-2"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-16 text-center bg-transparent border-none focus:ring-0 text-lg font-medium text-gray-900 dark:text-white hide-arrows"
                    title="Quantity"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                    className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white text-xl px-2"
                  >
                    +
                  </button>
                </div>
                
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.quantity <= 0 || !product.isActive}
                  className="flex-1 btn btn-primary py-4 text-lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                
                <button
                  onClick={handleContactFarmer}
                  className="sm:w-auto btn btn-outline py-4"
                  title="Contact Farmer"
                >
                  <MessageCircle className="w-5 h-5 mx-auto" />
                </button>
              </div>

              <p className="mt-4 text-sm text-gray-500 text-center sm:text-left">
                Available stock: <span className="font-semibold text-gray-900 dark:text-white">{product.quantity} {product.unit}</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
