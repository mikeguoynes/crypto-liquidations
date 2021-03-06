import { prisma } from "~/db.server";
import { Pagination } from "./pagination";

export type { accounts } from "@prisma/client";

export async function getAccounts(pagination?: Pagination) {
  const totalCount = await prisma.accounts.count()
  const accounts = await prisma.accounts.findMany({ 
    take: pagination?.limit || 25, 
    skip: pagination?.offset || 0,
    orderBy: [
      {
        util_perc: 'desc',
      },
    ],
  });
  return { items: accounts, totalCount };
}

export function getAccountByID(id?: string) {
  if (!id) { return null; }
  return prisma.accounts.findFirst({ where: { id: +id} })
}