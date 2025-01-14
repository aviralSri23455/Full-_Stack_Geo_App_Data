import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if the user is logged in
        const token = localStorage.getItem('token');
        console.log('Token:', token); // Debugging: Log token for verification
        setIsAuthenticated(!!token); // Update state based on token existence
    }, [router.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token'); // Clear token
        setIsAuthenticated(false); // Update state
        router.push('/login'); // Redirect to login
    };

    useEffect(() => {
        // Redirect unauthenticated users away from protected pages
        const token = localStorage.getItem('token');
        const protectedRoutes = ['/dashboard']; // Add any other protected routes here
        if (!token && protectedRoutes.includes(router.pathname)) {
            router.push('/login');
        }
    }, [router.pathname]);

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <Head>
                <title>Map Upload App</title>
                <meta name="description" content="Upload and process maps" />
            </Head>

            <nav className="bg-white shadow-sm">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <Link href="/" className="flex items-center flex-shrink-0">
                                <span className="text-lg font-bold">Map App</span>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            {isAuthenticated && router.pathname !== '/' ? (
                                <>
                                    <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 p-6">{children}</main>

            <footer className="bg-white border-t border-gray-200">
                <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <p className="text-center text-gray-500">
                        © 2025 Map Upload App. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
