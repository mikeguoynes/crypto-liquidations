import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams, useSubmit } from "@remix-run/react";
import * as React from "react";

import { createUserSession, getUserId } from "~/session.server";
import MyAlgoConnect from '@randlabs/myalgo-connect';
import { useEffect, useRef, useState } from "react";


const settings = {
    shouldSelectOneAccount: false,
    openManager: false
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

interface ActionData {
  errors?: {
    email?: string;
    password?: string;
  };
}

export async function action({ request }: { request: any }): Promise<any> {
  const data = await request.formData();
  console.log('login.tsx 36 action - get account number', data.get('accountNumber'));
  return createUserSession({request, userId: data.get('accountNumber'), remember: false, redirectTo: '/liquidations'})
}

// export const action: ActionFunction = async ({ request }) => {
  
//   const formData = await request.formData();
//   //const redirectTo = formData.get("redirectTo");
//   console.log('form data', formData);

//   return createUserSession({
//     request,
//     formData,
//     redirectTo:  "/liquidations",
//   });
// };

export const meta: MetaFunction = () => {
  return {
    title: "Login",
  };
};

export default function LoginPage() {
  const formRef = useRef<HTMLFormElement>(null); //Add a form ref.
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/liquidations";
  const actionData = useActionData() as ActionData;
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);
  const submit = useSubmit();

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  const handleConnectAlgoWallet = (event: any) => {
    // Submit arbitrary form data to the server. https://stackoverflow.com/questions/71123120/remix-usesubmit-arbitrary-data
   event.preventDefault();

   new MyAlgoConnect({ disableLedgerNano: false }).connect(settings).then((res) => {
     const accountInputEl: HTMLInputElement | null = document.querySelector('#accountNumber');
     if (!accountInputEl) { return; }
     accountInputEl.value = res[0].address;
     submit(
      event.target,
      { method: "post" }
    );
   })
  }

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form ref={formRef} method="post" onSubmit={handleConnectAlgoWallet} className="space-y-6">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button
            type="submit"
            className="w-full rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Connect to MyAlgoWallet
          </button>
          <input type="hidden" id="accountNumber" name="accountNumber" />
        </Form>
      </div>
    </div>
  );
}
