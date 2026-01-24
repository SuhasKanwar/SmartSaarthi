import { PrismaClient } from "../generated/prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
}