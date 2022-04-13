import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import type { LinksFunction } from "remix";
import { useUser } from "~/utils";
import { getAccounts } from "~/models/liquidations.server";

import tables from "../styles/tables.css";

type LoaderData = {
  accountsListItems: Awaited<ReturnType<typeof getAccounts>>;
};
export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tables }];
};

export const loader: LoaderFunction = async ({ request }) => {
  const accountsListItems = await getAccounts();
  return json<LoaderData>({ accountsListItems: accountsListItems });
};

export default function AccountsPage() {
  const data = useLoaderData() as LoaderData;
  const user = useUser();

  const handleSort = () => {
    console.log("sort");
  };

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to="/">Home</Link>
        </h1>
        <p>{user.email}</p>
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
        <h2 className="text-xl text-blue-600 my-4 ml-4">Liquidations </h2>
          <table className="table-auto">
            <thead>
              <tr>
                <th onClick={handleSort}>Storage Address</th>
                <th onClick={handleSort}>Algo</th>
                <th onClick={handleSort}>goBTC</th>
                <th onClick={handleSort}>goEth</th>
                <th onClick={handleSort}>usdc</th>
                <th onClick={handleSort}>Stbl</th>
                <th onClick={handleSort}>max borrow</th>
                <th onClick={handleSort}>total borrow</th>

              </tr>
            </thead>
            <tbody>
              {data.accountsListItems.map((account) => (
                <tr key={account.id}>
                  <td><Link to={`/accounts/${account.id}`}>{account.id}</Link></td>
                  <td>{account.ALGO_net}</td>
                  <td>{account.goBTC_net}</td>
                  <td>{account.goETH_net}</td>
                  <td>{account.USDC_net}</td>
                  <td>{account.STBL_net}</td>
                  <td>{account.max_borrow}</td>
                  <td>{account.total_borrow}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <Outlet />
        </div>
      </main>
    </div>
  );
}
