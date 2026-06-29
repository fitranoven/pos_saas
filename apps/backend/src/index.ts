import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import prisma from './lib/prisma';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import transactionRoutes from './routes/transactions';
import reportRoutes from './routes/reports';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Configuration
const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FirstanPOS API',
      version: '1.0.0',
      description: `
## 🏪 FirstanPOS – REST API Documentation

Enterprise-grade AI-powered SaaS Point of Sale system.

### Features:
- **Products** – Full CRUD with SKU auto-generation, barcode support
- **Transactions** – Checkout, Hold, Void with automatic stock management

### Authentication
Currently open API. JWT authentication will be added in Phase 2.
      `,
      contact: {
        name: 'FirstanPOS Team',
        email: 'support@firstanpos.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Development server',
      },
    ],
    tags: [
      { name: 'Products', description: 'Product management endpoints' },
      { name: 'Categories', description: 'Product category endpoints' },
      { name: 'Transactions', description: 'POS transaction endpoints' },
      { name: 'Reports', description: 'Dashboard & analytics endpoints' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Swagger UI
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'FirstanPOS API Docs',
    customfavIcon: '',
    customCss: `
      .swagger-ui .topbar { background: linear-gradient(135deg, #1E3A8A 0%, #1e40af 100%); }
      .swagger-ui .topbar .download-url-wrapper { display: none; }
      .swagger-ui .info h2.title { color: #1E3A8A; }
      .swagger-ui .btn.authorize { border-color: #D4AF37; color: #D4AF37; }
      .swagger-ui .btn.authorize svg { fill: #D4AF37; }
    `,
  })
);

// Swagger JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check
app.get('/api/health', async (req, res) => {
  let database: 'connected' | 'disconnected' = 'disconnected';
  try {
    // Verify the database is actually reachable
    await prisma.$queryRaw`SELECT 1`;
    database = 'connected';
  } catch {
    database = 'disconnected';
  }

  res.status(database === 'connected' ? 200 : 503).json({
    status: database === 'connected' ? 'ok' : 'degraded',
    message: 'FirstanPOS API is running!',
    timestamp: new Date().toISOString(),
    database,
    docs: `http://localhost:${port}/api-docs`,
  });
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

app.listen(port, () => {
  console.log(`🚀 FirstanPOS API running at http://localhost:${port}`);
  console.log(`📚 Swagger API Docs at http://localhost:${port}/api-docs`);
  console.log(`🗄️  Database: db_pos.sqlite`);
});
