import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare';
import { Form, redirect, useLoaderData } from '@remix-run/react';
import { jwtVerify } from 'jose';

interface Env {
    DB: D1Database;
}
interface LoaderData {
    secrets: string | null;
}
const SECRET_KEY = new TextEncoder().encode('your_secret_key'); // Replace with a secure, random key

async function getUserRoleId(email, db) {
    const { results } = await db.prepare('SELECT roleId FROM User WHERE email = ?').bind(email).all();
    return results.length > 0 ? results[0].roleId : null;
}

async function getRoleText(roleId, db) {
    const { results } = await db.prepare('SELECT text FROM RoleText WHERE roleId = ?').bind(roleId).all();
    return results.length > 0 ? results[0].text : null;
}

export const loader: LoaderFunction = async ({ context, request }) => {
    const env = context.cloudflare.env as Env;
    const token = request.headers.get('Cookie')?.split('session=')[1]?.split(';')[0];
    if (!token) return redirect('/');

    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        const email = payload.email;
        console.log('email', email);
        
        const roleId = await getUserRoleId(email, env.DB);
        console.log('roleId', roleId);

        if (!roleId) return { secrets: null };

        const secretText = await getRoleText(roleId, env.DB);
        console.log('secretText', secretText);

        return { secrets: secretText || null };
    } catch {
        return redirect('/');
    }
};

export const action: ActionFunction = async () => {
    return redirect('/', {
        headers: {
            'Set-Cookie': 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
        },
    });
};

export default function SecretsPost() {
    const { secrets } = useLoaderData<LoaderData>(); // Get data from loader

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
                        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                            Logout
                        </button>
                    </Form>
                </div>
            </div>
        </div>
    );
}
