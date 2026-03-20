'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import GlassSection from '@/components/dashboard/shared/GlassSection';
import ChatPanel from '@/components/dashboard/shared/ChatPanel';
import DashboardRealtimeListener from '@/components/dashboard/shared/DashboardRealtimeListener';
import MockContractButton from '@/components/dashboard/shared/MockContractButton';
import { useOfflineCache } from '@/hooks/useOfflineCache';
import { productsApi, ordersApi, rfqApi, aiApi, blockchainApi, authApi, logisticsApi, samplesApi, tendersApi, supplierRatingsApi } from '@/lib/api';
import { useAuthZustand } from '@/store/authZustand';
import { createAppSocket } from '@/lib/socketClient';
import { decodeJwtPayload } from '@/lib/jwtDecode';
import ProductForm, { ProductFormData } from '@/components/dashboard/farmer/ProductForm';
import ChatRoom from '@/components/dashboard/chat/ChatRoom';

type Product = any;
type Order = any;
type Rfq = any;

const STORAGE_LANG = 'dashboardLang';

const i18n = {
  en: {
    overview: 'Farmer Dashboard',
    create: 'Create',
    save: 'Save',
    update: 'Update',
    cancel: 'Cancel',
    add: 'Add',
    analyze: 'Analyze',
    verify: 'Verify',
    offline: 'Offline',
    online: 'Online',
  },
  es: {
    overview: 'Panel del Agricultor',
    create: 'Crear',
    save: 'Guardar',
    update: 'Actualizar',
    cancel: 'Cancelar',
    add: 'Agregar',
    analyze: 'Analizar',
    verify: 'Verificar',
    offline: 'Sin conexión',
    online: 'En línea',
  },
} as const;

