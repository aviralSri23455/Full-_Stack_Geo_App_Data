import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const router = useRouter();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Invalid credentials');

            const data = await res.json();
            localStorage.setItem('token', data.token);
            router.push('/dashboard');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Improved gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800">
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)] animate-pulse" />
            </div>

            {/* Enhanced floating particles */}
            <div className="absolute inset-0">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full opacity-20"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `float ${10 + Math.random() * 20}s linear infinite`,
                            animationDelay: `-${Math.random() * 20}s`,
                        }}
                    />
                ))}
            </div>

            <div className="relative flex items-center justify-center min-h-screen px-4 py-12">
                <div className="w-full max-w-md p-8 space-y-6 shadow-2xl bg-white/95 backdrop-blur-xl rounded-3xl">
                    <h2 className="text-3xl font-bold text-center text-gray-800">
                        Login
                    </h2>
                    
                    {error && (
                        <div className="p-3 text-center text-red-500 rounded-lg bg-red-50">
                            {error}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="block w-full px-4 py-3 transition-all duration-200 border border-gray-200 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="block w-full px-4 py-3 transition-all duration-200 border border-gray-200 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full px-6 py-3 mt-4 text-lg font-medium text-white transition-all duration-200 bg-violet-600 rounded-xl hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-500/30 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                        >
                            Login
                        </button>
                    </form>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Dont have an account?{' '}
                            <Link 
                                href="/register" 
                                className="font-medium transition-colors duration-200 text-violet-600 hover:text-violet-500"
                            >
                                Register
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;