import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, Outlet, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { accounts, getAccountByID } from "~/models/liquidations.server";

import { deleteNote } from "~/models/note.server";
import { requireUserId } from "~/session.server";
import tables from "../../styles/tables.css";
import type { LinksFunction } from "remix";
import { getPrice as getPriceAPI } from "~/models/pricesAPI.server";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tables }];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  return {
    ...(await getPriceAPI("bitcoin")),
    ...(await getPriceAPI("ethereum")),
    ...(await getPriceAPI("algorand")),
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
  const { account, algorand, bitcoin, ethereum } = useLoaderData();
  const tableView = () => ( <table className="table-auto">
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
      <td>Price</td>
      <td>${algorand.usd}</td>
      <td>${bitcoin.usd}</td>
      <td>${ethereum.usd}</td>
      <td></td>
      <td>STBL supply</td>
    </tr>
    <tr>
      <td>Value ($)</td>
    </tr>
    <tr>
      <td>Collateral Factor</td>
    </tr>
    <tr>
      <td>Max Borrow</td>
    </tr>
    <tr>
      <td></td>
    </tr>
    <tr>
      <td>Borrowed</td>
    </tr>
    <tr>
      <td>Price</td>
    </tr>
    <tr>
      <td>$ Value</td>
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
