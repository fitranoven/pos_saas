import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingCart, Package, Boxes, Users, Truck,
  ShoppingBag, DollarSign, BarChart3, Settings, ChevronLeft,
  ChevronRight, Zap, Bell, Search, Menu, X, Tag
} from 'lucide-react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: 'dashboard' },
  { icon: ShoppingCart, label: 'Point of Sale', path: 'pos' },
  { icon: Package, label: 'Produk', path: 'products' },
  { icon: Tag, label: 'Kategori', path: 'categories' },
  { icon: Boxes, label: 'Inventori', path: 'inventory' },
  { icon: Users, label: 'Customer', path: 'customers' },
  { icon: Truck, label: 'Supplier', path: 'suppliers' },
  { icon: ShoppingBag, label: 'Pembelian', path: 'purchases' },
  { icon: DollarSign, label: 'Keuangan', path: 'finance' },
  { icon: BarChart3, label: 'Laporan', path: 'reports' },
  { icon: Settings, label: 'Pengaturan', path: 'settings' },
];

interface LayoutProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentPage, onNavigate, children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className={`
          fixed lg:relative inset-y-0 left-0 z-40 flex flex-col
          bg-[#1E3A8A] text-white shadow-2xl
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform lg:transition-none
          h-full overflow-hidden
        `}
        style={{ minWidth: collapsed ? 72 : 240 }}
      >
        {/* Logo */}
        <div className="flex items-center px-4 py-5 border-b border-white/10 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#f0cb45] flex items-center justify-center flex-shrink-0 shadow-lg">
            <Zap size={18} className="text-[#1E3A8A]" fill="currentColor" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="ml-3 overflow-hidden"
              >
                <div className="text-lg font-extrabold tracking-tight text-white leading-none">
                  Firstan<span className="text-[#D4AF37]">POS</span>
                </div>
                <div className="text-[10px] text-blue-200 font-medium mt-0.5">Enterprise Suite</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop collapse button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex ml-auto p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="flex lg:hidden ml-auto p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.path;
            return (
              <button
                key={item.path}
                onClick={() => { onNavigate(item.path); setMobileOpen(false); }}
                className={`
                  w-full flex items-center px-4 py-2.5 my-0.5 mx-2 rounded-xl
                  transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-white text-[#1E3A8A] shadow-lg'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }
                `}
                style={{ width: `calc(100% - 16px)` }}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  size={20}
                  className={`flex-shrink-0 transition-colors ${isActive ? 'text-[#1E3A8A]' : 'text-blue-200 group-hover:text-white'}`}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className={`ml-3 text-sm font-medium whitespace-nowrap ${isActive ? 'text-[#1E3A8A] font-semibold' : ''}`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#D4AF37] rounded-r-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#f0cb45] flex items-center justify-center text-[#1E3A8A] font-bold text-sm flex-shrink-0">
              A
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="text-sm font-semibold text-white">Admin</div>
                  <div className="text-xs text-blue-200">Owner</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E2E8F0] px-4 lg:px-6 py-3 flex items-center gap-4 flex-shrink-0 z-20 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu size={20} className="text-gray-600" />
          </button>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari produk, transaksi..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full"></span>
            </button>

            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#1e40af] flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity">
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
