import { PrismaClient } from "../generated/prisma/client";
import { DATABASE_URL, NODE_ENV } from "./config";
import { PrismaPg } from "@prisma/adapter-pg";

let prisma: PrismaClient;

const adapter = new PrismaPg({
  connectionString: DATABASE_URL
});

if (NODE_ENV !== "development") {
  prisma = new PrismaClient({
    adapter: adapter
  });
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      adapter: adapter
    });
  }
  prisma = global.__prisma;
}

export default prisma;