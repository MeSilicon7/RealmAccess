import type { ActionFunction, LoaderFunction } from "@remix-run/cloudflare";
import { Form, redirect } from "@remix-run/react";
import { jwtVerify } from "jose";

interface Env {
  DB: D1Database;
}

const SECRET_KEY = new TextEncoder().encode("your_secret_key"); // Replace with a secure, random key

export const loader: LoaderFunction = async ({ context, request }) => {
  const env = context.cloudflare.env as Env;
  const token = request.headers.get("Cookie")?.split("session=")[1]?.split(";")[0];

  if (!token) {
    return redirect("/");
  }

  try {
    // Verify the token
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const email = payload.email as string;

    // Fetch user role
    const { results: userResults } = await env.DB.prepare(
      "SELECT roleId FROM User WHERE email = ?"
    )
      .bind(email)
      .all();

    if (userResults.length === 0) {
      throw new Error("User not found.");
    }

    const roleId = userResults[0].roleId;

    if (!roleId) {
      return { secrets: null };
    }

    // Fetch secret text based on role
    const { results: roleTextResults } = await env.DB.prepare(
      "SELECT text FROM RoleText WHERE roleId = ?"
    )
      .bind(roleId)
      .all();

    const secretText = roleTextResults.length > 0 ? roleTextResults[0].text : null;

    return { secrets: secretText };
  } catch (error) {
    console.error("Error verifying token or fetching data:", error);
    return redirect("/");
  }
};

export const action: ActionFunction = async () => {
  return redirect("/", {
    headers: {
      "Set-Cookie": "session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    },
  });
};

export default function SecretsPost({ secrets }: { secrets: string | null }) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-lg bg-white shadow-md rounded px-8 py-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Secrets</h1>
        {secrets ? (
          <p className="text-lg text-green-600 text-center">{secrets}</p>
        ) : (
          <p className="text-lg text-red-600 text-center">There are no secrets available for you.</p>
        )}
        <div className="text-center">
          <Form method="post">
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Logout
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
