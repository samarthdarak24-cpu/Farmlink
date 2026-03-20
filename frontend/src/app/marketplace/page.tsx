'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
  Loader2
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
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    location: '',
    certification: '',
    sortBy: 'newest',
    page: 1,
  });
  const [pagination, setPagination] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        category: selectedCategory,
        search: searchQuery || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        location: filters.location || undefined,
        sortBy: filters.sortBy,
        page: filters.page,
        limit: 12
      };
      const { data } = await productsApi.getAll(params);
      setProducts(data.products || []);
      setPagination(data.pagination);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300); // debounce search
    return () => clearTimeout(timer);
  }, [selectedCategory, filters.sortBy, filters.page, searchQuery, filters.minPrice, filters.maxPrice, filters.location]);

  const toggleFavorite = (productId: string) => {
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(f => ({ ...f, page: 1 }));
    fetchProducts();
  };

  const handleApplyFilters = () => {
    setFilters(f => ({ ...f, page: 1 }));
    fetchProducts();
  };

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
              <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-32 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Search products, farmers, categories..."
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-primary">
                  Search
                </button>
              </form>
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
                    onClick={() => { setSelectedCategory(category); setFilters(f => ({ ...f, page: 1 })); }}
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
                <div className="grid md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Min Price ($)
                    </label>
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      className="input"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Price ($)
                    </label>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      className="input"
                      placeholder="100"
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
                  <div className="flex items-end">
                    <button onClick={handleApplyFilters} className="btn btn-primary w-full shadow hover:bg-primary-700 transition">Apply Filters</button>
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
              Showing {pagination?.total || 0} products
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select 
                value={filters.sortBy}
                onChange={(e) => setFilters(f => ({ ...f, sortBy: e.target.value, page: 1 }))}
                className="input py-2 text-sm w-auto"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Rating</option>
              </select>
            </div>
          </div>

          {loading ? (
             <div className="flex justify-center flex-col items-center py-24 gap-4">
               <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
               <p className="text-gray-500 font-medium">Loading healthy products...</p>
             </div>
          ) : (
            <>
              {/* Product Grid */}
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
              }>
                {products.map((product, index) => (
                  <motion.div
                    key={product.id || product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`card group ${viewMode === 'list' ? 'flex items-center' : ''}`}
                  >
                    {/* Image */}
                    <Link href={`/product/${product.id || product._id}`}>
                      <div className={`cursor-pointer overflow-hidden relative ${viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : 'aspect-square mb-4'} rounded-xl bg-gray-100`}>
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full gradient-mesh flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                            <span className="text-4xl">🥬</span>
                          </div>
                        )}

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {(product.certifications || []).slice(0, 2).map((cert: string) => (
                            <span key={cert} className="text-xs bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded-full font-medium">
                              {cert}
                            </span>
                          ))}
                        </div>

                        {/* AI Badge */}
                        {product.aiPriceSuggestion && (
                          <div className="absolute top-3 right-3 shadow-sm rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-2 py-1">
                            <span className="flex items-center gap-1 text-xs">
                              <Sparkles className="w-3 h-3 text-white" />
                              AI Price
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Content */}
                    <div className={viewMode === 'list' ? 'flex-1 ml-6 relative' : 'relative'}>
                      {/* Favorite Button absolute positioned so it doesn't nest in link */}
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(product.id || product._id); }}
                        className={`absolute z-10 ${viewMode === 'list' ? '-left-8 top-0' : 'bottom-20 right-2'} w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center hover:scale-110 transition-transform`}
                      >
                        <Heart className={`w-5 h-5 outline-none border-none ${favorites.includes(product.id || product._id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                      </button>

                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors truncate">
                            <Link href={`/product/${product.id || product._id}`}>
                              {product.name}
                            </Link>
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {product.location || 'Any location'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-gray-500">by</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px]">{product.farmerName || 'Farmer'}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {product.farmerRatingAvg ? parseFloat(product.farmerRatingAvg).toFixed(1) : '—'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between font-display">
                        <div className="flex flex-col">
                          <div className="flex items-end gap-1">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">${product.price}</span>
                            <span className="text-gray-500 text-sm mb-1">/{product.unit}</span>
                          </div>
                          {product.aiPriceSuggestion && product.aiPriceSuggestion !== product.price && (
                            <div className="text-xs text-secondary-500 font-medium">
                              AI suggests ${product.aiPriceSuggestion}
                            </div>
                          )}
                        </div>
                        <Link href={`/product/${product.id || product._id}`} className="btn btn-primary rounded-xl h-10 w-10 p-0 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                          <ShoppingCart className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center mt-12 gap-2">
                  <button 
                    disabled={filters.page <= 1}
                    onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                    className="btn btn-outline"
                  >
                    Previous
                  </button>
                  <span className="flex items-center px-4 text-sm font-medium">
                    Page {filters.page} of {pagination.totalPages}
                  </span>
                  <button 
                    disabled={filters.page >= pagination.totalPages}
                    onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                    className="btn btn-outline"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Empty State */}
              {products.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your filters or search query</p>
                  <button onClick={() => {
                    setFilters({ minPrice: '', maxPrice: '', location: '', certification: '', sortBy: 'newest', page: 1 });
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }} className="btn btn-outline">
                    Clear all filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}