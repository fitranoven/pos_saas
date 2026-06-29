import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const LOW_STOCK_THRESHOLD = 10;

/**
 * @swagger
 * /api/reports/dashboard:
 *   get:
 *     summary: Aggregated business metrics for the dashboard
 *     tags: [Reports]
 *     description: Computes KPIs, 7-day sales trend, top products, and low-stock alerts from COMPLETED transactions.
 *     responses:
 *       200:
 *         description: Dashboard metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 kpi:
 *                   type: object
 *                   properties:
 *                     revenue: { type: number }
 *                     transactions: { type: integer }
 *                     itemsSold: { type: integer }
 *                     avgOrderValue: { type: number }
 *                     taxCollected: { type: number }
 *                     discountGiven: { type: number }
 *                 salesByDay:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date: { type: string }
 *                       label: { type: string }
 *                       total: { type: number }
 *                       count: { type: integer }
 *                 topProducts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name: { type: string }
 *                       sold: { type: integer }
 *                       revenue: { type: number }
 *                 lowStock:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name: { type: string }
 *                       stock: { type: integer }
 *                       threshold: { type: integer }
 */
router.get('/dashboard', async (_req: Request, res: Response) => {
  try {
    const completed = { status: 'COMPLETED' as const };

    // --- KPI aggregates ---
    const [revenueAgg, itemsAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: completed,
        _sum: { total: true, tax: true, discount: true },
        _count: { _all: true },
      }),
      prisma.transactionItem.aggregate({
        where: { transaction: completed },
        _sum: { quantity: true },
      }),
    ]);

    const revenue = revenueAgg._sum.total ?? 0;
    const transactions = revenueAgg._count._all ?? 0;
    const itemsSold = itemsAgg._sum.quantity ?? 0;
    const avgOrderValue = transactions > 0 ? Math.round(revenue / transactions) : 0;

    // --- 7-day sales trend (grouped in JS for SQLite compatibility) ---
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - 6); // include today + previous 6 days

    const recentTx = await prisma.transaction.findMany({
      where: { ...completed, createdAt: { gte: since } },
      select: { createdAt: true, total: true },
    });

    // Seed 7 buckets keyed by ISO date
    const buckets: { date: string; label: string; total: number; count: number }[] = [];
    const byDate: Record<string, { total: number; count: number }> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const entry = { date: key, label: DAY_LABELS[d.getDay()], total: 0, count: 0 };
      buckets.push(entry);
      byDate[key] = entry;
    }
    for (const tx of recentTx) {
      const key = tx.createdAt.toISOString().slice(0, 10);
      if (byDate[key]) {
        byDate[key].total += tx.total;
        byDate[key].count += 1;
      }
    }

    // --- Top products by quantity sold ---
    const grouped = await prisma.transactionItem.groupBy({
      by: ['productId'],
      where: { transaction: completed },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });
    const topProductDetails = await prisma.product.findMany({
      where: { id: { in: grouped.map((g) => g.productId) } },
      select: { id: true, name: true },
    });
    const nameById: Record<string, string> = Object.fromEntries(topProductDetails.map((p) => [p.id, p.name]));
    const topProducts = grouped.map((g) => ({
      name: nameById[g.productId] ?? 'Produk dihapus',
      sold: g._sum.quantity ?? 0,
      revenue: g._sum.subtotal ?? 0,
    }));

    // --- Low stock alerts ---
    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lte: LOW_STOCK_THRESHOLD } },
      orderBy: { stock: 'asc' },
      take: 5,
      select: { name: true, stock: true },
    });
    const lowStock = lowStockProducts.map((p) => ({ name: p.name, stock: p.stock, threshold: LOW_STOCK_THRESHOLD }));

    res.json({
      kpi: {
        revenue,
        transactions,
        itemsSold,
        avgOrderValue,
        taxCollected: revenueAgg._sum.tax ?? 0,
        discountGiven: revenueAgg._sum.discount ?? 0,
      },
      salesByDay: buckets,
      topProducts,
      lowStock,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to build dashboard report' });
  }
});

export default router;
