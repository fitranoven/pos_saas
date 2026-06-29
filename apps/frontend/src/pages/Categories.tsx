import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, Tag, X, Loader2,
  CheckCircle, AlertCircle, Package,
} from 'lucide-react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useCategories';
import type { Category } from '../store/cartStore';

interface CategoryFormProps {
  category?: Category | null;
  onSave: (data: { name: string; description?: string }) => void;
  onClose: () => void;
  loading: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSave, onClose, loading }) => {
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');

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
          <h2 className="font-bold text-lg text-[#0F172A]">{category ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#64748B] mb-1 block">Nama Kategori *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Minuman"
              className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#64748B] mb-1 block">Deskripsi</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Deskripsi kategori..." rows={2}
              className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] resize-none" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-3 border border-[#E2E8F0] rounded-xl text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition-colors">Batal</button>
          <button
            onClick={() => onSave({ name, description })}
            disabled={loading || !name.trim()}
            className="flex-1 py-3 bg-[#1E3A8A] hover:bg-[#162d6b] text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            {category ? 'Simpan' : 'Tambah'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Categories: React.FC = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  // Debounce the search term feeding the query key
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useCategories(debouncedSearch);
  const categories = data?.data ?? [];

  const createMut = useCreateCategory();
  const updateMut = useUpdateCategory();
  const deleteMut = useDeleteCategory();
  const saveLoading = createMut.isPending || updateMut.isPending;

  const handleSave = (formData: { name: string; description?: string }) => {
    const onSuccess = (msg: string) => {
      showToast('success', msg);
      setShowForm(false);
      setEditCategory(null);
    };
    const onError = (err: any) => showToast('error', err?.response?.data?.error || 'Gagal menyimpan kategori');

    if (editCategory) {
      updateMut.mutate({ id: editCategory.id, data: formData }, { onSuccess: () => onSuccess('Kategori berhasil diperbarui'), onError });
    } else {
      createMut.mutate(formData, { onSuccess: () => onSuccess('Kategori berhasil ditambahkan'), onError });
    }
  };

  const handleDelete = (cat: Category) => {
    const note = cat.productCount ? `\n${cat.productCount} produk akan dilepas dari kategori ini.` : '';
    if (!confirm(`Hapus kategori "${cat.name}"?${note}`)) return;
    deleteMut.mutate(cat.id, {
      onSuccess: () => showToast('success', 'Kategori dihapus'),
      onError: () => showToast('error', 'Gagal menghapus kategori'),
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Kategori</h1>
          <p className="text-sm text-[#64748B] mt-0.5">{categories.length} kategori terdaftar</p>
        </div>
        <button
          id="btn-add-category"
          onClick={() => { setEditCategory(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1E3A8A] hover:bg-[#162d6b] text-white rounded-xl text-sm font-semibold transition-colors shadow-md shadow-[#1E3A8A]/20"
        >
          <Plus size={16} /> Tambah Kategori
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari kategori..."
          className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] bg-white transition-all"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#1E3A8A]" />
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-2xl card-shadow py-16 text-center text-[#64748B]">
          <Tag size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Belum ada kategori</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl card-shadow p-5 hover:card-shadow-hover transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#1E3A8A]/5 flex items-center justify-center">
                  <Tag size={18} className="text-[#1E3A8A]" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditCategory(cat); setShowForm(true); }}
                    className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-[#64748B] hover:text-[#1E3A8A]"
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-[#64748B] hover:text-[#EF4444]"
                    title="Hapus"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-[#0F172A]">{cat.name}</h3>
              {cat.description && <p className="text-xs text-[#64748B] mt-1 line-clamp-2">{cat.description}</p>}
              <div className="flex items-center gap-1.5 mt-3 text-xs text-[#94a3b8]">
                <Package size={13} />
                <span>{cat.productCount ?? 0} produk</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

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

      {/* Category Form Modal */}
      <AnimatePresence>
        {showForm && (
          <CategoryForm
            category={editCategory}
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditCategory(null); }}
            loading={saveLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Categories;
