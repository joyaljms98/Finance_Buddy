'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Calculator, Download, Trash2, Edit2, Save, ArrowDownToLine, Wallet, ChevronDown, CheckCircle, PanelLeftClose, PanelLeftOpen, Tags, TrendingUp } from 'lucide-react';
import FYPicker from '@/components/FYPicker';
import { useCashBook } from '@/context/CashBookContext';
import { useUsers } from '@/context/UsersContext';
import api from '@/lib/api';

// --- FY Utilities ---
const getIndianFY = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    if (month >= 3) {
        return `${year}-${(year + 1).toString().slice(-2)}`;
    } else {
        return `${year - 1}-${year.toString().slice(-2)}`;
    }
};

const getNextIndianFY = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    if (month >= 3) {
        return `${year + 1}-${(year + 2).toString().slice(-2)}`;
    } else {
        return `${year}-${(year + 1).toString().slice(-2)}`;
    }
};

const generateFYList = () => {
    return [
        '2024-25', '2025-26', '2026-27', '2027-28', '2028-29', '2029-30', '2030-31', '2031-32'
    ];
};

export default function BudgetMakerPage() {
    const { books, heads, transactions, getBookBalance } = useCashBook();
    const { activeUser } = useUsers();
    const fyOptions = generateFYList();
    const [selectedFY, setSelectedFY] = useState(getNextIndianFY(new Date()));

    // Sandbox state stored locally
    const [budgetData, setBudgetData] = useState({});
    const [isLoaded, setIsLoaded] = useState(false);
    const [activeAltId, setActiveAltId] = useState(null);
    const [showAltDropdown, setShowAltDropdown] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const altDropdownRef = useRef(null);

    // Editing Data / Modals
    const [showItemModal, setShowItemModal] = useState(false);
    const [itemModalConfig, setItemModalConfig] = useState({ type: 'income', title: '', amount: '' });
    const [editingItemId, setEditingItemId] = useState(null);
    const [editingItemType, setEditingItemType] = useState(null); // 'income' | 'expense' | 'book'

    // Goal Sync
    const [unsyncedGoals, setUnsyncedGoals] = useState([]);

    useEffect(() => {
        if (typeof window === 'undefined' || !activeUser?.user_id) return;
        
        const loadInitialData = async () => {
            let loadedBudgets = null;
            try {
                const res = await api.get('/sync/data');
                if (res.data && res.data.budgets) {
                    loadedBudgets = res.data.budgets;
                }
            } catch(e) { console.warn("Could not fetch budgets from backend"); }

            if (!loadedBudgets) {
                // Try to handle legacy structure if present
                const storageKey = `financeBuddy_budgets_${activeUser.user_id}`;
                const saved = localStorage.getItem(storageKey);
                if (saved) {
                    try { loadedBudgets = JSON.parse(saved); } catch(e) {}
                }
            }
            
            if (loadedBudgets) {
                // Simple migration check: if keys are FYs but value is an object (not array)
                const migrated = {};
                for (const fy in loadedBudgets) {
                    if (Array.isArray(loadedBudgets[fy])) {
                        migrated[fy] = loadedBudgets[fy];
                    } else if (loadedBudgets[fy] && !Array.isArray(loadedBudgets[fy])) {
                        migrated[fy] = [{ id: 'legacy-1', name: 'Budget 1', isPrimary: true, data: loadedBudgets[fy] }];
                    }
                }
                setBudgetData(migrated);
            } else {
                setBudgetData({}); // Reset if no data found for this user
            }
            setIsLoaded(true);
        };
        
        loadInitialData();
    }, [activeUser?.user_id]);

    useEffect(() => {
        if (!isLoaded || typeof window === 'undefined' || !activeUser?.user_id) return;
        localStorage.setItem(`financeBuddy_budgets_${activeUser.user_id}`, JSON.stringify(budgetData));
        api.post('/sync/data', { budgets: budgetData }).catch(e => console.error(e));
    }, [budgetData, isLoaded, activeUser?.user_id]);

    const currentFyBudgets = budgetData[selectedFY] || [];

    useEffect(() => {
        if (currentFyBudgets.length > 0) {
            if (!currentFyBudgets.find(b => b.id === activeAltId)) {
                setActiveAltId((currentFyBudgets.find(b => b.isPrimary) || currentFyBudgets[0]).id);
            }
        } else {
            setActiveAltId(null);
        }
    }, [selectedFY, budgetData, activeAltId, currentFyBudgets]);

    useEffect(() => {
        // Goal Sync Check
        if (typeof window === 'undefined' || !isLoaded || !activeAltId || !activeUser?.user_id) return;
        const storageKey = `finance_buddy_goals_${activeUser.user_id}`;
        const savedGoals = localStorage.getItem(storageKey);
        if (savedGoals) {
            try {
                const parsed = JSON.parse(savedGoals);
                const activeBudgetContainer = budgetData[selectedFY]?.find(b => b.id === activeAltId);
                const activeExpenses = activeBudgetContainer ? activeBudgetContainer.data.expenses : [];
                
                const activeG = parsed.filter(g => 
                    g.status === 'in_progress' && 
                    !g.completed && 
                    g.emiAmount > 0 &&
                    !activeExpenses.find(e => e.title.includes(g.name))
                );
                
                setUnsyncedGoals(activeG);
            } catch(e) {}
        }
    }, [budgetData, activeAltId, selectedFY, isLoaded]);

    const handleSyncGoals = () => {
        if (!activeAltId || unsyncedGoals.length === 0) return;
        const newExpenses = [...activeBudget.expenses];
        unsyncedGoals.forEach(g => {
            // Assume emi is monthly, budget is yearly
            newExpenses.push({ id: Date.now() + Math.random(), title: `Goal: ${g.name}`, amount: (g.emiAmount || 0) * 12 });
        });
        updateActiveBudget({ expenses: newExpenses });
        setUnsyncedGoals([]);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (altDropdownRef.current && !altDropdownRef.current.contains(event.target)) {
                setShowAltDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activeBudgetContainer = currentFyBudgets.find(b => b.id === activeAltId);
    const activeBudget = activeBudgetContainer ? activeBudgetContainer.data : { books: [], incomes: [], expenses: [] };

    const updateActiveBudget = (newData) => {
        if (!activeAltId) return;
        setBudgetData(prev => {
            const fyBudgets = prev[selectedFY] || [];
            return {
                ...prev,
                [selectedFY]: fyBudgets.map(b => b.id === activeAltId ? { ...b, data: { ...b.data, ...newData } } : b)
            };
        });
    };

    const createAlternateBudget = (name = null) => {
        const fyB = budgetData[selectedFY] || [];
        if (fyB.length >= 3) {
            alert("Maximum 3 alternatives allowed.");
            return;
        }
        const newId = Date.now().toString();
        const isPrimary = fyB.length === 0;
        const newB = { id: newId, name: name || `Budget ${fyB.length + 1}`, isPrimary, data: { books: [], incomes: [], expenses: [] } };
        
        setBudgetData(prev => ({
            ...prev,
            [selectedFY]: [...(prev[selectedFY] || []), newB]
        }));
        setActiveAltId(newId);
    };

    const deleteAlternateBudget = (id) => {
        if (!confirm("Are you sure? Deleting this budget alternative clears its data.")) return;
        setBudgetData(prev => {
            const fyB = prev[selectedFY] || [];
            const newFyB = fyB.filter(b => b.id !== id);
            if (fyB.find(b => b.id === id)?.isPrimary && newFyB.length > 0) {
                newFyB[0].isPrimary = true;
            }
            return { ...prev, [selectedFY]: newFyB };
        });
    };

    const renameAlternateBudget = (id, newName) => {
        setBudgetData(prev => {
            const fyB = prev[selectedFY] || [];
            return { ...prev, [selectedFY]: fyB.map(b => b.id === id ? { ...b, name: newName } : b) };
        });
    };

    const setPrimaryBudget = (id) => {
        setBudgetData(prev => {
            const fyB = prev[selectedFY] || [];
            return { ...prev, [selectedFY]: fyB.map(b => ({ ...b, isPrimary: b.id === id })) };
        });
    };

    const handleImportFromCashBook = () => {
        if (!confirm("This will overwrite your current Budget Maker setup for " + selectedFY + ". Continue?")) return;

        // Clone books
        const clonedBooks = books.map(b => ({
            id: `b-${Date.now()}-${b.id}`,
            name: b.name,
            amount: b.initialBalance
        }));

        // Calculate recurring transactions translated into yearly budget items
        const yearlyIncomes = [];
        const yearlyExpenses = [];

        transactions.forEach(t => {
            if (t.isRecurring) {
                const headName = heads.find(h => h.id === t.headId)?.name || 'Unknown';
                const annualAmount = t.recurringType === 'monthly' ? t.amount * 12 : t.amount;

                if (t.type === 'income') {
                    yearlyIncomes.push({ id: `i-${Date.now()}-${t.id}`, title: t.description || headName, amount: annualAmount });
                } else {
                    yearlyExpenses.push({ id: `e-${Date.now()}-${t.id}`, title: t.description || headName, amount: annualAmount });
                }
            }
        });

        // Add some default padding if empty
        if (yearlyIncomes.length === 0) yearlyIncomes.push({ id: `i-${Date.now()}-1`, title: 'Projected Salary', amount: 0 });
        if (yearlyExpenses.length === 0) yearlyExpenses.push({ id: `e-${Date.now()}-2`, title: 'Projected Rent', amount: 0 });

        const newB = { id: Date.now().toString(), name: 'Budget 1', isPrimary: true, data: {
            books: clonedBooks.length ? clonedBooks : [{ id: 1, name: 'Main Account', amount: 0 }],
            incomes: yearlyIncomes,
            expenses: yearlyExpenses
        }};
        setBudgetData(prev => ({ ...prev, [selectedFY]: [newB] }));
        setActiveAltId(newB.id);
    };

    const handleInitialSetup = () => {
        const newB = { id: Date.now().toString(), name: 'Budget 1', isPrimary: true, data: {
            books: [{ id: 1, name: 'Main Account', amount: 0 }],
            incomes: [{ id: 1, title: 'Yearly Salary', amount: 0 }],
            expenses: [{ id: 1, title: 'Yearly Rent', amount: 0 }]
        }};
        setBudgetData(prev => ({ ...prev, [selectedFY]: [newB] }));
        setActiveAltId(newB.id);
    }

    const handleCarryForward = () => {
        const [startYear] = selectedFY.split('-').map(Number);
        const prevStartYear = startYear - 1;
        const prevFY = `${prevStartYear}-${startYear.toString().slice(-2)}`;
        
        if (!confirm(`This will calculate aggregate totals from all transactions in Financial Year ${prevFY} and use them as your starting budget for ${selectedFY}. Continue?`)) return;

        // Clone books
        const clonedBooks = books.map(b => ({
            id: `b-${Date.now()}-${b.id}`,
            name: b.name,
            amount: getBookBalance ? getBookBalance(b.id) : 0
        }));

        // Filter transactions by previous FY
        const prevFYStart = new Date(prevStartYear, 3, 1);
        const prevFYEnd = new Date(startYear, 2, 31, 23, 59, 59);

        const prevTransactions = transactions.filter(t => {
            const d = new Date(t.date);
            return d >= prevFYStart && d <= prevFYEnd;
        });

        const incomeHeadsMap = {};
        const expenseHeadsMap = {};

        prevTransactions.forEach(t => {
            const h = heads.find(head => head.id === t.headId);
            if (!h) return;
            const headName = h.name;
            if (t.type === 'income') {
                incomeHeadsMap[headName] = (incomeHeadsMap[headName] || 0) + t.amount;
            } else {
                expenseHeadsMap[headName] = (expenseHeadsMap[headName] || 0) + t.amount;
            }
        });

        const yearlyIncomes = Object.entries(incomeHeadsMap).map(([title, amount], idx) => ({ id: `cf-i-${idx}-${Date.now()}`, title, amount }));
        const yearlyExpenses = Object.entries(expenseHeadsMap).map(([title, amount], idx) => ({ id: `cf-e-${idx}-${Date.now()}`, title, amount }));

        if (yearlyIncomes.length === 0) yearlyIncomes.push({ id: `i-${Date.now()}-1`, title: 'Projected Salary', amount: 0 });
        if (yearlyExpenses.length === 0) yearlyExpenses.push({ id: `e-${Date.now()}-2`, title: 'Projected Rent', amount: 0 });

        const newB = { id: Date.now().toString(), name: 'Budget 1', isPrimary: true, data: {
            books: clonedBooks.length ? clonedBooks : [{ id: 1, name: 'Main Account', amount: 0 }],
            incomes: yearlyIncomes,
            expenses: yearlyExpenses
        }};
        setBudgetData(prev => ({ ...prev, [selectedFY]: [newB] }));
        setActiveAltId(newB.id);
    };

    // -- CRUD Actions via Modal --
    const openItemModal = (type, itemToEdit = null) => {
        if (itemToEdit) {
            setEditingItemId(itemToEdit.id);
            setEditingItemType(type);
            setItemModalConfig({ type, title: type === 'book' ? itemToEdit.name : itemToEdit.title, amount: itemToEdit.amount });
        } else {
            setEditingItemId(null);
            setEditingItemType(type);
            setItemModalConfig({ type, title: '', amount: '' });
        }
        setShowItemModal(true);
    };

    const handleSaveItemModal = (e) => {
        e.preventDefault();
        const amt = parseFloat(itemModalConfig.amount) || 0;
        
        if (editingItemId) {
            if (editingItemType === 'income') {
                updateActiveBudget({ incomes: activeBudget.incomes.map(i => i.id === editingItemId ? { ...i, title: itemModalConfig.title, amount: amt } : i) });
            } else if (editingItemType === 'expense') {
                updateActiveBudget({ expenses: activeBudget.expenses.map(i => i.id === editingItemId ? { ...i, title: itemModalConfig.title, amount: amt } : i) });
            } else if (editingItemType === 'book') {
                updateActiveBudget({ books: activeBudget.books.map(i => i.id === editingItemId ? { ...i, name: itemModalConfig.title, amount: amt } : i) });
            }
        } else {
            // Add New
            const newItem = { id: Date.now(), title: itemModalConfig.title, amount: amt, name: itemModalConfig.title };
            if (itemModalConfig.type === 'income') updateActiveBudget({ incomes: [...activeBudget.incomes, newItem] });
            else if (itemModalConfig.type === 'expense') updateActiveBudget({ expenses: [...activeBudget.expenses, newItem] });
            else if (itemModalConfig.type === 'book') updateActiveBudget({ books: [...activeBudget.books, newItem] });
        }
        setShowItemModal(false);
    };

    const removeItem = (id, type) => {
        if (type === 'income') updateActiveBudget({ incomes: activeBudget.incomes.filter(i => i.id !== id) });
        else if (type === 'expense') updateActiveBudget({ expenses: activeBudget.expenses.filter(i => i.id !== id) });
        else if (type === 'book') updateActiveBudget({ books: activeBudget.books.filter(i => i.id !== id) });
    };

    // Math
    const totalStartingBal = activeBudget.books.reduce((sum, b) => sum + b.amount, 0);
    const totalIncome = activeBudget.incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpense = activeBudget.expenses.reduce((sum, e) => sum + e.amount, 0);

    // Total End Of Year Balance
    const projectedEOY = totalStartingBal + totalIncome - totalExpense;

    if (!isLoaded) return <div className="p-8 text-gray-400 text-center flex-1">Loading Budget Maker...</div>;

    const isEmpty = currentFyBudgets.length === 0;

    const renderList = (title, items, type, color, bgLabel) => (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex-1">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${color}`}></span> {title}
                </h3>
                <button onClick={() => openItemModal(type)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                    <Plus size={18} />
                </button>
            </div>
            <div className="space-y-3">
                {items.length === 0 ? <p className="text-sm text-gray-400 p-2 italic bg-gray-50 rounded-lg">No items added.</p> : null}
                {items.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl group hover:bg-white border border-transparent hover:border-gray-200 transition-all shadow-sm">
                        <span className="font-medium text-gray-700 cursor-pointer flex items-center gap-2 flex-1" onClick={() => openItemModal(type, item)}>
                            {type === 'book' ? item.name : item.title}
                            <Edit2 size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                        <div className="flex items-center gap-3 shrink-0">
                            <span className={`font-bold ${bgLabel}`}>₹{item.amount.toLocaleString()}</span>
                            <button onClick={() => removeItem(item.id, type)} className="text-gray-400 p-1 hover:bg-red-50 rounded hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <main className="flex-1 w-full h-[calc(100vh-64px)] md:h-screen flex flex-col text-gray-800 font-sans p-4 animate-in fade-in zoom-in-95 duration-500">
            {/* Header */}
            <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors hidden md:block"
                        title={isSidebarOpen ? "Close Budgets" : "Open Budgets"}
                    >
                        {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                    </button>
                    <div className="bg-purple-100 text-purple-600 p-3 rounded-xl shadow-inner">
                        <Calculator size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Budget Maker Sandbox</h1>
                        <p className="text-sm text-gray-500">Plan your year without affecting real CashBook accounts.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto overflow-visible pb-2 md:pb-0">
                    <FYPicker selectedFY={selectedFY} onChange={setSelectedFY} options={fyOptions} />

                    {!isEmpty && (
                        <button onClick={handleImportFromCashBook} className="whitespace-nowrap flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors">
                            <ArrowDownToLine size={16} /> Re-Sync
                        </button>
                    )}
                </div>
            </header>

            <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
                {/* LEFT SIDEBAR: Budgets List */}
                <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden shrink-0 transition-all duration-300 ease-in-out ${isSidebarOpen && !isEmpty ? 'w-full md:w-80' : 'w-0 border-none hidden md:block opacity-0'}`}>
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="font-bold text-gray-800 uppercase tracking-wider text-xs">Alternative Budgets ({currentFyBudgets.length}/3)</h2>
                        {currentFyBudgets.length < 3 && (
                            <button onClick={() => { createAlternateBudget(); }} className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors">
                                <Plus size={12} /> Add Alt
                            </button>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {currentFyBudgets.map(b => (
                            <div
                                key={b.id}
                                onClick={() => setActiveAltId(b.id)}
                                className={`group relative p-4 rounded-xl cursor-pointer transition-all border ${activeAltId === b.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2">
                                        <p className={`font-semibold ${activeAltId === b.id ? 'text-blue-900' : 'text-gray-700'}`}>{b.name}</p>
                                        {b.isPrimary && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold ml-auto shrink-0">PRIMARY</span>}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        {!b.isPrimary && (
                                            <button onClick={(e) => { e.stopPropagation(); setPrimaryBudget(b.id); }} title="Set as Primary" className="text-gray-400 hover:text-green-600 p-1"><CheckCircle size={14} /></button>
                                        )}
                                        <button onClick={(e) => { e.stopPropagation(); const nn = prompt("Enter new name:", b.name); if(nn) renameAlternateBudget(b.id, nn); }} className="text-gray-400 hover:text-blue-600 p-1"><Edit2 size={14} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); deleteAlternateBudget(b.id); }} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MAIN CONTENT: Budget Detail */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-h-[50vh]">
                    <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar relative">
                        {isEmpty ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 rounded-3xl bg-white/50">
                        <Calculator size={64} className="text-gray-300 mb-6" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Budget for {selectedFY}</h2>
                        <p className="text-gray-500 mb-8 max-w-sm">You haven't planned any finances for this Financial Year. Would you like to import data from your actual CashBook or start fresh?</p>

                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <button onClick={handleImportFromCashBook} className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2">
                                <ArrowDownToLine size={18} /> Clone Recurring Transactions
                            </button>
                            <button onClick={handleCarryForward} className="w-full md:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition-all flex items-center gap-2">
                                <TrendingUp size={18} className="lucide-trending-up" /> Carry Forward Previous FY Totals
                            </button>
                            <button onClick={handleInitialSetup} className="w-full md:w-auto px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-xl border border-gray-200 transition-all">
                                Start Blank
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto">
                        
                        {/* Goal Sync Notification */}
                        {unsyncedGoals.length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 animate-in slide-in-from-top-4">
                                <div>
                                    <h4 className="font-bold text-yellow-800 text-sm">You have {unsyncedGoals.length} active goal(s) not in your budget.</h4>
                                    <p className="text-xs text-yellow-700 mt-1">Include their yearly projected EMI amounts automatically.</p>
                                </div>
                                <button onClick={handleSyncGoals} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors whitespace-nowrap">
                                    Sync Goals
                                </button>
                            </div>
                        )}

                        {/* Summary Banner */}
                        <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 bg-white/5 rounded-full blur-3xl w-48 h-48 -translate-y-1/2 translate-x-1/4"></div>

                            <div className="relative z-10 flex-1 w-full">
                                <p className="text-gray-400 font-medium mb-1 tracking-wider uppercase text-xs">Projected End of Year Balance</p>
                                <h2 className={`text-3xl md:text-4xl font-black tracking-tight ${projectedEOY < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                    ₹ {projectedEOY.toLocaleString()}
                                </h2>
                            </div>

                            <div className="relative z-10 flex gap-8 md:gap-12 text-left bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10 w-full md:w-auto justify-between shrink-0">
                                <div>
                                    <p className="text-[10px] text-green-300 uppercase tracking-widest font-bold mb-1">Total Income (+)</p>
                                    <p className="font-bold text-2xl tracking-tight text-white">₹ {totalIncome.toLocaleString()}</p>
                                </div>
                                <div className="w-px bg-white/20"></div>
                                <div>
                                    <p className="text-[10px] text-red-300 uppercase tracking-widest font-bold mb-1">Total Expense (-)</p>
                                    <p className="font-bold text-2xl tracking-tight text-white">₹ {totalExpense.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Unified Layout: Start Bal -> Heads -> Close Bal implicitly by EOY */}
                        <div className="space-y-6 mt-6">
                            {/* 1. Starting Balances */}
                            {renderList('Starting Balances (Books)', activeBudget.books, 'book', 'bg-blue-500', 'text-gray-900')}

                            {/* 2. Projected Incomes and Expenses */}
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative z-10 flex flex-col md:flex-row">
                                {/* INCOMES LEFT */}
                                <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col">
                                    <div className="p-4 border-b border-gray-100 bg-green-50/50 flex justify-between items-center">
                                        <h3 className="text-xs font-extrabold text-green-700 uppercase tracking-widest">Incomes (Projected)</h3>
                                        <button onClick={() => openItemModal('income')} className="p-1 hover:bg-green-100 rounded-lg text-green-600 transition-colors"><Plus size={16} /></button>
                                    </div>
                                    <div className="flex-1 p-4 space-y-3">
                                        {activeBudget.incomes.map(item => (
                                            <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                                                <span 
                                                    className="font-bold text-gray-700 text-sm flex-1 cursor-pointer flex items-center gap-2" 
                                                    onClick={() => openItemModal('income', item)}
                                                >
                                                    {item.title}
                                                    <Edit2 size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-400 mr-1">₹</span>
                                                    <input 
                                                        type="number" 
                                                        value={item.amount} 
                                                        onChange={(e) => updateActiveBudget({ incomes: activeBudget.incomes.map(i => i.id === item.id ? { ...i, amount: parseFloat(e.target.value) || 0 } : i) })}
                                                        className="w-24 bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm font-black text-green-600 outline-none focus:border-green-300 transition-colors text-right"
                                                    />
                                                    <button onClick={() => removeItem(item.id, 'income')} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                                        <span className="font-bold text-gray-500 text-sm">TOTAL INCOME</span>
                                        <span className="font-black text-lg text-green-600">₹{totalIncome.toLocaleString()}</span>
                                    </div>
                                </div>
                                
                                {/* EXPENSES RIGHT */}
                                <div className="flex-1 flex flex-col">
                                    <div className="p-4 border-b border-gray-100 bg-red-50/50 flex justify-between items-center">
                                        <h3 className="text-xs font-extrabold text-red-700 uppercase tracking-widest">Expenses (Projected)</h3>
                                        <button onClick={() => openItemModal('expense')} className="p-1 hover:bg-red-100 rounded-lg text-red-600 transition-colors"><Plus size={16} /></button>
                                    </div>
                                    <div className="flex-1 p-4 space-y-3">
                                        {activeBudget.expenses.map(item => (
                                            <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                                                <span 
                                                    className="font-bold text-gray-700 text-sm flex-1 cursor-pointer flex items-center gap-2"
                                                    onClick={() => openItemModal('expense', item)}
                                                >
                                                    {item.title}
                                                    <Edit2 size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-gray-400 mr-1">₹</span>
                                                    <input 
                                                        type="number" 
                                                        value={item.amount} 
                                                        onChange={(e) => updateActiveBudget({ expenses: activeBudget.expenses.map(e_item => e_item.id === item.id ? { ...e_item, amount: parseFloat(e.target.value) || 0 } : e_item) })}
                                                        className="w-24 bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm font-black text-red-500 outline-none focus:border-red-300 transition-colors text-right"
                                                    />
                                                    <button onClick={() => removeItem(item.id, 'expense')} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                                        <span className="font-bold text-gray-500 text-sm">TOTAL EXPENSE</span>
                                        <span className="font-black text-lg text-red-500">₹{totalExpense.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
                    </div>
                </div>
            </div>

            {/* Custom Modal for Items */}
            {showItemModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="font-bold text-xl text-gray-800 tracking-tight">
                                {editingItemId ? 'Edit Item' : `Add Projected ${itemModalConfig.type}`}
                            </h2>
                        </div>
                        <form onSubmit={handleSaveItemModal} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Name / Title</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={itemModalConfig.title} 
                                    onChange={e => setItemModalConfig(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder={itemModalConfig.type === 'book' ? "e.g., Savings Account" : "e.g., Salary, Rent"}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:bg-white transition-all font-bold text-gray-800" 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Yearly Amount (₹)</label>
                                <input 
                                    type="number" 
                                    required 
                                    value={itemModalConfig.amount} 
                                    onChange={e => setItemModalConfig(prev => ({ ...prev, amount: e.target.value }))}
                                    placeholder="0"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:bg-white transition-all font-bold text-gray-800 num-input-no-arrow" 
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowItemModal(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-colors">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
