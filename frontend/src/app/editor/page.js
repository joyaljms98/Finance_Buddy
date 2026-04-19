'use client';

import React, { useContext } from 'react';
import { Activity, Server, AlertTriangle, ArrowUpRight, PanelLeftClose, PanelLeftOpen, Home, Users, BookOpen } from 'lucide-react';
import { EditorSidebarContext } from '@/components/EditorSidebarWrapper';
import { useUsers } from '@/context/UsersContext';
import Link from 'next/link';

export default function EditorDashboard() {
    const { isSidebarOpen, setIsSidebarOpen } = useContext(EditorSidebarContext);
    const { users } = useUsers();

    const activeUsersCount = users.filter(u => u.status === 'Active').length;

    // Mock Articles Data
    const recentArticles = [
        { id: 1, title: 'Understanding Mutual Funds', author: 'Finance Buddy Team', date: '2025-01-10', status: 'Published' },
        { id: 2, title: 'Tax Saving Strategies 2026', author: 'Alice Johnson', date: '2025-02-05', status: 'Published' },
        { id: 3, title: 'Budgeting 101 for Students', author: 'Bob Smith', date: '2025-02-15', status: 'Draft' },
    ];

    return (
        <main className="flex-1 transition-all w-full h-[calc(100vh-64px)] md:h-screen flex text-gray-800 font-sans relative animate-in fade-in zoom-in-95 duration-500">
            <div className="flex-1 flex flex-col bg-gray-50/50 relative rounded-2xl shadow-sm my-4 mx-4 border border-gray-100 overflow-hidden">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors hidden md:block"
                            title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                        >
                            {isSidebarOpen ? <PanelLeftClose size={24} /> : <PanelLeftOpen size={24} />}
                        </button>

                        <h1 className="text-xl font-bold text-gray-900">Editor Dashboard</h1>
                        <p className="text-sm text-gray-500">Editor overview and assigned metrics.</p>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Total Users */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{users.length}</h3>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                                    <Users size={24} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm text-green-600 bg-green-50 w-fit px-2 py-1 rounded-lg">
                                <ArrowUpRight size={16} className="mr-1" />
                                <span>Platform Growth</span>
                            </div>
                        </div>

                        {/* Active Users */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Active Accounts</p>
                                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{activeUsersCount}</h3>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-xl text-purple-600">
                                    <Activity size={24} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm text-gray-500">
                                <span>Based on registered status</span>
                            </div>
                        </div>

                    </div>

                    {/* Recent Activity / Quick Actions Placeholder */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Recent Articles (Mock) */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">Recent Articles</h3>
                            <div className="space-y-4">
                                {recentArticles.map((article, i) => (
                                    <div key={article.id || i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                                <BookOpen size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900 line-clamp-1">{article.title}</h4>
                                                <p className="text-xs text-gray-500 line-clamp-1">by {article.author} • {article.date}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 mx-2 ${article.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {article.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <Link href="/editor/articles" className="block text-center w-full mt-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors">
                                View All Articles
                            </Link>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <Link href="/editor/articles#create" className="p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors text-left flex flex-col justify-center">
                                    <h4 className="font-bold">Create New Article</h4>
                                    <p className="text-xs mt-1">Draft and publish new content</p>
                                </Link>
                                <Link href="/editor/settings#feedback-new" className="p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition-colors text-left flex flex-col justify-center">
                                    <h4 className="font-bold">Drop a Message to Admin</h4>
                                    <p className="text-xs mt-1">Request permissions or report bugs</p>
                                </Link>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </main>
    );
};
