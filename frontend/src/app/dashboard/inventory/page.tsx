'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Boxes,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  RefreshCw,
  X,
  Plus
} from 'lucide-react';
import { productsApi } from '@/lib/api';
import { useAuthZustand } from '@/store/authZustand';
import toast from 'react-hot-toast';
import DashboardRealtimeListener from '@/components/dashboard/shared/DashboardRealtimeListener';

export default function InventoryPage() {
  const { user } = useAuthZustand();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'good'>('all');

  // Update Stock Modal states
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [newQuantity, setNewQuantity] = useState<number | string>('');
  const [updating, setUpdating] = useState(false);

  const fetchInventory = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await productsApi.getByFarmer(user.id);
      setProducts(res.data || []);
    } catch (error: any) {
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [user?.id]);

  // Derived state for filtering
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const isLowStock = p.quantity < 20; // threshold for low stock
      
      let matchesFilter = true;
      if (filterStatus === 'low') matchesFilter = isLowStock;
      if (filterStatus === 'good') matchesFilter = !isLowStock;

      return matchesSearch && matchesFilter;
    });
  }, [products, searchQuery, filterStatus]);

  const handleUpdateStock = async () => {
    if (!selectedProduct) return;
    const qty = Number(newQuantity);
    
    if (isNaN(qty) || qty < 0) {
      toast.error('Please enter a valid positive quantity');
      return;
    }

    setUpdating(true);
    try {
      await productsApi.update(selectedProduct.id || selectedProduct._id, { quantity: qty });
      toast.success('Stock updated successfully!');
      
      // Update local state to feel immediate without full refetch
      setProducts(products.map(p => 
        (p.id === selectedProduct.id || p._id === selectedProduct._id) 
          ? { ...p, quantity: qty } 
          : p
      ));
      
      setIsUpdateModalOpen(false);
      setSelectedProduct(null);
      setNewQuantity('');
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to update stock');
    } finally {
      setUpdating(false);
    }
  };

  const openUpdateModal = (product: any) => {
    setSelectedProduct(product);
    setNewQuantity(product.quantity);
    setIsUpdateModalOpen(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <DashboardRealtimeListener onOrderUpdate={() => fetchInventory()} />
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Boxes className="w-8 h-8 text-primary-600" />
            Inventory Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your real-time stock levels, check alerts, and perform instant updates.
          </p>
        </div>
        
        <button 
          onClick={fetchInventory}
          className="btn btn-outline flex items-center gap-2 h-11"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card border border-white/20 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
          <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
          <p className="text-4xl font-display font-bold text-gray-900 dark:text-white mt-2">
            {products.length}
          </p>
        </div>
        
        <div className="glass-card border border-white/20 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
          <h3 className="text-gray-500 text-sm font-medium">Healthy Stock</h3>
          <p className="text-4xl font-display font-bold text-green-600 dark:text-green-400 mt-2">
            {products.filter(p => p.quantity >= 20).length}
          </p>
        </div>

        <div className="glass-card border border-white/20 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
          <h3 className="text-gray-500 text-sm font-medium">Low Stock Alerts</h3>
          <p className="text-4xl font-display font-bold text-red-600 dark:text-red-500 mt-2">
            {products.filter(p => p.quantity < 20).length}
          </p>
        </div>
      </div>

      {/* Action Bar (Search & Filter) */}
      <div className="glass-card border border-white/20 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search products by name or category..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-5 h-5 text-gray-400" />
          <select 
            className="input w-full md:w-48"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">All Statuses</option>
            <option value="good">Good Stock (≥ 20)</option>
            <option value="low">Low Stock (&lt; 20)</option>
          </select>
        </div>

      </div>

      {/* Main Table Area */}
      <div className="glass-card border border-white/20 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 opacity-70">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <RefreshCw className="w-10 h-10 text-primary-500 mb-4" />
            </motion.div>
            <p className="text-lg font-medium text-gray-600">Syncing with warehouse...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Boxes className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-2">
              No products to track
            </h3>
            <p className="text-gray-500 max-w-sm">
              We couldn't find any inventory items matching your current filters. 
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">Product Info</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider text-right">Unit Price</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider text-right">In Stock</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                <AnimatePresence>
                  {filteredProducts.map((p, idx) => (
                    <motion.tr 
                      key={p.id || p._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {p.images && p.images[0] ? (
                            <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg gradient-mesh flex items-center justify-center text-white font-bold">
                              {p.name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white truncate max-w-[200px]">{p.name}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">ID: {String(p.id || p._id).slice(0,8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">
                        {p.category}
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold text-right">
                        ${p.price} <span className="text-gray-400 text-xs font-normal">/{p.unit}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {p.quantity < 20 ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold uppercase tracking-widest border border-red-200 dark:border-red-800">
                            <AlertTriangle className="w-3 h-3" />
                            Low
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold uppercase tracking-widest border border-green-200 dark:border-green-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Good
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-lg font-display font-bold ${p.quantity < 20 ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}>
                          {p.quantity} 
                        </span>
                        <span className="text-gray-500 text-sm ml-1">{p.unit}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button 
                            onClick={() => openUpdateModal(p)}
                            className="btn btn-outline h-9 px-3 text-sm flex items-center gap-2 group-hover:border-primary-500 group-hover:text-primary-600 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Update
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Stock Modal */}
      <AnimatePresence>
        {isUpdateModalOpen && selectedProduct && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setIsUpdateModalOpen(false)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-card border border-white/20 rounded-3xl w-full max-w-md p-6 relative overflow-hidden shadow-2xl"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                
                <button 
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white pr-8">
                  Update Inventory
                </h2>
                
                <div className="mt-6 flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl">
                  {selectedProduct.images && selectedProduct.images[0] ? (
                    <img src={selectedProduct.images[0]} alt="Product" className="w-14 h-14 rounded-xl object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl gradient-mesh flex items-center justify-center font-bold text-xl text-white">
                      {selectedProduct.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{selectedProduct.name}</h3>
                    <p className="text-sm text-gray-500">Current Stock: <strong className="text-primary-600 dark:text-primary-400">{selectedProduct.quantity} {selectedProduct.unit}</strong></p>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    New Stock Quantity
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      className="input w-full pl-6 pr-16 text-lg font-medium"
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(e.target.value)}
                      placeholder="e.g. 150"
                      autoFocus
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium select-none">
                      {selectedProduct.unit}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    This will directly overwrite the current stock level in the real-time database.
                  </p>
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    onClick={() => setIsUpdateModalOpen(false)}
                    className="btn btn-outline flex-1"
                    disabled={updating}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpdateStock}
                    disabled={updating}
                    className="btn btn-primary flex-1 flex justify-center items-center gap-2"
                  >
                    {updating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Confirm Update
                      </>
                    )}
                  </button>
                </div>

              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
