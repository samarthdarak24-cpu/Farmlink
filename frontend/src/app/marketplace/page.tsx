'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  MapPin,
  Heart,
  ShoppingCart,
  ChevronDown,
  X,
  Sparkles,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
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
    maxPrice: 100,
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar isDark={false} setIsDark={() => {}} />

      <main className="pt-20 pb-12">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Agricultural Marketplace
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
                Discover fresh produce directly from verified farmers. AI-powered pricing and blockchain traceability.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-32 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Search products, farmers, categories..."
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-primary">
                  Search
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Filters & Categories */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                {/* Filter Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn btn-outline"
                >
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </button>

                {/* View Mode */}
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : ''
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : ''
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Min Price
                    </label>
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
                      className="input"
                      placeholder="$0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Price
                    </label>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                      className="input"
                      placeholder="$100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={filters.location}
                      onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                      className="input"
                      placeholder="Any location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Certification
                    </label>
                    <select
                      value={filters.certification}
                      onChange={(e) => setFilters({ ...filters, certification: e.target.value })}
                      className="input"
                    >
                      <option value="">Any</option>
                      <option value="Organic">Organic</option>
                      <option value="GAP">GAP</option>
                      <option value="FSSAI">FSSAI</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              Showing {filteredProducts.length} products
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select className="input py-2 text-sm w-auto">
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
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`card group ${viewMode === 'list' ? 'flex items-center' : ''}`}
              >
                {/* Image */}
                <div className={`relative ${viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : 'aspect-square mb-4'} rounded-xl overflow-hidden bg-gray-100`}>
                  <div className="w-full h-full gradient-mesh flex items-center justify-center">
                    <span className="text-4xl">🥬</span>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {(product.certifications || []).map((cert: string) => (
                      <span key={cert} className="text-xs bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded-full font-medium">
                        {cert}
                      </span>
                    ))}
                  </div>

                  {/* AI Badge */}
                  {product.aiSuggested && (
                    <div className="absolute top-3 right-3">
                      <span className="flex items-center gap-1 text-xs bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-2 py-1 rounded-full">
                        <Sparkles className="w-3 h-3" />
                        AI Price
                      </span>
                    </div>
                  )}

                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <Heart className={`w-5 h-5 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </button>
                </div>

                {/* Content */}
                <div className={viewMode === 'list' ? 'flex-1 ml-6' : ''}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                        <Link href={`/product/${product.id}`}>
                          {product.name}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {product.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-gray-500">by</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{product.farmer}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {product.farmerRating}
                    </span>
                  </div>

                  {/* Quality Score */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-gray-500">Quality:</span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                        style={{ width: `${product.qualityGrade}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{product.qualityGrade}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">${product.price}</span>
                      <span className="text-gray-500">/{product.unit}</span>
                      {product.aiSuggested && product.aiSuggested !== product.price && (
                        <div className="text-xs text-gray-400">
                          AI suggests ${product.aiSuggested}
                        </div>
                      )}
                    </div>
                    <button className="btn btn-primary">
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or search query</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}