import type { ActionFunction, LoaderFunction, MetaFunction } from '@remix-run/cloudflare';
import { Form, json, redirect, useActionData } from '@remix-run/react';
import { useState } from 'react';
import jwt from 'jsonwebtoken';

export const meta: MetaFunction = () => [
    {
        title: 'RealmAccess',
        description: 'Welcome to RealmAccess!',
    },
];

interface Env {
    DB: D1Database;
}

export const loader: LoaderFunction = async ({ request }) => {
    const token = request.headers.get("Cookie")?.split("session=")[1]?.split(";")[0];
  
    if (token) {
      return redirect("/secrets-post");
    }

    return null;
};

export const action: ActionFunction = async ({ context, request }) => {
    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');
    const actionType = formData.get('actionType');

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
        return json({ error: 'Invalid form submission' }, { status: 400 });
    }

    const env = context.cloudflare.env as Env;

    try {
        if (actionType === 'login') {
            const { results } = await env.DB.prepare('SELECT * FROM User WHERE email = ? AND password = ?').bind(email, password).all();

            if (results.length > 0) {
                const token = jwt.sign({ email }, 'your_secret_key', { expiresIn: '1h' });

                const headers = new Headers();
                headers.append('Set-Cookie', `session=${token}; HttpOnly; Path=/; Max-Age=3600;`);

                return redirect('/secrets-post', { headers });
            } else {
                return json({ error: 'Invalid email or password.' }, { status: 401 });
            }
        } else if (actionType === 'register') {
            const { results: existingUser } = await env.DB.prepare('SELECT EXISTS (SELECT 1 FROM User WHERE email = ?)').bind(email).all();

            if (existingUser[0]['EXISTS (SELECT 1 FROM User WHERE email = ?)'] === 1) {
                return json({ error: 'Email is already registered.' }, { status: 409 });
            }

            await env.DB.prepare('INSERT INTO User (email, password) VALUES (?, ?)').bind(email, password).run();

            return json({ success: true, message: 'Registration successful!' });
        } else {
            return json({ error: 'Invalid action type.' }, { status: 400 });
        }
    } catch (e) {
        console.error('Database Error:', e);
        return json({ error: 'An error occurred during the process.' }, { status: 500 });
    }
};

export default function Index() {
    const actionData = useActionData();
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white shadow-lg rounded-lg">
                <div className="border-b flex">
                    <button
                        onClick={() => setActiveTab('login')}
                        className={`w-1/2 py-3 text-center font-semibold ${
                            activeTab === 'login' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'
                        }`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setActiveTab('register')}
                        className={`w-1/2 py-3 text-center font-semibold ${
                            activeTab === 'register' ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-500'
                        }`}
                    >
                        Register
                    </button>
                </div>
                <div className="p-6">
                    {activeTab === 'login' && (
                        <div>
                            <h2 className="text-xl font-semibold text-center mb-4">Login</h2>
                            <Form method="POST" className="space-y-4">
                                <input type="hidden" name="actionType" value="login" />
                                {actionData?.error && (
                                    <p className="text-red-500 text-sm text-center">{actionData.error}</p>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            className="mt-1 block w-full p-2 border rounded-md"
                                        />
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Password
                                        <input
                                            type="password"
                                            name="password"
                                            required
                                            className="mt-1 block w-full p-2 border rounded-md"
                                        />
                                    </label>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                                >
                                    Login
                                </button>
                            </Form>
                        </div>
                    )}
                    {activeTab === 'register' && (
                        <div>
                            <h2 className="text-xl font-semibold text-center mb-4">Register</h2>
                            <Form method="POST" className="space-y-4">
                                <input type="hidden" name="actionType" value="register" />
                                {actionData?.error && (
                                    <p className="text-red-500 text-sm text-center">{actionData.error}</p>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            className="mt-1 block w-full p-2 border rounded-md"
                                        />
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Password
                                        <input
                                            type="password"
                                            name="password"
                                            required
                                            className="mt-1 block w-full p-2 border rounded-md"
                                        />
                                    </label>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                                >
                                    Register
                                </button>
                            </Form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
