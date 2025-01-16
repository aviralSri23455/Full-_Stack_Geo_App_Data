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
    <div className="fixed inset-0 w-full h-full overflow-auto bg-gradient-to-br from-purple-800 via-indigo-700 to-pink-600">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)] animate-pulse" />
        {/* Optimized floating particles for different screen sizes */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full md:h-2 md:w-2 lg:h-3 lg:w-3 bg-white/20 animate-float"
              style={{
                left: `${(i * 7) % 100}%`,
                top: `${(i * 5) % 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${8 + i % 4}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content with responsive layout */}
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg transform transition-all duration-300 hover:scale-[1.02]">
          <div className="p-4 space-y-4 shadow-xl bg-white/95 backdrop-blur-xl sm:p-6 md:p-8 rounded-xl sm:rounded-2xl sm:shadow-2xl sm:space-y-6">
            {/* Responsive Header */}
            <div className="space-y-1 text-center sm:space-y-2">
              <h2 className="text-2xl font-bold text-transparent sm:text-3xl md:text-4xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">
                Create your account
              </h2>
              <p className="text-sm text-gray-600 sm:text-base">
                Join us to start your journey
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 text-xs text-red-600 border border-red-100 rounded-lg sm:p-4 sm:rounded-xl bg-red-50 sm:text-sm animate-shake">
                {error}
              </div>
            )}

            {/* Responsive Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {[
                { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your full name' },
                { id: 'email', label: 'Email address', type: 'email', placeholder: 'Enter your email' },
                { id: 'password', label: 'Password', type: 'password', placeholder: 'Create a password' },
                { id: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: 'Confirm your password' }
              ].map((field) => (
                <div key={field.id} className="group">
                  <label 
                    htmlFor={field.id} 
                    className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm sm:mb-2"
                  >
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    name={field.id}
                    type={field.type}
                    required
                    className="block w-full px-3 py-2 text-sm transition-all duration-300 ease-in-out border border-gray-200 rounded-lg sm:px-4 sm:py-3 sm:rounded-xl bg-gray-50 sm:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white group-hover:translate-x-1 placeholder:text-gray-400 placeholder:text-sm sm:placeholder:text-base"
                    placeholder={field.placeholder}
                    value={formData[field.id]}
                    onChange={handleChange}
                  />
                </div>
              ))}

              {/* Responsive Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl 
                           text-white font-medium text-sm sm:text-base md:text-lg
                           transition-all duration-300 ease-in-out transform
                           ${loading 
                             ? 'bg-purple-400 cursor-not-allowed' 
                             : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-purple-500/30'
                           }
                           focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2 animate-spin sm:h-5 sm:w-5 sm:mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating account...
                  </span>
                ) : 'Register'}
              </button>
            </form>

            {/* Responsive Footer */}
            <div className="space-y-3 text-center sm:space-y-4">
              <p className="text-xs text-gray-600 sm:text-sm">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="font-medium text-purple-600 transition-colors duration-200 hover:text-purple-500"
                >
                  Sign in
                </Link>
              </p>
              <div className="pt-3 border-t border-gray-200 sm:pt-4">
                <p className="text-xs text-gray-500">
                  © 2025 Map Upload App. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;