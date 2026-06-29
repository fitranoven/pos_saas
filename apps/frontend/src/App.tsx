import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Placeholder from './pages/Placeholder';

const pages: Record<string, React.ReactNode> = {
  dashboard: <Dashboard />,
  pos: <POS />,
  products: <Products />,
  categories: <Categories />,
  inventory: <Placeholder title="Inventori" description="Kelola stock in, stock out, transfer antar gudang, stock opname, dan laporan inventory valuation." />,
  customers: <Placeholder title="Customer" description="Manajemen data customer, membership, loyalty point, riwayat pembelian, dan reminder ulang tahun." />,
  suppliers: <Placeholder title="Supplier" description="CRUD supplier, purchase history, hutang supplier, dan ranking supplier." />,
  purchases: <Placeholder title="Pembelian" description="Purchase order, penerimaan barang, retur pembelian, dan invoice pembelian." />,
  finance: <Placeholder title="Keuangan" description="Income, expense, cash flow, profit & loss, daily closing, dan financial summary." />,
  reports: <Placeholder title="Laporan" description="Laporan lengkap penjualan, produk, stok, customer, supplier, dan laba rugi. Export PDF, Excel, CSV." />,
  settings: <Placeholder title="Pengaturan" description="Konfigurasi profil perusahaan, logo, pajak, mata uang, nomor invoice, backup database, dan pengaturan printer." />,
};

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {pages[currentPage] || pages.dashboard}
    </Layout>
  );
}

export default App;