export default function FarmerDashboard() {
  const { user, token } = useAuthZustand((s) => ({ user: s.user, token: s.token }));
  const [lang, setLang] = useState<'en' | 'es'>('en');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_LANG);
      if (raw === 'es') setLang('es');
    } catch {
      // ignore
    }
  }, []);

  const t = i18n[lang];

  // Socket emit client for proposal/order updates
  const emitSocketRef = useRef<any>(null);
  useEffect(() => {
    if (!token || !user?.id) return;
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
  }, [token, user?.id]);

  const productsState = useOfflineCache<Product[]>(`farmer-products-${user?.id || 'guest'}`, async () => {
    if (!user?.id) return [];
    const res = await productsApi.getByFarmer(user.id);
    return res.data || [];
  });
  const ordersState = useOfflineCache<Order[]>('farmer-orders', async () => {
    const res = await ordersApi.getAll();
    return res.data || [];
  });
  const rfqsState = useOfflineCache<Rfq[]>('farmer-rfqs', async () => {
    const res = await rfqApi.getAll();
    return res.data || [];
  });

  const products = productsState.data || [];
  const orders = ordersState.data || [];
  const rfqs = rfqsState.data || [];

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

  // Product CRUD form
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const resetProductForm = () => {
    setEditingProductId(null);
    setShowProductForm(false);
  };

  const submitProduct = async (data: ProductFormData) => {
    try {
      const payload = {
        name: data.name,
        category: data.category || categories[0],
        description: data.description,
        price: data.price,
        unit: data.unit,
        quantity: data.quantity,
        images: data.imageUrl ? [data.imageUrl] : [],
        certifications: Array.isArray(data.certifications) 
          ? data.certifications 
          : typeof data.certifications === 'string' 
            ? data.certifications.split(',').map((c) => c.trim()).filter(Boolean)
            : ['Organic'],
      };

      if (editingProductId) {
        await productsApi.update(editingProductId, payload);
        toast.success('Product updated');
      } else {
        const created = (await productsApi.create(payload)).data;
        toast.success('Product created');
        if (user?.role === 'farmer') {
          await blockchainApi.recordProductCreated({
            productId: created.id,
            farmerId: user.id,
            farmerName: user.name,
            productDetails: {
              name: created.name,
              category: created.category,
              certifications: created.certifications || payload.certifications,
            },
            location: created.location || user.location || '',
          });
        }
      }
      await productsState.reload();
      resetProductForm();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Product action failed');
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await productsApi.delete(productId);
      toast.success('Product deleted');
      await productsState.reload();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Delete failed');
    }
  };

  const updateInventory = async (productId: string, nextQty: number) => {
    try {
      await productsApi.update(productId, { quantity: nextQty });
      toast.success('Inventory updated');
      await productsState.reload();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Inventory update failed');
    }
  };

  const [orderBusy, setOrderBusy] = useState<string | null>(null);
  const setOrderStatus = async (orderId: string, status: string) => {
    setOrderBusy(orderId);
    try {
      const updated = (await ordersApi.updateStatus(orderId, status)).data;
      toast.success('Order status updated');
      await ordersState.reload();

      // Record transfer when order moves forward
      if (status !== 'pending' && updated?.productId && updated?.farmerId && updated?.buyerId) {
        await blockchainApi.recordTransfer({
          productId: updated.productId,
          from: updated.farmerId,
          to: updated.buyerId,
          quantity: updated.quantity,
          orderId: updated.id,
        });
      }

      if (updated?.buyerId) {
        emitSocketRef.current?.emit('order_update', {
          recipientId: updated.buyerId,
          order: updated,
          orderId: updated.id,
        });
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to update status');
    } finally {
      setOrderBusy(null);
    }
  };

  // RFQ respond (price negotiation)
  const [respondBusy, setRespondBusy] = useState<string | null>(null);
  const [respondDrafts, setRespondDrafts] = useState<Record<string, any>>({});

  const respondToRfq = async (rfqId: string) => {
    setRespondBusy(rfqId);
    try {
      const draft = respondDrafts[rfqId] || {};
      await rfqApi.respond(rfqId, {
        productId: draft.productId,
        productName: draft.productName,
        quantity: Number(draft.quantity),
        pricePerUnit: Number(draft.price),
        deliveryDays: Number(draft.deliveryDays || 3), // Default to 3 if not specified
        notes: draft.message || '',
        farmerName: user?.name || 'Farmer',
      });
      toast.success('Proposal submitted');
      await rfqsState.reload();

      const rfq = rfqs.find((x) => x.id === rfqId);
      const recipientId = rfq?.buyerId;
      if (recipientId) {
        emitSocketRef.current?.emit('proposal_update', {
          recipientId,
          proposal: { ...draft, rfqId },
          rfqId,
        });
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to respond');
    } finally {
      setRespondBusy(null);
    }
  };

  // AI quality grading
  const [qualityProductId, setQualityProductId] = useState('');
  const [qualityResult, setQualityResult] = useState<any>(null);
  const gradeQuality = async () => {
    if (!qualityProductId) return;
    try {
      const res = await aiApi.getQualityGrade(qualityProductId);
      setQualityResult(res.data);
      toast.success('Quality analyzed');
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Quality analysis failed');
    }
  };

  // Demand forecasting
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

  // Blockchain traceability
  const [blockchainProductId, setBlockchainProductId] = useState('');
  const [blockchainResult, setBlockchainResult] = useState<{ verify: any; history: any } | null>(null);

  const verifyBlockchain = async () => {
    if (!blockchainProductId) return;
    try {
      const verify = (await blockchainApi.verifyProduct(blockchainProductId)).data;
      const history = (await blockchainApi.getProductHistory(blockchainProductId)).data;
      setBlockchainResult({ verify, history });
      toast.success(verify.verified ? 'Verified in blockchain' : 'Not found in blockchain');
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Blockchain verify failed');
    }
  };

  // Profile + KYC (KYC stored locally in demo)
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

  const [kyc, setKyc] = useState<{ submittedAt?: string; fileName?: string } | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('farmer-kyc');
      if (raw) setKyc(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  // Ratings (local demo)
  const [ratingDraftProductId, setRatingDraftProductId] = useState('');
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingReview, setRatingReview] = useState('');
  const [ratingsByProduct, setRatingsByProduct] = useState<Record<string, Array<{ rating: number; review: string }>>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem('farmer-ratings');
      if (raw) setRatingsByProduct(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const saveRating = () => {
    if (!ratingDraftProductId) return;
    const next = { ...ratingsByProduct };
    next[ratingDraftProductId] = next[ratingDraftProductId] ? [...next[ratingDraftProductId]] : [];
    next[ratingDraftProductId].push({ rating: ratingStars, review: ratingReview });
    setRatingsByProduct(next);
    try {
      localStorage.setItem('farmer-ratings', JSON.stringify(next));
    } catch {
      // ignore
    }
    setRatingReview('');
    toast.success('Review saved');
  };

  // Tenders + Samples (API connected)
  const [buyerRecommendations, setBuyerRecommendations] = useState<any[]>([]);

  const logisticsState = useOfflineCache<any[]>('farmer-logistics', async () => {
    const res = await logisticsApi.getAll();
    return res.data || [];
  });
  const samplesState = useOfflineCache<any[]>('farmer-samples', async () => {
    const res = await samplesApi.getAll();
    return res.data || [];
  });
  const myTendersState = useOfflineCache<any[]>('farmer-tenders-my', async () => {
    const res = await tendersApi.getMy();
    return res.data || [];
  });
  const openTendersState = useOfflineCache<any[]>('farmer-tenders-open', async () => {
    const res = await tendersApi.getAll({ status: 'open' });
    return res.data || [];
  });

  const logistics = logisticsState.data || [];
  const samples = samplesState.data || [];
  const myTenders = myTendersState.data || [];
  const openTenders = openTendersState.data || [];

  const [tenderBidAmount, setTenderBidAmount] = useState('');
  const [tenderDeliveryTimeline, setTenderDeliveryTimeline] = useState('');
  const [tenderNotes, setTenderNotes] = useState('');

  const submitTenderBid = async (tenderId: string) => {
    if (!tenderBidAmount || !tenderDeliveryTimeline) {
      toast.error('Please fill in bid amount and delivery timeline');
      return;
    }
    try {
      await tendersApi.bid(tenderId, {
        bidAmount: Number(tenderBidAmount),
        deliveryTimeline: tenderDeliveryTimeline,
        notes: tenderNotes,
        farmerName: user?.name,
      });
      toast.success('Bid submitted successfully');
      await openTendersState.reload();
      await myTendersState.reload();
      setTenderBidAmount('');
      setTenderDeliveryTimeline('');
      setTenderNotes('');
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Bid submission failed');
    }
  };

  const updateLogisticsStatus = async (logisticsId: string, status: string, lastLocation: string) => {
    try {
      await logisticsApi.update(logisticsId, { status, lastLocation });
      toast.success(`Logistics updated to ${status}`);
      await logisticsState.reload();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to update logistics');
    }
  };

  const updateSampleStatus = async (sampleId: string, status: string) => {
    try {
      await samplesApi.updateStatus(sampleId, status);
      toast.success(`Sample request ${status}`);
      await samplesState.reload();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to update sample');
    }
  };

  // Analytics
  const ordersByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of orders) {
      const s = o.status || 'unknown';
      counts[s] = (counts[s] || 0) + 1;
    }
    return counts;
  }, [orders]);

  const revenueSeries = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of orders) {
      const created = o.createdAt ? new Date(o.createdAt) : null;
      const key = created ? created.toLocaleDateString() : 'Unknown';
      const val = Number(o.total || (o.price && o.quantity ? Number(o.price) * Number(o.quantity) : 0));
      map[key] = (map[key] || 0) + val;
    }
    const keys = Object.keys(map).slice(0, 6);
    const points = keys.map((k) => ({ name: k, value: map[k] }));
    return points.length ? points : [{ name: 'No data', value: 0 }];
  }, [orders]);

  const offlineNote = useMemo(() => {
    const anyErr = Boolean(productsState.error || ordersState.error || rfqsState.error);
    return anyErr ? 'You may be viewing cached data. Reconnect to refresh.' : 'Online. Data is up to date.';
  }, [productsState.error, ordersState.error, rfqsState.error]);

  // Product performance insights
  const performance = useMemo(() => {
    const map: Record<string, { product: Product; orders: number; avgPrice: number; avgRating: number }> = {};
    for (const p of products) {
      map[p.id] = { product: p, orders: 0, avgPrice: 0, avgRating: 0 };
    }
    for (const o of orders) {
      const pid = o.productId || o.product?.id;
      if (!pid || !map[pid]) continue;
      map[pid].orders += 1;
      map[pid].avgPrice += Number(o.price || 0);
    }
    for (const pid of Object.keys(map)) {
      const productOrders = orders.filter(o => (o.productId === pid || o.product?.id === pid) && o.rating);
      const ratingAvg = productOrders.length 
        ? productOrders.reduce((a, o) => a + Number(o.rating), 0) / productOrders.length 
        : 0;
      map[pid].avgRating = ratingAvg;
      map[pid].avgPrice = map[pid].orders ? map[pid].avgPrice / map[pid].orders : 0;
    }
    return Object.values(map).sort((a, b) => b.orders - a.orders).slice(0, 6);
  }, [products, orders, ratingsByProduct]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-0">
      <DashboardRealtimeListener onProposalUpdate={() => rfqsState.reload()} onOrderUpdate={() => ordersState.reload()} />

      <section id="farmer-overview" className="scroll-mt-24 py-6 sm:py-8">
        <div className="glass-card border border-white/20 rounded-3xl p-5 sm:p-7">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">{t.overview}</p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white">
                {user ? `Welcome, ${user.name}` : 'Welcome, Farmer'}
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Products • Inventory • Orders • RFQs • AI quality and forecasting • Blockchain traceability
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="glass-card border border-white/20 rounded-2xl px-4 py-3">
                <p className="text-xs text-gray-600 dark:text-gray-300">Products</p>
                <p className="text-xl font-display font-bold text-gray-900 dark:text-white">{products.length}</p>
              </div>
              <div className="glass-card border border-white/20 rounded-2xl px-4 py-3">
                <p className="text-xs text-gray-600 dark:text-gray-300">Orders</p>
                <p className="text-xl font-display font-bold text-gray-900 dark:text-white">{orders.length}</p>
              </div>
              <div className="glass-card border border-white/20 rounded-2xl px-4 py-3">
                <p className="text-xs text-gray-600 dark:text-gray-300">RFQs</p>
                <p className="text-xl font-display font-bold text-gray-900 dark:text-white">{rfqs.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <GlassSection id="farmer-product-crud" eyebrow="Core" title="Product CRUD (API connected)">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between gap-4 mb-3">
              <p className="font-display font-bold text-gray-900 dark:text-white">Your products</p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setEditingProductId(null);
                  setShowProductForm(true);
                }}
              >
                {t.add} product
              </button>
            </div>
            {productsState.loading ? (
              <p className="text-sm text-gray-600 dark:text-gray-300">Loading...</p>
            ) : products.length ? (
              <div className="space-y-3">
                {products.map((p) => (
                  <div key={p.id} className="glass-card border border-white/20 rounded-3xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4">
                        {p.images && p.images[0] && (
                          <div className="w-16 h-16 rounded-xl overflow-hidden shadow border border-gray-200 dark:border-gray-800 flex-shrink-0">
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-display font-bold text-gray-900 dark:text-white truncate">{p.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {p.category} • Qty {p.quantity} {p.unit}
                          </p>
                        <p className="text-sm text-gray-800 dark:text-gray-100 mt-1">
                          Price: <span className="font-semibold text-primary-700">{p.price}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => {
                            setEditingProductId(p.id);
                            setShowProductForm(true);
                          }}
                        >
                          Edit
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => deleteProduct(p.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300">No products found.</p>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="glass-card border border-white/20 rounded-3xl p-4">
              <p className="font-display font-bold text-gray-900 dark:text-white">
                {editingProductId ? 'Edit product' : 'Create product'}
              </p>
              {showProductForm ? (
                <ProductForm
                  isEditing={!!editingProductId}
                  categories={categories.length ? categories : ['Vegetables', 'Fruits', 'Grains', 'Dairy']}
                  initialData={
                    editingProductId
                      ? (() => {
                          const p = products.find((x) => x.id === editingProductId);
                          if (!p) return undefined;
                          return {
                            name: p.name,
                            category: p.category,
                            price: p.price,
                            unit: p.unit || 'kg',
                            quantity: p.quantity,
                            description: p.description || '',
                            certifications: (p.certifications || []).join(', '),
                            imageUrl: p.images?.[0] || '',
                          };
                        })()
                      : undefined
                  }
                  onSubmit={submitProduct}
                  onCancel={resetProductForm}
                />
              ) : (
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">Click “Add product” to begin.</p>
              )}
            </div>
          </div>
        </div>
      </GlassSection>

      <GlassSection id="farmer-inventory" eyebrow="Inventory" title="Inventory tracking">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((p) => (
            <div key={p.id} className="glass-card border border-white/20 rounded-3xl p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display font-bold text-gray-900 dark:text-white truncate">{p.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{p.category}</p>
                </div>
                <p className="text-lg font-display font-bold text-primary-700 dark:text-primary-300">{p.quantity} {p.unit}</p>
              </div>
              <div className="mt-3">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">New quantity</span>
                  <input
                    type="number"
                    className="input mt-1"
                    defaultValue={p.quantity}
                    onBlur={(e) => {
                      const nextQty = Number(e.target.value);
                      if (Number.isFinite(nextQty)) updateInventory(p.id, nextQty);
                    }}
                  />
                </label>
              </div>
            </div>
          ))}
          {!products.length ? <p className="text-sm text-gray-600 dark:text-gray-300">No products to track.</p> : null}
        </div>
      </GlassSection>

      <GlassSection id="farmer-orders" eyebrow="Orders" title="Order management (status updates)">
        <div className="space-y-3">
          {orders.length ? (
            orders.map((o) => (
              <div key={o.id} className="glass-card border border-white/20 rounded-3xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-display font-bold text-gray-900 dark:text-white">Order #{String(o.id).slice(0, 8)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {o.productName || o.productId || 'Product'} • Qty {o.quantity ?? '—'} {o.unit ?? ''}
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-100 mt-2">
                      Status: <span className="font-semibold text-primary-700">{o.status || 'pending'}</span> • Payment: {o.paymentStatus || 'pending'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2 flex-wrap justify-end">
                      {['pending', 'accepted', 'shipped', 'delivered'].map((s) => (
                        <button
                          key={s}
                          type="button"
                          disabled={orderBusy === o.id}
                          onClick={() => setOrderStatus(o.id, s)}
                          className={`btn ${o.status === s ? 'btn-primary' : 'btn-outline'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <MockContractButton contractLabel="Generate contract" details={o} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">No orders yet.</p>
          )}
        </div>
      </GlassSection>

      <GlassSection id="farmer-rfqs" eyebrow="RFQs" title="RFQ management (respond with proposals)">
        <div className="space-y-3">
          {rfqs.length ? (
            rfqs.map((r) => {
              const draft = respondDrafts[r.id] || {};
              return (
                <div key={r.id} className="glass-card border border-white/20 rounded-3xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-display font-bold text-gray-900 dark:text-white">RFQ #{String(r.id).slice(0, 8)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Buyer: {r.buyerId || '—'} • Category: {r.category || '—'} • Qty: {r.quantity ?? '—'}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">Responses: {(r.responses || []).length}</p>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-5">
                      <label className="block">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Product</span>
                        <select
                          className="input mt-1"
                          value={draft.productId || (products[0]?.id ?? '')}
                          onChange={(e) => {
                            const p = products.find((x) => x.id === e.target.value);
                            setRespondDrafts((prev) => ({
                              ...prev,
                              [r.id]: {
                                ...draft,
                                productId: e.target.value,
                                productName: p?.name,
                                price: draft.price ?? p?.price ?? '',
                                quantity: draft.quantity ?? r.quantity ?? p?.quantity ?? '',
                              },
                            }));
                          }}
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Price</span>
                        <input
                          className="input mt-1"
                          type="number"
                          value={draft.price ?? ''}
                          onChange={(e) => setRespondDrafts((prev) => ({ ...prev, [r.id]: { ...draft, price: e.target.value } }))}
                        />
                      </label>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Quantity</span>
                        <input
                          className="input mt-1"
                          type="number"
                          value={draft.quantity ?? ''}
                          onChange={(e) => setRespondDrafts((prev) => ({ ...prev, [r.id]: { ...draft, quantity: e.target.value } }))}
                        />
                      </label>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Delivery (Days)</span>
                        <input
                          className="input mt-1"
                          type="number"
                          value={draft.deliveryDays ?? ''}
                          onChange={(e) => setRespondDrafts((prev) => ({ ...prev, [r.id]: { ...draft, deliveryDays: e.target.value } }))}
                        />
                      </label>
                    </div>
                    <div className="sm:col-span-1 flex items-end">
                      <button
                        type="button"
                        disabled={respondBusy === r.id}
                        className="btn btn-primary w-full"
                        onClick={() => respondToRfq(r.id)}
                      >
                        {respondBusy === r.id ? 'Sending...' : 'Submit'}
                      </button>
                    </div>
                    <div className="sm:col-span-12">
                      <label className="block">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Message</span>
                        <input
                          className="input mt-1"
                          value={draft.message ?? ''}
                          onChange={(e) => setRespondDrafts((prev) => ({ ...prev, [r.id]: { ...draft, message: e.target.value } }))}
                          placeholder="Quality notes / availability..."
                        />
                      </label>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">No RFQs yet.</p>
          )}
        </div>
      </GlassSection>

      <GlassSection id="farmer-chat" eyebrow="Communication" title="Advanced Real-Time Chat">
        <div className="max-w-5xl mx-auto">
          <ChatRoom 
            conversationId={orders[0]?.id || 'demo-conv-id'} 
            recipientId={orders[0]?.buyerId || 'demo-buyer-id'} 
            recipientName={orders[0]?.buyerName || 'Sample Buyer'} 
          />
        </div>
      </GlassSection>

      <GlassSection id="farmer-ai-quality" eyebrow="AI" title="AI quality grading (API call)">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <label className="block">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Product</span>
              <select className="input mt-1" value={qualityProductId} onChange={(e) => setQualityProductId(e.target.value)}>
                <option value="">Select...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
            <button className="btn btn-primary mt-4 w-full" disabled={!qualityProductId} onClick={gradeQuality}>
              {t.analyze}
            </button>
          </div>
          <div className="md:col-span-8">
            {qualityResult ? (
              <div className="glass-card border border-white/20 rounded-3xl p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">Result</p>
                <p className="mt-2 text-2xl font-display font-bold text-primary-700">Grade {qualityResult.grade} • Score {qualityResult.score}</p>
                <div className="mt-4 space-y-2">
                  {Object.entries(qualityResult.factors || {}).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{k}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{String(v)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300">Select a product to analyze.</p>
            )}
          </div>
        </div>
      </GlassSection>

      <GlassSection id="farmer-buyer-recommendations" eyebrow="AI" title="Buyer recommendations">
        <div className="glass-card border border-white/20 rounded-3xl p-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Loads AI recommendations (uses the available backend endpoint in this repo).
          </p>
          <button
            type="button"
            className="btn btn-primary mt-4"
            onClick={async () => {
              try {
                const res = await aiApi.getSupplierRecommendation(user?.id || '1', { location: user?.location });
                const recs = res.data?.recommendations || [];
                if (!recs.length) {
                  toast('No recommendations');
                  return;
                }
                toast.success('Recommendations loaded');
                // store for rendering
                setBuyerRecommendations(recs);
              } catch (e: any) {
                toast.error(e?.response?.data?.error || e?.message || 'Recommendations failed');
              }
            }}
          >
            Load recommendations
          </button>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(buyerRecommendations || []).map((b: any) => (
              <div key={b.id} className="glass-card border border-white/15 rounded-2xl p-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{b.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Match score: {b.matchScore}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Rating: {b.rating}</p>
                <p className="text-xs text-gray-500 mt-1">{b.location}</p>
              </div>
            ))}
          </div>
        </div>
      </GlassSection>

      <GlassSection id="farmer-negotiation" eyebrow="Negotiation" title="Price negotiation (proposal system)">
        <div className="space-y-3">
          {rfqs.length ? (
            rfqs.map((r) => (
              <div key={r.id} className="glass-card border border-white/20 rounded-3xl p-4">
                <p className="font-display font-bold text-gray-900 dark:text-white">RFQ #{String(r.id).slice(0, 8)}</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Responses: {(r.responses || []).length}</p>
                <div className="mt-3 space-y-2">
                  {(r.responses || []).filter((x: any) => x.farmerId === user?.id).map((res: any) => (
                    <div key={res.id} className="glass-card border border-white/15 rounded-2xl p-3">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{res.productName || res.productId}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Price: {res.price ?? '—'} • Qty: {res.quantity ?? '—'}</p>
                      {res.message ? <p className="text-sm text-gray-800 dark:text-gray-100 mt-1">{res.message}</p> : null}
                    </div>
                  ))}
                  {!((r.responses || []).filter((x: any) => x.farmerId === user?.id).length) ? (
                    <p className="text-sm text-gray-600 dark:text-gray-300">No submitted proposals yet.</p>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">No negotiation data.</p>
          )}
        </div>
      </GlassSection>

      <GlassSection id="farmer-contracts" eyebrow="Contracts" title="Contract generation (mock PDF)">
        <div className="space-y-3">
          {orders.length ? (
            orders.map((o) => (
              <div key={o.id} className="glass-card border border-white/20 rounded-3xl p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display font-bold text-gray-900 dark:text-white truncate">Order #{String(o.id).slice(0, 8)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Product: {o.productName || o.productId || '—'}</p>
                </div>
                <MockContractButton contractLabel="Generate contract" details={o} />
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">No contracts available.</p>
          )}
        </div>
      </GlassSection>

      <GlassSection id="farmer-blockchain" eyebrow="Blockchain" title="Blockchain traceability (verify + history)">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <div className="md:col-span-4">
            <label className="block">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Product</span>
              <select className="input mt-1" value={blockchainProductId} onChange={(e) => setBlockchainProductId(e.target.value)}>
                <option value="">Select...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
            <button className="btn btn-primary mt-4 w-full" disabled={!blockchainProductId} onClick={verifyBlockchain}>
              {t.verify}
            </button>
          </div>
          <div className="md:col-span-8">
            {blockchainResult ? (
              <div className="glass-card border border-white/20 rounded-3xl p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Verified: <span className="font-semibold text-primary-700">{String(blockchainResult.verify.verified)}</span>
                </p>
                <p className="mt-3 font-display font-bold text-gray-900 dark:text-white">History</p>
                <div className="mt-2 max-h-[240px] overflow-y-auto pr-1 space-y-2">
                  {(blockchainResult.history?.history || []).length ? (
                    (blockchainResult.history.history || []).slice(-8).map((h: any) => (
                      <div key={h.id} className="glass-card border border-white/15 rounded-2xl p-3">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{h.action || h.txHash?.slice?.(0, 10)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {h.timestamp ? new Date(h.timestamp).toLocaleString() : ''} • Actor: {h.actor || '—'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-300">No blockchain records found.</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300">Select a product to verify.</p>
            )}
          </div>
        </div>
      </GlassSection>

      <GlassSection id="farmer-ratings" eyebrow="Community" title="Ratings & reviews">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Demo ratings stored locally. Select a product and submit a review.
            </p>
            <div className="mt-4 space-y-2">
              {products.map((p) => {
                const list = ratingsByProduct[p.id] || [];
                const avg = list.length ? list.reduce((a, r) => a + Number(r.rating), 0) / list.length : 0;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setRatingDraftProductId(p.id)}
                    className={`w-full text-left glass-card border rounded-3xl p-3 transition-colors ${
                      ratingDraftProductId === p.id ? 'border-primary-500/40 bg-primary-50/60' : 'border-white/15 bg-white/5 hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{p.name}</span>
                      <span className="text-sm text-primary-700 dark:text-primary-300 font-bold">
                        {avg ? avg.toFixed(1) : '—'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="glass-card border border-white/20 rounded-3xl p-4">
              <p className="font-display font-bold text-gray-900 dark:text-white">Write a review</p>
              <label className="block mt-4">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Rating</span>
                <select className="input mt-1" value={ratingStars} onChange={(e) => setRatingStars(Number(e.target.value))}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} ★</option>
                  ))}
                </select>
              </label>
              <label className="block mt-3">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Review</span>
                <input className="input mt-1" value={ratingReview} onChange={(e) => setRatingReview(e.target.value)} placeholder="Short review..." />
              </label>
              <button type="button" className="btn btn-primary w-full mt-4" disabled={!ratingDraftProductId} onClick={saveRating}>
                Save review
              </button>
              <p className="mt-2 text-xs text-gray-500">You can rate again anytime (stored locally).</p>
            </div>
          </div>
        </div>
      </GlassSection>

      <GlassSection id="farmer-kyc" eyebrow="Account" title="Profile + KYC upload">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <div className="md:col-span-7">
            <div className="glass-card border border-white/20 rounded-3xl p-4">
              <p className="font-display font-bold text-gray-900 dark:text-white">Profile</p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Name</span>
                  <input
                    className="input mt-1"
                    value={profile?.name ?? ''}
                    onChange={(e) => setProfile((p: any) => ({ ...(p || {}), name: e.target.value }))}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Phone</span>
                  <input
                    className="input mt-1"
                    value={profile?.phone ?? ''}
                    onChange={(e) => setProfile((p: any) => ({ ...(p || {}), phone: e.target.value }))}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Location</span>
                  <input
                    className="input mt-1"
                    value={profile?.location ?? ''}
                    onChange={(e) => setProfile((p: any) => ({ ...(p || {}), location: e.target.value }))}
                  />
                </label>
              </div>
              <button
                type="button"
                className="btn btn-primary w-full mt-4"
                disabled={profileBusy || !profile?.name}
                onClick={async () => {
                  try {
                    setProfileBusy(true);
                    await authApi.updateProfile({
                      name: profile?.name,
                      location: profile?.location,
                      phone: profile?.phone,
                    });
                    const res = await authApi.getProfile();
                    setProfile(res.data);
                    toast.success('Profile updated');
                  } catch (e: any) {
                    toast.error(e?.response?.data?.error || e?.message || 'Update failed');
                  } finally {
                    setProfileBusy(false);
                  }
                }}
              >
                {profileBusy ? 'Saving...' : 'Save profile'}
              </button>
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="glass-card border border-white/20 rounded-3xl p-4">
              <p className="font-display font-bold text-gray-900 dark:text-white">KYC upload</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Demo stores KYC metadata locally.
              </p>
              <input
                type="file"
                className="mt-4"
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const next = { submittedAt: new Date().toISOString(), fileName: f.name };
                  setKyc(next);
                  try {
                    localStorage.setItem('farmer-kyc', JSON.stringify(next));
                  } catch {
                    // ignore
                  }
                  toast.success('KYC submitted (demo)');
                }}
              />
              {kyc ? (
                <div className="mt-4 glass-card border border-white/15 rounded-2xl p-3">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Status: Submitted</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {kyc.fileName} • {kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleString() : ''}
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-xs text-gray-500">No KYC submitted yet.</p>
              )}
              <button
                type="button"
                className="btn btn-outline w-full mt-4"
                onClick={() => {
                  setKyc(null);
                  try {
                    localStorage.removeItem('farmer-kyc');
                  } catch {
                    // ignore
                  }
                }}
              >
                Reset KYC
              </button>
            </div>
          </div>
        </div>
      </GlassSection>

      <GlassSection id="farmer-forecast" eyebrow="AI" title="Demand forecasting (API)">
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
              <p className="text-sm text-gray-600 dark:text-gray-300">Choose a category to see forecast.</p>
            )}
          </div>
        </div>
      </GlassSection>

      <GlassSection id="farmer-logistics" eyebrow="Planning" title="Logistics tracking (API)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {logistics.map((l) => (
            <div key={l.id} className="glass-card border border-white/20 rounded-3xl p-4">
              <div className="flex justify-between items-start">
                <p className="font-display font-bold text-gray-900 dark:text-white">Order #{String(l.orderId).slice(0, 8)}</p>
                <span className="text-xs font-semibold uppercase px-2 py-1 rounded bg-primary-100 text-primary-700">{l.status}</span>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Carrier: {l.carrier || 'Pending'}</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Last Location: {l.lastLocation || 'N/A'}</p>
              <div className="mt-4 flex gap-2 flex-wrap">
                <button className="btn btn-outline btn-xs" onClick={() => updateLogisticsStatus(l.id, 'in-transit', 'Warehouse')}>Mark In-Transit</button>
                <button className="btn btn-primary btn-xs" onClick={() => updateLogisticsStatus(l.id, 'delivered', 'Customer Address')}>Mark Delivered</button>
              </div>
            </div>
          ))}
          {!logistics.length ? <p className="text-sm text-gray-600 dark:text-gray-300">No active logistics tracking.</p> : null}
        </div>
      </GlassSection>

      <GlassSection id="farmer-language" eyebrow="UX" title="Multi-language (basic toggle)">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-gray-600 dark:text-gray-300">Switch dashboard language.</p>
          <div className="flex gap-2">
            <button className={`btn ${lang === 'en' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setLang('en'); localStorage.setItem(STORAGE_LANG, 'en'); }}>English</button>
            <button className={`btn ${lang === 'es' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setLang('es'); localStorage.setItem(STORAGE_LANG, 'es'); }}>Español</button>
          </div>
        </div>
      </GlassSection>

      <GlassSection id="farmer-offline" eyebrow="Resilience" title="Offline fallback (basic)">
        <div className="glass-card border border-white/20 rounded-3xl p-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Status: <span className="font-semibold text-primary-700">{typeof navigator !== 'undefined' && navigator.onLine ? t.online : t.offline}</span>
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{offlineNote}</p>
          <div className="mt-4 flex gap-3 flex-wrap">
            <button
              type="button"
              className="btn btn-primary"
              onClick={async () => {
                await productsState.reload();
                await ordersState.reload();
                await rfqsState.reload();
                toast.success('Sync complete');
              }}
            >
              Retry sync
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                try {
                  localStorage.removeItem('farmer-products');
                  localStorage.removeItem('farmer-orders');
                  localStorage.removeItem('farmer-rfqs');
                } catch {
                  // ignore
                }
                toast.success('Cache cleared');
              }}
            >
              Clear cache
            </button>
          </div>
        </div>
      </GlassSection>

      <GlassSection id="farmer-tenders" eyebrow="Opportunities" title="Tender participation (API)">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <div className="md:col-span-12 mb-4">
            <h3 className="font-display font-bold text-gray-900 dark:text-white">Open Tenders</h3>
          </div>
          <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {openTenders.map((tender) => (
              <div key={tender.id || tender._id} className="glass-card border border-white/20 rounded-3xl p-4 flex flex-col">
                <p className="font-display font-bold text-gray-900 dark:text-white">{tender.title}</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{tender.category} • {tender.quantity} {tender.unit}</p>
                <p className="mt-2 text-xs text-gray-500">Deadline: {new Date(tender.deadline).toLocaleDateString()}</p>
                
                <div className="mt-4 space-y-2">
                  <input 
                    className="input input-sm" 
                    type="number" 
                    placeholder="Bid Amount" 
                    value={tenderBidAmount} 
                    onChange={(e) => setTenderBidAmount(e.target.value)} 
                  />
                  <input 
                    className="input input-sm" 
                    placeholder="Delivery Timeline (e.g. 5 days)" 
                    value={tenderDeliveryTimeline} 
                    onChange={(e) => setTenderDeliveryTimeline(e.target.value)} 
                  />
                  <textarea 
                    className="input input-sm" 
                    placeholder="Notes (optional)" 
                    value={tenderNotes} 
                    onChange={(e) => setTenderNotes(e.target.value)} 
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm w-full"
                    onClick={() => submitTenderBid(tender.id || tender._id)}
                  >
                    Submit Bid
                  </button>
                </div>
              </div>
            ))}
            {!openTenders.length ? <p className="text-sm text-gray-600 dark:text-gray-300">No open tenders found.</p> : null}
          </div>

          <div className="md:col-span-12">
            <h3 className="font-display font-bold text-gray-900 dark:text-white mb-4">My Bids</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myTenders.map((tender) => (
                <div key={tender.id || tender._id} className="glass-card border border-white/20 rounded-3xl p-4">
                  <p className="font-display font-bold text-gray-900 dark:text-white">{tender.title}</p>
                  <p className="text-xs text-primary-700 font-semibold uppercase mt-1">{tender.status}</p>
                  <div className="mt-3">
                    {tender.bids.filter((b: any) => b.farmerId === user?.id).map((b: any, idx: number) => (
                      <div key={idx} className="text-sm text-gray-600 dark:text-gray-300 border-t border-white/10 pt-2 mt-2">
                        <p>Bid: <span className="font-bold">${b.bidAmount}</span></p>
                        <p>Timeline: {b.deliveryTimeline}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {!myTenders.length ? <p className="text-sm text-gray-600 dark:text-gray-300">You haven&apos;t bid on any tenders yet.</p> : null}
            </div>
          </div>
        </div>
      </GlassSection>

      <GlassSection id="farmer-samples" eyebrow="Requests" title="Sample request handling (API)">
        <div className="space-y-3">
          {samples.map((s) => (
            <div key={s.id || s._id} className="glass-card border border-white/20 rounded-3xl p-4">
              <p className="font-display font-bold text-gray-900 dark:text-white">Sample Request for {s.productName}</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Buyer: {s.buyerId} • Status: <span className="font-semibold text-primary-700">{s.status}</span>
              </p>
              {s.notes ? <p className="mt-2 text-sm text-gray-800 dark:text-gray-100">{s.notes}</p> : null}
              <div className="mt-3 flex gap-2 flex-wrap">
                <button className="btn btn-outline btn-sm" onClick={() => updateSampleStatus(s.id || s._id, 'approved')}>Approve</button>
                <button className="btn btn-primary btn-sm" onClick={() => updateSampleStatus(s.id || s._id, 'shipped')}>Mark Shipped</button>
                <button className="btn btn-secondary btn-sm" onClick={() => updateSampleStatus(s.id || s._id, 'rejected')}>Reject</button>
              </div>
            </div>
          ))}
          {!samples.length ? <p className="text-sm text-gray-600 dark:text-gray-300">No persistent sample requests found.</p> : null}
        </div>
      </GlassSection>

      <GlassSection id="farmer-analytics" eyebrow="Insights" title="Analytics dashboard (charts)">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7 glass-card border border-white/20 rounded-3xl p-4">
            <p className="font-display font-bold text-gray-900 dark:text-white">Revenue trend (approx)</p>
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
                Object.entries(ordersByStatus).map(([k, v]) => {
                  const count = Number(v);
                  return (
                    <div key={k} className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 capitalize">{k}</p>
                      <p className="text-sm text-primary-700 dark:text-primary-300 font-bold">
                        {Number.isFinite(count) ? count : 0}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-300">No stats.</p>
              )}
            </div>
          </div>
        </div>
      </GlassSection>

      <GlassSection id="farmer-performance" eyebrow="Optimization" title="Product performance insights">
        <div className="space-y-3">
          {performance.length ? (
            performance.map((x) => (
              <div key={x.product.id} className="glass-card border border-white/20 rounded-3xl p-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-display font-bold text-gray-900 dark:text-white">{x.product.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Inventory: {x.product.quantity} {x.product.unit} • Category: {x.product.category}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    Orders: {x.orders} • Avg price: {x.avgPrice ? x.avgPrice.toFixed(2) : '—'} • Avg rating: {x.avgRating ? x.avgRating.toFixed(1) : '—'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Orders</p>
                  <p className="text-3xl font-display font-bold text-primary-700 dark:text-primary-300">{x.orders}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">No performance data.</p>
          )}
        </div>
      </GlassSection>
    </motion.div>
  );
}

