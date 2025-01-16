import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [particles, setParticles] = useState([]);
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

    useEffect(() => {
        const newParticles = [...Array(30)].map(() => ({
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `-${Math.random() * 20}s`,
            animationDuration: `${10 + Math.random() * 20}s`,
        }));
        setParticles(newParticles);
    }, []);

    return (
        <div className="fixed inset-0 w-full h-full overflow-hidden bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)] animate-pulse" />
                
                {/* Optimized particles for different screen sizes */}
                {particles.map((particle, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full md:h-2 md:w-2 opacity-20"
                        style={{
                            left: particle.left,
                            top: particle.top,
                            animation: `float ${particle.animationDuration} linear infinite`,
                            animationDelay: particle.animationDelay,
                        }}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-xs sm:max-w-sm md:max-w-md transform transition-all duration-300 hover:scale-[1.02]">
                    <div className="p-6 space-y-4 shadow-2xl bg-white/95 backdrop-blur-xl sm:p-8 rounded-3xl sm:space-y-6">
                        {/* Header */}
                        <h2 className="text-2xl font-bold text-center text-gray-800 sm:text-3xl">
                            Login
                        </h2>
                        
                        {/* Error Display */}
                        {error && (
                            <div className="p-3 text-sm text-center text-red-500 rounded-xl bg-red-50 animate-shake">
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
                            <div className="group">
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
                                    className="block w-full px-4 py-3 text-sm text-gray-700 transition-all duration-200 border border-gray-200 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent group-hover:translate-x-1 placeholder:text-gray-400 sm:text-base"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div className="group">
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
                                    className="block w-full px-4 py-3 text-sm text-gray-700 transition-all duration-200 border border-gray-200 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent group-hover:translate-x-1 placeholder:text-gray-400 sm:text-base"
                                    placeholder="Enter your password"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full px-6 py-3 mt-6 text-base sm:text-lg font-medium text-white 
                                         transition-all duration-200 bg-violet-600 rounded-xl
                                         hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-500/30 
                                         focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2
                                         transform hover:translate-y-[-2px]"
                            >
                                Login
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="pt-2 text-center">
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
        </div>
    );
};

export default Login;