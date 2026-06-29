import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Barcode, ShoppingCart, Plus, Minus, Trash2,
  CreditCard, Smartphone, Banknote, Wifi, X,
  Pause, Play, RotateCcw, Printer, CheckCircle, Tag,
  Package, AlertCircle, Loader2, Receipt
} from 'lucide-react';
import { useCartStore, type Product } from '../store/cartStore';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useCreateTransaction } from '../hooks/useTransactions';

// Offline fallback so the cashier UI still renders if the API is unreachable
const DEMO_PRODUCTS: Product[] = [
  { id: '1', sku: 'SKU-00001', name: 'Aqua 600ml', price: 5000, stock: 48, createdAt: '', updatedAt: '' },
  { id: '2', sku: 'SKU-00002', name: 'Indomie Goreng', price: 3500, stock: 120, createdAt: '', updatedAt: '' },
  { id: '3', sku: 'SKU-00003', name: 'Kopi Kapal Api', price: 8500, stock: 65, createdAt: '', updatedAt: '' },
  { id: '4', sku: 'SKU-00004', name: 'Teh Botol Sosro', price: 5000, stock: 30, createdAt: '', updatedAt: '' },
  { id: '5', sku: 'SKU-00005', name: 'Pocari Sweat', price: 9000, stock: 24, createdAt: '', updatedAt: '' },
  { id: '6', sku: 'SKU-00006', name: 'Chitato Sapi Panggang', price: 12000, stock: 15, createdAt: '', updatedAt: '' },
  { id: '7', sku: 'SKU-00007', name: 'Good Day Cappuccino', price: 6500, stock: 40, createdAt: '', updatedAt: '' },
  { id: '8', sku: 'SKU-00008', name: 'Roti Tawar Serba', price: 18000, stock: 10, createdAt: '', updatedAt: '' },
];

const paymentMethods = [
  { id: 'CASH', label: 'Tunai', icon: Banknote, color: 'from-emerald-500 to-emerald-600' },
  { id: 'DEBIT', label: 'Debit', icon: CreditCard, color: 'from-blue-500 to-blue-600' },
  { id: 'CREDIT_CARD', label: 'Kredit', icon: CreditCard, color: 'from-purple-500 to-purple-600' },
  { id: 'QRIS', label: 'QRIS', icon: Wifi, color: 'from-orange-500 to-orange-600' },
  { id: 'EWALLET', label: 'E-Wallet', icon: Smartphone, color: 'from-pink-500 to-pink-600' },
];

const formatRp = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

