import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TransactionItem:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *         quantity:
 *           type: integer
 *         price:
 *           type: number
 *     TransactionCreate:
 *       type: object
 *       required:
 *         - items
 *         - paymentType
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TransactionItem'
 *         paymentType:
 *           type: string
 *           enum: [CASH, DEBIT, CREDIT_CARD, QRIS, EWALLET]
 *         status:
 *           type: string
 *           enum: [COMPLETED, HOLD, VOID]
 *           default: COMPLETED
 *         discount:
 *           type: number
 *           description: Discount as a nominal amount (IDR)
 *           default: 0
 *         taxRate:
 *           type: number
 *           description: Tax rate as a percentage (e.g. 11 for PPN 11%)
 *           default: 0
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         subtotal:
 *           type: number
 *         discount:
 *           type: number
 *         tax:
 *           type: number
 *         total:
 *           type: number
 *         status:
 *           type: string
 *         paymentType:
 *           type: string
 *         items:
 *           type: array
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Transactions]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [COMPLETED, HOLD, VOID]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of transactions
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where = status ? { status: status as string } : {};

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: true } } },
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({ data, total, page: pageNum, limit: limitNum });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get a transaction by ID
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction detail
 *       404:
 *         description: Transaction not found
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { product: true } } },
    });
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction (Checkout)
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransactionCreate'
 *     responses:
 *       201:
 *         description: Transaction created
 *       400:
 *         description: Invalid data or insufficient stock
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { items, paymentType = 'CASH', status = 'COMPLETED', discount = 0, taxRate = 0 } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }

    // Fetch products and calculate the subtotal from authoritative DB prices
    let subtotal = 0;
    const transactionItems: { productId: string; quantity: number; price: number; subtotal: number }[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) return res.status(404).json({ error: `Product ${item.productId} not found` });
      if (status === 'COMPLETED' && product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }
      const lineSubtotal = product.price * item.quantity;
      subtotal += lineSubtotal;
      transactionItems.push({ productId: item.productId, quantity: item.quantity, price: product.price, subtotal: lineSubtotal });
    }

    // Compute discount, tax and grand total server-side for integrity.
    // discount is a nominal amount (clamped to subtotal); taxRate is a percentage.
    const discountAmount = Math.min(Math.max(Number(discount) || 0, 0), subtotal);
    const taxableBase = subtotal - discountAmount;
    const tax = Math.round(taxableBase * (Math.max(Number(taxRate) || 0, 0) / 100));
    const total = taxableBase + tax;

    // Create transaction and reduce stock in one transaction block
    const transaction = await prisma.$transaction(async (tx) => {
      const newTx = await tx.transaction.create({
        data: {
          subtotal,
          discount: discountAmount,
          tax,
          total,
          paymentType,
          status,
          items: { create: transactionItems },
        },
        include: { items: { include: { product: true } } },
      });

      // Reduce stock only if COMPLETED
      if (status === 'COMPLETED') {
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      return newTx;
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

/**
 * @swagger
 * /api/transactions/{id}/void:
 *   patch:
 *     summary: Void a transaction
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction voided and stock restored
 */
router.patch('/:id/void', async (req: Request, res: Response) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    if (transaction.status === 'VOID') return res.status(400).json({ error: 'Transaction already voided' });

    await prisma.$transaction(async (tx) => {
      await tx.transaction.update({ where: { id: req.params.id }, data: { status: 'VOID' } });
      // Restore stock
      if (transaction.status === 'COMPLETED') {
        for (const item of transaction.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    });

    res.json({ message: 'Transaction voided and stock restored' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to void transaction' });
  }
});

export default router;
