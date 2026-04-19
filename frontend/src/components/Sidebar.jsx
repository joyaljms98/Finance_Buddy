'use client';

import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, MessageSquare, PieChart, Target, BookOpen, Settings,
    LogOut, TrendingUp, StickyNote, ChevronLeft, User, Lock, Wallet, Calculator, Bell
} from 'lucide-react';

// Receive isOpen and toggleSidebar props
export default function Sidebar({ isOpen, toggleSidebar }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isOnboarded, setIsOnboarded] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    useEffect(() => {
        const checkProfile = async () => {
            try {
                const token = localStorage.getItem('finance_buddy_token');
                if (!token) return;
                const res = await api.get('/tax_profile');
                setIsOnboarded(res.data.length > 0);
            } catch (err) {
                console.error("Failed to check profile status", err);
            }
        };
        checkProfile();
        window.addEventListener('profileUpdated', checkProfile);
        return () => window.removeEventListener('profileUpdated', checkProfile);
    }, []);

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/dashboard' },
        { icon: <BookOpen size={20} />, label: 'Knowledge', path: '/dashboard/learn' },
        { icon: <Wallet size={20} />, label: 'CashBook', path: '/dashboard/cashbook' },
        { icon: <Target size={20} />, label: 'Goals', path: '/dashboard/goals' },
        { icon: <Calculator size={20} />, label: 'Budget Maker', path: '/dashboard/budget' },
        { icon: <MessageSquare size={20} />, label: 'AI Advisor', path: '/dashboard/chat' },
        { icon: <StickyNote size={20} />, label: 'Notes Manager', path: '/dashboard/notes' },
        { icon: <Bell size={20} />, label: 'Reminders', path: '/dashboard/reminders' },
    ];

    const handleLogout = () => { 
        localStorage.removeItem('finance_buddy_token');
        router.push('/login');
    };
    return (
        <>
        <aside
            className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-100 flex flex-col shadow-sm z-40 transition-all duration-500 ease-in-out whitespace-nowrap overflow-hidden ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:opacity-100 md:w-0'
                }`}
        >
            {/* Toggle Button inside Sidebar (To close it) */}
            <button
                onClick={toggleSidebar}
                className="absolute top-6 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
                <ChevronLeft size={20} />
            </button>

            {/* Logo Area */}
            <div className="p-6 flex items-center gap-3 border-b border-gray-50 min-w-max">
                <div className="bg-blue-600 p-2 rounded-lg text-white">
                    <TrendingUp size={24} />
                </div>
                {/* Hide text instantly if width is 0 to prevent overflow glitch */}
                <span className={`text-xl font-bold text-gray-900 tracking-tight transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                    Finance Buddy
                </span>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar pb-24">
                <div className={`text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                    Main Menu
                </div>

                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    const isLocked = !isOnboarded && item.path !== '/dashboard';

                    return (
                        <Link
                            key={item.path}
                            href={isLocked ? '#' : item.path}
                            onClick={(e) => isLocked && e.preventDefault()}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group min-w-max ${isActive
                                ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
                                : isLocked ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={isActive ? 'text-blue-600' : isLocked ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-600'}>
                                    {item.icon}
                                </span>
                                <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                                    {item.label}
                                </span>
                            </div>
                            {isLocked && isOpen && <Lock size={14} className="text-gray-300" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-gray-50 min-w-max bg-white relative z-10 shrink-0 mt-auto">
                <Link
                    href="/dashboard/about"
                    className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors mb-1"
                >
                    <User size={20} />
                    <span className={isOpen ? 'opacity-100' : 'opacity-0'}>About You</span>
                </Link>
                <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors mb-1"
                >
                    <Settings size={20} />
                    <span className={isOpen ? 'opacity-100' : 'opacity-0'}>Settings</span>
                </Link>
                <button
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                    <LogOut size={20} />
                    <span className={isOpen ? 'opacity-100' : 'opacity-0'}>Log out</span>
                </button>
            </div>
        </aside>

        {/* Global Logout Modal */}
        {showLogoutModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Logout</h3>
                    <p className="text-gray-500 text-center mb-6">Are you sure you want to log out?<br /><span className="text-blue-600 font-medium mt-1 inline-block">Hope to see you again!</span></p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowLogoutModal(false)}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-sm shadow-red-200"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}
