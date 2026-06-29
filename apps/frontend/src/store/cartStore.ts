import { create } from 'zustand';

export interface CartItem {
  id: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  barcode?: string;
  image?: string;
  categoryId?: string | null;
  category?: Category | null;
  createdAt: string;
  updatedAt: string;
}

interface CartStore {
  items: CartItem[];
  discount: number;
  discountType: 'percent' | 'nominal';
  taxRate: number;
  paymentType: string;
  heldTransactions: { id: string; items: CartItem[]; createdAt: Date }[];
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setDiscount: (discount: number, type: 'percent' | 'nominal') => void;
  setTaxRate: (rate: number) => void;
  setPaymentType: (type: string) => void;
  holdTransaction: () => void;
  resumeTransaction: (id: string) => void;
  subtotal: () => number;
  discountAmount: () => number;
  taxAmount: () => number;
  total: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  discount: 0,
  discountType: 'percent',
  taxRate: 11, // PPN 11% by default
  paymentType: 'CASH',
  heldTransactions: [],

  addItem: (product) => {
    set((state) => {
      const existing = state.items.find((i) => i.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return {
        items: [...state.items, { id: product.id, sku: product.sku, name: product.name, price: product.price, quantity: 1, image: product.image }],
      };
    });
  },

  removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }
    set((state) => ({ items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)) }));
  },

  clearCart: () => set({ items: [], discount: 0, discountType: 'percent', paymentType: 'CASH' }),

  setDiscount: (discount, type) => set({ discount, discountType: type }),

  setTaxRate: (rate) => set({ taxRate: Math.max(0, rate) }),

  setPaymentType: (type) => set({ paymentType: type }),

  holdTransaction: () => {
    const { items, clearCart } = get();
    if (items.length === 0) return;
    set((state) => ({
      heldTransactions: [
        ...state.heldTransactions,
        { id: `HOLD-${Date.now()}`, items: [...items], createdAt: new Date() },
      ],
    }));
    clearCart();
  },

  resumeTransaction: (id) => {
    const { heldTransactions, clearCart } = get();
    const held = heldTransactions.find((t) => t.id === id);
    if (!held) return;
    clearCart();
    set((state) => ({
      items: [...held.items],
      heldTransactions: state.heldTransactions.filter((t) => t.id !== id),
    }));
  },

  subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

  discountAmount: () => {
    const { discount, discountType, subtotal } = get();
    const amount = discountType === 'percent' ? (subtotal() * discount) / 100 : discount;
    // Never discount more than the subtotal
    return Math.min(Math.max(amount, 0), subtotal());
  },

  taxAmount: () => {
    const { subtotal, discountAmount, taxRate } = get();
    const taxableBase = subtotal() - discountAmount();
    return Math.round((taxableBase * taxRate) / 100);
  },

  total: () => {
    const { subtotal, discountAmount, taxAmount } = get();
    return Math.max(0, subtotal() - discountAmount() + taxAmount());
  },
}));
