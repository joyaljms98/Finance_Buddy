'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Target, Plus, Car, Home, Plane, AlertCircle, Trophy, ShoppingBag, Gift, Heart, Star, Smartphone, Laptop, Bike, Book, Coffee, Music, Camera, Briefcase, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

import GoalCard from '../../../components/goals/GoalCard';
import GoalModal from '../../../components/goals/GoalModal';
import FilterBar from '../../../components/goals/FilterBar';
import api from '../../../lib/api';
import { useUsers } from '../../../context/UsersContext';

function GoalsContent() {
    const { activeUser } = useUsers();
    // --- STATE ---
    const [goals, setGoals] = useState([]);
    const [activeTab, setActiveTab] = useState('active'); // 'active' | 'achievements'

    // Filtering & Sorting State
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('createdDate'); // createdDate, targetDate, priority, saved
    const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
    const [groupBy, setGroupBy] = useState('none'); // none, priority, status, icon

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentGoal, setCurrentGoal] = useState(null);

    // EXTENDED Icon Options
    const iconOptions = [
        { name: 'Target', component: <Target /> },
        { name: 'Trophy', component: <Trophy /> },
        { name: 'Car', component: <Car /> },
        { name: 'Home', component: <Home /> },
        { name: 'Travel', component: <Plane /> },
        { name: 'Emergency', component: <AlertCircle /> },
        { name: 'Shopping', component: <ShoppingBag /> },
        { name: 'Gift', component: <Gift /> },
        { name: 'Health', component: <Heart /> },
        { name: 'Dream', component: <Star /> },
        { name: 'Phone', component: <Smartphone /> },
        { name: 'Laptop', component: <Laptop /> },
        { name: 'Bike', component: <Bike /> },
        { name: 'Education', component: <Book /> },
        { name: 'Leisure', component: <Coffee /> },
        { name: 'Music', component: <Music /> },
        { name: 'Gadget', component: <Camera /> },
        { name: 'Work', component: <Briefcase /> },
        { name: 'Investment', component: <Zap /> },
    ];

    const colors = [
        'bg-purple-100 text-purple-600',
        'bg-red-100 text-red-600',
        'bg-blue-100 text-blue-600',
        'bg-green-100 text-green-600',
        'bg-orange-100 text-orange-600',
        'bg-teal-100 text-teal-600',
        'bg-gray-100 text-gray-600',
        'bg-pink-100 text-pink-600',
        'bg-indigo-100 text-indigo-600',
        'bg-yellow-100 text-yellow-600',
    ];

    // --- INITIAL DATA LOAD ---
    useEffect(() => {
        if (typeof window === 'undefined' || !activeUser?.user_id) return;
        
        const loadInitialData = async () => {
            let savedGoals = null;
            try {
                const res = await api.get('/sync/data');
                if (res.data && res.data.goals) {
                    savedGoals = res.data.goals;
                }
            } catch(e) { console.warn("Could not fetch goals from backend"); }
            
            if (!savedGoals) {
                const storageKey = `finance_buddy_goals_${activeUser.user_id}`;
                savedGoals = JSON.parse(localStorage.getItem(storageKey) || '[]');
            }
            
            // Migration: Add new fields if missing
            const migratedGoals = savedGoals.map(g => ({
            ...g,
            priority: g.priority || 3, // Default Priority: Medium (3)
            completedDate: g.completedDate || null,
            recurrence: g.recurrence || { type: 'monthly', day: 5 },
            // Ensure other fields exist
            paymentMethod: g.paymentMethod || 'emi',
            createdDate: g.createdDate || new Date().toISOString(),
            targetDate: g.targetDate || '',
            installments: g.installments || { emi: '', interest: '', tenure: '', billDate: '', shopName: '' }
        }));

        if (migratedGoals.length === 0) {
            migratedGoals.push({
                id: 'demo_goal',
                title: 'My first goal',
                saved: 500,
                target: 1000,
                iconIndex: 0,
                color: colors[0],
                status: 'active',
                priority: 3,
                paymentMethod: 'full',
                createdDate: new Date().toISOString(),
                targetDate: '',
                installments: { emi: '', interest: '', tenure: '' },
                recurrence: { type: 'monthly', day: 5 }
            });
        }

        setGoals(migratedGoals);
        };
        loadInitialData();
    }, [activeUser?.user_id]);

    // --- DEEP LINKING ---
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const openGoalId = searchParams.get('openGoalId');
        const createNew = searchParams.get('createNew');
        const defaultDate = searchParams.get('defaultDate');

        if (openGoalId && goals.length > 0) {
            const targetGoal = goals.find(g => g.id === Number(openGoalId));
            if (targetGoal) {
                handleOpenModal(targetGoal);
                router.replace('/dashboard/goals');
            }
        } else if (createNew) {
            // AUTO OPEN CREATE
            handleOpenModal(); // Get fresh default state

            // If date provided from calendar, override targetDate
            if (defaultDate) {
                const d = new Date(defaultDate);
                const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD

                // Update state immediately after open
                setCurrentGoal(prev => ({ ...prev, targetDate: dateStr }));
            }

            router.replace('/dashboard/goals');
        }
    }, [searchParams, goals, router]);

    // --- PERSISTENCE ---
    const saveGoalsToStorage = (updatedGoals) => {
        setGoals(updatedGoals);
        if (activeUser?.user_id) {
            localStorage.setItem(`finance_buddy_goals_${activeUser.user_id}`, JSON.stringify(updatedGoals));
        }
        
        // Sync to backend (exclude demo goal)
        const goalsToSync = updatedGoals.filter(g => g.id !== 'demo_goal');
        api.post('/sync/data', { goals: goalsToSync }).catch(e => console.error("Failed to sync goals"));
    };

    // --- HANDLERS ---

    const handleOpenModal = (goal = null) => {
        if (goal) {
            setCurrentGoal({ ...goal });
        } else {
            // New Goal Template
            setCurrentGoal({
                id: Date.now(),
                title: '',
                saved: 0,
                target: 0,
                iconIndex: 0,
                color: colors[0],
                status: 'active',
                priority: 3, // Default Medium
                paymentMethod: 'full',
                createdDate: new Date().toISOString(),
                targetDate: '',
                installments: { emi: '', interest: '', tenure: '' },
                recurrence: { type: 'monthly', day: 5 }
            });
        }
        setIsModalOpen(true);
    };

    const handleSaveGoal = () => {
        if (!currentGoal.title) return alert("Title is required!");

        // Check completion
        const wasCompleted = currentGoal.status === 'achieved';
        const isNowCompleted = Number(currentGoal.saved) >= Number(currentGoal.target) && Number(currentGoal.target) > 0;

        const goalToSave = {
            ...currentGoal,
            status: isNowCompleted ? 'achieved' : 'active',
            completedDate: isNowCompleted && !wasCompleted ? new Date().toISOString() : currentGoal.completedDate
        };

        let updatedGoals;
        if (goals.find(g => g.id === currentGoal.id)) {
            if (currentGoal.id === 'demo_goal') {
                goalToSave.id = Date.now(); // Promote to real goal
                updatedGoals = goals.map(g => g.id === 'demo_goal' ? goalToSave : g);
            } else {
                updatedGoals = goals.map(g => g.id === goalToSave.id ? goalToSave : g);
            }
        } else {
            const goalsWithoutDemo = goals.filter(g => g.id !== 'demo_goal');
            updatedGoals = [...goalsWithoutDemo, goalToSave];
        }

        saveGoalsToStorage(updatedGoals);

        // Notify Calendar
        setTimeout(() => window.dispatchEvent(new Event('finance_buddy_data_updated')), 50);

        setIsModalOpen(false);

        // Trigger Confetti if newly completed
        if (isNowCompleted && !wasCompleted) {
            triggerVictoryConfetti();
            setTimeout(() => setActiveTab('achievements'), 1500);
        }
    };

    const handleDeleteGoal = () => {
        if (window.confirm("Delete this goal?")) {
            const updated = goals.filter(g => g.id !== currentGoal.id);
            saveGoalsToStorage(updated);
            setTimeout(() => window.dispatchEvent(new Event('finance_buddy_data_updated')), 50);
            setIsModalOpen(false);
        }
    };

    const handleQuickEditSave = (id, newSavedValue) => {
        const g = goals.find(g => g.id === id);
        if (!g) return;

        const wasCompleted = g.status === 'achieved';
        const isNowCompleted = Number(newSavedValue) >= Number(g.target) && Number(g.target) > 0;

        const updatedGoals = goals.map(x => {
            if (x.id === id) {
                return {
                    ...x,
                    id: x.id === 'demo_goal' ? Date.now() : x.id, // Promote on quick edit
                    saved: newSavedValue,
                    status: isNowCompleted ? 'achieved' : x.status,
                    completedDate: isNowCompleted && !wasCompleted ? new Date().toISOString() : x.completedDate
                };
            }
            return x;
        });
        saveGoalsToStorage(updatedGoals);
        setTimeout(() => window.dispatchEvent(new Event('finance_buddy_data_updated')), 50);

        if (isNowCompleted && !wasCompleted) {
            triggerVictoryConfetti();
            setTimeout(() => setActiveTab('achievements'), 1500);
        }
    };

    const triggerVictoryConfetti = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    // --- PROCESSING DATA ---
    const processGoals = () => {
        // 1. Filter by Tab
        let processed = goals.filter(g =>
            activeTab === 'active' ? g.status !== 'achieved' : g.status === 'achieved'
        );

        // 2. Search
        if (searchTerm) {
            processed = processed.filter(g => g.title.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        // 3. Sort
        processed.sort((a, b) => {
            let valA = a[sortBy];
            let valB = b[sortBy];

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return processed;
    };

    const sortedGoals = processGoals();

    // Grouping Logic
    const renderGroupedGoals = () => {
        if (groupBy === 'none') return renderGrid(sortedGoals);

        // Group Helper
        const groups = {};
        sortedGoals.forEach(g => {
            let key = 'Other';
            if (groupBy === 'priority') {
                const labels = { 1: 'Critical', 2: 'High', 3: 'Medium', 4: 'Low', 5: 'Minimal' };
                key = labels[g.priority] || 'Unknown';
            } else if (groupBy === 'status') {
                key = g.status.toUpperCase();
            } else if (groupBy === 'icon') {
                key = iconOptions[g.iconIndex]?.name || 'Misc';
            }

            if (!groups[key]) groups[key] = [];
            groups[key].push(g);
        });

        return Object.keys(groups).map((key) => (
            <div key={key} className="mb-8">
                <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">{key}</h3>
                {renderGrid(groups[key])}
            </div>
        ));
    };

    const renderGrid = (list) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map(goal => (
                <GoalCard
                    key={goal.id}
                    goal={goal}
                    onClick={() => handleOpenModal(goal)}
                    onQuickEdit={handleQuickEditSave}
                    iconOptions={iconOptions}
                />
            ))}

            {/* Create Goal Card - Show only in Active tab and ONLY IF NOT GROUPED */}
            {activeTab === 'active' && groupBy === 'none' && (
                <div
                    onClick={() => handleOpenModal()}
                    className="border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center p-8 text-gray-400 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 transition cursor-pointer group h-auto min-h-[340px]"
                >
                    <div className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-md transition-all">
                        <Plus size={32} />
                    </div>
                    <span className="font-bold text-lg">Create New Goal</span>
                </div>
            )}
        </div>
    );

    return (
        <main className="flex-1 w-full h-[calc(100vh-64px)] md:h-screen flex flex-col text-gray-800 font-sans p-4 animate-in fade-in zoom-in-95 duration-500">
            {/* Header */}
            <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-xl shadow-inner">
                        <Target size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Goals</h1>
                        <p className="text-sm text-gray-500">Track targets and EMIs efficiently.</p>
                    </div>
                </div>

                    {/* Mode Toggle */}
                    <div className="bg-gray-100 p-1 rounded-xl flex items-center font-medium text-sm">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${activeTab === 'active' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Target size={16} /> Active Goals
                        </button>
                        <button
                            onClick={() => setActiveTab('achievements')}
                            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${activeTab === 'achievements' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Trophy size={16} /> Achievements
                        </button>
                    </div>
                </header>

                <div className="flex-1 flex flex-col bg-gray-50/50 relative shadow-sm border border-gray-100 overflow-y-auto rounded-2xl p-6">
                    {/* Filter Bar */}
                    <FilterBar
                        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                        sortBy={sortBy} setSortBy={setSortBy}
                        sortOrder={sortOrder} setSortOrder={setSortOrder}
                        groupBy={groupBy} setGroupBy={setGroupBy}
                    />

                    {/* Goals Content */}
                    {renderGroupedGoals()}

                    {/* Empty State */}
                    {sortedGoals.length === 0 && activeTab === 'achievements' && (
                        <div className="text-center py-20">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                <Trophy size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">No achievements yet</h3>
                            <p className="text-gray-500">Complete your active goals to see them here!</p>
                        </div>
                    )}

                    {/* Global Create Button for Grouped Views */}
                    {activeTab === 'active' && groupBy !== 'none' && (
                        <button
                            onClick={() => handleOpenModal()}
                            className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition z-40"
                        >
                            <Plus size={24} />
                        </button>
                    )}

                </div>

            {/* Modal */}
            <GoalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                goal={currentGoal}
                setGoal={setCurrentGoal}
                onSave={handleSaveGoal}
                onDelete={handleDeleteGoal}
                colors={colors}
                iconOptions={iconOptions}
            />
        </main>
    );
}

export default function GoalsPage() {
    return (
        <React.Suspense fallback={<div className="p-8 text-center">Loading goals...</div>}>
            <GoalsContent />
        </React.Suspense>
    );
}
