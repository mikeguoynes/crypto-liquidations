import { prisma } from "~/db.server";

export type { accounts } from "@prisma/client";

export function getAccounts() {
  return prisma.accounts.findMany({ take: 25 })
}

export function getAccountByID(id?: string) {
  if (!id) { return null; }
  return prisma.accounts.findFirst({ where: { id: +id} })
}