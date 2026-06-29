import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const url = process.env.DATABASE_URL || 'file:../../db_pos.sqlite';
const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log('🌱 Seeding database...');

  // Create demo company
  const company = await prisma.company.upsert({
    where: { id: 'demo-company' },
    update: {},
    create: {
      id: 'demo-company',
      name: 'Toko Demo FirstanPOS',
    },
  });

  // Create demo categories
  const categoryDefs = [
    { name: 'Minuman', description: 'Air mineral, teh, kopi, dan minuman lainnya' },
    { name: 'Makanan Instan', description: 'Mie instan dan makanan siap saji' },
    { name: 'Snack', description: 'Keripik, biskuit, dan camilan' },
    { name: 'Roti & Kue', description: 'Roti tawar, roti manis, dan kue' },
  ];

  const categoryByName: Record<string, string> = {};
  for (const c of categoryDefs) {
    const cat = await prisma.category.upsert({
      where: { name: c.name },
      update: { description: c.description },
      create: c,
    });
    categoryByName[c.name] = cat.id;
  }
  console.log(`✅ Seeded ${categoryDefs.length} categories`);

  // Create demo products (linked to categories)
  const products = [
    { sku: 'SKU-00001', name: 'Aqua 600ml', price: 5000, stock: 48, category: 'Minuman' },
    { sku: 'SKU-00002', name: 'Indomie Goreng', price: 3500, stock: 120, category: 'Makanan Instan' },
    { sku: 'SKU-00003', name: 'Kopi Kapal Api Sachet', price: 8500, stock: 65, category: 'Minuman' },
    { sku: 'SKU-00004', name: 'Teh Botol Sosro', price: 5000, stock: 30, category: 'Minuman' },
    { sku: 'SKU-00005', name: 'Pocari Sweat 500ml', price: 9000, stock: 24, category: 'Minuman' },
    { sku: 'SKU-00006', name: 'Chitato Sapi Panggang 68g', price: 12000, stock: 15, category: 'Snack' },
    { sku: 'SKU-00007', name: 'Good Day Cappuccino', price: 6500, stock: 40, category: 'Minuman' },
    { sku: 'SKU-00008', name: 'Roti Tawar Serba', price: 18000, stock: 10, category: 'Roti & Kue' },
    { sku: 'SKU-00009', name: 'Susu Ultra 250ml', price: 8000, stock: 55, category: 'Minuman' },
    { sku: 'SKU-00010', name: 'Milo Sachet 33g', price: 4500, stock: 80, category: 'Minuman' },
    { sku: 'SKU-00011', name: 'Biskuat Energy 35g', price: 5500, stock: 45, category: 'Snack' },
    { sku: 'SKU-00012', name: 'Roma Kelapa', price: 7000, stock: 60, category: 'Snack' },
  ];

  for (const p of products) {
    const { category, ...rest } = p;
    const data = { ...rest, categoryId: categoryByName[category] ?? null };
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: data,
      create: data,
    });
  }

  console.log(`✅ Seeded ${products.length} products`);
  console.log('🏁 Done!');
  await prisma.$disconnect();
}

seed().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
