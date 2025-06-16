import { PrismaClient } from "../generated/client"

declare global {
  var __prisma: PrismaClient | undefined
}

export const prisma =
  globalThis.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ['error', 'warn'] : ['error']
  })

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma
}

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
