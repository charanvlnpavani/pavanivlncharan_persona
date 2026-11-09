import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env";
import { PrismaClient } from "../generated/prisma/client";

/** One shared database client for the whole process. */
export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
});

export type Db = typeof prisma;
/** Either the client or an interactive transaction client. */
export type Tx = Parameters<Parameters<Db["$transaction"]>[0]>[0] | Db;
