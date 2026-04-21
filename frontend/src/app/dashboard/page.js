'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, MessageSquare, Clock, CheckCircle, LogOut, RefreshCw, Calendar, User, LayoutDashboard as LayoutDashboardIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import FYPicker from '@/components/FYPicker';
import { useFinancialYear } from '@/context/FinancialYearContext';
import { useCashBook } from '@/context/CashBookContext';
import { useUsers } from '@/context/UsersContext';
import api from '../../lib/api';

export default function Dashboard() {
    const router = useRouter();
    const [reminders, setReminders] = useState([]);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isRemindersOpen, setIsRemindersOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isOnboarded, setIsOnboarded] = useState(true);
    const [taxProfiles, setTaxProfiles] = useState([]);
    const [activeProfileId, setActiveProfileId] = useState(null);
    const [aiInsight, setAiInsight] = useState("AI insights would show up based on your personal details. Please click the Reload button to generate insights.");
    const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
    
    // Import useReminders dynamically
    const { myReminders } = require('@/context/RemindersContext').useReminders();

    // Initial Onboarding Check
    useEffect(() => {
        const checkProfile = async () => {
            try {
                const token = localStorage.getItem('finance_buddy_token');
                if (!token) return;
                const res = await api.get('/tax_profile');
                const profiles = res.data;
                setIsOnboarded(profiles.length > 0);
                setTaxProfiles(profiles);

                const savedProfileId = localStorage.getItem('active_tax_profile_id');
                if (savedProfileId && profiles.some(p => p.id === savedProfileId)) {
                    setActiveProfileId(savedProfileId);
                } else if (profiles.length > 0) {
                    setActiveProfileId(profiles[0].id);
                    localStorage.setItem('active_tax_profile_id', profiles[0].id);
                }
            } catch (err) {
                console.error("Failed to fetch tax profiles check", err);
            }
        };
        checkProfile();

        window.addEventListener('profileUpdated', checkProfile);
        return () => window.removeEventListener('profileUpdated', checkProfile);
    }, []);

    const handleSwitchProfile = (id) => {
        setActiveProfileId(id);
        localStorage.setItem('active_tax_profile_id', id);
        setIsProfileOpen(false);
        window.dispatchEvent(new Event('activeProfileChanged'));
    };

    // FY State
    const { selectedFY, setSelectedFY, fyOptions, currentFY } = useFinancialYear();
    const { books, heads, transactions } = useCashBook();
    const { activeUser } = useUsers();
    const [goals, setGoals] = useState([]);

    useEffect(() => {
        if (typeof window === 'undefined' || !activeUser?.user_id) return;

        const loadGoals = async () => {
            // 1. Try fetching from MongoDB (same source as Goals page)
            try {
                const res = await api.get('/sync/data');
                if (res.data && res.data.goals && res.data.goals.length > 0) {
                    setGoals(res.data.goals);
                    return;
                }
            } catch (e) { console.warn('Could not fetch goals from backend'); }

            // 2. Fallback to user-specific localStorage key (matching Goals page)
            const storageKey = `finance_buddy_goals_${activeUser.user_id}`;
            const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
            setGoals(stored);
        };
        loadGoals();
    }, [activeUser?.user_id]);

    // FY Date Calculation
    const startYear = parseInt(selectedFY.split('-')[0]);
    const fyStartDate = new Date(startYear, 3, 1);
    const fyEndDate = new Date(startYear + 1, 2, 31, 23, 59, 59);
    const isFutureFY = fyStartDate > new Date();

    // Data filtering
    const fyTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        return d >= fyStartDate && d <= fyEndDate;
    });

    let totalExpenses = 0;
    let totalIncome = 0;

    let fyOpeningBalance = books.reduce((sum, b) => sum + (b.initialBalance || 0), 0);
    transactions.filter(t => new Date(t.date) < fyStartDate).forEach(t => {
        if (t.type === 'income') fyOpeningBalance += t.amount;
        if (t.type === 'expense') fyOpeningBalance -= t.amount;
    });

    let fyClosingBalance = books.reduce((sum, b) => sum + (b.initialBalance || 0), 0);
    transactions.filter(t => new Date(t.date) <= fyEndDate).forEach(t => {
        if (t.type === 'income') fyClosingBalance += t.amount;
        if (t.type === 'expense') fyClosingBalance -= t.amount;
    });

    const monthsLayout = [
        { label: 'Apr' }, { label: 'May' }, { label: 'Jun' },
        { label: 'Jul' }, { label: 'Aug' }, { label: 'Sep' },
        { label: 'Oct' }, { label: 'Nov' }, { label: 'Dec' },
        { label: 'Jan' }, { label: 'Feb' }, { label: 'Mar' }
    ];

    const monthlyMap = {};
    monthsLayout.forEach(m => {
        monthlyMap[m.label] = { name: m.label, spent: 0, income: 0 };
    });

    const categoryMap = {};
    fyTransactions.forEach(t => {
        const d = new Date(t.date);
        const mLabel = d.toLocaleString('en-US', { month: 'short' });

        if (t.type === 'expense') {
            totalExpenses += t.amount;
            if (monthlyMap[mLabel]) monthlyMap[mLabel].spent += t.amount;

            const headName = heads.find(h => h.id === t.headId)?.name || 'Other';
            categoryMap[headName] = (categoryMap[headName] || 0) + t.amount;
        } else if (t.type === 'income') {
            totalIncome += t.amount;
            if (monthlyMap[mLabel]) monthlyMap[mLabel].income += t.amount;
        }
    });

    const dynamicMonthlyData = monthsLayout.map(m => monthlyMap[m.label]);
    const dynamicCategoryData = Object.keys(categoryMap).map(k => ({ name: k, value: categoryMap[k] }));

    const activeGoals = goals.filter(g => g.status === 'active' && g.id !== 'demo_goal').sort((a, b) => a.priority - b.priority);
    const totalGoalTarget = activeGoals.reduce((sum, g) => sum + Number(g.target || 0), 0);
    const totalGoalSaved = activeGoals.reduce((sum, g) => sum + Number(g.saved || 0), 0);
    const goalProgressPercent = totalGoalTarget > 0 ? Math.min((totalGoalSaved / totalGoalTarget) * 100, 100).toFixed(1) : 0;

    const currentStats = {
        openingBalance: fyOpeningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        closingBalance: fyClosingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        income: totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        expenses: totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        savings: totalGoalSaved.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8B5CF6', '#EC4899'];

    // --- Load Reminders Logic ---
    const loadReminders = () => {
        if (typeof window === 'undefined') return;

        const savedNotes = JSON.parse(localStorage.getItem('finance_buddy_notes') || '[]');
        const archivedSystemReminders = JSON.parse(localStorage.getItem('finance_buddy_archived_reminders') || '[]');

        const activeLocalReminders = savedNotes
            .filter(n => n.reminder && n.reminder !== '')
            .map(n => ({
                ...n,
                dateObj: new Date(n.reminder)
            }));

        const activeSystemReminders = (myReminders || [])
            .filter(r => !archivedSystemReminders.includes(r.id))
            .map(r => ({
                id: `system_${r.id}`,
                title: `[System] ${r.title}`,
                content: r.description,
                reminder: r.date,
                color: 'bg-indigo-50',
                dateObj: new Date(r.date)
            }));

        const combinedReminders = [...activeLocalReminders, ...activeSystemReminders].sort((a, b) => a.dateObj - b.dateObj);
        setReminders(combinedReminders);
    };

    useEffect(() => {
        loadReminders();
        const interval = setInterval(loadReminders, 60000);
        return () => clearInterval(interval);
    }, [myReminders]);

    const handleDismiss = (e, noteId) => {
        e.stopPropagation();
        const savedNotes = JSON.parse(localStorage.getItem('finance_buddy_notes') || '[]');
        const updatedNotes = savedNotes.map(n =>
            n.id === noteId ? { ...n, reminder: '' } : n
        );
        localStorage.setItem('finance_buddy_notes', JSON.stringify(updatedNotes));
        loadReminders();
    };

    const handleSnooze = (e, noteId) => {
        e.stopPropagation();
        const snoozeTime = prompt("Snooze for how many hours?", "1");
        if (!snoozeTime) return;

        const savedNotes = JSON.parse(localStorage.getItem('finance_buddy_notes') || '[]');
        const note = savedNotes.find(n => n.id === noteId);

        if (note) {
            const currentReminder = new Date(note.reminder);
            currentReminder.setHours(currentReminder.getHours() + parseInt(snoozeTime));

            const updatedNotes = savedNotes.map(n =>
                n.id === noteId ? { ...n, reminder: currentReminder.toISOString().slice(0, 16) } : n
            );
            localStorage.setItem('finance_buddy_notes', JSON.stringify(updatedNotes));
            loadReminders();
        }
    };

    const handleNavigateToNote = (noteId) => {
        if (noteId.toString().startsWith('system_')) {
            const systemId = noteId.toString().replace('system_', '');
            router.push(`/dashboard/reminders?id=${systemId}`);
        } else {
            router.push(`/dashboard/notes?openNoteId=${noteId}`);
        }
    };

    const handleReloadInsight = async () => {
        setIsGeneratingInsight(true);
        setAiInsight("");
        try {
            const token = localStorage.getItem('finance_buddy_token');
            const savedScopeStr = localStorage.getItem('fb_chat_scope');
            let scope = {
                include_profile: true,
                include_rag_docs: true,
                include_cashbook: false,
                include_goals: false,
                include_budget: false
            };
            if (savedScopeStr) {
                try {
                    scope = { ...scope, ...JSON.parse(savedScopeStr) };
                } catch(e) {}
            }

            const res = await fetch('http://localhost:8000/api/chatbot/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    query: "Generate a short 1 or 2-sentence financial insight based on my personal profile details and cashbook. Do not use markdown or formatting, just plain text. Make it feel personal and useful",
                    chat_mode: "context",
                    ...scope
                })
            });
            const reader = res.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let insightText = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                insightText += decoder.decode(value, { stream: true });
                setAiInsight(insightText);
            }
        } catch (err) {
            setAiInsight("Unable to generate insight at this moment.");
        } finally {
            setIsGeneratingInsight(false);
        }
    };

    const handleResetInsight = () => {
        setAiInsight("AI insights would show up based on your personal details. Please click the Reload button to generate insights.");
    };

    const formatDate = (dateString) => {
        if (!dateString) return null;
        const d = new Date(dateString);
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (d < now) return <span className="text-red-500 font-bold">Overdue ({d.toLocaleDateString()} {timeStr})</span>;
        if (isToday) return <span className="text-blue-600 font-bold">Today, {timeStr}</span>;
        return <span className="text-gray-500">{d.toLocaleDateString()} {timeStr}</span>;
    };

    return (
        <main className="flex-1 w-full h-[calc(100vh-64px)] md:h-screen flex flex-col text-gray-800 font-sans p-4 animate-in fade-in zoom-in-95 duration-500">
            <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-xl shadow-inner">
                        <LayoutDashboardIcon />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                        <p className="text-sm text-gray-500">Welcome back, User</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="min-w-max">
                        <FYPicker selectedFY={selectedFY} onChange={setSelectedFY} options={fyOptions} currentFY={currentFY} />
                    </div>
                    <div className="relative">
                        <button onClick={() => setIsRemindersOpen(!isRemindersOpen)} className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                            <Bell size={20} />
                            {reminders.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>}
                        </button>
                        {isRemindersOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsRemindersOpen(false)}></div>
                                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-20 animate-in fade-in slide-in-from-top-2">
                                    <h3 className="font-bold text-gray-900 mb-3 border-b pb-2">Upcoming Reminders</h3>
                                    {reminders.length === 0 ? (
                                        <p className="text-sm text-gray-500">No active reminders.</p>
                                    ) : (
                                        <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                                            {reminders.map(note => (
                                                <div key={note.id} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer" onClick={() => { setIsRemindersOpen(false); handleNavigateToNote(note.id); }}>
                                                    <div className="font-bold text-sm text-gray-800 line-clamp-1">{note.title || 'Untitled'}</div>
                                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                        <Clock size={12} /> {formatDate(note.reminder)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                    <div className="relative">
                        <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full border-2 border-white shadow-md hover:ring-2 hover:ring-blue-100 transition-all flex items-center justify-center text-white font-bold">
                            {taxProfiles.find(p => p.id === activeProfileId)?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </button>
                        {isProfileOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-20 animate-in fade-in slide-in-from-top-2">
                                    <div className="p-3 border-b border-gray-50 mb-1">
                                        <p className="font-bold text-gray-900 line-clamp-1">{taxProfiles.find(p => p.id === activeProfileId)?.name || 'User Name'}</p>
                                        <p className="text-xs text-gray-500 capitalize">{taxProfiles.find(p => p.id === activeProfileId)?.profileFor || 'Main Profile'}</p>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto mb-2 custom-scrollbar pr-1 space-y-1">
                                        {taxProfiles.map((p) => (
                                            <button key={p.id} onClick={() => handleSwitchProfile(p.id)} className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-xl transition-colors text-left ${activeProfileId === p.id ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>
                                                <span className="truncate">{p.name}</span>
                                                {activeProfileId === p.id && <CheckCircle size={14} className="text-blue-600 shrink-0" />}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="border-t border-gray-50 pt-2 space-y-1">
                                        <button onClick={() => { setIsProfileOpen(false); router.push('/dashboard/about'); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-xl transition-colors text-left font-medium">
                                            <RefreshCw size={16} /> Manage Profiles
                                        </button>
                                        <button onClick={() => { setIsProfileOpen(false); setShowLogoutModal(true); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left font-medium">
                                            <LogOut size={16} /> Log Out
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {!isOnboarded ? (
                    <div className="bg-white border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-3xl p-10 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500 shadow-sm min-h-[50vh]">
                        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <User size={40} />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome to Finance Buddy!</h2>
                        <p className="text-gray-500 max-w-md mb-8">To provide you with personalized tax advice, accurate RAG limits, and an intelligent budget, we need to know a little bit more about you.</p>
                        <button onClick={() => router.push('/dashboard/about')} className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                            🚀 Complete Your Profile Now
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 transition-all duration-300 flex flex-col justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium mb-1">Closing Balance (FY)</p>
                                    <h3 className="text-3xl font-bold">₹ {currentStats.closingBalance}</h3>
                                </div>
                                <div className="mt-4 flex items-center justify-between text-sm bg-white/10 px-3 py-2 rounded-lg border border-white/20">
                                    <span className="opacity-80">Opening Balance:</span>
                                    <span className="font-bold">₹{currentStats.openingBalance}</span>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all duration-300">
                                <p className="text-gray-500 text-sm font-medium mb-1">FY Total Income</p>
                                <h3 className="text-3xl font-bold text-gray-900">₹ {currentStats.income}</h3>
                                <div className="mt-4 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div className="bg-green-500 h-full w-full rounded-full transition-all duration-500"></div>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Money in.</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all duration-300">
                                <p className="text-gray-500 text-sm font-medium mb-1">FY Total Expenses</p>
                                <h3 className="text-3xl font-bold text-gray-900">₹ {currentStats.expenses}</h3>
                                <div className="mt-4 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: totalIncome > 0 ? `${Math.min((totalExpenses / totalIncome) * 100, 100)}%` : '0%' }}></div>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">{totalIncome > 0 ? `${((totalExpenses / totalIncome) * 100).toFixed(1)}% of FY Income spent` : 'No income recorded yet'}</p>
                            </div>
                        </div>

                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex items-start gap-4">
                            <div className="bg-white p-3 rounded-xl shadow-sm text-indigo-600">
                                {isGeneratingInsight ? <RefreshCw size={24} className="animate-spin text-indigo-400" /> : <MessageSquare size={24} />}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-bold text-indigo-900 text-lg">AI Insight</h4>
                                    <div className="flex gap-2">
                                        <button onClick={handleResetInsight} disabled={isGeneratingInsight} className="text-xs text-indigo-500 hover:text-indigo-700 bg-indigo-100 hover:bg-indigo-200 px-2 py-1 rounded transition-colors disabled:opacity-50">Reset</button>
                                        <button onClick={handleReloadInsight} disabled={isGeneratingInsight} className="text-xs text-indigo-600 hover:text-indigo-800 bg-white shadow-sm border border-indigo-100 hover:bg-indigo-50 px-2 py-1 rounded transition-colors flex items-center gap-1 disabled:opacity-50">
                                            <RefreshCw size={12} className={isGeneratingInsight ? "animate-spin" : ""} /> Reload
                                        </button>
                                    </div>
                                </div>
                                <p className="text-indigo-700">{isGeneratingInsight && aiInsight === "" ? "Analyzing your latest dashboard data..." : `"${aiInsight}"`}</p>
                                <button className="mt-3 text-sm font-semibold text-indigo-600 hover:underline">Ask AI Advisor &rarr;</button>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Clock size={20} className="text-blue-600" /> Upcoming Reminders
                            </h3>
                            {reminders.length === 0 ? (
                                <div className="bg-white border-2 border-dashed border-gray-100 rounded-2xl p-8 text-center text-gray-400">
                                    <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                                    <p>No active reminders.</p>
                                    <p className="text-xs">Set a reminder in Notes Manager to see it here.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                                        <h4 className="font-semibold text-indigo-900 text-sm">System Reminders</h4>
                                        {reminders.filter(r => r.id.toString().startsWith('system_')).length === 0 ? (
                                            <p className="text-xs text-gray-500 italic">No system reminders.</p>
                                        ) : (
                                            reminders.filter(r => r.id.toString().startsWith('system_')).map(r => (
                                                <div key={r.id} onClick={() => handleNavigateToNote(r.id)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group relative">
                                                    <h4 className="font-bold text-gray-800 line-clamp-1 text-sm">{r.title || 'Untitled'}</h4>
                                                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{r.content || 'No details.'}</p>
                                                    <div className="flex items-center gap-2 text-xs bg-gray-50 w-fit px-2 py-1 rounded-lg border border-gray-200">
                                                        <Bell size={12} className={new Date(r.reminder) < new Date() ? "text-red-500 animate-pulse" : "text-gray-400"} />
                                                        {formatDate(r.reminder)}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="space-y-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 md:col-span-1 lg:col-span-2">
                                        <h4 className="font-semibold text-emerald-900 text-sm">Notes Reminders</h4>
                                        {reminders.filter(r => !r.id.toString().startsWith('system_')).length === 0 ? (
                                            <p className="text-xs text-gray-500 italic">No notes reminders.</p>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {reminders.filter(r => !r.id.toString().startsWith('system_')).map(r => (
                                                    <div key={r.id} onClick={() => handleNavigateToNote(r.id)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group relative">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-bold text-gray-800 line-clamp-1 text-sm">{r.title || 'Untitled'}</h4>
                                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 backdrop-blur-sm rounded-lg p-1">
                                                                <button onClick={(e) => handleSnooze(e, r.id)} className="p-1 hover:text-orange-500 text-gray-500" title="Snooze 1 Hour"><Clock size={16} /></button>
                                                                <button onClick={(e) => handleDismiss(e, r.id)} className="p-1 hover:text-green-600 text-gray-500" title="Complete"><CheckCircle size={16} /></button>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{r.content || 'No details.'}</p>
                                                        <div className="flex items-center gap-2 text-xs bg-gray-50 w-fit px-2 py-1 rounded-lg border border-gray-200">
                                                            <Bell size={12} className={new Date(r.reminder) < new Date() ? "text-red-500 animate-pulse" : "text-gray-400"} />
                                                            {formatDate(r.reminder)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {isFutureFY ? (
                            <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center shadow-sm">
                                <h3 className="text-xl font-bold text-gray-500 mb-2">Analytics will be available with more data</h3>
                                <p className="text-gray-400">Transactions for the selected future financial year have not occurred yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:col-span-1">
                                    <h3 className="font-bold text-gray-800 mb-4">Monthly Income & Spending</h3>
                                    {dynamicMonthlyData.every(d => d.income === 0 && d.spent === 0) ? (
                                        <div className="flex-1 flex items-center justify-center text-gray-400 font-medium">Please add data in cashbook</div>
                                    ) : (
                                        <div className="flex-1 w-full overflow-x-auto custom-scrollbar pb-2">
                                            <div className="h-64 min-w-[300px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={dynamicMonthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                                        <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                                                        <Bar dataKey="spent" name="Spent" fill="#EF4444" radius={[4, 4, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:col-span-1">
                                    <h3 className="font-bold text-gray-800 mb-4">Expense Categories</h3>
                                    {dynamicCategoryData.length === 0 ? (
                                        <div className="flex-1 flex items-center justify-center text-gray-400 font-medium">Please add data in cashbook</div>
                                    ) : (
                                        <div className="h-64 flex items-center justify-center">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={dynamicCategoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                        {dynamicCategoryData.map((en, idx) => <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />)}
                                                    </Pie>
                                                    <Tooltip /><Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:col-span-1">
                                    <h3 className="font-bold text-gray-800 mb-4">Total Saved (Goals)</h3>
                                    {activeGoals.length === 0 ? (
                                        <div className="flex-1 flex items-center justify-center text-gray-400 font-medium">Please add Goals in the Goals section</div>
                                    ) : (
                                        <div className="h-64 flex flex-col items-center justify-center">
                                            <div className="w-full flex justify-between items-center mb-4">
                                                <div className="text-center"><p className="text-xs font-semibold text-gray-500 uppercase">Target</p><p className="text-lg font-bold text-indigo-600">₹{totalGoalTarget.toLocaleString()}</p></div>
                                                <div className="text-center"><p className="text-xs font-semibold text-gray-500 uppercase">Saved</p><p className="text-lg font-bold text-emerald-600">₹{totalGoalSaved.toLocaleString()}</p></div>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-8 overflow-hidden relative shadow-inner">
                                                <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-1000 flex items-center justify-end pr-2" style={{ width: `${goalProgressPercent}%` }}>
                                                    {goalProgressPercent >= 15 && <span className="text-white text-xs font-bold">{goalProgressPercent}%</span>}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-6 text-center">Across {activeGoals.length} active goals</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Logout</h3>
                        <p className="text-gray-500 text-center mb-6">Are you sure you want to log out?<br /><span className="text-blue-600 font-medium mt-1 inline-block">Hope to see you again!</span></p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowLogoutModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                            <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-sm shadow-red-200">Logout</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}