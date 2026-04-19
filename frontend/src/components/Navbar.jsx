'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Menu, X } from 'lucide-react';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [alloRegistration, setAlloRegistration] = useState(true);

    React.useEffect(() => {
        const storedSettings = localStorage.getItem('systemSettings');
        if (storedSettings) {
            const parsed = JSON.parse(storedSettings);
            if (parsed.alloRegistration !== undefined) {
                setAlloRegistration(parsed.alloRegistration);
            }
        }
    }, []);

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">

                    {/* Logo - Clicks go to top of Home */}
                    <Link href="/#home" className="flex items-center gap-2">
                        <TrendingUp className="h-8 w-8 text-blue-600" />
                        <span className="text-xl font-bold text-gray-900 tracking-tight">Finance Buddy</span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/#home" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                            Home
                        </Link>
                        <Link href="/#features" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                            Features
                        </Link>
                        <Link href="/#articles" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                            Articles
                        </Link>
                        <Link href="/#contact" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                            Contact Us
                        </Link>
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/login" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
                            Log In
                        </Link>
                        {alloRegistration ? (
                            <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md">
                                Sign Up
                            </Link>
                        ) : (
                            <div className="relative group cursor-help">
                                <button disabled className="bg-gray-200 text-gray-500 px-4 py-2 rounded-lg shadow-sm cursor-not-allowed">
                                    Sign Up
                                </button>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    New registrations are restricted.
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-600 hover:text-blue-600 focus:outline-none"
                        >
                            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>

                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
                    <div className="px-4 pt-2 pb-6 flex flex-col space-y-4">
                        <Link
                            href="/#home"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-gray-600 hover:text-blue-600 font-medium transition-colors pt-2"
                        >
                            Home
                        </Link>
                        <Link
                            href="/#features"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                        >
                            Features
                        </Link>
                        <Link
                            href="/#articles"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                        >
                            Articles
                        </Link>
                        <Link
                            href="/#contact"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-gray-600 hover:text-blue-600 font-medium transition-colors border-b border-gray-100 pb-4"
                        >
                            Contact Us
                        </Link>

                        <div className="flex flex-col gap-3 pt-2">
                            <Link
                                href="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-center text-blue-600 font-medium border border-blue-600 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                Log In
                            </Link>
                            {alloRegistration ? (
                                <Link
                                    href="/signup"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
                                >
                                    Sign Up
                                </Link>
                            ) : (
                                <button disabled className="text-center bg-gray-100 text-gray-400 py-2 rounded-lg border border-gray-200 cursor-not-allowed" onClick={() => alert("New registrations are currently restricted.")}>
                                    Sign Up (Closed)
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
