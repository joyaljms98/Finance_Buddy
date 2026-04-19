'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Search, Filter, Archive as ArchiveIcon, Clock, ArrowUpDown, BellRing, Eye, X, CheckSquare, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useReminders } from '@/context/RemindersContext';

export default function RemindersHub() {
    const { myReminders } = useReminders();
    
    // States
    const [viewMode, setViewMode] = useState('active'); // 'active' or 'archive'
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'az', 'za'
    const [selectedTags, setSelectedTags] = useState([]);
    
    // Modal
    const [selectedReminder, setSelectedReminder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Archiving local state
    const [archivedIds, setArchivedIds] = useState([]);

    const tagOptions = ['Taxation', 'Investing', 'Savings', 'Loans', 'Crypto', 'Tricks', 'Trends'];

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = JSON.parse(localStorage.getItem('finance_buddy_archived_reminders') || '[]');
            setArchivedIds(saved);
        }
    }, []);

    const toggleArchiveStatus = (id) => {
        let newArchived;
        if (archivedIds.includes(id)) {
            newArchived = archivedIds.filter(i => i !== id);
        } else {
            newArchived = [...archivedIds, id];
        }
        setArchivedIds(newArchived);
        localStorage.setItem('finance_buddy_archived_reminders', JSON.stringify(newArchived));
        
        if (isModalOpen && selectedReminder?.id === id) {
            setIsModalOpen(false);
        }
        
        // Dispatch event for Dashboard to refresh
        setTimeout(() => window.dispatchEvent(new Event('finance_buddy_data_updated')), 50);
    };

    const toggleTag = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const generateImplicitTags = (title, description) => {
        const text = ((title || '') + ' ' + (description || '')).toLowerCase();
        return tagOptions.filter(t => text.includes(t.toLowerCase()));
    };

    // Filter & Sort
    const processedReminders = (myReminders || [])
        .map(r => ({
            ...r,
            implicitTags: generateImplicitTags(r.title, r.description),
            isArchived: archivedIds.includes(r.id)
        }))
        .filter(r => (viewMode === 'active' ? !r.isArchived : r.isArchived))
        .filter(r => 
            (r.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
            (r.description || '').toLowerCase().includes(searchQuery.toLowerCase())
        )
        .filter(r => {
            if (selectedTags.length === 0) return true;
            return selectedTags.some(tag => r.implicitTags.includes(tag));
        })
        .sort((a, b) => {
            let valA, valB;
            switch(sortBy) {
                case 'newest':
                    return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
                case 'oldest':
                    return new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt);
                case 'az':
                    valA = a.title || ''; valB = b.title || '';
                    return valA.localeCompare(valB);
                case 'za':
                    valA = a.title || ''; valB = b.title || '';
                    return valB.localeCompare(valA);
                default: return 0;
            }
        });

    const openModal = (r) => {
        setSelectedReminder(r);
        setIsModalOpen(true);
    };

    return (
        <main className="flex-1 w-full h-[calc(100vh-64px)] md:h-screen flex flex-col text-gray-800 font-sans p-4 animate-in fade-in zoom-in-95 duration-500 bg-gray-50/50">
            {/* Header */}
            <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 shrink-0">
                <div className="flex items-center gap-4">
                    <div className={`${viewMode === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} p-3 rounded-xl shadow-inner transition-colors`}>
                        {viewMode === 'active' ? <BellRing size={24} /> : <ArchiveIcon size={24} />}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Reminders</h1>
                        <p className="text-sm text-gray-500">Notifications from Admin and Editor.</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    {/* Active / Archive Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
                        <button 
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setViewMode('active')}
                        >
                            Active
                        </button>
                        <button 
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'archive' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setViewMode('archive')}
                        >
                            Archived
                        </button>
                    </div>
                </div>
            </header>

            {/* Controls Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 mb-6 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center shrink-0">
                <div className="relative flex-1 max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search reminders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm transition-all"
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="flex flex-wrap gap-2">
                        {tagOptions.map(tag => (
                            <button 
                                key={tag} 
                                onClick={() => toggleTag(tag)}
                                className={`text-[10px] sm:text-xs px-2 py-1 sm:px-3 sm:py-1.5 rounded-full font-medium transition-all border ${selectedTags.includes(tag) ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2 py-1.5">
                        <ArrowUpDown size={14} className="text-gray-400" />
                        <select 
                            className="bg-transparent text-xs font-semibold text-gray-600 outline-none cursor-pointer"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="az">Name (A-Z)</option>
                            <option value="za">Name (Z-A)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {processedReminders.map(rem => (
                        <div 
                            key={rem.id} 
                            onClick={() => openModal(rem)}
                            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-gray-800 text-lg leading-tight line-clamp-2">{rem.title}</h3>
                            </div>
                            <div className="text-sm text-gray-500 mb-4 line-clamp-3 prose prose-sm flex-1">
                                <ReactMarkdown>{rem.description}</ReactMarkdown>
                            </div>
                            
                            <div className="flex flex-col gap-3 mt-auto border-t border-gray-50 pt-3">
                                {rem.implicitTags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {rem.implicitTags.map(tag => (
                                            <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase">{tag}</span>
                                        ))}
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] md:text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg flex items-center gap-1">
                                        <Clock size={12} /> {new Date(rem.date || rem.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {processedReminders.length === 0 && (
                    <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                            <Bell size={32} className="opacity-30" />
                        </div>
                        <p className="font-medium text-gray-500">No {viewMode} reminders found.</p>
                        <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>

            {/* Read Modal */}
            {isModalOpen && selectedReminder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Eye size={18} className="text-blue-600" /> Reminder View
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 border-b border-gray-50">
                            <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900">{selectedReminder.title}</h2>
                            <div className="prose prose-lg max-w-none text-gray-700 font-medium">
                                <ReactMarkdown>{selectedReminder.description}</ReactMarkdown>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-b-3xl flex items-center justify-between">
                            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                                Push Date: {new Date(selectedReminder.date || selectedReminder.createdAt).toLocaleString()}
                            </div>
                            
                            {viewMode === 'active' ? (
                                <button 
                                    onClick={() => toggleArchiveStatus(selectedReminder.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-md shadow-green-200"
                                >
                                    <CheckSquare size={18} /> Noted - send to archive
                                </button>
                            ) : (
                                <button 
                                    onClick={() => toggleArchiveStatus(selectedReminder.id)}
                                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-md shadow-amber-200"
                                >
                                    <RotateCcw size={18} /> Restore to Active
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
