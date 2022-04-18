import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, Outlet, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { accounts, getAccountByID } from "~/models/accounts.server";

import { deleteNote } from "~/models/note.server";
import { requireUserId } from "~/session.server";
import tables from "../../styles/tables.css";
import global from "../../styles/global.css";

import type { LinksFunction } from "remix";
import { getPrice as getPriceAPI } from "~/models/pricesAPI.server";
import { useEffect, useState } from "react";
export const formatPriceAPI = (price: number = 0) => {
  return price?.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}
export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tables }, { rel: "stylesheet", href: global }];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const prices = { 
    ...(await getPriceAPI("bitcoin")),
    ...(await getPriceAPI("ethereum")),
    ...(await getPriceAPI("algorand")),
  }
  return {
    prices,
    account: await getAccountByID(params.accountId),
  };
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.noteId, "noteId not found");

  await deleteNote({ userId, id: params.noteId });

  return redirect("/accounts");
};

export default function AccountDetailsPage() {
  const { account, prices } = useLoaderData();
  const [totalValue, setTotalValue] = useState(0);
  const getValue = (accountSupply?: number, price?: number) => {
    if (accountSupply && price) {
      return accountSupply * price;
    } else {
      return 0;
    }
  }

  const getMaxBorrow = (accountValue?: number, collateralFactor?: number) => {
    collateralFactor = collateralFactor || 0.8; // TODO: remove hardcoded default value
    if (!accountValue || !collateralFactor) {
      return 0;
    } else {
     return formatPriceAPI(accountValue * collateralFactor);
    }
  }

  useEffect(() => {
    const total = getValue(account?.ALGO_supply, prices?.algorand?.usd) + getValue(account?.BTC_supply, prices?.bitcoin?.usd) + getValue(account?.ETH_supply, prices?.ethereum?.usd);
    setTotalValue(+total.toFixed(2));
  }, [account, prices]);
 
  const tableView = () => ( <table id="table-account-view" className="table-auto">
  <thead>
    <tr>
      <th></th>
      <th>ALGO</th>
      <th>goBTC</th>
      <th>goETH</th>
      <th>USDC</th>
      <th>STBL</th>
      <th>Total</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Supplied </td>
      <td>{account?.ALGO_supply || "-"}</td>
      <td>{account?.goBTC_supply || "-"}</td>
      <td>{account?.goETH_supply || "-"}</td>
      <td>{account?.USDC_supply || "-"}</td>
      <td>{account?.STBL_supply || "-"}</td>
      <td></td>
    </tr>
    <tr>
      {/* TODO: Make this the asset */}
      <td>Borrowed (usd)</td>
      <td>{formatPriceAPI(account?.ALGO_borrow) || "-"}</td>
      <td>{formatPriceAPI(account?.goBTC_borrow) || "-"}</td>
      <td>{formatPriceAPI(account?.goETH_borrow) || "-"}</td>
      <td>{formatPriceAPI(account?.USDC_borrow) || "-"}</td>
      <td>{formatPriceAPI(account?.STBL_borrow) || "-"}</td>
      <td>{formatPriceAPI(account?.total_borrow)}</td>
    </tr>
    <tr>
      <td>Price</td>
      <td>{formatPriceAPI(prices?.algorand?.usd)}</td>
      <td>{formatPriceAPI(prices?.bitcoin?.usd)}</td>
      <td>{formatPriceAPI(prices?.ethereum?.usd)}</td>
      {/* // TODO: Get price for USDC and STBL */}
      <td>{formatPriceAPI(1)}</td>
      <td>{formatPriceAPI(1)}</td>
      <td></td>
    </tr>
    <tr>
      <td>Value ($)</td>
      <td>{formatPriceAPI(getValue(prices?.algorand?.usd, account?.ALGO_supply)) || "-"}</td>
      <td>{formatPriceAPI(getValue(prices?.bitcoin?.usd, account?.BTC_supply)) || "-"}</td>
      <td>{formatPriceAPI(getValue(prices?.ethereum?.usd, account?.ETH_supply)) || "-"}</td>
      <td>{formatPriceAPI(getValue(prices?.usdc?.usd, account?.USDC_supply)) || "-"}</td>
      <td>{formatPriceAPI(getValue(prices?.stbl?.usd, account?.STBL_supply)) || "-"}</td>
      <td>{formatPriceAPI(totalValue)}</td>
    </tr>
    <tr>
      <td>Collateral Factor</td>
      <td>{prices?.algorand?.collateral_factor || '-'}%</td>
      <td>{prices?.bitcoin?.collateral_factor || '-'}%</td>
      <td>{prices?.ethereum?.collateral_factor || '-'}%</td>
      <td>{prices?.usdc?.collateral_factor || '-'}%</td>
      <td>{prices?.stbl?.collateral_factor || '-'}%</td>
      <td></td>

    </tr>
    <tr>
      <td>Max Borrow</td>
      <td>{getMaxBorrow(getValue(account?.ALGO_supply, prices?.algorand?.usd), prices?.algorand?.collateral_factor)}</td>
      <td>{getMaxBorrow(getValue(account?.BTC_supply, prices?.bitcoin?.usd), prices?.bitcoin?.collateral_factor)}</td>
      <td>{getMaxBorrow(getValue(account?.ETH_supply, prices?.ethereum?.usd), prices?.ethereum?.collateral_factor)}</td>
      <td>{getMaxBorrow(getValue(account?.USDC_supply, prices?.usdc?.usd), prices?.usdc?.collateral_factor)}</td>
      <td>{getMaxBorrow(getValue(account?.STBL_supply, prices?.stbl?.usd), prices?.stbl?.collateral_factor)}</td>
      <td>{formatPriceAPI(account?.max_borrow)}</td>
   
    </tr>
    
    
    <tr>
      <td colSpan="9999">
        <div className="flex justify-end">
         Util percent {(account?.util_perc.toFixed(2) * 100)}%
         </div>
      </td>
    </tr>
    
   
  </tbody>
</table>)


  return (
    <div className="flex h-full min-h-screen flex-col">
    <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
      <h1 className="text-3xl font-bold">
        <Link to="/">Home</Link>
      </h1>
      <Form action="/logout" method="post">
        <button
          type="submit"
          className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
        >
          Logout
        </button>
      </Form>
    </header>

    <main className="flex h-full bg-white">
      <div className="h-full w-80 border-r bg-gray-50">
        <Link to="new" className="block p-4 text-xl text-blue-500">
          + New Alert
        </Link>

        <hr />
      </div>

      <div className="flex-1 p-6">
      <h2 className="text-xl text-blue-600 my-4">Account Details </h2>
      <p className="my-2">Account Storage Address: {account?.address}</p>
        {tableView()}

        <Outlet />
      </div>
    </main>
  </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Note not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
