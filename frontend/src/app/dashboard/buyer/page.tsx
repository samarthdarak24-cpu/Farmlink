'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import GlassSection from '@/components/dashboard/shared/GlassSection';
import ChatPanel from '@/components/dashboard/shared/ChatPanel';
import DashboardRealtimeListener from '@/components/dashboard/shared/DashboardRealtimeListener';
import { useOfflineCache } from '@/hooks/useOfflineCache';
import {
  productsApi,
  ordersApi,
  rfqApi,
  aiApi,
  blockchainApi,
  authApi,
  contractsApi,
  paymentsApi,
  supplierRatingsApi,
  buyerCartApi,
} from '@/lib/api';
import { useAuthZustand } from '@/store/authZustand';
import { createAppSocket } from '@/lib/socketClient';
import { decodeJwtPayload } from '@/lib/jwtDecode';

type Product = any;
type Order = any;
type Rfq = any;

type CartItem = {
  productId: string;
  productName: string;
  farmerId: string;
  farmerName: string;
  price: number;
  quantity: number;
  unit: string;
  category?: string;
  location?: string;
};

export default function BuyerDashboard() {
  const { user, token } = useAuthZustand((s) => ({ user: s.user, token: s.token }));
  const buyerId = user?.id || '';

  const [lang] = useState<'en' | 'es'>('en'); // buyer RBAC section only (keep minimal)

  const ordersState = useOfflineCache<Order[]>('buyer-orders', async () => {
    const res = await ordersApi.getAll();
    return res.data || [];
  });
  const rfqsState = useOfflineCache<Rfq[]>('buyer-rfqs', async () => {
    const res = await rfqApi.getMyRfqs();
    return res.data || [];
  });

  const [categories, setCategories] = useState<string[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await productsApi.getCategories();
        setCategories(res.data || []);
      } catch {
        // ignore
      }
    })();
  }, []);

  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    minPrice: '',
    maxPrice: '',
    location: '',
    page: 1,
    limit: 12,
    sortBy: 'newest',
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [productsMeta, setProductsMeta] = useState<any>(null);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setProductsLoading(true);
    setProductsError(null);
    const cacheKey = 'buyer-products-cache';
    try {
      const params: any = {
        category: filters.category,
        search: filters.search || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        location: filters.location || undefined,
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy,
      };
      const res = await productsApi.getAll(params);
      setProducts(res.data.products || []);
      setProductsMeta(res.data.pagination || null);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(res.data));
      } catch {
        // ignore
      }
    } catch (e: any) {
      const cached = (() => {
        try {
          const raw = localStorage.getItem(cacheKey);
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      })();
      if (cached?.products) {
        setProducts(cached.products);
        setProductsMeta(cached.pagination || null);
        setProductsError('Loaded cached product results due to fetch failure.');
      } else {
        setProductsError(e?.response?.data?.error || e?.message || 'Failed to load products');
      }
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.limit, filters.category, filters.sortBy]);

  // Load all products for inventory planning / auto reorder
  const [planningProducts, setPlanningProducts] = useState<Product[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await productsApi.getAll({ limit: 100 });
        setPlanningProducts(res.data.products || []);
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    // keep search as separate effect to avoid infinite loops
    (async () => fetchProducts())();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.minPrice, filters.maxPrice, filters.location, filters.sortBy]);

  const [cartItems, setCartItems] = useState<Record<string, CartItem>>({});

  const cartList = useMemo(() => Object.values(cartItems), [cartItems]);
  const cartTotal = useMemo(
    () => cartList.reduce((sum, it) => sum + Number(it.price) * Number(it.quantity), 0),
    [cartList],
  );

  const refreshCart = async () => {
    try {
      const res = await buyerCartApi.get();
      const items: any[] = res.data?.items || [];
      const next: Record<string, CartItem> = {};
      for (const it of items) {
        next[it.productId] = it as CartItem;
      }
      setCartItems(next);
    } catch (e) {
      // Keep UI usable even if cart fetch fails.
    }
  };

  useEffect(() => {
    if (!token || !buyerId) return;
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, buyerId]);

  const addToCart = async (p: Product) => {
    try {
      const pid = String((p as any).id || (p as any)._id);
      await buyerCartApi.addItem(pid, 1);
      await refreshCart();
      toast.success('Added to cart');
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to add to cart');
    }
  };

  const updateCartQty = async (productId: string, qty: number) => {
    try {
      const nextQty = Math.max(0, qty);
      if (nextQty === 0) {
        await buyerCartApi.removeItem(productId);
      } else {
        await buyerCartApi.updateItemQty(productId, nextQty);
      }
      await refreshCart();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to update cart');
    }
  };

  // Emit socket events for order/proposal updates
  const emitSocketRef = useRef<any>(null);
  useEffect(() => {
    if (!token || !buyerId) return;
    const payload = decodeJwtPayload<{ userId: string }>(token);
    const userId = payload?.userId;
    if (!userId) return;
    const s = createAppSocket();
    emitSocketRef.current = s;
    s.connect();
    s.emit('authenticate', userId);
    return () => {
      s.disconnect();
      emitSocketRef.current = null;
    };
  }, [token, buyerId]);

  const emitOrderUpdate = (recipientId: string, order: any) => {
    try {
      emitSocketRef.current?.emit('order_update', { recipientId, order, orderId: order?.id });
    } catch {
      // ignore
    }
  };

  const emitProposalUpdate = (recipientId: string, proposal: any) => {
    try {
      emitSocketRef.current?.emit('proposal_update', { recipientId, proposal, rfqId: proposal?.rfqId });
    } catch {
      // ignore
    }
  };

  // Bulk orders checkout
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const checkoutCart = async () => {
    if (!cartList.length) return;
    setCheckoutBusy(true);
    try {
      const res = await buyerCartApi.checkout();
      const createdOrders = res.data?.orders || [];
      toast.success(`Created ${createdOrders.length} order(s)`);
      await ordersState.reload();
      await refreshCart();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Checkout failed');
    } finally {
      setCheckoutBusy(false);
    }
  };

  // RFQ creation
  const [rfqDraft, setRfqDraft] = useState({
    category: '',
    quantity: '',
    requirements: '',
  });
  const [rfqBusy, setRfqBusy] = useState(false);
  const createRfq = async () => {
    if (!rfqDraft.category || !rfqDraft.quantity) return;
    setRfqBusy(true);
    try {
      await rfqApi.create({
        productCategory: rfqDraft.category,
        productName: rfqDraft.category,
        quantity: Number(rfqDraft.quantity),
        unit: 'kg',
        notes: rfqDraft.requirements,
        buyerName: user?.name || 'Buyer',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      toast.success('RFQ created');
      await rfqsState.reload();
      setRfqDraft({ category: '', quantity: '', requirements: '' });
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'RFQ failed');
    } finally {
      setRfqBusy(false);
    }
  };

  const [acceptedBusy, setAcceptedBusy] = useState<string | null>(null);
  const acceptProposal = async (rfq: Rfq, proposal: any) => {
    const rfqId = (rfq as any)?.id || (rfq as any)?._id;
    const responseId = proposal?.id || proposal?._id;
    if (!rfqId || !responseId) return;
    setAcceptedBusy(`${rfqId}:${responseId}`);
    try {
      toast.success('Proposal accepted: creating order...');
      await rfqApi.award(String(rfqId), String(responseId));
      await Promise.all([rfqsState.reload(), ordersState.reload()]);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Accept failed');
    } finally {
      setAcceptedBusy(null);
    }
  };

  // Profile
  const [profile, setProfile] = useState<any>(null);
  const [profileBusy, setProfileBusy] = useState(false);
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await authApi.getProfile();
        setProfile(res.data);
      } catch {
        // ignore
      }
    })();
  }, [token]);

  // Supplier ratings (local demo)
  const [supplierRatingDraftFarmerId, setSupplierRatingDraftFarmerId] = useState<string>('');
  const [supplierStars, setSupplierStars] = useState(5);
  const [supplierReview, setSupplierReview] = useState('');

  // Forecast
  const [forecastCategory, setForecastCategory] = useState('');
  const [forecastResult, setForecastResult] = useState<any>(null);
  const fetchForecast = async () => {
    if (!forecastCategory) return;
    try {
      const res = await aiApi.getDemandForecast(forecastCategory);
      setForecastResult(res.data);
      toast.success('Forecast updated');
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Forecast failed');
    }
  };

  // Supplier comparison
  const [compareRequirements, setCompareRequirements] = useState({
    location: user?.location || '',
    category: 'Vegetables',
  });
  const [compareResults, setCompareResults] = useState<any[]>([]);
  const loadComparison = async () => {
    try {
      const res = await aiApi.getSupplierRecommendation(user?.id || '1', compareRequirements);
      setCompareResults(res.data?.recommendations || []);
      toast.success('Comparison loaded');
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Comparison failed');
    }
  };

  // Analytics
  const ordersByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of ordersState.data || []) {
      const s = o.status || 'unknown';
      counts[s] = (counts[s] || 0) + 1;
    }
    return counts;
  }, [ordersState.data]);

  const revenueSeries = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of ordersState.data || []) {
      const created = o.createdAt ? new Date(o.createdAt) : null;
      const key = created ? created.toLocaleDateString() : 'Unknown';
      const val = Number(o.total || (o.price && o.quantity ? Number(o.price) * Number(o.quantity) : 0));
      map[key] = (map[key] || 0) + val;
    }
    const keys = Object.keys(map).slice(0, 6);
    const points = keys.map((k) => ({ name: k, value: map[k] }));
    return points.length ? points : [{ name: 'No data', value: 0 }];
  }, [ordersState.data]);

  // Export CSV
  const exportCsv = () => {
    const rows = (ordersState.data || []).map((o) => ({
      orderId: o.id,
      product: o.productName || o.productId,
      farmerId: o.farmerId,
      quantity: o.quantity ?? '',
      price: o.price ?? '',
      status: o.status ?? '',
      createdAt: o.createdAt ?? '',
    }));
    const header = Object.keys(rows[0] || { orderId: '' }).join(',');
    const body = rows
      .map((r) =>
        Object.values(r)
          .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
          .join(','),
      )
      .join('\n');
    const csv = `${header}\n${body}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `odop-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const lowStock = useMemo(() => planningProducts.filter((p) => Number(p.quantity || 0) < 100).slice(0, 6), [planningProducts]);

  const autoReorder = async () => {
    if (!lowStock.length) {
      toast('No low-stock items.');
      return;
    }
    try {
      for (const p of lowStock) {
        await rfqApi.create({
          productCategory: p.category,
          productName: p.name,
          quantity: 200,
          unit: p.unit || 'kg',
          notes: `Auto reorder for ${p.name}`,
          buyerName: user?.name || 'Buyer',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
      await rfqsState.reload();
      toast.success('Auto reorder RFQs created');
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Auto reorder failed');
    }
  };

  const buyerRfqList = useMemo(() => rfqsState.data || [], [rfqsState.data]);
  const buyerOrdersList = useMemo(() => ordersState.data || [], [ordersState.data]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-0">
      <DashboardRealtimeListener
        onProposalUpdate={() => rfqsState.reload()}
        onOrderUpdate={() => ordersState.reload()}
      />

      <section id="buyer-overview" className="scroll-mt-24 py-6 sm:py-8">
        <div className="glass-card border border-white/20 rounded-3xl p-5 sm:p-7">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">Buyer Dashboard</p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white">
                {user ? `Welcome, ${user.name}` : 'Welcome, Buyer'}
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Browse products, create RFQs, manage proposals and orders, and verify traceability via blockchain.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="glass-card border border-white/20 rounded-2xl px-4 py-3">
                <p className="text-xs text-gray-600 dark:text-gray-300">Products shown</p>
                <p className="text-xl font-display font-bold text-gray-900 dark:text-white">{products.length}</p>
              </div>
              <div className="glass-card border border-white/20 rounded-2xl px-4 py-3">
                <p className="text-xs text-gray-600 dark:text-gray-300">Orders</p>
                <p className="text-xl font-display font-bold text-gray-900 dark:text-gray-100">{buyerOrdersList.length}</p>
              </div>
              <div className="glass-card border border-white/20 rounded-2xl px-4 py-3">
                <p className="text-xs text-gray-600 dark:text-gray-300">RFQs</p>
                <p className="text-xl font-display font-bold text-gray-900 dark:text-white">{buyerRfqList.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Browsing */}
      <GlassSection id="buyer-products" eyebrow="Marketplace" title="Product browsing">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Showing products. Use “Advanced Filters” below for more control.
            </p>
            <button className="btn btn-outline" onClick={() => fetchProducts()} disabled={productsLoading}>
              {productsLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={String((p as any).id || (p as any)._id)} className="glass-card border border-white/20 rounded-3xl p-4 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="relative w-full h-28 rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                      {((p as any).images?.[0]) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={(p as any).images?.[0]}
                          alt={(p as any).name || 'Product image'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🥬</div>
                      )}
                    </div>
                    <p className="mt-3 font-display font-bold text-gray-900 dark:text-white truncate">{(p as any).name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{(p as any).category}</p>
                    <p className="text-sm text-gray-800 dark:text-gray-100 mt-2">
                      Price <span className="font-semibold text-primary-700">{(p as any).price}</span> / {(p as any).unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Stock</p>
                    <p className="text-sm font-bold text-primary-700">{(p as any).quantity}</p>
                    <p className="mt-2 text-xs text-gray-500">Rating</p>
                    <p className="text-sm font-bold text-primary-700">
                      {(p as any).farmerRatingAvg ? (Number((p as any).farmerRatingAvg).toFixed(1)) : '—'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Farmer: {(p as any).farmerName || (p as any).farmerId} • {(p as any).location || '—'}
                </div>
                <div className="mt-auto flex gap-2">
                  <button type="button" className="btn btn-primary flex-1" onClick={() => addToCart(p)}>
                    Add to cart
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 mt-4">
            <button
              type="button"
              className="btn btn-outline"
              disabled={filters.page <= 1 || productsLoading}
              onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
            >
              Prev
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Page {filters.page}
              {productsMeta?.totalPages ? ` / ${productsMeta.totalPages}` : ''}
            </p>
            <button
              type="button"
              className="btn btn-primary"
              disabled={productsLoading || (productsMeta?.totalPages ? filters.page >= productsMeta.totalPages : false)}
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            >
              Next
            </button>
          </div>
          {productsError ? <p className="text-sm text-red-600">{productsError}</p> : null}
        </div>
      </GlassSection>

      {/* Advanced Search + Filters */}
      <GlassSection id="buyer-filters" eyebrow="Search" title="Advanced search + filters">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-4">
            <label className="block">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Search</span>
              <input className="input mt-1" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} placeholder="tomatoes, farmer name..." />
            </label>
          </div>
          <div className="sm:col-span-3">
            <label className="block">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Category</span>
              <select className="input mt-1" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}>
                <option value="All">All</option>
                {(categories || []).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="block">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Min price</span>
              <input className="input mt-1" type="number" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value, page: 1 })} />
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="block">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Max price</span>
              <input className="input mt-1" type="number" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value, page: 1 })} />
            </label>
          </div>
          <div className="sm:col-span-1">
            <button type="button" className="btn btn-primary w-full" onClick={() => fetchProducts()}>
              Apply
            </button>
          </div>
          <div className="sm:col-span-12">
            <label className="block">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Location</span>
              <input className="input mt-1" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value, page: 1 })} placeholder="Maharashtra, Gujarat..." />
            </label>
          </div>

          <div className="sm:col-span-6">
            <label className="block">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Sort</span>
              <select
                className="input mt-1"
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value, page: 1 })}
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Rating: High to Low</option>
              </select>
            </label>
          </div>
        </div>
      </GlassSection>

      {/* Bulk Orders (Cart) */}
      <GlassSection id="buyer-bulk" eyebrow="Cart" title="Bulk ordering (cart system)">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <div className="md:col-span-8">
            <div className="glass-card border border-white/20 rounded-3xl p-4">
              <p className="font-display font-bold text-gray-900 dark:text-white">Cart items</p>
              <div className="mt-4 space-y-3">
                {cartList.length ? (
                  cartList.map((it) => (
                    <div key={it.productId} className="glass-card border border-white/15 rounded-2xl p-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{it.productName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            Farmer: {it.farmerName} • Price: {it.price} / {it.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Line total</p>
                          <p className="text-sm font-bold text-primary-700">{Number(it.price) * Number(it.quantity)}</p>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                        <div className="sm:col-span-4">
                          <label className="block">
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Quantity</span>
                            <input
                              type="number"
                              className="input mt-1"
                              value={it.quantity}
                              onChange={(e) => updateCartQty(it.productId, Number(e.target.value))}
                            />
                          </label>
                        </div>
                        <div className="sm:col-span-3">
                          <button type="button" className="btn btn-outline w-full" onClick={() => updateCartQty(it.productId, it.quantity - 1)}>
                            -1
                          </button>
                        </div>
                        <div className="sm:col-span-3">
                          <button type="button" className="btn btn-outline w-full" onClick={() => updateCartQty(it.productId, it.quantity + 1)}>
                            +1
                          </button>
                        </div>
                        <div className="sm:col-span-2">
                          <button type="button" className="btn btn-secondary w-full" onClick={() => updateCartQty(it.productId, 0)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-300">Cart is empty. Add items from Product Browsing.</p>
                )}
              </div>
            </div>
          </div>
          <div className="md:col-span-4">
            <div className="glass-card border border-white/20 rounded-3xl p-4">
              <p className="font-display font-bold text-gray-900 dark:text-white">Checkout</p>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                Total: <span className="font-bold text-primary-700">{cartTotal}</span>
              </p>
              <button type="button" className="btn btn-primary w-full mt-4" disabled={checkoutBusy || !cartList.length} onClick={checkoutCart}>
                {checkoutBusy ? 'Creating orders...' : 'Create orders'}
              </button>
              <p className="mt-2 text-xs text-gray-500">Orders are created via `/api/orders` (buyer-only).</p>
            </div>
          </div>
        </div>
      </GlassSection>

      {/* RFQ Creation */}
      <GlassSection id="buyer-rfqs" eyebrow="RFQs" title="RFQ creation">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <div className="md:col-span-4">
            <div className="glass-card border border-white/20 rounded-3xl p-4">
              <p className="font-display font-bold text-gray-900 dark:text-white">Create RFQ</p>
              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Category</span>
                  <select className="input mt-1" value={rfqDraft.category} onChange={(e) => setRfqDraft({ ...rfqDraft, category: e.target.value })}>
                    <option value="">Select...</option>
                    {(categories || []).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Quantity</span>
                  <input className="input mt-1" type="number" value={rfqDraft.quantity} onChange={(e) => setRfqDraft({ ...rfqDraft, quantity: e.target.value })} />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Requirements</span>
                  <input className="input mt-1" value={rfqDraft.requirements} onChange={(e) => setRfqDraft({ ...rfqDraft, requirements: e.target.value })} placeholder="Organic, packaging, delivery date..." />
                </label>
                <button type="button" className="btn btn-primary w-full" disabled={rfqBusy || !rfqDraft.category || !rfqDraft.quantity} onClick={createRfq}>
                  {rfqBusy ? 'Creating...' : 'Create RFQ'}
                </button>
              </div>
            </div>
          </div>
          <div className="md:col-span-8">
            <div className="glass-card border border-white/20 rounded-3xl p-4">
              <p className="font-display font-bold text-gray-900 dark:text-white">Your RFQs</p>
              <div className="mt-4 space-y-3">
                {(buyerRfqList || []).length ? (
                  buyerRfqList.map((r) => (
                    <div key={r.id} className="glass-card border border-white/15 rounded-2xl p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            RFQ #{String(r.id).slice(0, 8)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            Category: {r.productCategory || r.productName || '—'} • Qty: {r.quantity ?? '—'}
                          </p>
                          {r.requirements ? <p className="text-sm text-gray-800 dark:text-gray-100 mt-1">Req: {r.requirements}</p> : null}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Responses</p>
                          <p className="text-sm font-bold text-primary-700">{(r.responses || []).length}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-300">No RFQs yet.</p>
                )}
              </div>
              <p className="mt-4 text-xs text-gray-500">Proposal management happens in “Proposal Management”.</p>
            </div>
          </div>
        </div>
      </GlassSection>

      {/* Real-time chat */}
      <GlassSection id="buyer-chat" eyebrow="Communication" title="Real-time chat (Socket.IO)">
        <ChatPanel />
      </GlassSection>

      {/* Proposal management */}
      <GlassSection id="buyer-proposals" eyebrow="Negotiation" title="Proposal management">
        <div className="space-y-3">
          {(buyerRfqList || []).length ? (
            buyerRfqList.map((r) => (
              <div key={r.id} className="glass-card border border-white/20 rounded-3xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display font-bold text-gray-900 dark:text-white">RFQ #{String(r.id).slice(0, 8)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Category: {r.productCategory || r.productName || '—'} • Qty: {r.quantity ?? '—'}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">Open</p>
                </div>
                <div className="mt-3 space-y-2">
                  {(r.responses || []).length ? (
                    r.responses.map((p: any) => (
                      <div key={p.id || p._id} className="glass-card border border-white/15 rounded-2xl p-3">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          Supplier: {p.farmerName || p.farmerId}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Product: {p.productId || '—'} • Price: {p.pricePerUnit ?? '—'} • Qty: {p.quantity ?? '—'}
                        </p>
                        {p.deliveryDays ? (
                          <p className="text-sm text-gray-800 dark:text-gray-100 mt-1">
                            Delivery: ~{p.deliveryDays} days
                          </p>
                        ) : null}
                        <div className="mt-3 flex gap-2 flex-wrap">
                          {(() => {
                            const rfqId = (r as any)?.id || (r as any)?._id;
                            const responseId = p?.id || p?._id;
                            const busyKey = rfqId && responseId ? `${rfqId}:${responseId}` : '';
                            return (
                          <button
                            type="button"
                            className="btn btn-primary"
                            disabled={!busyKey || acceptedBusy === busyKey}
                            onClick={() => acceptProposal(r, p)}
                          >
                            {acceptedBusy === busyKey ? 'Accepting...' : 'Accept & create order'}
                          </button>
                            );
                          })()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-300">No proposals yet. Farmers will respond via RFQ.</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">No RFQs available.</p>
          )}
        </div>
      </GlassSection>

      {/* Order tracking */}
      <GlassSection id="buyer-orders" eyebrow="Orders" title="Order tracking">
        <div className="space-y-3">
          {buyerOrdersList.length ? (
            buyerOrdersList.map((o) => (
              <div key={o.id} className="glass-card border border-white/20 rounded-3xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-display font-bold text-gray-900 dark:text-white">Order #{String(o.id).slice(0, 8)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {o.productName || o.productId} • Qty {o.quantity ?? '—'} • Supplier: {o.farmerName || o.farmerId || '—'}
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-100 mt-2">
                      Status: <span className="font-semibold text-primary-700">{o.status || 'pending'}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Payment</p>
                    <p className="text-sm font-bold text-primary-700">{o.paymentStatus || 'pending'}</p>
                    <ContractOpenButton orderId={String((o as any).id || (o as any)._id)} label="View contract" />
                  </div>
                </div>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <button type="button" className="btn btn-outline" onClick={async () => {
                    try {
                      await ordersApi.cancel(o.id);
                      await ordersState.reload();
                      toast.success('Order cancelled');
                    } catch (e: any) {
                      toast.error(e?.response?.data?.error || e?.message || 'Cancel failed');
                    }
                  }}>
                    Cancel (pending)
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => {
                    (async () => {
                      try {
                        await paymentsApi.markPaid(String(o.id));
                        toast.success('Payment marked as paid');
                        await ordersState.reload();
                      } catch (e: any) {
                        toast.error(e?.response?.data?.error || e?.message || 'Payment failed');
                      }
                    })();
                  }}>
                    Mark paid
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">No orders yet.</p>
          )}
        </div>
      </GlassSection>

      {/* Contract viewing */}
      <GlassSection id="buyer-contracts" eyebrow="Contracts" title="Contract viewing">
        <div className="space-y-3">
          {buyerOrdersList.length ? (
            buyerOrdersList.map((o) => (
              <div key={o.id} className="glass-card border border-white/20 rounded-3xl p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display font-bold text-gray-900 dark:text-white truncate">Order #{String(o.id).slice(0, 8)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Product: {o.productName || o.productId}</p>
                </div>
                <ContractOpenButton orderId={String((o as any).id || (o as any)._id)} label="View contract" />
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">No contracts to view.</p>
          )}
        </div>
      </GlassSection>

      {/* Blockchain verification */}
      <GlassSection id="buyer-blockchain" eyebrow="Blockchain" title="Blockchain verification">
        <BlockchainVerifyPanel />
      </GlassSection>

      {/* Supplier ratings */}
      <GlassSection id="buyer-ratings" eyebrow="Community" title="Supplier ratings">
        <SupplierRatingsPanel />
      </GlassSection>

      {/* Profile + history */}
      <GlassSection id="buyer-profile" eyebrow="Account" title="Profile + history">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <div className="glass-card border border-white/20 rounded-3xl p-4">
              <p className="font-display font-bold text-gray-900 dark:text-white">Profile</p>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">Name: {profile?.name || user?.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Email: {profile?.email || user?.email}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Location: {profile?.location || user?.location}</p>
              <p className="mt-3 text-xs text-gray-500">Profile is loaded from `/api/auth/profile`.</p>
            </div>
          </div>
          <div className="md:col-span-7">
            <div className="glass-card border border-white/20 rounded-3xl p-4">
              <p className="font-display font-bold text-gray-900 dark:text-white">Order history</p>
              <div className="mt-3 space-y-3">
                {buyerOrdersList.length ? (
                  buyerOrdersList.slice(0, 6).map((o) => (
                    <div key={o.id} className="glass-card border border-white/15 rounded-2xl p-3">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Order #{String(o.id).slice(0, 8)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {o.productName || o.productId} • Status: {o.status || 'pending'}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-300">No orders yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </GlassSection>

      {/* Forecast dashboard */}
      <GlassSection id="buyer-forecast" eyebrow="AI" title="Forecast dashboard (demand)">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <label className="block">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Category</span>
              <select className="input mt-1" value={forecastCategory} onChange={(e) => setForecastCategory(e.target.value)}>
                <option value="">Select...</option>
                {(categories || []).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <button className="btn btn-primary mt-4 w-full" disabled={!forecastCategory} onClick={fetchForecast}>
              Fetch forecast
            </button>
          </div>
          <div className="md:col-span-8">
            {forecastResult ? (
              <div className="glass-card border border-white/20 rounded-3xl p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">Insight</p>
                <p className="mt-2 font-display font-bold text-gray-900 dark:text-white">{forecastResult.insight}</p>
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastResult.forecast}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="demand" stroke="#16a34a" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300">Select a category to view forecast.</p>
            )}
          </div>
        </div>
      </GlassSection>

      {/* Logistics tracking */}
      <GlassSection id="buyer-logistics" eyebrow="Logistics" title="Logistics tracking">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buyerOrdersList.slice(0, 6).map((o) => (
            <div key={o.id} className="glass-card border border-white/20 rounded-3xl p-4">
              <p className="font-display font-bold text-gray-900 dark:text-white">Order #{String(o.id).slice(0, 8)}</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Route: {o.location || '—'} → Your facility</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">ETA: {o.status === 'delivered' ? 'Completed' : '2–5 days'}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Status: {o.status}</p>
            </div>
          ))}
          {!buyerOrdersList.length ? <p className="text-sm text-gray-600 dark:text-gray-300">No logistics yet.</p> : null}
        </div>
      </GlassSection>

      {/* Inventory planning */}
      <GlassSection id="buyer-inventory" eyebrow="Inventory" title="Inventory planning">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7">
            <div className="glass-card border border-white/20 rounded-3xl p-4">
              <p className="font-display font-bold text-gray-900 dark:text-white">Current stock overview</p>
              <div className="mt-4 space-y-2">
                {planningProducts.slice(0, 8).map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{p.name}</p>
                    <p className="text-sm font-bold text-primary-700 dark:text-primary-300">{p.quantity} {p.unit}</p>
                  </div>
                ))}
                {!planningProducts.length ? <p className="text-sm text-gray-600 dark:text-gray-300">No planning data.</p> : null}
              </div>
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="glass-card border border-white/20 rounded-3xl p-4">
              <p className="font-display font-bold text-gray-900 dark:text-white">Planning summary</p>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                Low stock items are highlighted in <span className="font-semibold text-primary-700">Auto Reorder Logic</span>.
              </p>
            </div>
          </div>
        </div>
      </GlassSection>

      {/* Auto reorder */}
      <GlassSection id="buyer-auto-reorder" eyebrow="Automation" title="Auto reorder logic">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <div className="md:col-span-7">
            <div className="glass-card border border-white/20 rounded-3xl p-4">
              <p className="font-display font-bold text-gray-900 dark:text-white">Low stock items</p>
              <div className="mt-3 space-y-2">
                {lowStock.length ? (
                  lowStock.map((p) => (
                    <div key={p.id} className="glass-card border border-white/15 rounded-2xl p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{p.name}</p>
                        <p className="text-sm font-bold text-primary-700">{p.quantity} {p.unit}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{p.category} • {p.farmerName}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-300">No low-stock items.</p>
                )}
              </div>
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="glass-card border border-white/20 rounded-3xl p-4">
              <p className="font-display font-bold text-gray-900 dark:text-white">Auto reorder</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Creates RFQs for low-stock categories.</p>
              <button type="button" className="btn btn-primary w-full mt-4" onClick={autoReorder}>
                Create RFQs
              </button>
              <p className="mt-2 text-xs text-gray-500">RFQs are created via `/api/rfqs`.</p>
            </div>
          </div>
        </div>
      </GlassSection>

      {/* Supplier comparison */}
      <GlassSection id="buyer-compare" eyebrow="AI" title="Supplier comparison">
        <div className="space-y-3">
          <div className="glass-card border border-white/20 rounded-3xl p-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-5">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Category</span>
                  <select className="input mt-1" value={compareRequirements.category} onChange={(e) => setCompareRequirements({ ...compareRequirements, category: e.target.value })}>
                    {(categories || ['Vegetables']).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="sm:col-span-6">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Location</span>
                  <input className="input mt-1" value={compareRequirements.location} onChange={(e) => setCompareRequirements({ ...compareRequirements, location: e.target.value })} />
                </label>
              </div>
              <div className="sm:col-span-1">
                <button type="button" className="btn btn-primary w-full" onClick={loadComparison}>
                  Load
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {compareResults.map((s) => (
              <div key={s.id} className="glass-card border border-white/20 rounded-3xl p-4">
                <p className="font-display font-bold text-gray-900 dark:text-white">{s.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Match: {s.matchScore}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Rating: {s.rating}</p>
                <p className="text-xs text-gray-500 mt-1">{s.location}</p>
              </div>
            ))}
            {!compareResults.length ? <p className="text-sm text-gray-600 dark:text-gray-300">No comparison results.</p> : null}
          </div>
        </div>
      </GlassSection>

      {/* Payment tracking */}
      <GlassSection id="buyer-payments" eyebrow="Payments" title="Payment tracking">
        <div className="space-y-3">
          {buyerOrdersList.length ? (
            buyerOrdersList.map((o) => (
              <div key={o.id} className="glass-card border border-white/20 rounded-3xl p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display font-bold text-gray-900 dark:text-white">Order #{String(o.id).slice(0, 8)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Payment: {o.paymentStatus || 'pending'}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button type="button" className="btn btn-outline" disabled>
                    Processing
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={async () => {
                      try {
                        await paymentsApi.markPaid(String(o.id));
                        toast.success('Payment marked as paid');
                        await ordersState.reload();
                      } catch (e: any) {
                        toast.error(e?.response?.data?.error || e?.message || 'Payment failed');
                      }
                    }}
                  >
                    Paid
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">No orders.</p>
          )}
        </div>
      </GlassSection>

      {/* Analytics dashboard */}
      <GlassSection id="buyer-analytics" eyebrow="Insights" title="Analytics dashboard">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7 glass-card border border-white/20 rounded-3xl p-4">
            <p className="font-display font-bold text-gray-900 dark:text-white">Spend trend (approx)</p>
            <div className="h-64 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueSeries}>
                  <XAxis dataKey="name" hide />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="md:col-span-5 glass-card border border-white/20 rounded-3xl p-4">
            <p className="font-display font-bold text-gray-900 dark:text-white">Orders by status</p>
            <div className="mt-3 space-y-2">
              {Object.keys(ordersByStatus).length ? (
                Object.entries(ordersByStatus).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 capitalize">{k}</p>
                    <p className="text-sm text-primary-700 dark:text-primary-300 font-bold">{Number(v)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-300">No stats.</p>
              )}
            </div>
          </div>
        </div>
      </GlassSection>

      {/* RBAC */}
      <GlassSection id="buyer-rbac" eyebrow="Security" title="Multi-user roles (RBAC)">
        <div className="glass-card border border-white/20 rounded-3xl p-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Your role: <span className="font-semibold text-primary-700">{user?.role}</span>. Buyer actions are enabled; farmer-only actions are hidden.
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="glass-card border border-white/15 rounded-2xl p-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Enabled</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">RFQ creation, bulk ordering, order tracking</p>
            </div>
            <div className="glass-card border border-white/15 rounded-2xl p-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Disabled</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Product CRUD, responding as farmer</p>
            </div>
          </div>
        </div>
      </GlassSection>

      {/* Export CSV */}
      <GlassSection id="buyer-export" eyebrow="Data" title="Export (CSV)">
        <div className="glass-card border border-white/20 rounded-3xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="font-display font-bold text-gray-900 dark:text-white">Export orders</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Downloads a CSV containing your orders.</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={exportCsv}>
            Export CSV
          </button>
        </div>
      </GlassSection>
    </motion.div>
  );

  // ---------------- panels (scoped local components) ----------------
  function ContractOpenButton({ orderId, label }: { orderId: string; label: string }) {
    const [busy, setBusy] = useState(false);

    return (
      <button
        type="button"
        className="btn btn-outline"
        disabled={busy || !orderId}
        onClick={async () => {
          if (!orderId) return;
          setBusy(true);
          try {
            let contract: any;
            try {
              contract = (await contractsApi.getByOrder(orderId)).data;
            } catch (e: any) {
              // If not generated yet, generate it.
              contract = (await contractsApi.generate(orderId)).data;
            }

            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const pdfUrl = contract?.pdfUrl ? `${apiBase}${contract.pdfUrl}` : null;
            if (!pdfUrl) throw new Error('Contract PDF not found');
            window.open(pdfUrl, '_blank', 'noopener,noreferrer');
          } catch (e: any) {
            toast.error(e?.response?.data?.error || e?.message || 'Failed to open contract');
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? 'Loading...' : label}
      </button>
    );
  }

  function BlockchainVerifyPanel() {
    const [pid, setPid] = useState('');
    const [res, setRes] = useState<any>(null);
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        <div className="md:col-span-4">
          <label className="block">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Product</span>
            <select className="input mt-1" value={pid} onChange={(e) => setPid(e.target.value)}>
              <option value="">Select...</option>
              {planningProducts.map((p) => (
                <option key={String((p as any).id || (p as any)._id)} value={String((p as any).id || (p as any)._id)}>{(p as any).name}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="btn btn-primary mt-4 w-full"
            disabled={!pid}
            onClick={async () => {
              try {
                const verify = (await blockchainApi.verifyProduct(pid)).data;
                const history = (await blockchainApi.getProductHistory(pid)).data;
                setRes({ verify, history });
                toast.success('Blockchain verified');
              } catch (e: any) {
                toast.error(e?.response?.data?.error || e?.message || 'Verify failed');
              }
            }}
          >
            Verify
          </button>
        </div>
        <div className="md:col-span-8">
          {res ? (
            <div className="glass-card border border-white/20 rounded-3xl p-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">Verified: <span className="font-semibold text-primary-700">{String(res.verify.verified)}</span></p>
              <p className="mt-3 font-display font-bold text-gray-900 dark:text-white">History</p>
              <div className="mt-2 max-h-[240px] overflow-y-auto pr-1 space-y-2">
                {(res.history?.history || []).slice(-8).map((h: any) => (
                  <div key={h.id} className="glass-card border border-white/15 rounded-2xl p-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{h.action || h.txHash?.slice?.(0, 10)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{h.timestamp ? new Date(h.timestamp).toLocaleString() : ''}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">Select a product to verify.</p>
          )}
        </div>
      </div>
    );
  }

  function SupplierRatingsPanel() {
    const farmers = useMemo(() => {
      const set = new Set<string>();
      for (const p of planningProducts) if (p.farmerId) set.add(p.farmerId);
      for (const o of buyerOrdersList) if (o.farmerId) set.add(o.farmerId);
      return Array.from(set);
    }, [planningProducts, buyerOrdersList]);

    const [summary, setSummary] = useState<Record<string, { averageRating: number | null; count: number }>>({});
    const [summaryBusy, setSummaryBusy] = useState(false);
    const [orderIdToRate, setOrderIdToRate] = useState<string>('');
    const selectedFarmerId = supplierRatingDraftFarmerId;

    useEffect(() => {
      let cancelled = false;
      (async () => {
        if (!farmers.length) return;
        setSummaryBusy(true);
        try {
          const results = await Promise.all(
            farmers.map(async (fid) => {
              try {
                const { data } = await supplierRatingsApi.summary(fid);
                return { fid, data };
              } catch {
                return { fid, data: { averageRating: null, count: 0 } };
              }
            }),
          );
          if (cancelled) return;
          const next: Record<string, { averageRating: number | null; count: number }> = {};
          for (const r of results) next[r.fid] = { averageRating: r.data.averageRating, count: r.data.count };
          setSummary(next);
        } finally {
          if (!cancelled) setSummaryBusy(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [farmers]);

    const deliveredOrdersForFarmer = useMemo(() => {
      if (!selectedFarmerId) return [];
      return (buyerOrdersList || [])
        .filter((o) => o.farmerId === selectedFarmerId && o.status === 'delivered')
        .filter((o) => !o.rating);
    }, [buyerOrdersList, selectedFarmerId]);

    useEffect(() => {
      setOrderIdToRate('');
      setSupplierReview('');
    }, [selectedFarmerId]);

    const avg = summary[selectedFarmerId]?.averageRating ?? null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-7">
          <div className="glass-card border border-white/20 rounded-3xl p-4">
            <p className="font-display font-bold text-gray-900 dark:text-white">Suppliers</p>
            <div className="mt-3 space-y-2">
              {farmers.length ? farmers.map((fid) => (
                <button
                  key={fid}
                  type="button"
                  className={`w-full text-left glass-card border rounded-3xl p-3 transition-colors ${
                    supplierRatingDraftFarmerId === fid ? 'border-primary-500/40 bg-primary-50/60' : 'border-white/15 bg-white/5 hover:border-white/25'
                  }`}
                  onClick={() => setSupplierRatingDraftFarmerId(fid)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{fid}</p>
                    <p className="text-sm font-bold text-primary-700">
                      {summaryBusy
                        ? '...'
                        : summary[fid]?.averageRating !== null && summary[fid]?.averageRating !== undefined
                          ? summary[fid]!.averageRating!.toFixed(1)
                          : '—'}
                    </p>
                  </div>
                </button>
              )) : (
                <p className="text-sm text-gray-600 dark:text-gray-300">No suppliers found.</p>
              )}
            </div>
          </div>
        </div>
        <div className="md:col-span-5">
          <div className="glass-card border border-white/20 rounded-3xl p-4">
            <p className="font-display font-bold text-gray-900 dark:text-white">Rate supplier</p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Avg: {avg !== null ? Number(avg).toFixed(1) : '—'}
            </p>

            <label className="block mt-4">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Order to rate</span>
              <select
                className="input mt-1"
                value={orderIdToRate}
                onChange={(e) => setOrderIdToRate(e.target.value)}
                disabled={!selectedFarmerId || !deliveredOrdersForFarmer.length}
              >
                <option value="">{deliveredOrdersForFarmer.length ? 'Select delivered order...' : 'No unrated delivered orders'}</option>
                {deliveredOrdersForFarmer.map((o) => (
                  <option key={o.id} value={o.id}>
                    {String(o.id).slice(0, 8)} • Qty {o.quantity}
                  </option>
                ))}
              </select>
            </label>

            <label className="block mt-4">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Stars</span>
              <select className="input mt-1" value={supplierStars} onChange={(e) => setSupplierStars(Number(e.target.value))}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n} ★</option>
                ))}
              </select>
            </label>
            <label className="block mt-3">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Review</span>
              <input className="input mt-1" value={supplierReview} onChange={(e) => setSupplierReview(e.target.value)} placeholder="Short review..." />
            </label>
            <button
              type="button"
              className="btn btn-primary w-full mt-4"
              disabled={!orderIdToRate}
              onClick={async () => {
                if (!orderIdToRate) return;
                try {
                  await ordersApi.rate(orderIdToRate, supplierStars, supplierReview);
                  toast.success('Review saved');
                  await ordersState.reload();
                } catch (e: any) {
                  toast.error(e?.response?.data?.error || e?.message || 'Failed to save review');
                }
              }}
            >
              Save review
            </button>
          </div>
        </div>
      </div>
    );
  }
}

