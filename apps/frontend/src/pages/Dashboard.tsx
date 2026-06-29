import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, DollarSign, ShoppingCart, Package,
  AlertTriangle, Brain, Receipt, Loader2, RefreshCw,
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { useDashboard } from '../hooks/useDashboard';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const formatRp = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const formatCompact = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return `${n}`;
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: '#1E3A8A', titleColor: '#fff', bodyColor: '#bfdbfe', cornerRadius: 8, padding: 12 },
  },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { color: '#94a3b8', font: { size: 12 } } },
    y: { grid: { color: '#f1f5f9', drawBorder: false }, border: { display: false }, ticks: { color: '#94a3b8', font: { size: 12 }, callback: (v: any) => formatCompact(Number(v)) } },
  },
};

const todayLabel = () =>
  new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const Dashboard: React.FC = () => {
  const { data, isLoading, isError, refetch } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={32} className="animate-spin text-[#1E3A8A]" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#64748B] gap-3">
        <AlertTriangle size={36} className="opacity-40" />
        <p className="text-sm">Gagal memuat data dashboard. Pastikan server berjalan.</p>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:bg-[#162d6b] transition-colors">
          <RefreshCw size={15} /> Coba lagi
        </button>
      </div>
    );
  }

  const { kpi, salesByDay, topProducts, lowStock } = data;

  const kpiCards = [
    { label: 'Total Penjualan', value: formatRp(kpi.revenue), sub: `${kpi.transactions} transaksi selesai`, icon: DollarSign, color: 'from-blue-500 to-blue-600' },
    { label: 'Total Transaksi', value: `${kpi.transactions}`, sub: 'transaksi tercatat', icon: ShoppingCart, color: 'from-violet-500 to-violet-600' },
    { label: 'Item Terjual', value: `${kpi.itemsSold} item`, sub: 'total kuantitas terjual', icon: Package, color: 'from-amber-500 to-amber-600' },
    { label: 'Rata-rata / Transaksi', value: formatRp(kpi.avgOrderValue), sub: 'nilai rata-rata pesanan', icon: TrendingUp, color: 'from-emerald-500 to-emerald-600' },
  ];

  const hasSales = salesByDay.some((d) => d.total > 0);

  const salesChartData = {
    labels: salesByDay.map((d) => d.label),
    datasets: [{
      data: salesByDay.map((d) => d.total),
      borderColor: '#1E3A8A',
      backgroundColor: 'rgba(30, 58, 138, 0.08)',
      borderWidth: 2.5,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#1E3A8A',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
    }],
  };

  const txChartData = {
    labels: salesByDay.map((d) => d.label),
    datasets: [{
      data: salesByDay.map((d) => d.count),
      backgroundColor: salesByDay.map((_, i) => (i === salesByDay.length - 1 ? '#D4AF37' : 'rgba(212, 175, 55, 0.4)')),
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  // Data-driven summary (honest, derived from the same metrics — no forecasting)
  const insights: { icon: string; title: string; desc: string; type: string }[] = [];
  if (topProducts[0]) insights.push({ icon: '🏆', title: 'Produk Terlaris', desc: `${topProducts[0].name} — ${topProducts[0].sold} terjual`, type: 'success' });
  insights.push({ icon: '🧾', title: 'PPN Terkumpul', desc: formatRp(kpi.taxCollected), type: 'info' });
  if (kpi.discountGiven > 0) insights.push({ icon: '🎁', title: 'Diskon Diberikan', desc: formatRp(kpi.discountGiven), type: 'gold' });
  insights.push({ icon: lowStock.length > 0 ? '⚠️' : '✅', title: 'Stok Menipis', desc: lowStock.length > 0 ? `${lowStock.length} produk perlu restock` : 'Semua stok aman', type: lowStock.length > 0 ? 'warning' : 'success' });

  return (
    <div className="p-6 space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Dashboard</h1>
          <p className="text-sm text-[#64748B] mt-0.5">Ringkasan bisnis • {todayLabel()}</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-3 py-2 text-sm text-[#64748B] border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors">
          <RefreshCw size={15} /> Segarkan
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((kpiItem, i) => {
          const Icon = kpiItem.icon;
          return (
            <motion.div
              key={kpiItem.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              className="bg-white rounded-2xl p-5 card-shadow hover:card-shadow-hover transition-all cursor-default"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${kpiItem.color} flex items-center justify-center shadow-md mb-3`}>
                <Icon size={20} className="text-white" />
              </div>
              <div className="text-xl font-bold text-[#0F172A]">{kpiItem.value}</div>
              <div className="text-sm text-[#64748B] mt-1">{kpiItem.label}</div>
              <div className="text-xs text-[#94a3b8] mt-0.5">{kpiItem.sub}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="xl:col-span-2 bg-white rounded-2xl p-5 card-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-[#0F172A]">Grafik Penjualan</h2>
              <p className="text-xs text-[#64748B]">7 hari terakhir</p>
            </div>
            <span className="text-xs px-3 py-1.5 bg-[#1E3A8A]/5 text-[#1E3A8A] rounded-lg font-medium">Mingguan</span>
          </div>
          <div className="h-52 relative">
            <Line data={salesChartData} options={chartOptions as any} />
            {!hasSales && (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-[#94a3b8]">
                Belum ada penjualan dalam 7 hari terakhir
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          className="bg-white rounded-2xl p-5 card-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-[#0F172A]">Jumlah Transaksi</h2>
              <p className="text-xs text-[#64748B]">7 hari terakhir</p>
            </div>
          </div>
          <div className="h-52">
            <Bar data={txChartData} options={chartOptions as any} />
          </div>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Summary / Insights */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-white rounded-2xl p-5 card-shadow"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Brain size={16} className="text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-[#0F172A] text-sm">Ringkasan Bisnis</h2>
              <p className="text-xs text-[#64748B]">Dihitung dari transaksi nyata</p>
            </div>
          </div>
          <div className="space-y-2.5">
            {insights.map((insight, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl text-sm
                ${insight.type === 'success' ? 'bg-emerald-50' :
                  insight.type === 'warning' ? 'bg-amber-50' :
                  insight.type === 'gold' ? 'bg-yellow-50' : 'bg-blue-50'}
              `}>
                <span className="text-base flex-shrink-0 mt-0.5">{insight.icon}</span>
                <div>
                  <div className="font-semibold text-[#0F172A] text-xs">{insight.title}</div>
                  <div className="text-[#64748B] text-xs mt-0.5">{insight.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.45 }}
          className="bg-white rounded-2xl p-5 card-shadow"
        >
          <h2 className="font-semibold text-[#0F172A] mb-4">Produk Terlaris</h2>
          {topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-[#94a3b8]">
              <Receipt size={28} className="mb-2 opacity-30" />
              <p className="text-xs">Belum ada penjualan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white
                    ${i === 0 ? 'bg-[#D4AF37]' : i === 1 ? 'bg-[#94a3b8]' : 'bg-[#cd7f32]'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#0F172A] truncate">{p.name}</div>
                    <div className="text-xs text-[#64748B]">{p.sold} terjual</div>
                  </div>
                  <div className="text-sm font-semibold text-[#1E3A8A] text-right">{formatRp(p.revenue)}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Low Stock Alert */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-white rounded-2xl p-5 card-shadow"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-[#F59E0B]" />
            <h2 className="font-semibold text-[#0F172A]">Stok Menipis</h2>
          </div>
          {lowStock.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-[#94a3b8]">
              <Package size={28} className="mb-2 opacity-30" />
              <p className="text-xs">Semua stok dalam batas aman</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStock.map((item, i) => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-[#0F172A]">{item.name}</span>
                    <span className="text-[#EF4444] font-semibold">{item.stock} sisa</span>
                  </div>
                  <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (item.stock / item.threshold) * 100)}%` }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-[#EF4444] to-[#F59E0B]"
                    />
                  </div>
                  <div className="text-xs text-[#94a3b8] mt-1">Ambang minimum: {item.threshold}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
