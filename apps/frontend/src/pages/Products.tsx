import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, Package, X, Loader2,
  CheckCircle, AlertCircle, BarChart2
} from 'lucide-react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import type { Product, Category } from '../store/cartStore';

const formatRp = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  onSave: (data: Record<string, string>) => void;
  onClose: () => void;
  loading: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, categories, onSave, onClose, loading }) => {
  const [form, setForm] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    price: product?.price?.toString() || '',
    stock: product?.stock?.toString() || '0',
    description: product?.description || '',
    barcode: product?.barcode || '',
    categoryId: product?.categoryId || '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl p-6 w-full max-w-md card-shadow-hover"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg text-[#0F172A]">{product ? 'Edit Produk' : 'Tambah Produk'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#64748B] mb-1 block">Nama Produk *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Aqua 600ml"
              className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#64748B] mb-1 block">SKU (otomatis)</label>
              <input value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="SKU-00001"
                className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#64748B] mb-1 block">Barcode</label>
              <input value={form.barcode} onChange={e => set('barcode', e.target.value)} placeholder="8991234567890"
                className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#64748B] mb-1 block">Harga Jual *</label>
              <input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="5000"
                className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#64748B] mb-1 block">Stok Awal</label>
              <input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="0"
                className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#64748B] mb-1 block">Kategori</label>
            <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)}
              className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] bg-white">
              <option value="">— Tanpa kategori —</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#64748B] mb-1 block">Deskripsi</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Deskripsi produk..." rows={2}
              className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] resize-none" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-3 border border-[#E2E8F0] rounded-xl text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition-colors">Batal</button>
          <button
            onClick={() => onSave(form)}
            disabled={loading || !form.name || !form.price}
            className="flex-1 py-3 bg-[#1E3A8A] hover:bg-[#162d6b] text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            {product ? 'Simpan' : 'Tambah'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Products: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  // Debounce search feeding the query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to first page whenever the filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, categoryFilter]);

  const { data, isLoading } = useProducts({ search: debouncedSearch, page, limit, categoryId: categoryFilter || undefined });
  const products = data?.data ?? [];
  const total = data?.total ?? 0;

  const { data: catData } = useCategories();
  const categories: Category[] = catData?.data ?? [];

  const createMut = useCreateProduct();
  const updateMut = useUpdateProduct();
  const deleteMut = useDeleteProduct();
  const saveLoading = createMut.isPending || updateMut.isPending;

  const handleSave = (form: Record<string, string>) => {
    const payload: Partial<Product> = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) } as Partial<Product>;
    const onSuccess = (msg: string) => {
      showToast('success', msg);
      setShowForm(false);
      setEditProduct(null);
    };
    const onError = (err: any) => showToast('error', err?.response?.data?.error || 'Gagal menyimpan produk');

    if (editProduct) {
      updateMut.mutate({ id: editProduct.id, data: payload }, { onSuccess: () => onSuccess('Produk berhasil diperbarui'), onError });
    } else {
      createMut.mutate(payload, { onSuccess: () => onSuccess('Produk berhasil ditambahkan'), onError });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Hapus produk "${name}"?`)) return;
    deleteMut.mutate(id, {
      onSuccess: () => showToast('success', 'Produk dihapus'),
      onError: () => showToast('error', 'Gagal menghapus produk'),
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Produk</h1>
          <p className="text-sm text-[#64748B] mt-0.5">{total} produk terdaftar</p>
        </div>
        <button
          id="btn-add-product"
          onClick={() => { setEditProduct(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1E3A8A] hover:bg-[#162d6b] text-white rounded-xl text-sm font-semibold transition-colors shadow-md shadow-[#1E3A8A]/20"
        >
          <Plus size={16} /> Tambah Produk
        </button>
      </div>

      {/* Search + Category filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari produk..."
            className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] bg-white transition-all"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] bg-white transition-all min-w-[180px]"
        >
          <option value="">Semua kategori</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Produk</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">SKU</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Kategori</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Harga</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Stok</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Loader2 size={28} className="animate-spin text-[#1E3A8A] mx-auto" />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#64748B]">
                    <Package size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Belum ada produk</p>
                  </td>
                </tr>
              ) : (
                products.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center flex-shrink-0">
                          <Package size={16} className="text-[#94a3b8]" />
                        </div>
                        <div>
                          <div className="font-medium text-[#0F172A]">{p.name}</div>
                          {p.description && <div className="text-xs text-[#94a3b8] truncate max-w-xs">{p.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-1 rounded-lg text-[#64748B]">{p.sku}</span>
                    </td>
                    <td className="px-4 py-3">
                      {p.category ? (
                        <span className="inline-block text-xs font-medium bg-[#1E3A8A]/5 text-[#1E3A8A] px-2.5 py-1 rounded-full">{p.category.name}</span>
                      ) : (
                        <span className="text-xs text-[#94a3b8]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[#1E3A8A]">{formatRp(p.price)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
                        ${p.stock > 10 ? 'bg-emerald-50 text-emerald-700' :
                          p.stock > 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                        <BarChart2 size={11} />
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => { setEditProduct(p); setShowForm(true); }}
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-[#64748B] hover:text-[#1E3A8A]"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-[#64748B] hover:text-[#EF4444]"
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#E2E8F0]">
            <span className="text-xs text-[#64748B]">
              {(page - 1) * limit + 1}–{Math.min(page * limit, total)} dari {total}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-lg disabled:opacity-40 hover:bg-[#F8FAFC] transition-colors"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * limit >= total}
                className="px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-lg disabled:opacity-40 hover:bg-[#F8FAFC] transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className={`fixed bottom-6 left-1/2 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-lg z-50
              ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-[#EF4444] text-white'}`}
          >
            {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Form Modal */}
      <AnimatePresence>
        {showForm && (
          <ProductForm
            product={editProduct}
            categories={categories}
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditProduct(null); }}
            loading={saveLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
