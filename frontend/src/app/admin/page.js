'use client';

import React, { useContext, useEffect, useState } from 'react';
import { Users, Activity, Server, AlertTriangle, ArrowUpRight, PanelLeftClose, PanelLeftOpen, MessageSquare } from 'lucide-react';
import { AdminSidebarContext } from '@/components/AdminSidebarWrapper';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function AdminDashboard() {
    const { isSidebarOpen, setIsSidebarOpen } = useContext(AdminSidebarContext);
    const router = useRouter();
    const [metrics, setMetrics] = useState({
        totalUsers: 0,
        activeUsers: 0,
        recentRegistrations: [],
        feedbackRequests: 0,
        systemHealth: "100%",
        loading: true
    });

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                // Fetch Users and Feedback in parallel
                const [usersRes, feedbackRes] = await Promise.all([
                    api.get('/users'),
                    api.get('/communication/feedback')
                ]);

                const users = usersRes.data || [];
                const feedbacks = feedbackRes.data || [];

                const activeUsers = users.filter(u => u.status === 'Active').length;

                // Sort by ID or created_at to get recent registrations
                const recentRegs = [...users].sort((a, b) => {
                    // if created_at exists sort by that, else fallback to user_id
                    if (a.created_at && b.created_at) {
                        return new Date(b.created_at) - new Date(a.created_at);
                    }
                    return b.user_id?.localeCompare(a.user_id);
                }).slice(0, 3);

                setMetrics({
                    totalUsers: users.length,
                    activeUsers: activeUsers,
                    recentRegistrations: recentRegs,
                    feedbackRequests: feedbacks.length,
                    systemHealth: "100%", // Placeholder since there is no backend health endpoint natively
                    loading: false
                });

            } catch (error) {
                console.error("Failed to fetch admin metrics", error);
                setMetrics(prev => ({ ...prev, loading: false }));
            }
        };

        fetchMetrics();
    }, []);

    const handleClearCaches = () => {
        // Clear non-critical caches. (We keep Users so we don't invalidate logins, 
        // but typically you'd clear session scopes here)
        window.sessionStorage.clear();
        alert("System caches have been cleared.");
        window.location.reload();
    };

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

                        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-sm text-gray-500">System overview and health metrics.</p>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* Total Users */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                                    <h3 className="text-3xl font-bold text-gray-900 mt-1">
                                        {metrics.loading ? '...' : metrics.totalUsers}
                                    </h3>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                                    <Users size={24} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm text-green-600 bg-green-50 w-fit px-2 py-1 rounded-lg">
                                <span>Up to Date</span>
                            </div>
                        </div>

                        {/* Active Users */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Active Now</p>
                                    <h3 className="text-3xl font-bold text-gray-900 mt-1">
                                        {metrics.loading ? '...' : metrics.activeUsers}
                                    </h3>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-xl text-purple-600">
                                    <Activity size={24} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm text-gray-500">
                                <span>Real-time count</span>
                            </div>
                        </div>

                        {/* System Health */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">System Health</p>
                                    <h3 className="text-3xl font-bold text-green-600 mt-1">{metrics.systemHealth}</h3>
                                </div>
                                <div className="bg-green-50 p-3 rounded-xl text-green-600">
                                    <Server size={24} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm text-gray-500">
                                <span>All systems operational</span>
                            </div>
                        </div>

                        {/* Feedback & Requests */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Feedback & Requests</p>
                                    <h3 className="text-3xl font-bold text-gray-900 mt-1">
                                        {metrics.loading ? '...' : metrics.feedbackRequests}
                                    </h3>
                                </div>
                                <div className="bg-orange-50 p-3 rounded-xl text-orange-600">
                                    <MessageSquare size={24} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm text-orange-600 bg-orange-50 w-fit px-2 py-1 rounded-lg">
                                <span>Requires your review</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity / Quick Actions Placeholder */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Recent Registrations */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">Recent Registrations</h3>
                            <div className="space-y-4">
                                {metrics.loading ? (
                                    <p className="text-sm text-gray-500">Loading...</p>
                                ) : metrics.recentRegistrations.length === 0 ? (
                                    <p className="text-sm text-gray-500">No new registrations yet.</p>
                                ) : (
                                    metrics.recentRegistrations.map((user) => (
                                        <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
                                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{user.name}</h4>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-400">ID: {user.user_id}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                            <Link href="/admin/users" className="block text-center w-full mt-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors">
                                View All Users
                            </Link>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => router.push('/admin/reports')}
                                    className="p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors text-left"
                                >
                                    <h4 className="font-bold">Generate Report</h4>
                                    <p className="text-xs mt-1">Download monthly activity summary</p>
                                </button>
                                <button
                                    onClick={() => router.push('/admin/settings#backup')}
                                    className="p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition-colors text-left"
                                >
                                    <h4 className="font-bold">System Backup</h4>
                                    <p className="text-xs mt-1">Create a manual database snapshot</p>
                                </button>
                                <button
                                    onClick={() => router.push('/admin/settings#maintenance')}
                                    className="p-4 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl transition-colors text-left"
                                >
                                    <h4 className="font-bold">Maintenance Mode</h4>
                                    <p className="text-xs mt-1">Temporarily disable user access</p>
                                </button>
                                <button
                                    onClick={handleClearCaches}
                                    className="p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-colors text-left"
                                >
                                    <h4 className="font-bold">Clear Caches</h4>
                                    <p className="text-xs mt-1">Refresh system performance</p>
                                </button>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </main>
    );
};