// --- Payment Success Modal ---
const SuccessModal: React.FC<{ total: number; payment: string; change: number; onClose: () => void }> = ({ total, payment, change, onClose }) => (
  <motion.div
    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div
      className="bg-white rounded-3xl p-8 max-w-sm w-full text-center card-shadow-hover"
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.85, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      <motion.div
        className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <CheckCircle size={40} className="text-emerald-500" />
      </motion.div>
      <h2 className="text-2xl font-bold text-[#0F172A] mb-1">Pembayaran Berhasil!</h2>
      <p className="text-[#64748B] mb-6">Transaksi telah disimpan ke database</p>
      <div className="bg-[#F8FAFC] rounded-2xl p-4 space-y-2 text-left mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-[#64748B]">Total</span>
          <span className="font-bold text-[#0F172A]">{formatRp(total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#64748B]">Bayar ({payment})</span>
          <span className="font-semibold">{formatRp(parseFloat(payment) || 0)}</span>
        </div>
        {change > 0 && (
          <div className="flex justify-between text-sm border-t border-[#E2E8F0] pt-2">
            <span className="text-[#64748B]">Kembalian</span>
            <span className="font-bold text-emerald-600">{formatRp(change)}</span>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-3 bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#64748B] rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
          <Printer size={16} /> Cetak Struk
        </button>
        <button onClick={onClose} className="flex-1 py-3 bg-[#1E3A8A] hover:bg-[#162d6b] text-white rounded-xl font-semibold transition-colors">
          Transaksi Baru
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// --- Hold Transactions Drawer ---
const HoldDrawer: React.FC<{ held: any[]; onResume: (id: string) => void; onClose: () => void }> = ({ held, onResume, onClose }) => (
  <motion.div
    className="fixed inset-0 bg-black/50 z-40 flex justify-end"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div
      className="bg-white w-full max-w-sm h-full shadow-2xl p-6 overflow-y-auto"
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-lg text-[#0F172A]">Transaksi Hold</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <X size={18} />
        </button>
      </div>
      {held.length === 0 ? (
        <div className="text-center text-[#64748B] mt-12">
          <Pause size={40} className="mx-auto mb-3 opacity-30" />
          <p>Tidak ada transaksi yang dihold</p>
        </div>
      ) : (
        <div className="space-y-3">
          {held.map((t) => (
            <div key={t.id} className="border border-[#E2E8F0] rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-sm text-[#0F172A]">{t.id}</div>
                  <div className="text-xs text-[#64748B]">{t.items.length} item • {new Date(t.createdAt).toLocaleTimeString('id-ID')}</div>
                </div>
                <button
                  onClick={() => { onResume(t.id); onClose(); }}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#162d6b] transition-colors"
                >
                  <Play size={12} /> Resume
                </button>
              </div>
              <div className="text-sm font-bold text-[#1E3A8A]">
                {formatRp(t.items.reduce((s: number, i: any) => s + i.price * i.quantity, 0))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  </motion.div>
);

// --- POS Page ---
const POS: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [cashInput, setCashInput] = useState('');
  const [discountInput, setDiscountInput] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showHold, setShowHold] = useState(false);
  const [successData, setSuccessData] = useState({ total: 0, payment: '', change: 0 });
  const [error, setError] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const cart = useCartStore();

  // Debounce search feeding the products query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data: catData } = useCategories();
  const categories = catData?.data ?? [];

  const { data: prodData, isLoading: loading, isError } = useProducts({
    search: debouncedSearch,
    categoryId: activeCategory || undefined,
    limit: 50,
  });
  const products: Product[] = isError
    ? DEMO_PRODUCTS.filter((p) => p.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
    : (prodData?.data ?? []);

  const checkoutMut = useCreateTransaction();
  const checkoutLoading = checkoutMut.isPending;

  const handleCheckout = () => {
    if (cart.items.length === 0) return;
    setError('');
    // Snapshot totals before clearing the cart
    const finalTotal = cart.total();
    const cashAmt = parseFloat(cashInput) || finalTotal;
    checkoutMut.mutate(
      {
        items: cart.items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        paymentType: cart.paymentType,
        status: 'COMPLETED',
        discount: cart.discountAmount(),
        taxRate: cart.taxRate,
      },
      {
        onSuccess: () => {
          setSuccessData({ total: finalTotal, payment: cashInput || String(finalTotal), change: Math.max(0, cashAmt - finalTotal) });
          cart.clearCart();
          setCashInput('');
          setDiscountInput('');
          setShowSuccess(true);
          // products & dashboard are refreshed via query invalidation in the hook
        },
        onError: (err: any) => {
          setError(err?.response?.data?.error || 'Checkout gagal. Pastikan server berjalan.');
        },
      }
    );
  };

  const handleDiscount = (val: string) => {
    setDiscountInput(val);
    cart.setDiscount(parseFloat(val) || 0, 'percent');
  };

  const cashAmt = parseFloat(cashInput) || 0;
  const change = cashAmt - cart.total();

  return (
    <div className="flex h-full overflow-hidden">
      {/* Products Panel */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-[#E2E8F0]">
        {/* Search bar */}
        <div className="p-4 border-b border-[#E2E8F0] bg-white flex items-center gap-3 flex-shrink-0">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input
              id="pos-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk, scan barcode, atau ketik SKU..."
              className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] bg-[#F8FAFC] transition-all"
            />
          </div>
          <button className="p-2.5 border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors" title="Scan Barcode">
            <Barcode size={18} className="text-[#64748B]" />
          </button>
          <div className="flex items-center border border-[#E2E8F0] rounded-xl overflow-hidden">
            <button onClick={() => setView('grid')} className={`px-3 py-2 text-xs font-medium transition-colors ${view === 'grid' ? 'bg-[#1E3A8A] text-white' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}>Grid</button>
            <button onClick={() => setView('list')} className={`px-3 py-2 text-xs font-medium transition-colors ${view === 'list' ? 'bg-[#1E3A8A] text-white' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}>List</button>
          </div>
        </div>

        {/* Category filter chips */}
        {categories.length > 0 && (
          <div className="px-4 py-2.5 border-b border-[#E2E8F0] bg-white flex items-center gap-2 overflow-x-auto flex-shrink-0">
            <button
              onClick={() => setActiveCategory('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border
                ${activeCategory === ''
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-sm'
                  : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A]'}`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border
                  ${activeCategory === cat.id
                    ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-sm'
                    : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A]'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Products grid/list */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 size={32} className="animate-spin text-[#1E3A8A]" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-[#64748B]">
              <Package size={40} className="mb-3 opacity-30" />
              <p className="text-sm">Produk tidak ditemukan</p>
            </div>
          ) : (
            <div className={view === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3'
              : 'flex flex-col gap-2'
            }>
              {products.map((product, i) => (
                <motion.button
                  key={product.id}
                  id={`product-${product.id}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15, delay: i * 0.02 }}
                  onClick={() => product.stock > 0 && cart.addItem(product)}
                  disabled={product.stock === 0}
                  className={`
                    text-left bg-white rounded-xl border transition-all duration-150 group
                    ${product.stock === 0 ? 'opacity-50 cursor-not-allowed border-[#E2E8F0]' : 'border-[#E2E8F0] hover:border-[#1E3A8A]/40 hover:shadow-md cursor-pointer active:scale-95'}
                    ${view === 'grid' ? 'p-3' : 'p-3 flex items-center gap-3'}
                  `}
                >
                  {/* Product image placeholder */}
                  <div className={`bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] rounded-lg flex items-center justify-center flex-shrink-0
                    ${view === 'grid' ? 'w-full aspect-square mb-2' : 'w-12 h-12'}`}>
                    <Package size={view === 'grid' ? 28 : 20} className="text-[#94a3b8] group-hover:text-[#1E3A8A] transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-[#0F172A] truncate">{product.name}</div>
                    <div className="text-xs text-[#94a3b8] mt-0.5">{product.sku}</div>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="font-bold text-[#1E3A8A] text-sm">{formatRp(product.price)}</div>
                      <div className={`text-xs px-1.5 py-0.5 rounded-md font-medium
                        ${product.stock > 10 ? 'bg-emerald-50 text-emerald-600' :
                          product.stock > 0 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'}`}>
                        Stok: {product.stock}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-80 xl:w-96 flex flex-col bg-white flex-shrink-0">
        {/* Cart header */}
        <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-[#1E3A8A]" />
            <span className="font-semibold text-[#0F172A]">Keranjang</span>
            {cart.items.length > 0 && (
              <span className="bg-[#1E3A8A] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cart.items.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowHold(true)}
              className="relative p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors text-[#64748B] hover:text-[#1E3A8A]"
              title="Lihat transaksi hold"
            >
              <Pause size={16} />
              {cart.heldTransactions.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#D4AF37] text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {cart.heldTransactions.length}
                </span>
              )}
            </button>
            {cart.items.length > 0 && (
              <button
                onClick={cart.clearCart}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors text-[#64748B] hover:text-[#EF4444]"
                title="Hapus semua"
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <AnimatePresence>
            {cart.items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-48 text-[#64748B]"
              >
                <ShoppingCart size={40} className="mb-3 opacity-20" />
                <p className="text-sm font-medium">Keranjang kosong</p>
                <p className="text-xs mt-1">Klik produk untuk menambahkan</p>
              </motion.div>
            ) : (
              cart.items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-3 py-3 border-b border-[#F1F5F9] last:border-0"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] flex items-center justify-center flex-shrink-0">
                    <Package size={16} className="text-[#94a3b8]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#0F172A] truncate">{item.name}</div>
                    <div className="text-xs text-[#1E3A8A] font-semibold">{formatRp(item.price)}</div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-[#F8FAFC] hover:bg-[#E2E8F0] flex items-center justify-center transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-7 text-center text-sm font-bold text-[#0F172A]">{item.quantity}</span>
                    <button
                      onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-[#1E3A8A] hover:bg-[#162d6b] text-white flex items-center justify-center transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <button
                    onClick={() => cart.removeItem(item.id)}
                    className="p-1 hover:bg-red-50 rounded-lg transition-colors text-[#94a3b8] hover:text-[#EF4444]"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Cart summary */}
        <div className="px-4 pt-3 pb-4 border-t border-[#E2E8F0] space-y-3 flex-shrink-0 bg-[#FAFBFC]">
          {/* Discount */}
          <div className="flex items-center gap-2">
            <Tag size={14} className="text-[#64748B] flex-shrink-0" />
            <div className="flex items-center gap-1 flex-1">
              <input
                type="number"
                value={discountInput}
                onChange={(e) => handleDiscount(e.target.value)}
                placeholder="Diskon %"
                min="0" max="100"
                className="flex-1 px-3 py-1.5 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
              />
              <button
                onClick={() => cart.setDiscount(cart.discount, cart.discountType === 'percent' ? 'nominal' : 'percent')}
                className="text-xs px-2 py-1.5 border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors font-medium text-[#64748B]"
              >
                {cart.discountType === 'percent' ? '%' : 'Rp'}
              </button>
            </div>
          </div>

          {/* Tax rate */}
          <div className="flex items-center gap-2">
            <Receipt size={14} className="text-[#64748B] flex-shrink-0" />
            <div className="flex items-center gap-1 flex-1">
              <input
                type="number"
                value={cart.taxRate}
                onChange={(e) => cart.setTaxRate(parseFloat(e.target.value) || 0)}
                placeholder="Pajak %"
                min="0" max="100"
                className="flex-1 px-3 py-1.5 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
              />
              <span className="text-xs px-2 py-1.5 border border-[#E2E8F0] rounded-lg font-medium text-[#64748B]">PPN %</span>
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-[#64748B]">
              <span>Subtotal</span>
              <span>{formatRp(cart.subtotal())}</span>
            </div>
            {cart.discountAmount() > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Diskon</span>
                <span>-{formatRp(cart.discountAmount())}</span>
              </div>
            )}
            {cart.taxAmount() > 0 && (
              <div className="flex justify-between text-[#64748B]">
                <span>Pajak (PPN {cart.taxRate}%)</span>
                <span>+{formatRp(cart.taxAmount())}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base text-[#0F172A] pt-2 border-t border-[#E2E8F0]">
              <span>Total</span>
              <span className="text-[#1E3A8A]">{formatRp(cart.total())}</span>
            </div>
          </div>

          {/* Payment type */}
          <div className="grid grid-cols-5 gap-1">
            {paymentMethods.map((pm) => {
              const Icon = pm.icon;
              const active = cart.paymentType === pm.id;
              return (
                <button
                  key={pm.id}
                  onClick={() => cart.setPaymentType(pm.id)}
                  title={pm.label}
                  className={`flex flex-col items-center gap-0.5 py-2 rounded-xl text-xs font-medium transition-all border
                    ${active
                      ? 'border-[#1E3A8A] bg-[#1E3A8A] text-white shadow-md'
                      : 'border-[#E2E8F0] text-[#64748B] hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A]'}`}
                >
                  <Icon size={14} />
                  <span className="text-[9px] leading-tight text-center">{pm.label}</span>
                </button>
              );
            })}
          </div>

          {/* Cash input */}
          {cart.paymentType === 'CASH' && (
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#64748B] font-medium">Rp</span>
              <input
                type="number"
                value={cashInput}
                onChange={(e) => setCashInput(e.target.value)}
                placeholder="Jumlah bayar"
                className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
              />
              {change > 0 && (
                <div className="mt-1 text-xs text-emerald-600 font-semibold text-right">
                  Kembalian: {formatRp(change)}
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg text-xs text-red-600">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={cart.holdTransaction}
              disabled={cart.items.length === 0}
              className="flex items-center justify-center gap-1.5 py-3 border border-[#E2E8F0] rounded-xl text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Pause size={15} /> Hold
            </button>
            <button
              id="btn-checkout"
              onClick={handleCheckout}
              disabled={cart.items.length === 0 || checkoutLoading}
              className="flex items-center justify-center gap-1.5 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#1e40af] hover:from-[#162d6b] hover:to-[#1E3A8A] text-white rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-[#1E3A8A]/20 active:scale-95"
            >
              {checkoutLoading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
              Bayar
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showSuccess && (
          <SuccessModal
            total={successData.total}
            payment={successData.payment}
            change={successData.change}
            onClose={() => setShowSuccess(false)}
          />
        )}
        {showHold && (
          <HoldDrawer
            held={cart.heldTransactions}
            onResume={cart.resumeTransaction}
            onClose={() => setShowHold(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default POS;
