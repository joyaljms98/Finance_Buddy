'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, ArrowRight, TrendingUp } from 'lucide-react';
import { useUsers } from '@/context/UsersContext';

export default function Signup() {
    const router = useRouter();
    const { addUser } = useUsers();
    const [isAllowed, setIsAllowed] = useState(true);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        // Enforce a completely clean session when signing up
        
        const keysToRemove = [
            'finance_buddy_token',
            'finance_buddy_notes',
            'finance_buddy_folders',
            'finance_buddy_archived_reminders',
            'finance_buddy_goals',
            'financeBuddy_budgets',
            'finance_buddy_profile_',
            'active_tax_profile_id',
            'fb_chat_mode',
            'fb_chat_scope'
        ];
        
        Object.keys(localStorage).forEach(key => {
            if (keysToRemove.some(prefix => key.startsWith(prefix))) {
                localStorage.removeItem(key);
            }
        });

        const storedSettings = localStorage.getItem('systemSettings');
        if (storedSettings) {
            const parsed = JSON.parse(storedSettings);
            if (parsed.allowRegistration === false) {
                setIsAllowed(false);
            }
        }
    }, [router]);

    if (!isAllowed) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
                <div className="bg-white/80 backdrop-blur-lg w-full max-w-md rounded-2xl shadow-xl border border-white/50 p-8 text-center relative z-10">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Registrations Disabled</h2>
                    <p className="text-gray-500 mb-6">
                        The administrator has temporarily disabled new account creations. Please check back later.
                    </p>
                    <Link href="/" className="inline-flex items-center justify-center w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-all">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await addUser({
            name: formData.fullName,
            email: formData.email,
            password: formData.password,
            role: "User"
        });

        if (result.success) {
            router.push('/login');
        } else {
            setError(result.error || 'Failed to register account');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-10 right-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            </div>

            <div className="bg-white/80 backdrop-blur-lg w-full max-w-md rounded-2xl shadow-xl border border-white/50 p-8 relative z-10">

                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-600 mb-4 hover:scale-105 transition-transform">
                        <TrendingUp size={24} />
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-900">Create an Account</h2>
                    <p className="text-gray-500 mt-2">Start your journey to financial freedom.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                            {error}
                        </div>
                    )}

                    {/* Call Name */}
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            name="fullName"
                            required
                            placeholder="Call Name (What should we call you?)"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white/50"
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Email */}
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="Email Address"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white/50"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="password"
                            name="password"
                            required
                            placeholder="Password"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white/50"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Creating...' : (
                            <>Sign Up <ArrowRight size={20} /></>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
                        Log in
                    </Link>
                </div>
            </div>
        </div>
    );
}
