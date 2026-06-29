import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// Prisma 7 uses driver adapters (WASM query compiler) instead of a bundled
// query engine, so the SQLite connection must be provided explicitly.
const url = process.env.DATABASE_URL || 'file:../../db_pos.sqlite';
const adapter = new PrismaBetterSqlite3({ url });

const prisma = new PrismaClient({ adapter });

export default prisma;
