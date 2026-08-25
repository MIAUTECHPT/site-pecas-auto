import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getPrismaClient() {
  if (!globalForPrisma.prisma) {
    const adapter = new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL || "file:./dev.db",
    });
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.prisma;
}

export const prisma = getPrismaClient();
export const getPrisma = getPrismaClient;
export default prisma;