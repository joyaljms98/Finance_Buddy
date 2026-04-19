'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    X,
    BookOpen,
    Bot,
    Home,
    CalendarClock,
    StickyNote
} from 'lucide-react';
import { usePermissions } from '@/context/PermissionsContext';

const EditorSidebar = ({ isOpen, toggleSidebar }) => {
    const router = useRouter();
    const pathname = usePathname();
    const { checkPermission } = usePermissions();

    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showHomeModal, setShowHomeModal] = useState(false);

    const handleLogout = () => {
        router.push('/login');
    };

    // The Editor Role always has these base navigational paths available to view, 
    // even if action inside them is restricted.
    // However, if the Admin explicitly removes "View Users", we might want to hide the User Management tab entirely.
    const navItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/editor', show: true },
        { name: 'Manage Articles', icon: <BookOpen size={20} />, path: '/editor/articles', show: checkPermission('Editor', 'content', 'view') || checkPermission('Editor', 'content', 'edit') },
        { name: 'Manage Reminders', icon: <CalendarClock size={20} />, path: '/editor/reminders', show: true },
        { name: 'Chatbot & RAG', icon: <Bot size={20} />, path: '/editor/chatbot', show: true }, // General system access
    ].filter(item => item.show);

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={toggleSidebar}
            />

            {/* Sidebar Container */}
            <aside
                className={`fixed top-0 left-0 z-50 h-screen w-64 bg-slate-800 text-white shadow-xl transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <div className="flex-1 flex justify-between items-center ml-2">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-emerald-400">Editor Portal</h2>
                            <p className="text-xs text-slate-400">Finance Buddy</p>
                        </div>
                        <button onClick={() => setShowHomeModal(true)} className="text-slate-400 hover:text-white transition-colors p-2" title="Go to User Dashboard">
                            <Home size={20} />
                        </button>
                    </div>
                    <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="mt-6 px-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar pb-6">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20'
                                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                                    }`}
                            >
                                {item.icon}
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer (Settings & Logout) */}
                <div className="p-4 border-t border-slate-700 bg-slate-800 relative z-10 shrink-0 w-full mt-auto">
                    <Link
                        href="/editor/settings"
                        className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all mb-1 group"
                    >
                        <Settings size={20} className="group-hover:rotate-45 transition-transform" />
                        <span className="font-medium">Settings & Feedback</span>
                    </Link>
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-xl transition-all"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Logout Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200 text-gray-800">
                        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Logout</h3>
                        <p className="text-gray-500 text-center mb-6">Are you sure you want to log out?</p>
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

            {/* Home Navigation Modal */}
            {showHomeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200 text-gray-800">
                        <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                            <Home size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Exit Editor Portal</h3>
                        <p className="text-gray-500 text-center mb-6">Are you sure you want to return to the user dashboard?</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowHomeModal(false)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => router.push('/')}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EditorSidebar;
