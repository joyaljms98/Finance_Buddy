'use client';

import React, { useState, useContext } from 'react';
import { Download, BarChart2, Users, FileText, TrendingUp, Calendar, Filter, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { AdminSidebarContext } from '@/components/AdminSidebarWrapper';
import { useUsers } from '@/context/UsersContext';

export default function AdminReportsPage() {
    const { isSidebarOpen, setIsSidebarOpen } = useContext(AdminSidebarContext);
    const { users } = useUsers();

    const [dateRange, setDateRange] = useState('All');

    const filterByDateRange = (itemDateStr) => {
        if (!itemDateStr) return false;
        const d = new Date(itemDateStr);
        const now = new Date();

        switch (dateRange) {
            case 'This Week':
                return d >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            case 'This Month':
                return d >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            case 'This Financial Year':
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();
                const startYear = currentMonth >= 3 ? currentYear : currentYear - 1;
                return d >= new Date(startYear, 3, 1);
            case 'All':
            default:
                return true;
        }
    };

    // Derived Metrics 
    const periodUsers = users.filter(u => filterByDateRange(u.created_at || u.createdAt));
    const totalUsers = users.length;
    const newUsersRecent = periodUsers.length;

    // Approximate scaling factor based on timeframe for mock metrics
    let factor = 1;
    if (dateRange === 'This Week') factor = 0.05;
    if (dateRange === 'This Month') factor = 0.2;
    if (dateRange === 'This Financial Year') factor = 0.8;

    const mockArticlesMade = Math.floor(24 * factor) || 1;
    const mockTotalReads = Math.floor(12450 * factor) || 45;

    const topArticles = [
        { id: 1, title: 'The Ultimate Guide to Tax Optimization 2025', category: 'Tax Planning', reads: 3240, trend: '+14%' },
        { id: 2, title: 'Understanding Compound Interest for Gen Z', category: 'Investing', reads: 2890, trend: '+8%' },
        { id: 3, title: 'How to Build an Emergency Fund in 6 Months', category: 'Personal Finance', reads: 2100, trend: '+22%' },
        { id: 4, title: 'Top 5 Index Funds for Beginners', category: 'Investing', reads: 1850, trend: '-3%' }
    ];

    const generateCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";

        // Header
        csvContent += "Metric,Value\r\n";

        // General Stats
        csvContent += `Total Users,${totalUsers}\r\n`;
        csvContent += `New Users (30 Days),${newUsersRecent}\r\n`;
        csvContent += `Articles Published,${mockArticlesMade}\r\n`;
        csvContent += `Total Article Reads,${mockTotalReads}\r\n`;

        csvContent += "\r\nArticle Details\r\n";
        csvContent += "Title,Category,Reads,Trend\r\n";

        // Top Articles
        topArticles.forEach(row => {
            const safeTitle = row.title.replace(/,/g, ''); // Basic escaping
            csvContent += `${safeTitle},${row.category},${Math.floor(row.reads * factor)},${row.trend}\r\n`;
        });

        csvContent += "\r\nNew User Details\r\n";
        csvContent += "Name,Email,Role,Status,Joined\r\n";
        periodUsers.forEach(u => {
            const joined = new Date(u.created_at || u.createdAt).toLocaleDateString();
            csvContent += `${u.name},${u.email},${u.role},${u.status},${joined}\r\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `finance_buddy_report_${dateRange.replace(' ', '_').toLowerCase()}.csv`);
        document.body.appendChild(link);

        link.click();
        document.body.removeChild(link);
    };

    return (
        <main className="flex-1 transition-all w-full flex text-gray-800 font-sans relative animate-in fade-in zoom-in-95 duration-500 h-[calc(100vh-2rem)]">
            <div className="flex-1 flex flex-col bg-gray-50/50 relative rounded-2xl shadow-sm m-4 border border-gray-100 overflow-hidden">
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between sticky top-0 z-10 shrink-0 gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors hidden md:block"
                            title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                        >
                            {isSidebarOpen ? <PanelLeftClose size={24} /> : <PanelLeftOpen size={24} />}
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">System Reports</h1>
                            <p className="text-sm text-gray-500">Analytics, user growth, and content performance.</p>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative">
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="appearance-none pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-auto"
                            >
                                <option>All</option>
                                <option>This Week</option>
                                <option>This Month</option>
                                <option>This Financial Year</option>
                            </select>
                            <Calendar size={16} className="absolute left-3 top-2.5 text-gray-400" />
                        </div>

                        <button
                            onClick={generateCSV}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors whitespace-nowrap"
                        >
                            <Download size={16} /> Export CSV
                        </button>
                    </div>
                </header>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">

                    {/* Top Level Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Users</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalUsers}</h3>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                <Users size={20} />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">New Users ({dateRange})</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">+{newUsersRecent}</h3>
                            </div>
                            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                                <TrendingUp size={20} />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Articles Published</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">{mockArticlesMade}</h3>
                            </div>
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                <FileText size={20} />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Reads</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">{mockTotalReads.toLocaleString()}</h3>
                            </div>
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                                <BarChart2 size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Top Performing Articles */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Most Read Articles</h3>
                            <button className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                                <Filter size={14} /> Filter
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Article Title</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Reads</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Trend</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {topArticles.map((article) => (
                                        <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-900">{article.title}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium">
                                                    {article.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">{Math.floor(article.reads * factor).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`text-sm font-bold ${article.trend.startsWith('+') ? 'text-green-600' : 'text-orange-600'}`}>
                                                    {article.trend}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>


                    {/* New User's Details */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">New User Details ({dateRange})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {periodUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-400">No new users in this timeframe.</td>
                                        </tr>
                                    ) : (
                                        periodUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900">{user.name}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-700">{user.role}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{user.status}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{new Date(user.created_at || user.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
