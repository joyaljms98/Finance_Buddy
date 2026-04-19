'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Wallet, TrendingUp, Tags, Trash2, ArrowRightLeft, CalendarDays, X, Check, PanelLeftClose, PanelLeftOpen, Edit2 } from 'lucide-react';
import { useCashBook } from '@/context/CashBookContext';

export default function CashBookPage() {
    const {
        books, heads, transactions, isLoaded,
        addBook, deleteBook, addHead, addTransaction, updateTransaction, deleteTransaction, getBookBalance
    } = useCashBook();

    const [activeBookId, setActiveBookId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [viewMode, setViewMode] = useState('transactions'); // 'transactions' or 'heads'
    const [searchTerm, setSearchTerm] = useState('');
    const [sortCol, setSortCol] = useState('date');
    const [sortDesc, setSortDesc] = useState(true);

    // Modal States
    const [showTxModal, setShowTxModal] = useState(false);
    const [showBookModal, setShowBookModal] = useState(false);
    const [showHeadModal, setShowHeadModal] = useState(false);
    const [editingTxId, setEditingTxId] = useState(null);
    const [selectedHeadDetails, setSelectedHeadDetails] = useState(null);
    const [inlineHeadForm, setInlineHeadForm] = useState(false);
    const [inlineHeadName, setInlineHeadName] = useState('');

    // Setup initial active book
    useEffect(() => {
        if (isLoaded && books.length > 0 && !activeBookId) {
            setActiveBookId(books[0].id);
        }
    }, [isLoaded, books, activeBookId]);

    const activeBook = books.find(b => b.id === activeBookId);
    const activeTransactions = transactions
        .filter(t => t.bookId === activeBookId && (searchTerm ? t.description.toLowerCase().includes(searchTerm.toLowerCase()) || (heads.find(h => h.id === t.headId)?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) : true))
        .sort((a, b) => {
            let valA, valB;
            if (sortCol === 'date') { valA = new Date(a.date).getTime(); valB = new Date(b.date).getTime(); }
            else if (sortCol === 'description') { valA = a.description.toLowerCase(); valB = b.description.toLowerCase(); }
            else if (sortCol === 'head') { valA = (heads.find(h => h.id === a.headId)?.name || '').toLowerCase(); valB = (heads.find(h => h.id === b.headId)?.name || '').toLowerCase(); }
            else if (sortCol === 'amount') { valA = a.amount; valB = b.amount; }
            
            if (valA < valB) return sortDesc ? 1 : -1;
            if (valA > valB) return sortDesc ? -1 : 1;
            return 0;
        });

    // -- Forms --
    const [txForm, setTxForm] = useState({ type: 'expense', headId: '', amount: '', date: new Date().toISOString().slice(0, 16), description: '', isRecurring: false, recurringType: 'monthly' });
    const [bookForm, setBookForm] = useState({ name: '', initialBalance: '' });
    const [headForm, setHeadForm] = useState({ name: '', type: 'expense' });

    const openTxModalForEdit = (tx) => {
        setTxForm({
            type: tx.type,
            headId: tx.headId,
            amount: tx.amount,
            date: tx.date.slice(0, 16),
            description: tx.description,
            isRecurring: tx.isRecurring,
            recurringType: tx.recurringType
        });
        setEditingTxId(tx.id);
        setShowTxModal(true);
    };

    const handleAddTransaction = (e) => {
        e.preventDefault();
        if (!txForm.headId || !txForm.amount) return;

        if (editingTxId) {
            updateTransaction(editingTxId, { ...txForm, bookId: activeBookId });
        } else {
            addTransaction({
                bookId: activeBookId,
                headId: txForm.headId,
                type: txForm.type,
                amount: txForm.amount,
                date: txForm.date,
                description: txForm.description,
                isRecurring: txForm.isRecurring,
                recurringType: txForm.recurringType
            });
        }

        setShowTxModal(false);
        setEditingTxId(null);
        setTxForm({ type: 'expense', headId: '', amount: '', date: new Date().toISOString().slice(0, 16), description: '', isRecurring: false, recurringType: 'monthly' });
    };

    const handleAddBook = (e) => {
        e.preventDefault();
        if (!bookForm.name) return;
        const newId = addBook(bookForm.name, bookForm.initialBalance || 0);
        setActiveBookId(newId);
        setShowBookModal(false);
        setBookForm({ name: '', initialBalance: '' });
    };

    const handleAddHead = async (e) => {
        e.preventDefault();
        if (!headForm.name) return;
        await addHead(headForm.name, headForm.type);
        setShowHeadModal(false);
        setHeadForm({ name: '', type: 'expense' });
    };

    const handleInlineAddHead = async () => {
        if (!inlineHeadName) return;
        const newHeadId = await addHead(inlineHeadName, txForm.type);
        if(newHeadId) setTxForm({...txForm, headId: newHeadId});
        setInlineHeadForm(false);
        setInlineHeadName('');
    };

    if (!isLoaded) return <div className="p-8 animate-pulse flex-1 text-center text-gray-400">Loading CashBook...</div>;

    return (
        <main className="flex-1 w-full h-[calc(100vh-64px)] md:h-screen flex flex-col text-gray-800 font-sans p-4 animate-in fade-in zoom-in-95 duration-500">
            {/* Header */}
            <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors hidden md:block"
                        title={isSidebarOpen ? "Close Accounts" : "Open Accounts"}
                    >
                        {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                    </button>
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-xl shadow-inner">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Standard CashBook</h1>
                        <p className="text-sm text-gray-500">Manage your wallets, accounts, and daily transactions.</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <button onClick={() => setShowHeadModal(true)} className="whitespace-nowrap flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl border border-gray-200 transition-colors">
                        <Tags size={16} /> Manage Heads
                    </button>
                    <button onClick={() => { activeBookId ? setShowTxModal(true) : alert('Create a Book first!') }} className="whitespace-nowrap flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-200 transition-colors">
                        <ArrowRightLeft size={16} /> Add Transaction
                    </button>
                </div>
            </header>

            <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
                {/* LEFT SIDEBAR: Books List */}
                <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden shrink-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-full md:w-80' : 'w-0 border-none hidden overflow-hidden'}`}>
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="font-bold text-gray-800 uppercase tracking-wider text-xs">Your Books / Accounts</h2>
                        <button onClick={() => setShowBookModal(true)} className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors">
                            <Plus size={12} /> Add new book
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {books.length === 0 ? (
                            <div className="text-center p-6 text-gray-400">
                                <Wallet size={32} className="mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No books created. Tap 'New Book' to start.</p>
                            </div>
                        ) : (
                            books.map(b => {
                                const bal = getBookBalance(b.id);
                                const isNeg = bal < 0;
                                return (
                                    <div
                                        key={b.id}
                                        onClick={() => setActiveBookId(b.id)}
                                        className={`group relative p-4 rounded-xl cursor-pointer transition-all border ${activeBookId === b.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <p className={`font-semibold ${activeBookId === b.id ? 'text-blue-900' : 'text-gray-700'}`}>{b.name}</p>
                                            {!b.isSystem && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteBook(b.id); }}
                                                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-1"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <p className={`text-lg font-bold ${isNeg ? 'text-red-500' : 'text-green-600'}`}>
                                            {isNeg ? '-' : ''}₹{Math.abs(bal).toLocaleString()}
                                        </p>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* MAIN CONTENT: Transactions & Summary */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-h-[50vh]">
                    {activeBook ? (
                        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar relative bg-gray-50/50">
                            <div className="max-w-6xl mx-auto">
                                {/* Summary Banner (Black Component) */}
                                <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden shrink-0">
                                    <div className="absolute top-0 right-0 p-12 bg-white/5 rounded-full blur-3xl w-48 h-48 -translate-y-1/2 translate-x-1/4"></div>

                                <div className="relative z-10 flex-1 w-full">
                                    <p className="text-gray-400 font-medium mb-1 tracking-wider uppercase text-xs">Total Balance • {activeBook.name}</p>
                                    <h2 className={`text-3xl md:text-4xl font-black tracking-tight ${getBookBalance(activeBook.id) < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                        ₹ {getBookBalance(activeBook.id).toLocaleString()}
                                    </h2>
                                    
                                    {/* View Toggle and Search */}
                                    <div className="mt-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                                        <div className="flex bg-white/10 backdrop-blur-sm rounded-xl p-1 w-fit border border-white/5">
                                            <button 
                                                onClick={() => setViewMode('transactions')} 
                                                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'transactions' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                <CalendarDays size={14} /> Transactions
                                            </button>
                                            <button 
                                                onClick={() => setViewMode('heads')} 
                                                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'heads' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                <Tags size={14} /> Head-wise Totals
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 flex gap-8 md:gap-12 text-left bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10 w-full md:w-auto justify-between">
                                    <div>
                                        <p className="text-[10px] text-green-300 uppercase tracking-widest font-bold mb-1">Total Income (+)</p>
                                        <p className="font-bold text-2xl tracking-tight text-white">
                                            ₹ {activeTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="w-px bg-white/20"></div>
                                    <div>
                                        <p className="text-[10px] text-red-300 uppercase tracking-widest font-bold mb-1">Total Expense (-)</p>
                                        <p className="font-bold text-2xl tracking-tight text-white">
                                            ₹ {activeTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {viewMode === 'transactions' && transactions.filter(t => t.bookId === activeBookId).length > 0 && (
                                <div className="mt-6 flex justify-end">
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex items-center gap-2 relative z-10 w-full sm:w-80">
                                        <div className="bg-gray-50 p-2 rounded-xl text-gray-400">
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                                        </div>
                                        <input 
                                            type="text" 
                                            placeholder="Search transactions by desc or tag..." 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="bg-transparent border-none text-gray-700 placeholder-gray-400 rounded-xl py-2 text-sm focus:outline-none flex-1 font-medium"
                                        />
                                        {searchTerm && (
                                            <button onClick={() => setSearchTerm('')} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors">
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="mt-6">
                                {viewMode === 'transactions' ? (
                                        activeTransactions.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-gray-400 relative z-10 p-10 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                            <ArrowRightLeft size={48} className="mb-4 opacity-20" />
                                            <p>No transactions found in this book.</p>
                                            <button onClick={() => setShowTxModal(true)} className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md transition-colors flex items-center gap-2 hover:scale-105 active:scale-95">
                                                <Plus size={16} /> Add first transaction
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative z-10">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="bg-gray-50/80 backdrop-blur-md text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                                    <tr>
                                                        <th className="p-4 rounded-tl-3xl cursor-pointer hover:text-gray-600 transition-colors" onClick={() => { setSortCol('date'); setSortDesc(!sortDesc) }}>Date {sortCol==='date' && (sortDesc?'↓':'↑')}</th>
                                                        <th className="p-4 cursor-pointer hover:text-gray-600 transition-colors" onClick={() => { setSortCol('description'); setSortDesc(!sortDesc) }}>Description {sortCol==='description' && (sortDesc?'↓':'↑')}</th>
                                                        <th className="p-4 cursor-pointer hover:text-gray-600 transition-colors" onClick={() => { setSortCol('head'); setSortDesc(!sortDesc) }}>Head / Category {sortCol==='head' && (sortDesc?'↓':'↑')}</th>
                                                        <th className="p-4 text-right cursor-pointer hover:text-gray-600 transition-colors" onClick={() => { setSortCol('amount'); setSortDesc(!sortDesc) }}>Amount {sortCol==='amount' && (sortDesc?'↓':'↑')}</th>
                                                        <th className="p-4 w-20 rounded-tr-3xl text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {activeTransactions.map(t => {
                                                        const headName = heads.find(h => h.id === t.headId)?.name || 'Unknown';
                                                        const isEx = t.type === 'expense';
                                                        return (
                                                            <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors group">
                                                                <td className="p-4">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm text-gray-700 font-medium whitespace-nowrap">
                                                                            {new Date(t.date).toLocaleDateString()}
                                                                        </span>
                                                                        <span className="text-xs text-gray-400">{new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="p-4">
                                                                    <span className="font-bold text-gray-800 tracking-tight">{t.description || headName}</span>
                                                                    {t.isRecurring && <span className="ml-2 bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider">{t.recurringType}</span>}
                                                                </td>
                                                                <td className="p-4">
                                                                    <span className="bg-gray-50 text-gray-600 px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-100 shadow-sm leading-none inline-flex items-center">
                                                                        {headName}
                                                                    </span>
                                                                </td>
                                                                <td className="p-4 text-right">
                                                                    <span className={`font-black tracking-tight ${isEx ? 'text-red-500' : 'text-green-600'}`}>
                                                                        {isEx ? '-' : '+'} ₹{t.amount.toLocaleString()}
                                                                    </span>
                                                                </td>
                                                                <td className="p-4 flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={() => openTxModalForEdit(t)}
                                                                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 flex-shrink-0 rounded-lg transition-all"
                                                                    >
                                                                        <Edit2 size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => deleteTransaction(t.id)}
                                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0 rounded-lg transition-all"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
                                                <button onClick={() => setShowTxModal(true)} className="px-6 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2">
                                                    <Plus size={16} /> Add Transaction
                                                </button>
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    // Head-wise Totals View
                                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative z-10 flex flex-col md:flex-row">
                                        {/* INCOMES LEFT */}
                                        <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col">
                                            <div className="p-4 border-b border-gray-100 bg-green-50/50">
                                                <h3 className="text-xs font-extrabold text-green-700 uppercase tracking-widest">Cash In (Incomes)</h3>
                                            </div>
                                            <div className="flex-1 p-4 space-y-3">
                                                {heads.filter(h => h.type === 'income').map(h => {
                                                    const total = activeTransactions.filter(t => t.headId === h.id).reduce((sum, t) => sum + t.amount, 0);
                                                    if (total === 0) return null;
                                                    return (
                                                        <div key={h.id} onClick={() => setSelectedHeadDetails(h.id)} className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:bg-green-50/30 transition-colors">
                                                            <span className="font-bold text-gray-700">{h.name}</span>
                                                            <span className="font-black text-green-600">₹{total.toLocaleString()}</span>
                                                        </div>
                                                    );
                                                })}
                                                {heads.filter(h => h.type === 'income').every(h => activeTransactions.filter(t => t.headId === h.id).reduce((sum, t) => sum + t.amount, 0) === 0) && (
                                                    <div className="text-gray-400 text-sm italic text-center p-4">No income recorded</div>
                                                )}
                                            </div>
                                            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                                                <span className="font-bold text-gray-500 text-sm">TOTAL INCOME</span>
                                                <span className="font-black text-lg text-green-600">₹{activeTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        
                                        {/* EXPENSES RIGHT */}
                                        <div className="flex-1 flex flex-col">
                                            <div className="p-4 border-b border-gray-100 bg-red-50/50">
                                                <h3 className="text-xs font-extrabold text-red-700 uppercase tracking-widest">Cash Out (Expenses)</h3>
                                            </div>
                                            <div className="flex-1 p-4 space-y-3">
                                                {heads.filter(h => h.type === 'expense').map(h => {
                                                    const total = activeTransactions.filter(t => t.headId === h.id).reduce((sum, t) => sum + t.amount, 0);
                                                    if (total === 0) return null;
                                                    return (
                                                        <div key={h.id} onClick={() => setSelectedHeadDetails(h.id)} className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:bg-red-50/30 transition-colors">
                                                            <span className="font-bold text-gray-700">{h.name}</span>
                                                            <span className="font-black text-red-500">₹{total.toLocaleString()}</span>
                                                        </div>
                                                    );
                                                })}
                                                {heads.filter(h => h.type === 'expense').every(h => activeTransactions.filter(t => t.headId === h.id).reduce((sum, t) => sum + t.amount, 0) === 0) && (
                                                    <div className="text-gray-400 text-sm italic text-center p-4">No expenses recorded</div>
                                                )}
                                            </div>
                                            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                                                <span className="font-bold text-gray-500 text-sm">TOTAL EXPENSE</span>
                                                <span className="font-black text-lg text-red-500">₹{activeTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <Wallet size={48} className="mb-4 opacity-20" />
                            {books.length === 0 ? (
                                <button
                                    onClick={() => setShowBookModal(true)}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
                                >
                                    <Plus size={16} /> Add new book to get started with your cashbook
                                </button>
                            ) : (
                                <p>Select a book from the sidebar to view transactions</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODALS --- */}

            {/* 1. Add Transaction Modal */}
            {showTxModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="font-bold text-xl text-gray-800">{editingTxId ? 'Edit Transaction' : 'Add Transaction'}</h2>
                            <button onClick={() => { setShowTxModal(false); setEditingTxId(null); }} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddTransaction} className="p-6 space-y-5">
                            {/* Type Toggle */}
                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                <button type="button" onClick={() => setTxForm(f => ({ ...f, type: 'income' }))} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${txForm.type === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                    <span className="text-xl">🟩</span> Cash In
                                </button>
                                <button type="button" onClick={() => setTxForm(f => ({ ...f, type: 'expense' }))} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${txForm.type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                    <span className="text-xl">🟥</span> Cash Out
                                </button>
                            </div>

                            <div className="space-y-1">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Head / Category</label>
                                                    <button type="button" onClick={() => setInlineHeadForm(!inlineHeadForm)} className="text-xs text-blue-600 font-bold hover:underline">
                                                        {inlineHeadForm ? 'Cancel' : '+ New Head'}
                                                    </button>
                                                </div>
                                                {inlineHeadForm ? (
                                                    <div className="flex gap-2">
                                                        <input type="text" value={inlineHeadName} onChange={e => setInlineHeadName(e.target.value)} placeholder={`New ${txForm.type} head name...`} className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1" />
                                                        <button type="button" onClick={handleInlineAddHead} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition-colors">Add</button>
                                                    </div>
                                                ) : (
                                                    <select required value={txForm.headId} onChange={e => setTxForm({ ...txForm, headId: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium">
                                                        <option value="" disabled>Select a {txForm.type} head...</option>
                                                        {heads.filter(h => h.type === txForm.type).map(h => (
                                                            <option key={h.id} value={h.id}>{h.name}</option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Amount (₹)</label>
                                <input type="number" required min="1" step="0.01" value={txForm.amount} onChange={e => setTxForm({ ...txForm, amount: e.target.value })} placeholder="e.g. 500" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-bold text-xl" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Date & Time</label>
                                    <input type="datetime-local" required value={txForm.date} onChange={e => setTxForm({ ...txForm, date: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Short Description</label>
                                    <input type="text" value={txForm.description} onChange={e => setTxForm({ ...txForm, description: e.target.value })} placeholder="Optional comment" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium" />
                                </div>
                            </div>

                            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex flex-col gap-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={txForm.isRecurring} onChange={e => setTxForm({ ...txForm, isRecurring: e.target.checked })} className="w-5 h-5 rounded !border-blue-300 text-blue-600 focus:ring-blue-500" />
                                    <span className="font-semibold text-gray-800">Is this a Recurring setup?</span>
                                </label>
                                {txForm.isRecurring && (
                                    <div className="flex flex-wrap gap-4 ml-8 animate-in fade-in slide-in-from-top-2">
                                        {['daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'half-yearly', 'yearly'].map(rt => (
                                            <label key={rt} className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="recType" value={rt} checked={txForm.recurringType === rt} onChange={e => setTxForm({ ...txForm, recurringType: e.target.value })} className="text-blue-600 focus:ring-blue-500" />
                                                <span className="text-sm font-medium capitalize">{rt.replace("-", " ")}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 text-lg">
                                {editingTxId ? 'Save Changes' : `Log ${txForm.type === 'income' ? 'Cash In' : 'Cash Out'}`}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* 2. Add Book Modal */}
            {showBookModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-xl text-gray-800">New Book / Account</h2>
                            <button onClick={() => setShowBookModal(false)} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddBook} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Book Name</label>
                                <input type="text" required value={bookForm.name} onChange={e => setBookForm({ ...bookForm, name: e.target.value })} placeholder="e.g. Credit Card, Savings..." className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Initial Balance (Optional)</label>
                                <input type="number" step="0.01" value={bookForm.initialBalance} onChange={e => setBookForm({ ...bookForm, initialBalance: e.target.value })} placeholder="Use negative for debt (e.g. -500)" className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500" />
                            </div>
                            <button type="submit" className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-md transition-all">Create Book</button>
                        </form>
                    </div>
                </div>
            )}

            {/* 3. Manage Heads Modal */}
            {showHeadModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="font-bold text-xl text-gray-800">Manage Heads</h2>
                                <p className="text-xs text-gray-500">Your Income and Expense categories.</p>
                            </div>
                            <button onClick={() => setShowHeadModal(false)} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full"><X size={20} /></button>
                        </div>

                        {/* List of existing */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Incomes */}
                                <div>
                                    <h3 className="text-xs font-bold text-green-600 uppercase tracking-wider border-b pb-2 mb-2">Income Heads</h3>
                                    <div className="space-y-2">
                                        {heads.filter(h => h.type === 'income').map(h => (
                                            <div key={h.id} className="p-2 bg-green-50 text-sm font-medium text-green-800 rounded-lg flex justify-between">
                                                {h.name} {h.isSystem && <span className="opacity-50" title="System defined">★</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Expenses */}
                                <div>
                                    <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider border-b pb-2 mb-2">Expense Heads</h3>
                                    <div className="space-y-2">
                                        {heads.filter(h => h.type === 'expense').map(h => (
                                            <div key={h.id} className="p-2 bg-red-50 text-sm font-medium text-red-800 rounded-lg flex justify-between">
                                                {h.name} {h.isSystem && <span className="opacity-50" title="System defined">★</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Add new head */}
                        <form onSubmit={handleAddHead} className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
                            <div className="flex gap-2">
                                <select value={headForm.type} onChange={e => setHeadForm({ ...headForm, type: e.target.value })} className="bg-white border text-sm font-bold border-gray-200 rounded-xl px-3 outline-none">
                                    <option value="income">🟩 In</option>
                                    <option value="expense">🟥 Out</option>
                                </select>
                                <input type="text" required value={headForm.name} onChange={e => setHeadForm({ ...headForm, name: e.target.value })} placeholder="New Head Name..." className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1" />
                                <button type="submit" className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 shadow-md"> <Plus size={20} /> </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 4. Head Details Popup */}
            {selectedHeadDetails && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center shrink-0">
                            <h2 className="font-bold text-xl text-gray-800">
                                {heads.find(h => h.id === selectedHeadDetails)?.name || 'Head Details'}
                            </h2>
                            <button onClick={() => setSelectedHeadDetails(null)} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <div className="space-y-2">
                                {activeTransactions.filter(t => t.headId === selectedHeadDetails).map(t => (
                                    <div key={t.id} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                        <div>
                                            <p className="font-bold text-gray-800">{t.description || heads.find(h => h.id === selectedHeadDetails)?.name}</p>
                                            <p className="text-xs text-gray-500">{new Date(t.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                        </div>
                                        <span className={`font-black ${t.type === 'expense' ? 'text-red-500' : 'text-green-600'}`}>
                                            {t.type === 'expense' ? '-' : '+'}₹{t.amount.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                                {activeTransactions.filter(t => t.headId === selectedHeadDetails).length === 0 && (
                                    <div className="text-center text-gray-400 py-8">No transactions found for this head.</div>
                                )}
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-between items-center">
                            <span className="font-bold text-gray-500">TOTAL</span>
                            <span className="font-black text-xl text-gray-900">
                                ₹{activeTransactions.filter(t => t.headId === selectedHeadDetails).reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
