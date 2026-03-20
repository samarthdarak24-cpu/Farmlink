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
  Loader2,
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
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        location: filters.location || undefined,
        certification: filters.certification || undefined,
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
    }, 500); // debounce search
    return () => clearTimeout(timer);
  }, [selectedCategory, filters.sortBy, filters.page, searchQuery, filters.minPrice, filters.maxPrice, filters.location, filters.certification]);

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
    setShowFilters(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />

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
              <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-28 py-4 rounded-2xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-lg shadow-emerald-900/20 text-sm"
                  placeholder="Search products, farmers, categories..."
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl transition-colors font-medium">
                  Search
                </button>
              </form>
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
                    onClick={() => { setSelectedCategory(category); setFilters(f => ({ ...f, page: 1 })); }}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
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
                  className={`flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg py-2 px-4 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${showFilters ? 'border-emerald-500 text-emerald-600' : 'text-gray-600 dark:text-gray-300'}`}
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
                  className="overflow-hidden border-t border-gray-100 dark:border-gray-700 mt-3"
                >
                  <div className="py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                          Min Price (₹)
                        </label>
                        <input
                          type="number"
                          value={filters.minPrice}
                          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                          Max Price (₹)
                        </label>
                        <input
                          type="number"
                          value={filters.maxPrice}
                          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="10000"
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
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="District/State"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                          Certification
                        </label>
                        <select
                          value={filters.certification}
                          onChange={(e) => setFilters({ ...filters, certification: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="">Any</option>
                          <option value="Organic">Organic</option>
                          <option value="GAP">GAP</option>
                          <option value="FSSAI">FSSAI</option>
                          <option value="ODOP">ODOP Certified</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button 
                          onClick={handleApplyFilters} 
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 text-sm font-medium transition-colors shadow-sm"
                        >
                          Apply Filters
                        </button>
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
              Showing <span className="font-semibold text-gray-900 dark:text-white">{pagination?.total || products.length}</span> products
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Sort by:</span>
              <select 
                value={filters.sortBy}
                onChange={(e) => setFilters(f => ({ ...f, sortBy: e.target.value, page: 1 }))}
                className="bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Top Rated</option>
              </select>
            </div>
          </div>

          {loading ? (
             <div className="flex justify-center flex-col items-center py-24 gap-4">
               <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
               <p className="text-gray-500 font-medium">Loading products...</p>
             </div>
          ) : (
            <>
              {/* Product Grid */}
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
              }>
                {products.map((product, index) => (
                  <motion.div
                    key={product.id || product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300 ${viewMode === 'list' ? 'flex items-center' : ''}`}
                  >
                    {/* Image */}
                    <Link href={`/product/${product.id || product._id}`} className={viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : 'block aspect-square'}>
                      <div className="h-full w-full relative overflow-hidden bg-gray-100">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center text-4xl">
                            🥬
                          </div>
                        )}

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                          {(product.certifications || []).slice(0, 2).map((cert: string) => (
                            <span key={cert} className="text-[10px] bg-white/90 dark:bg-gray-900/90 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm">
                              {cert}
                            </span>
                          ))}
                        </div>

                        {/* AI Badge */}
                        {product.aiPriceSuggestion && (
                          <div className="absolute top-2 right-2">
                             <span className="flex items-center gap-1 text-[10px] bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-1 rounded-full font-bold uppercase tracking-wider shadow-md">
                              <Sparkles className="w-2.5 h-2.5" />
                              AI Price
                            </span>
                          </div>
                        )}

                        {/* Favorite Button */}
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(product.id || product._id); }}
                          className={`absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md flex items-center justify-center transition-transform hover:scale-110 active:scale-95`}
                        >
                          <Heart className={`w-4 h-4 ${favorites.includes(product.id || product._id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                        </button>
                      </div>
                    </Link>

                    {/* Content */}
                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1 ml-2' : ''}`}>
                      <div className="mb-2">
                        <Link href={`/product/${product.id || product._id}`}>
                          <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors line-clamp-1">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs text-gray-500">{product.location || 'India'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-700">
                          {product.farmerName?.[0] || 'F'}
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">{product.farmerName || 'Verified Farmer'}</span>
                        <div className="flex items-center gap-0.5 ml-auto">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{product.farmerRatingAvg || '4.5'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-gray-900 dark:text-white">₹{product.price}</span>
                            <span className="text-gray-400 text-[10px] font-medium uppercase">{product.unit || 'KG'}</span>
                          </div>
                          {product.aiPriceSuggestion && product.aiPriceSuggestion !== product.price && (
                            <span className="text-[10px] text-emerald-600 font-semibold">AI: ₹{product.aiPriceSuggestion}</span>
                          )}
                        </div>
                        <Link 
                          href={`/product/${product.id || product._id}`} 
                          className="bg-gray-900 dark:bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Empty State */}
              {products.length === 0 && (
                <div className="text-center py-20">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Search className="w-7 h-7 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Try adjusting your filters or search query to find what you're looking for</p>
                  <button 
                    onClick={() => {
                      setFilters({ minPrice: '', maxPrice: '', location: '', certification: '', sortBy: 'newest', page: 1 });
                      setSelectedCategory('All');
                      setSearchQuery('');
                    }} 
                    className="mt-6 text-emerald-600 font-semibold hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center mt-12 gap-3">
                  <button 
                    disabled={filters.page <= 1}
                    onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setFilters(f => ({ ...f, page: i + 1 }))}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                          filters.page === i + 1
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button 
                    disabled={filters.page >= pagination.totalPages}
                    onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}