# FirstanPOS

Enterprise-grade AI-powered SaaS Point of Sale.

## Getting Started

Due to the massive scope of the project, we have scaffolded the Monorepo structure (Phase 1).

### Prerequisites
- Node.js (v18+)
- PostgreSQL (or Docker)

### Installation

1. From the root directory (`c:\posFirstan`), install all dependencies for workspaces:
   ```bash
   npm install
   ```

2. Setup Database:
   Create a `.env` file in `packages/database` and set your `DATABASE_URL`.
   ```bash
   cd packages/database
   npx prisma generate
   npx prisma db push
   ```

3. Run the development servers:
   From the root directory, run both frontend and backend concurrently:
   ```bash
   npm run dev
   ```

Frontend will run on port 5173 by default, and backend will run on port 3001.
