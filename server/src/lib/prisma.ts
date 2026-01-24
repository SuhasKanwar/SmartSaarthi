import { PrismaClient } from "../generated/prisma/client";
import { DATABASE_URL, NODE_ENV } from "./config";
import { PrismaPg } from "@prisma/adapter-pg";

let prismaClient;

const adapter = new PrismaPg({
  connectionString: DATABASE_URL
});

if (NODE_ENV !== "development") {
  prismaClient = new PrismaClient({
    adapter: adapter
  });
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      adapter: adapter
    });
  }
  prismaClient = global.__prisma;
}

export default prismaClient;