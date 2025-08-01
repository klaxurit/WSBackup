import { PrismaClient } from "../generated/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  // CRITIQUE: Configuration connection pooling optimisée
  // Logging pour debug connection issues
  log: process.env.NODE_ENV === "development" 
    ? ['query', 'info', 'warn', 'error']
    : ['warn', 'error'],
});

if (process.env.NODE_ENV === "production") globalForPrisma.prisma = prisma;

export * from "../generated/client"

export const connectDB = async () => {
  try {
    await prisma.$connect()
    console.log("Data connected")
  } catch (error) {
    console.error(' Database connection failed', error)
    process.exit(1)
  }
}

export const disconnectDB = async () => {
  await prisma.$disconnect()
}
