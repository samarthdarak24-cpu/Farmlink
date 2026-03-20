'use client';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, User as UserIcon, ChevronLeft, ChevronRight,
  TrendingUp, Boxes, ShieldCheck, Mail, FileText, Search, Shield, Filter,
  Package, CheckCircle, BarChart3, Truck, Globe, Target, Map, Settings, RefreshCw
} from 'lucide-react';
import { logout as reduxLogout } from '@/store/authSlice';
import { useDispatch } from 'react-redux';
import { useAuthZustand } from '@/store/authZustand';

const farmerMenu = [
  { name: 'Dashboard Overview', id: 'farmer-overview', href: '/dashboard/farmer', icon: BarChart3 },
  { name: 'Product Management', id: 'farmer-products', href: '/dashboard/products', icon: Boxes },
  { name: 'Inventory Tracking', id: 'farmer-inventory', href: '/dashboard/inventory', icon: Boxes },
  { name: 'Order Management', id: 'farmer-orders', href: '/dashboard/orders', icon: Package },
  { name: 'RFQ Management', id: 'farmer-rfqs', href: '/dashboard/rfq', icon: FileText },
  { name: 'Real-time Chat', id: 'farmer-chat', href: '/dashboard/chat', icon: Mail },
  { name: 'AI Quality Grading', id: 'farmer-ai-quality', href: '/dashboard/quality', icon: Target },
  { name: 'Buyer Matchmaking', id: 'farmer-buyer-recommendations', href: '/dashboard/recommendations', icon: UserIcon },
  { name: 'Price Negotiation', id: 'farmer-negotiation', href: '/dashboard/negotiation', icon: FileText },
  { name: 'Legal Contracts', id: 'farmer-contracts', href: '/dashboard/contracts', icon: FileText },
  { name: 'Blockchain Trust', id: 'farmer-blockchain', href: '/dashboard/blockchain', icon: ShieldCheck },
  { name: 'Ratings & Reviews', id: 'farmer-ratings', href: '/dashboard/reviews', icon: CheckCircle },
  { name: 'Profile & KYC', id: 'farmer-kyc', href: '/dashboard/profile', icon: Shield },
  { name: 'Demand Forecast', id: 'farmer-forecast', href: '/dashboard/forecast', icon: BarChart3 },
  { name: 'Supply Chain Logistics', id: 'farmer-logistics', href: '/dashboard/logistics', icon: Truck },
  { name: 'Tender Hall', id: 'farmer-tenders', href: '/dashboard/tenders', icon: Search },
  { name: 'Sample Requests', id: 'farmer-samples', href: '/dashboard/samples', icon: Package },
  { name: 'Strategic Analytics', id: 'farmer-analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Control Hub', id: 'farmer-settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Offline Sync Hub', id: 'farmer-sync', href: '/dashboard/sync', icon: RefreshCw },
];

