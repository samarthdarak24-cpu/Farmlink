'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Truck,
  CreditCard,
  Tag,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface CartItem {
  id: string;
  name: string;
  farmer: string;
  price: number;
  unit: string;
  quantity: number;
  image: string;
}

const initialCartItems: CartItem[] = [
  {
    id: '1',
    name: 'Premium Alphonso Mangoes',
    farmer: 'Rajesh Orchards',
    price: 140,
    unit: 'kg',
    quantity: 10,
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '2',
    name: 'Organic Turmeric Finger',
    farmer: 'Kerala Spices Co.',
    price: 95,
    unit: 'kg',
    quantity: 5,
    image: 'https://images.unsplash.com/photo-1615486511484-92e172054db9?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: '3',
    name: 'Export Quality Basmati Rice',
    farmer: 'Punjab Agri Hub',
    price: 120,
    unit: 'kg',
    quantity: 25,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&q=80&w=200',
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 5000 ? 0 : 150;
  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar isDark={false} setIsDark={() => {}} />

      <main className="flex-1 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/marketplace" className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors mb-2">
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white">
                Your Cart
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>

          {cartItems.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="card flex items-center gap-4 sm:gap-6 hover:shadow-md"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item.id}`} className="text-base font-semibold text-gray-900 dark:text-white hover:text-emerald-600 transition-colors truncate block">
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-500 mt-0.5">by {item.farmer}</p>
                      <p className="text-sm font-semibold text-emerald-600 mt-1">₹{item.price}/{item.unit}</p>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold text-gray-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <p className="text-base font-bold text-gray-900 dark:text-white">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <div className="card p-6">
                    <h2 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-5">Order Summary</h2>

                    <div className="space-y-3 mb-5">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Subtotal ({cartItems.length} items)</span>
                        <span className="font-semibold text-gray-900 dark:text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                        <span className={`font-semibold ${deliveryFee === 0 ? 'text-emerald-600' : 'text-gray-900 dark:text-white'}`}>
                          {deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}
                        </span>
                      </div>
                      {deliveryFee === 0 && (
                        <p className="text-xs text-emerald-600 flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          Free delivery on orders above ₹5,000
                        </p>
                      )}
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                      <div className="flex justify-between">
                        <span className="text-base font-bold text-gray-900 dark:text-white">Total</span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">₹{total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <button className="btn btn-primary w-full py-3.5 text-base mb-3">
                      <CreditCard className="w-5 h-5" />
                      Proceed to Checkout
                    </button>

                    <Link href="/marketplace" className="btn btn-ghost w-full py-3 text-sm">
                      Continue Shopping
                    </Link>

                    {/* Trust Indicators */}
                    <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700 space-y-3">
                      <div className="flex items-center gap-2.5 text-xs text-gray-500">
                        <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>Secure checkout with encrypted payments</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-gray-500">
                        <Truck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>Free delivery on orders above ₹5,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Empty Cart State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                Looks like you haven&apos;t added any products yet. Explore our marketplace to find fresh produce.
              </p>
              <Link href="/marketplace" className="btn btn-primary">
                Browse Marketplace
              </Link>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
