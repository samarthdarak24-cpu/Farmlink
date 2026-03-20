'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  MapPin,
  Heart,
  ShoppingCart,
  Sparkles,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { productsApi } from '@/lib/api';

const categories = [
  'All',
  'Vegetables',
  'Fruits',
  'Grains',
  'Spices',
  'Dairy',
  'Organic',
];

export default function MarketplacePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 10000,
    location: '',
    certification: '',
  });
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data } = await productsApi.getAll();
        setProducts(data.products || []);
      } catch {
        setProducts([]);
      }
    };
    loadProducts();
  }, []);

  const toggleFavorite = (productId: string) => {
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.farmer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = product.price >= filters.minPrice && product.price <= filters.maxPrice;
    return matchesCategory && matchesSearch && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar isDark={false} setIsDark={() => {}} />

      <main className="flex-1 pt-20 pb-12">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-3">
                Agricultural Marketplace
              </h1>
              <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
                Discover fresh produce directly from verified farmers. AI-powered pricing and blockchain traceability.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-28 py-4 rounded-2xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-lg shadow-emerald-900/20 text-sm"
                  placeholder="Search products, farmers, categories..."
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-primary py-2.5 px-5 text-sm rounded-xl">
                  Search
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Filters & Categories */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 sticky top-16 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="flex items-center justify-between gap-4">
              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Filter Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn btn-outline py-2 px-4 text-sm ${showFilters ? 'border-emerald-500 text-emerald-600' : ''}`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                </button>

                {/* View Mode */}
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm text-emerald-600' : 'text-gray-500'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm text-emerald-600' : 'text-gray-500'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                          Min Price (₹)
                        </label>
                        <input
                          type="number"
                          value={filters.minPrice}
                          onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
                          className="input py-2.5 text-sm"
                          placeholder="₹0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                          Max Price (₹)
                        </label>
                        <input
                          type="number"
                          value={filters.maxPrice}
                          onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                          className="input py-2.5 text-sm"
                          placeholder="₹10000"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                          Location
                        </label>
                        <input
                          type="text"
                          value={filters.location}
                          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                          className="input py-2.5 text-sm"
                          placeholder="Any location"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                          Certification
                        </label>
                        <select
                          value={filters.certification}
                          onChange={(e) => setFilters({ ...filters, certification: e.target.value })}
                          className="input py-2.5 text-sm"
                        >
                          <option value="">Any</option>
                          <option value="Organic">Organic</option>
                          <option value="GAP">GAP</option>
                          <option value="FSSAI">FSSAI</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredProducts.length}</span> products
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Sort by:</span>
              <select className="input py-2 px-3 text-sm w-auto rounded-lg border-gray-200">
                <option>Recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating</option>
                <option>Newest</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
            : 'space-y-4'
          }>
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`card group hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-600 ${viewMode === 'list' ? 'flex items-center' : ''}`}
              >
                {/* Image */}
                <div className={`relative ${viewMode === 'list' ? 'w-44 h-44 flex-shrink-0' : 'aspect-square mb-4'} rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800`}>
                  <div className="w-full h-full gradient-mesh flex items-center justify-center">
                    <span className="text-4xl">🥬</span>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                    {(product.certifications || []).map((cert: string) => (
                      <span key={cert} className="text-xs bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded-full font-medium shadow-sm">
                        {cert}
                      </span>
                    ))}
                  </div>

                  {/* AI Badge */}
                  {product.aiSuggested && (
                    <div className="absolute top-2.5 right-2.5">
                      <span className="flex items-center gap-1 text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-1 rounded-full font-medium">
                        <Sparkles className="w-3 h-3" />
                        AI Price
                      </span>
                    </div>
                  )}

                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </button>
                </div>

                {/* Content */}
                <div className={viewMode === 'list' ? 'flex-1 ml-5' : ''}>
                  <div className="flex items-start justify-between mb-1.5">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                        <Link href={`/product/${product.id}`}>
                          {product.name}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {product.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-xs text-gray-500">by</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{product.farmer}</span>
                    <span className="flex items-center gap-0.5 text-xs text-gray-500">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {product.farmerRating}
                    </span>
                  </div>

                  {/* Quality Score */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-gray-500 font-medium">Quality:</span>
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                        style={{ width: `${product.qualityGrade}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{product.qualityGrade}%</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">₹{product.price}</span>
                      <span className="text-gray-500 text-sm">/{product.unit}</span>
                      {product.aiSuggested && product.aiSuggested !== product.price && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          AI suggests ₹{product.aiSuggested}
                        </div>
                      )}
                    </div>
                    <button className="btn btn-primary py-2 px-3.5 text-sm">
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Search className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Try adjusting your filters or search query to find what you&apos;re looking for</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}