'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Calendar as CalIcon, ChevronLeft, Target, StickyNote } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useReminders } from '@/context/RemindersContext';

export default function RightSidebar({ isOpen, toggleSidebar, basePath = '/dashboard' }) {
    const router = useRouter(); // updated hook
    const { myReminders } = useReminders();
    const [currentDate, setCurrentDate] = useState(new Date());

    // Data State
    const [events, setEvents] = useState([]); // Unified list of all events
    const [selectedDateEvents, setSelectedDateEvents] = useState(null); // For popup
    const [selectedDate, setSelectedDate] = useState(null); // NEW: Track clicked date
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
    const [filterType, setFilterType] = useState('all'); // all, note, goal
    const [isMonthSelectorOpen, setIsMonthSelectorOpen] = useState(false);
    const [isYearSelectorOpen, setIsYearSelectorOpen] = useState(false);

    // Load & Parse Data
    useEffect(() => {
        // Only run on client to avoid hydration mismatch if using localStorage
        if (typeof window === 'undefined') return;

        const loadData = () => {
            const allEvents = [];

            // 1. NOTES (Reminders)
            const notes = JSON.parse(localStorage.getItem('finance_buddy_notes') || '[]');
            notes.forEach(note => {
                if (note.reminder) {
                    allEvents.push({
                        id: note.id,
                        title: note.title || 'Untitled Note',
                        date: new Date(note.reminder),
                        type: 'note',
                        color: 'bg-purple-500',
                        data: note
                    });
                }
            });

            // 2. GOALS (EMIs & Targets)
            const goals = JSON.parse(localStorage.getItem('finance_buddy_goals') || '[]');
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            goals.forEach(goal => {
                if (goal.status === 'achieved') return; // Skip completed

                // A. Target Date (One time)
                if (goal.targetDate) {
                    const tDate = new Date(goal.targetDate);
                    allEvents.push({
                        id: `${goal.id}-target`,
                        title: `Deadline: ${goal.title}`,
                        date: tDate,
                        type: 'goal-target',
                        color: 'bg-red-500',
                        data: goal
                    });
                }

                // B. EMI Recurrence (If matched)
                if (goal.paymentMethod === 'emi' && goal.recurrence) {
                    const { type, day } = goal.recurrence;

                    if (type === 'monthly') {
                        if (day <= daysInMonth) {
                            const emiDate = new Date(year, month, day);
                            allEvents.push({
                                id: `${goal.id}-emi-${month}`,
                                title: `EMI: ${goal.title}`,
                                date: emiDate,
                                type: 'goal-emi',
                                color: 'bg-blue-500',
                                data: goal
                            });
                        }
                    }
                }
            });

            // 3. GLOBAL REMINDERS
            if (myReminders) {
                myReminders.forEach(rem => {
                    if (rem.date) {
                        allEvents.push({
                            id: `global-${rem.id}`,
                            title: `🔔 ${rem.title}`,
                            date: new Date(rem.date),
                            type: 'note', // clicking acts like a note
                            color: 'bg-indigo-500',
                            data: {
                                id: `global_${rem.id}`,
                                title: rem.title,
                                content: rem.description,
                                reminder: rem.date,
                                isGlobal: true
                            }
                        });
                    }
                });
            }

            setEvents(allEvents);
        };

        loadData();

        // Listen for updates from other components
        window.addEventListener('finance_buddy_data_updated', loadData);

        return () => {
            window.removeEventListener('finance_buddy_data_updated', loadData);
        };
    }, [currentDate, myReminders]);

    // --- Calendar Logic ---
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const changeMonth = (offset) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
        setSelectedDateEvents(null); // Close popup
        setSelectedDate(null);
    };

    const setMonth = (monthIndex) => {
        setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1));
        setIsMonthSelectorOpen(false);
    };

    const setYear = (year) => {
        setCurrentDate(new Date(year, currentDate.getMonth(), 1));
        setIsYearSelectorOpen(false);
    };

    const isSameDay = (d1, d2) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const getEventsForDay = (day) => {
        const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        return events.filter(e => isSameDay(e.date, checkDate));
    };

    // --- Interaction ---
    const handleDateClick = (day, dayEvents, e) => {
        // Show Popup for ALL days (Empty or not)
        const rect = e.currentTarget.getBoundingClientRect();
        setPopupPosition({ x: rect.left - 280, y: rect.top }); // Align to left of sidebar mainly
        setSelectedDateEvents(dayEvents);
        setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day)); // Store clicked date
    };

    // !!! REPLACED router.push with state passing is tricky in Next.js without query params or Context !!!
    // Next.js App Router recommendation: Use URL search params or a Global Store / Context.
    // The original app used navigate(path, { state: ... }).
    // Next.js router.push doesn't support state object directly.
    // I will use query params instead: /dashboard/notes?openNoteId=...

    const navigateToItem = (event) => {
        if (event.type === 'note') {
            router.push(`${basePath}/notes?openNoteId=${event.data.id}`);
        } else if (event.type === 'goal-target' || event.type === 'goal-emi') {
            if (basePath === '/dashboard') {
                router.push(`${basePath}/goals?openGoalId=${event.data.id}`);
            }
        }
        // Mobile: auto-close sidebar?
        if (window.innerWidth < 768) toggleSidebar();
    };

    const createFromCalendar = (type) => {
        if (!selectedDate) return;

        // ISO String
        const dateStr = selectedDate.toISOString();

        if (type === 'note') {
            router.push(`${basePath}/notes?createNew=true&defaultDate=${dateStr}`);
        } else if (type === 'goal' && basePath === '/dashboard') {
            router.push(`${basePath}/goals?createNew=true&defaultDate=${dateStr}`);
        }

        toggleSidebar(); // Close sidebar after action
    };

    return (
        <>
            <div
                className={`fixed right-0 top-0 h-screen bg-white border-l border-gray-100 shadow-xl transition-all duration-500 ease-in-out z-40 flex flex-col ${isOpen ? 'w-80 translate-x-0' : 'w-0 translate-x-full opacity-0'
                    }`}
            >
                {/* Toggle Button */}
                <button
                    onClick={toggleSidebar}
                    className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors z-50"
                >
                    <ChevronRight size={20} />
                </button>

                {/* --- TOP SECTION (Calendar) --- */}
                <div className="flex-shrink-0 bg-white z-10 relative">

                    {/* Header */}
                    <div className="p-6 border-b border-gray-50 flex flex-col items-center mt-8">
                        <div className="bg-purple-100 p-3 rounded-full text-purple-600 mb-3">
                            <CalIcon size={24} />
                        </div>
                        <h3 className="font-bold text-gray-800">Smart Calendar</h3>
                        <p className="text-xs text-gray-400">Track EMIs, Goals & Notes</p>
                        <button 
                            onClick={() => { router.push('/dashboard/notes'); toggleSidebar(); }} 
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-2 flex items-center gap-1"
                        >
                            Manage Notes Reminders <ChevronRight size={12} />
                        </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-4 px-2 relative">
                            <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"><ChevronLeft size={18} /></button>

                            <div className="flex items-center gap-2 relative">
                                {/* Month Selector */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsMonthSelectorOpen(!isMonthSelectorOpen)}
                                        className="font-bold text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors"
                                    >
                                        {monthNames[currentDate.getMonth()]}
                                    </button>
                                    {isMonthSelectorOpen && (
                                        <div className="absolute top-full -left-8 mt-2 w-40 h-48 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 overflow-hidden">
                                            {/* ... Same UI ... */}
                                            <div className="h-full overflow-y-auto no-scrollbar snap-y snap-mandatory py-[76px] relative z-20">
                                                {monthNames.map((m, i) => (
                                                    <div
                                                        key={m}
                                                        onClick={() => setMonth(i)}
                                                        className={`h-10 flex items-center justify-center snap-center cursor-pointer text-sm transition-all duration-200 ${currentDate.getMonth() === i ? 'font-bold text-gray-900 scale-110' : 'text-gray-400 font-medium'}`}
                                                    >
                                                        {m}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Year Selector */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsYearSelectorOpen(!isYearSelectorOpen)}
                                        className="font-bold text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors"
                                    >
                                        {currentDate.getFullYear()}
                                    </button>
                                    {isYearSelectorOpen && (
                                        <div className="absolute top-full -left-8 mt-2 w-32 h-48 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 overflow-hidden">
                                            <div className="h-full overflow-y-auto no-scrollbar snap-y snap-mandatory py-[76px] relative z-20">
                                                {Array.from({ length: 101 }, (_, i) => currentDate.getFullYear() - 50 + i).map(y => (
                                                    <div
                                                        key={y}
                                                        onClick={() => setYear(y)}
                                                        className={`h-10 flex items-center justify-center snap-center cursor-pointer text-sm transition-all duration-200 ${currentDate.getFullYear() === y ? 'font-bold text-gray-900 scale-110' : 'text-gray-400 font-medium'}`}
                                                    >
                                                        {y}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"><ChevronRight size={18} /></button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, index) => <span key={`${d}-${index}`} className="text-xs text-gray-400 font-medium">{d}</span>)}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}

                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dailyEvents = getEventsForDay(day);
                                const isToday = isSameDay(new Date(), new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
                                const hasEvents = dailyEvents.length > 0;

                                return (
                                    <div
                                        key={day}
                                        onClick={(e) => handleDateClick(day, dailyEvents, e)}
                                        className={`flex flex-col items-center justify-center h-9 w-full relative rounded-lg transition-all shadow-sm border border-transparent cursor-pointer hover:bg-gray-50 hover:shadow-md hover:border-gray-100 ${!hasEvents && 'bg-white'}`}
                                    >
                                        <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-black text-white font-bold' : hasEvents ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                                            {day}
                                        </span>
                                        {hasEvents && (
                                            <div className="flex gap-0.5 mt-0.5">
                                                {dailyEvents.slice(0, 3).map((ev, idx) => (
                                                    <div key={idx} className={`w-1.5 h-1.5 rounded-full ${ev.color}`}></div>
                                                ))}
                                                {dailyEvents.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* --- BOTTOM SECTION (Upcoming List) --- */}
                <div className="flex-1 overflow-y-auto min-h-0 p-4 bg-gray-50/50 border-t border-gray-100" onClick={() => setSelectedDateEvents(null)}>
                    <div className="sticky top-0 bg-gray-50/95 pt-1 pb-3 backdrop-blur-sm z-10 flex items-center justify-between">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Upcoming
                        </h4>

                        {/* Filter Toggle */}
                        <div className="flex bg-gray-200/50 p-0.5 rounded-lg">
                            <button
                                onClick={() => setFilterType('all')}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${filterType === 'all' ? 'bg-white shadow text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                All
                            </button>
                            {/* ... other buttons ... */}
                            <button
                                onClick={() => setFilterType('note')}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${filterType === 'note' ? 'bg-white shadow text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Notes
                            </button>
                            {basePath === '/dashboard' && (
                                <button
                                    onClick={() => setFilterType('goal')}
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${filterType === 'goal' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Goals
                                </button>
                            )}
                        </div>
                    </div>

                    {events.filter(e => e.date >= new Date()).length === 0 ? (
                        <p className="text-center text-gray-400 text-xs mt-4">No upcoming events found.</p>
                    ) : (
                        <div className="space-y-3 pb-4">
                            {events
                                .filter(e => e.date >= new Date())
                                .filter(e => filterType === 'all' ? true : e.type.includes(filterType === 'note' ? 'note' : 'goal'))
                                .sort((a, b) => a.date - b.date)
                                .slice(0, 10)
                                .map((ev, idx) => (
                                    <div
                                        key={`${ev.id}-${idx}`}
                                        onClick={() => navigateToItem(ev)}
                                        className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex gap-3 items-start group hover:shadow-md transition-all cursor-pointer hover:border-blue-200"
                                    >
                                        {/* ... Item UI ... */}
                                        <div className={`${ev.color.replace('bg-', 'text-').replace('500', '600')} bg-opacity-10 p-2 rounded-lg shrink-0`}>
                                            {ev.type === 'note' ? <StickyNote size={14} /> : <Target size={14} />}
                                        </div>
                                        <div className="min-w-0">
                                            <h5 className="text-sm font-bold text-gray-800 line-clamp-1 break-all">{ev.title}</h5>
                                            <p className="text-[10px] text-gray-500 font-medium">
                                                {ev.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}

                </div>
            </div>

            {/* POPUP FOR MULTIPLE EVENTS OR CREATE */}
            {(selectedDateEvents || selectedDate) && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => { setSelectedDateEvents(null); setSelectedDate(null); }}></div>
                    <div
                        className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 w-64 animate-in zoom-in-95 duration-200"
                        style={{ top: popupPosition.y, left: popupPosition.x - 20 }} // Adjust position
                    >
                        {/* ... Popup UI ... */}
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">
                            {selectedDate ? selectedDate.toLocaleDateString() : 'Events'}
                        </h4>

                        {selectedDateEvents && selectedDateEvents.length > 0 ? (
                            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar mb-3">
                                {selectedDateEvents.map((ev, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => { navigateToItem(ev); setSelectedDateEvents(null); setSelectedDate(null); }}
                                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                    >
                                        <div className={`w-2 h-2 rounded-full ${ev.color} shrink-0`} />
                                        <span className="text-sm font-medium text-gray-700 truncate">{ev.title}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 mb-3 italic">No events.</p>
                        )}

                        <div className={`pt-2 border-t border-gray-100 grid ${basePath === '/dashboard' ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                            <button
                                onClick={() => createFromCalendar('note')}
                                className="flex flex-col items-center justify-center p-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 transition-colors"
                            >
                                <StickyNote size={16} className="mb-1" />
                                <span className="text-[10px] font-bold">Add Note</span>
                            </button>
                            {basePath === '/dashboard' && (
                                <button
                                    onClick={() => createFromCalendar('goal')}
                                    className="flex flex-col items-center justify-center p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                                >
                                    <Target size={16} className="mb-1" />
                                    <span className="text-[10px] font-bold">Add Goal</span>
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
