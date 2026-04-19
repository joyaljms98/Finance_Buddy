'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { useUsers } from '@/context/UsersContext';

export default function Login() {
    const router = useRouter();
    const { login } = useUsers();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        let loginId = formData.email.trim();

        const result = await login(loginId, formData.password);

        if (result.success) {
            // Route based on role
            if (result.user.role === 'Admin') {
                router.push('/admin');
            } else if (result.user.role === 'Editor') {
                router.push('/editor');
            } else {
                router.push('/dashboard');
            }
        } else {
            setError(result.error);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-10 right-10 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            </div>

            <div className="bg-white/80 backdrop-blur-lg w-full max-w-md rounded-2xl shadow-xl border border-white/50 p-8 relative z-10">

                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-600 mb-4 hover:scale-105 transition-transform">
                        <TrendingUp size={24} />
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                    <p className="text-gray-500 mt-2">Continue your financial journey.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                            {error}
                        </div>
                    )}

                    {/* Email / Username */}
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="email"
                            name="email"
                            required
                            autoComplete="username"
                            placeholder="Email Address"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white/50"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <div className="relative flex items-center">
                            <Lock className="absolute left-3 text-gray-400" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                required
                                autoComplete="current-password"
                                placeholder="Password"
                                className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white/50"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <div className="text-right mt-2">
                            <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Forgot Password?</a>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Authenticating...' : (
                            <>Log In <ArrowRight size={20} /></>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link href="/signup" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}
