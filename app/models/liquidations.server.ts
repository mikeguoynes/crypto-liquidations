import { prisma } from "~/db.server";
import { Pagination } from "./pagination";

export type { accounts } from "@prisma/client";

export function getAccounts(pagination?: Pagination) {
  return prisma.accounts.findMany({ take: pagination?.limit || 25, skip: pagination?.offset || 0 });
}

export function getAccountByID(id?: string) {
  if (!id) { return null; }
  return prisma.accounts.findFirst({ where: { id: +id} })
}