import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check if we already have a prisma instance on the global object.
// If not, create a new one.
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// In development mode, save the instance to the global object 
// so it's reused during Hot Module Replacement (HMR).
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma