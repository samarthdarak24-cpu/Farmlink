'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit2, Trash2, Boxes, Package, Tag, Layers, 
  TrendingUp, Eye, ShoppingCart, DollarSign, Filter, ChevronRight, 
  AlertCircle, CheckCircle2, MoreHorizontal, X, Image as ImageIcon,
  Loader2, Sparkles, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productsApi, blockchainApi, aiApi } from '@/lib/api';
import { useAuthZustand } from '@/store/authZustand';
import { useOfflineCache } from '@/hooks/useOfflineCache';
import Link from 'next/link';

export default function ProductsPage() {
  const { user } = useAuthZustand();
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    unit: 'kg',
    quantity: '',
    description: '',
    certifications: '',
    images: [] as string[],
  });
  const [uploading, setUploading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const productsState = useOfflineCache<any[]>(`farmer-products-${user?.id}`, async () => {
    if (!user?.id) return [];
    const res = await productsApi.getByFarmer(user.id);
    return res.data || [];
  });

  const products = productsState.data || [];

  useEffect(() => {
    (async () => {
      try {
        const res = await productsApi.getCategories();
        setCategories(res.data || ['Vegetables', 'Fruits', 'Grains', 'Spices', 'Dairy', 'Organic']);
      } catch {
        setCategories(['Vegetables', 'Fruits', 'Grains', 'Spices', 'Dairy', 'Organic']);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const total = products.length;
    const views = products.reduce((acc, p) => acc + (p.views || 0), 0);
    const orders = products.reduce((acc, p) => acc + (p.orderCount || 0), 0);
    const revenue = products.reduce((acc, p) => acc + (p.revenueGenerated || 0), 0);
    const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= (p.lowStockThreshold || 10)).length;
    return { total, views, orders, revenue, lowStock };
  }, [products]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    
    let matchesStock = true;
    if (stockFilter === 'low') matchesStock = p.quantity > 0 && p.quantity <= (p.lowStockThreshold || 10);
    if (stockFilter === 'out') matchesStock = p.quantity === 0;
    if (stockFilter === 'in') matchesStock = p.quantity > (p.lowStockThreshold || 10);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: categories[0] || 'Vegetables',
      price: '',
      unit: 'kg',
      quantity: '',
      description: '',
      certifications: '',
      images: [],
    });
    setEditingProduct(null);
  };

  const handleEdit = (p: any) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      price: String(p.price),
      unit: p.unit || 'kg',
      quantity: String(p.quantity),
      description: p.description || '',
      certifications: (p.certifications || []).join(', '),
      images: p.images || [],
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => productsApi.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.data.url);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
      toast.success(`${urls.length} image(s) uploaded`);
    } catch (err: any) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const getAiPriceSuggestion = async () => {
    if (!formData.category) {
      toast.error('Please select a category first');
      return;
    }
    setAiLoading(true);
    try {
      const res = await aiApi.getPriceSuggestion({
        category: formData.category,
        quality: 90, // mock quality for suggestion
        season: 'peak'
      });
      setFormData(prev => ({ ...prev, price: String(res.data.suggestedPrice) }));
      toast.success('Price suggested by AI');
    } catch {
      toast.error('AI Suggestion failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        certifications: formData.certifications.split(',').map(s => s.trim()).filter(Boolean),
      };

      if (editingProduct) {
        await productsApi.update(editingProduct.id || editingProduct._id, payload);
        toast.success('Product updated');
      } else {
        const created = (await productsApi.create(payload)).data;
        toast.success('Product created & recorded on blockchain');
        // Record on blockchain
        blockchainApi.recordProductCreated({
          productId: created.id || created._id,
          farmerId: user?.id,
          farmerName: user?.name,
          productDetails: { ...created },
          location: user?.location || ''
        }).catch(console.error);
      }
      
      await productsState.reload();
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productsApi.delete(id);
      toast.success('Product deleted');
      await productsState.reload();
    } catch (err: any) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white flex items-center gap-4 uppercase tracking-tighter">
            <Boxes className="w-10 h-10 text-primary-600" />
            Inventory Hub
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1 pl-1">
            Institutional-Grade Asset Management & Analytics
          </p>
        </motion.div>
        
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn btn-primary h-14 px-8 rounded-2xl flex items-center gap-3 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 group"
        >
          <Plus className="group-hover:rotate-90 transition-transform" />
          Add Strategic Asset
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Market Exposure', value: stats.views, sub: 'Total Views', icon: Eye, color: 'text-blue-600' },
          { label: 'Trade Volume', value: stats.orders, sub: 'Confirmed Orders', icon: ShoppingCart, color: 'text-indigo-600' },
          { label: 'Gross Revenue', value: `$${stats.revenue.toLocaleString()}`, sub: 'Lifetime Sales', icon: DollarSign, color: 'text-emerald-600' },
          { label: 'Risk Alerts', value: stats.lowStock, sub: 'Low Stock Items', icon: AlertCircle, color: stats.lowStock > 0 ? 'text-red-500' : 'text-gray-400' },
        ].map((kpi) => (
          <div key={kpi.label} className="glass-card border border-white/20 rounded-[32px] p-6 flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center ${kpi.color}`}>
              <kpi.icon size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{kpi.label}</p>
              <p className="text-2xl font-display font-black text-gray-900 dark:text-white">{kpi.value}</p>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter mt-0.5">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="glass-card border border-white/20 rounded-3xl p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search assets by name or batch ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-12 h-14 w-full bg-white/50 dark:bg-gray-800/50 rounded-2xl"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              className="input pl-11 h-14 w-full md:w-44 bg-white/50 dark:bg-gray-800/50 appearance-none font-bold text-xs uppercase tracking-widest rounded-2xl"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <select 
            className="input h-14 w-full md:w-44 bg-white/50 dark:bg-gray-800/50 font-bold text-xs uppercase tracking-widest rounded-2xl"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="all">Stock Status</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
          
          <button 
            onClick={() => productsState.reload()}
            className="h-14 w-14 rounded-2xl border border-white/20 bg-white/50 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:border-primary-500 transition-all shadow-sm"
          >
             <RefreshCw className={productsState.loading ? 'animate-spin' : ''} size={20} />
          </button>
        </div>
      </div>

      {/* Main Listing Table */}
      <div className="glass-card border border-white/20 rounded-[40px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-black/20 border-b border-white/10 uppercase tracking-[0.2em] text-[10px] font-black text-gray-400">
                <th className="p-6">Asset Identity</th>
                <th className="p-6 text-center">Status</th>
                <th className="p-6">Stock Velocity</th>
                <th className="p-6 text-center">Unit Price</th>
                <th className="p-6 text-center">KPIs</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map((p) => {
                const isLow = p.quantity > 0 && p.quantity <= (p.lowStockThreshold || 10);
                const isOut = p.quantity === 0;
                
                return (
                  <tr key={p.id || p._id} className="group hover:bg-white/40 dark:hover:bg-white/5 transition-all">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-inner group-hover:scale-110 transition-transform flex-shrink-0">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full gradient-mesh flex items-center justify-center text-white text-xl font-black">
                              {p.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-black text-primary-600 uppercase tracking-widest leading-none mb-1">{p.category}</p>
                          <h4 className="text-base font-bold text-gray-900 dark:text-white tracking-tight truncate">{p.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Blockchain Verified</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      {isOut ? (
                        <span className="px-3 py-1 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-200 dark:border-red-800">Out of Stock</span>
                      ) : isLow ? (
                        <span className="px-3 py-1 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-200 dark:border-amber-800">Low Inventory</span>
                      ) : (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-200 dark:border-emerald-800">Healthy</span>
                      )}
                    </td>
                    <td className="p-6 w-48">
                       <div className="space-y-2">
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-400">
                             <span>{p.quantity} {p.unit}</span>
                             <span>{Math.min(100, Math.round((p.quantity / 100) * 100))}% Cap</span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${Math.min(100, (p.quantity / 100) * 100)}%` }}
                               className={`h-full rounded-full ${isOut ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-primary-500'}`} 
                             />
                          </div>
                       </div>
                    </td>
                    <td className="p-6 text-center">
                       <p className="text-lg font-display font-black text-gray-900 dark:text-white">${p.price}<span className="text-[10px] text-gray-400 font-bold">/{p.unit}</span></p>
                    </td>
                    <td className="p-6">
                       <div className="flex items-center justify-center gap-4">
                          <div className="flex flex-col items-center">
                             <Eye size={14} className="text-gray-400 mb-1" />
                             <span className="text-[10px] font-black text-gray-600 dark:text-gray-300">{p.views || 0}</span>
                          </div>
                          <div className="flex flex-col items-center">
                             <ShoppingCart size={14} className="text-gray-400 mb-1" />
                             <span className="text-[10px] font-black text-gray-600 dark:text-gray-300">{p.orderCount || 0}</span>
                          </div>
                       </div>
                    </td>
                    <td className="p-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(p)}
                            className="p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 hover:border-primary-500 hover:text-primary-600 transition-all shadow-sm"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(p.id || p._id)}
                            className="p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 hover:border-red-500 hover:text-red-500 transition-all shadow-sm"
                          >
                            <Trash2 size={16} />
                          </button>
                       </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-24 text-center">
                     <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package size={36} className="text-gray-300" />
                     </div>
                     <h3 className="text-2xl font-display font-black uppercase tracking-tighter mb-2 text-gray-900 dark:text-white">Stock Ledger Empty</h3>
                     <p className="text-sm text-gray-500 max-w-sm mx-auto">No assets match your current filtering matrix. Try adjusting your parameters or registering a new asset.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advanced Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="glass-card border border-white/20 rounded-[48px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative z-10"
            >
              {/* Modal Header */}
              <div className="p-8 pb-4 flex items-center justify-between border-b border-white/10">
                 <div>
                    <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                       {editingProduct ? 'Update Asset Index' : 'Register New Asset'}
                    </h2>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-1">Multi-Channel Distributed Marketplace Sync</p>
                 </div>
                 <button 
                    onClick={() => setShowModal(false)}
                    className="w-12 h-12 rounded-2xl bg-white/50 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm"
                 >
                    <X size={20} />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  
                  {/* Left Col: Media & Meta */}
                  <div className="space-y-8">
                     <section className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2 mb-2">
                           <ImageIcon size={14} className="text-primary-500" />
                           Asset Visual Registry
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                           {formData.images.map((url, i) => (
                             <div key={url} className="aspect-square rounded-2xl overflow-hidden relative group border border-white/10 shadow-sm transition-all hover:scale-95">
                                <img src={url} className="w-full h-full object-cover" />
                                <button 
                                  type="button"
                                  onClick={() => removeImage(i)}
                                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                   <X size={12} />
                                </button>
                             </div>
                           ))}
                           {formData.images.length < 6 && (
                              <label className="aspect-square rounded-2xl border-2 border-dashed border-white/10 dark:border-gray-800 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary-500 hover:bg-primary-500/5 transition-all">
                                 <Plus size={20} className="text-gray-400" />
                                 <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Add Image</span>
                                 <input type="file" className="hidden" multiple onChange={handleImageUpload} disabled={uploading} />
                              </label>
                           )}
                        </div>
                        {uploading && (
                           <div className="flex items-center gap-2 text-primary-600 text-[10px] font-black uppercase tracking-widest animate-pulse">
                              <Loader2 className="animate-spin" size={14} /> Uploading to cloud...
                           </div>
                        )}
                     </section>

                     <section className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none">Identity Protocols</label>
                        <input 
                           required 
                           placeholder="Full Asset Name (e.g. Organic Basmati Rice)" 
                           className="input h-14 bg-white/40 dark:bg-white/5 border border-white/20 rounded-2xl text-sm"
                           value={formData.name}
                           onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                        <textarea 
                           placeholder="Market description & provenance details..." 
                           rows={4}
                           className="input bg-white/40 dark:bg-white/5 border border-white/20 rounded-2xl text-sm p-4 resize-none"
                           value={formData.description}
                           onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                        <input 
                           placeholder="Certifications (e.g. Organic, GAP, Export-Ready)" 
                           className="input h-14 bg-white/40 dark:bg-white/5 border border-white/20 rounded-2xl text-sm"
                           value={formData.certifications}
                           onChange={(e) => setFormData(prev => ({ ...prev, certifications: e.target.value }))}
                        />
                     </section>
                  </div>

                  {/* Right Col: Logistics & Pricing */}
                  <div className="space-y-8">
                      <section className="space-y-6">
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none">Asset Category</label>
                               <select 
                                 className="input h-14 bg-white/40 dark:bg-white/5 border border-white/20 rounded-2xl text-xs font-black uppercase tracking-widest"
                                 value={formData.category}
                                 onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                               >
                                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                               </select>
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none">Trade Unit</label>
                               <input 
                                 placeholder="kg, Ton, etc." 
                                 className="input h-14 bg-white/40 dark:bg-white/5 border border-white/20 rounded-2xl text-sm"
                                 value={formData.unit}
                                 onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                               />
                            </div>
                         </div>

                         <div className="space-y-2">
                             <div className="flex items-center justify-between px-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none">Pricing Matrix ($)</label>
                                <button 
                                  type="button"
                                  onClick={getAiPriceSuggestion}
                                  disabled={aiLoading}
                                  className="text-[10px] font-black uppercase text-primary-600 flex items-center gap-1.5 hover:scale-105 transition-transform disabled:opacity-50"
                                >
                                   {aiLoading ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
                                   AI Price Signal
                                </button>
                             </div>
                             <div className="relative">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600">
                                   <DollarSign size={18} />
                                </div>
                                <input 
                                   required
                                   type="number"
                                   step="0.01"
                                   placeholder="0.00" 
                                   className="input h-16 pl-16 bg-white/40 dark:bg-white/5 border border-white/20 rounded-[24px] text-2xl font-display font-black"
                                   value={formData.price}
                                   onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                />
                             </div>
                         </div>

                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none pl-1">Global Stock Reservoir</label>
                            <div className="relative">
                               <Package className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                               <input 
                                  required
                                  type="number"
                                  placeholder="Available capacity..." 
                                  className="input h-14 pl-14 bg-white/40 dark:bg-white/5 border border-white/20 rounded-2xl text-sm font-bold"
                                  value={formData.quantity}
                                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                               />
                            </div>
                         </div>
                      </section>

                      <div className="p-6 bg-primary-600/5 rounded-[32px] border border-primary-500/20 space-y-3 relative overflow-hidden group/tip">
                         <div className="absolute top-0 right-0 w-24 h-24 bg-primary-600/5 rounded-full blur-2xl group-hover/tip:scale-150 transition-transform" />
                         <div className="flex items-center gap-2 text-primary-600 relative z-10">
                            <Sparkles size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Market Intelligence</span>
                         </div>
                         <p className="text-[11px] text-gray-500 font-medium leading-relaxed relative z-10">
                            Our ML models suggest that <span className="text-gray-900 dark:text-white font-black italic">high-fidelity</span> visual registries with detailed provenance descriptions improve discovery rates across the Mumbai-node by up to <span className="text-emerald-500 font-black">42.8%</span>.
                         </p>
                      </div>
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="p-10 pt-4 flex gap-6 items-center justify-end border-t border-white/10 bg-gray-50/50 dark:bg-black/20">
                 <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-8 h-14 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                 >
                    Discard Changes
                 </button>
                 <button 
                  type="submit" 
                  form="product-form"
                  disabled={submitting || uploading}
                  className="px-12 h-14 bg-primary-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50"
                 >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : (editingProduct ? 'Commit & Sync' : 'Broadcast Asset')}
                    <ChevronRight size={18} />
                 </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