const buyerMenu = [
  { name: 'Product Browsing', id: 'buyer-products', icon: Search },
  { name: 'Advanced Filters', id: 'buyer-filters', icon: Filter },
  { name: 'Bulk Orders (Cart)', id: 'buyer-bulk', icon: Package },
  { name: 'RFQ Creation', id: 'buyer-rfqs', icon: FileText },
  { name: 'Real-time Chat', id: 'buyer-chat', icon: Mail },
  { name: 'Proposal Management', id: 'buyer-proposals', icon: FileText },
  { name: 'Order Tracking', id: 'buyer-orders', icon: Truck },
  { name: 'Contract Viewing', id: 'buyer-contracts', icon: FileText },
  { name: 'Blockchain Verification', id: 'buyer-blockchain', icon: ShieldCheck },
  { name: 'Supplier Ratings', id: 'buyer-ratings', icon: CheckCircle },
  { name: 'Profile & History', id: 'buyer-profile', icon: UserIcon },
  { name: 'Forecast Dashboard', id: 'buyer-forecast', icon: BarChart3 },
  { name: 'Logistics Tracking', id: 'buyer-logistics', icon: Truck },
  { name: 'Inventory Planning', id: 'buyer-inventory', icon: Boxes },
  { name: 'Auto Reorder Logic', id: 'buyer-auto-reorder', icon: Target },
  { name: 'Supplier Comparison', id: 'buyer-compare', icon: Map },
  { name: 'Payment Tracking', id: 'buyer-payments', icon: FileText },
  { name: 'Analytics Dashboard', id: 'buyer-analytics', icon: BarChart3 },
  { name: 'Multi-user Roles (RBAC)', id: 'buyer-rbac', icon: Shield },
  { name: 'Export (CSV)', id: 'buyer-export', icon: Globe },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeHash, setActiveHash] = useState<string>('');
  const pathname = usePathname() || '';
  const router = useRouter();
  const dispatch = useDispatch();
  const { token, user, hydrated, hydrateFromStorage, logout } = useAuthZustand((s) => ({
    token: s.token,
    user: s.user,
    hydrated: s.hydrated,
    hydrateFromStorage: s.hydrateFromStorage,
    logout: s.logout,
  }));

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const set = () => setActiveHash(window.location.hash || '');
    set();
    window.addEventListener('hashchange', set);
    return () => window.removeEventListener('hashchange', set);
  }, []);

  const roleFromUser = user?.role ?? null;
  const roleFromPath = pathname.includes('/dashboard/buyer') ? 'buyer' : 
                       (pathname.includes('/dashboard/farmer') || 
                        farmerMenu.some(m => m.href && pathname === m.href)) ? 'farmer' : 'buyer';

  const menuItems = useMemo(() => {
    const effectiveRole = roleFromUser ?? roleFromPath;
    return effectiveRole === 'farmer' ? farmerMenu : buyerMenu;
  }, [roleFromUser, roleFromPath]);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    if (roleFromUser && roleFromUser !== roleFromPath) {
      router.replace(roleFromUser === 'farmer' ? '/dashboard/farmer' : '/dashboard/buyer');
    }
  }, [hydrated, token, router, roleFromUser, roleFromPath]);

  const userLabel = user?.name || 'User';
  if (hydrated && !token) return null;

  return (
    <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 min-h-screen">
      {/* Sidebar */}
      <motion.aside
        initial={{ width: 280 }}
        animate={{ width: collapsed ? 80 : 280 }}
        className="border-r border-white/20 dark:border-gray-800/50 flex flex-col z-20 h-screen sticky top-0"
        style={{
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)'
        }}
      >
        <div className="flex items-center justify-between w-full p-4 border-b border-white/10 dark:border-gray-800/30">
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600"
              >
                ODOP Connect
              </motion.span>
            )}
          </AnimatePresence>
          <button onClick={() => setCollapsed(!collapsed)} className="text-gray-500 hover:text-gray-900 p-2 rounded-lg hover:bg-white/10">
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto w-full py-2 space-y-1 custom-scrollbar">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            // Support explicit href paths as well as hash-based routing
            const href = (item as any).href || `#${item.id}`;
            const isActive = (item as any).href ? pathname === (item as any).href : activeHash === `#${item.id}`;

            return (
              <a
                key={index}
                href={href}
                className={`flex items-center w-full px-4 py-3 group relative ${
                  isActive
                    ? 'text-primary-600 bg-primary-50/50 dark:bg-primary-900/20 border-r-4 border-primary-600'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50'
                }`}
              >
                <div className={(collapsed ? 'mx-auto' : 'mr-4') + ' flex-shrink-0'}>
                  <Icon size={20} className={isActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white'} />
                </div>
                {!collapsed && <span className="truncate font-medium text-sm">{item.name}</span>}
              </a>
            );
          })}
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-white/20 dark:border-gray-800/50 flex items-center justify-between px-6 sticky top-0 z-10"
                style={{ backdropFilter: 'blur(10px)', background: 'rgba(255, 255, 255, 0.1)' }}>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white capitalize truncate">
            {pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
          </h2>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-white/10">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                {userLabel.slice(0, 1).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{userLabel}</p>
                <p className="text-xs text-gray-500 capitalize">{roleFromUser ?? roleFromPath}</p>
              </div>
            </div>

            <button
              type="button"
              className="ml-1 inline-flex items-center px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-gray-700 hover:bg-white/15 transition-colors"
              onClick={() => {
                dispatch(reduxLogout());
                logout();
                router.replace('/');
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
             <AnimatePresence mode="wait">
               {children}
             </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
