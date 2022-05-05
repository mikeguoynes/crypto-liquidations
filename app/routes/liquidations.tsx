import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { getAccounts } from "~/models/accounts.server";

import tables from "../styles/tables.css";
import global from "../styles/global.css";
import { Pagination } from "~/components/pagination";
import { useEffect, useState } from "react";

export type PaginationFilters = {
  pageCount: number;
  limit: number;
  offset: number;
}

type LoaderData = {
  accountsListItems: Awaited<ReturnType<typeof getAccounts>>;
  limit: number;
  offset: number;
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tables }, { rel: "stylesheet", href: global }];
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const search = new URLSearchParams(url.search);
  const limit = +(search.get('limit') || 25);
  const offset = +(search.get('offset') || 0);
  const accountsListItems = await getAccounts({ limit, offset });
  
  return json<LoaderData>({ accountsListItems, limit, offset });
};

export default function AccountListings() {
  let navigate = useNavigate();
  const data = useLoaderData() as LoaderData;

  const [filters, setFilters] = useState({ limit: data.limit, offset: data.offset, pageCount: Math.ceil(data.accountsListItems.totalCount / 25 ) });
  
  const handlePageChange = (pageChangeDirection: string) => {
    let newOffset = 0;
    if (pageChangeDirection === 'next') {
      newOffset = filters?.offset + filters?.limit;
    } else {
      newOffset = Math.max(filters?.offset - filters?.limit, 0) 
    };
    console.log('offset', newOffset)
    navigate(`?limit=${filters.limit}&offset=${newOffset}`);
  }

  useEffect(() => {
    setFilters({ limit: data.limit, offset: data.offset, pageCount: Math.ceil(data.accountsListItems.totalCount / 25 ) });
  }, [data])

  const handleSort = () => {
    console.log("sort");
  };

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
          <div></div>
          
          <div className="lhs-filters px-4 mt-8">
            <h2 className="mb-4">Filters</h2>
            <div className="mb-4">
              <div>Min util %</div>
              <input type="number" className="p-1"/>
            </div>

            <div className="mb-4">
              <div>Max util %</div>
              <input type="number" className="p-1"/>
            </div>
          </div>
          

          <hr />
        </div>

        <div className="flex-1 p-6">
        <h2 className="text-xl text-blue-600 my-4 ml-4">Borrow Accounts </h2>
          <Pagination onPageChange={handlePageChange} filters={filters} totalCount={data.accountsListItems.totalCount}/>
          <table className="table-auto">
            <thead>
              <tr>
                <th onClick={handleSort}> Address</th>
                <th onClick={handleSort}>Algo</th>
                <th onClick={handleSort}>goBTC</th>
                <th onClick={handleSort}>goEth</th>
                <th onClick={handleSort}>usdc</th>
                <th onClick={handleSort}>Stbl</th>
                <th onClick={handleSort}>max borrow</th>
                <th onClick={handleSort}>total borrow</th>
                <th>Util %</th>
              </tr>
            </thead>
            <tbody>
              {data.accountsListItems.items.map((account) => (
                <tr key={account.id}>
                  <td><Link to={`/accounts/${account.id}`}>{account.address}</Link></td>
                  <td>{account.ALGO_net}</td>
                  <td>{account.goBTC_net}</td>
                  <td>{account.goETH_net}</td>
                  <td>{account.USDC_net}</td>
                  <td>{account.STBL_net}</td>
                  <td>{account.max_borrow}</td>
                  <td>{account.total_borrow}</td>
                  <td>{(account.util_perc * 100).toFixed(2)}%</td>
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
