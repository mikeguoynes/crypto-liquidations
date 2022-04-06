import type { User, accounts } from "@prisma/client";
import { prisma } from "~/db.server";

export type { accounts } from "@prisma/client";

export function getAccounts() {
  return prisma.accounts.findMany({ take: 25 })
}
