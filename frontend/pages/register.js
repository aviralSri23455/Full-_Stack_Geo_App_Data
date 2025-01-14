import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const Register = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const validateForm = () => {
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('All fields are required');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Registration failed');
            if (data.token) localStorage.setItem('token', data.token);
            router.push('/login');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)] animate-pulse" />
            </div>

            {/* Floating particles */}
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

            <div className="relative flex items-center justify-center min-h-screen px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md p-8 space-y-6 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl transform transition-all duration-300 hover:scale-[1.01]">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Create your account
                        </h2>
                    </div>

                    {error && (
                        <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl animate-shake">
                            {error}
                        </div>
                    )}

                    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <div className="transition-all duration-300 transform hover:translate-x-1">
                                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">
                                    Full Name
                                </label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="block w-full px-4 py-3 transition-all duration-200 border border-gray-200 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="transition-all duration-300 transform hover:translate-x-1">
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                                    Email address
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="block w-full px-4 py-3 transition-all duration-200 border border-gray-200 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="transition-all duration-300 transform hover:translate-x-1">
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="block w-full px-4 py-3 transition-all duration-200 border border-gray-200 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="transition-all duration-300 transform hover:translate-x-1">
                                <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-700">
                                    Confirm Password
                                </label>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="block w-full px-4 py-3 transition-all duration-200 border border-gray-200 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full px-6 py-3 mt-4 text-lg font-medium text-white transition-all duration-200 rounded-xl ${
                                loading 
                                    ? 'bg-violet-400 cursor-not-allowed' 
                                    : 'bg-violet-600 hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-500/30'
                            } focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="w-5 h-5 mr-3 -ml-1 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Registering...
                                </span>
                            ) : 'Register'}
                        </button>
                    </form>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link 
                                href="/login" 
                                className="font-medium transition-colors duration-200 text-violet-600 hover:text-violet-500"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>

                    <div className="pt-4 text-center border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                            © 2025 Map Upload App. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;