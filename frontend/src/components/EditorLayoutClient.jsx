'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUsers } from '@/context/UsersContext';
import NotesDrawer from './NotesDrawer';
import { PenTool, Bell, GripVertical } from 'lucide-react';

export default function EditorLayoutClient({ children }) {
    const router = useRouter();
    const { activeUser, isLoaded } = useUsers();

    // Notes & Reminder State
    const [isNotesOpen, setIsNotesOpen] = useState(false);
    const [activeReminder, setActiveReminder] = useState(null);
    const [bottomPos, setBottomPos] = useState(40);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef(0);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const checkReminders = () => {
            const notes = JSON.parse(localStorage.getItem('finance_buddy_notes') || '[]');
            const now = new Date();
            const found = notes.find(n => {
                if (!n.reminder) return false;
                const remDate = new Date(n.reminder);
                const diff = now - remDate;
                return diff >= 0 && diff < 60000;
            });
            if (found) setActiveReminder(found);
        };
        const interval = setInterval(checkReminders, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(false);
        dragStartPos.current = e.clientY;
        const handleMouseMove = (moveEvent) => {
            const newBottom = window.innerHeight - moveEvent.clientY - 30;
            const maxBottom = window.innerHeight - 80;
            const minBottom = 20;
            if (newBottom >= minBottom && newBottom <= maxBottom) {
                setBottomPos(newBottom);
                setIsDragging(true);
            }
        };
        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    useEffect(() => {
        if (isLoaded) {
            if (!activeUser || (activeUser.role !== 'Editor' && activeUser.role !== 'Admin')) {
                router.push('/login');
            }
        }
    }, [isLoaded, activeUser, router]);

    if (!isLoaded || !activeUser || (activeUser.role !== 'Editor' && activeUser.role !== 'Admin')) {
        return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 text-gray-500">Redirecting to Secure Login...</div>;
    }

    return (
        <>
            {children}
            <NotesDrawer isOpen={isNotesOpen} onClose={() => setIsNotesOpen(false)} />
            
            {/* Floating Action Button (Draggable) */}
            <div
                className="fixed right-8 z-50 flex flex-col gap-3 items-center group touch-none"
                style={{ bottom: `${bottomPos}px`, cursor: isDragging ? 'grabbing' : 'grab' }}
                onMouseDown={handleMouseDown}
            >
                <div className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1">
                    <GripVertical size={16} />
                </div>
                <button
                    onClick={() => !isDragging && setIsNotesOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-lg shadow-emerald-600/30 transition-all hover:scale-110 active:scale-95 flex items-center justify-center relative"
                    title="Quick Notes"
                >
                    <PenTool size={24} />
                    <span className="absolute -top-1 -right-1 bg-white w-3 h-3 rounded-full border-2 border-emerald-600"></span>
                </button>
            </div>

            {/* REMINDER TOAST */}
            {activeReminder && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500 border border-gray-700/50">
                    <div className="bg-emerald-500/20 p-2 rounded-full">
                        <Bell className="text-emerald-400 animate-bounce" size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">Reminder!</h4>
                        <p className="text-xs text-gray-300">{activeReminder.title}</p>
                    </div>
                    <button
                        onClick={() => setActiveReminder(null)}
                        className="ml-4 hover:bg-white/10 p-1 rounded-full transition-colors"
                    >
                        <span className="text-xs font-bold text-gray-400 hover:text-white">Done</span>
                    </button>
                </div>
            )}
        </>
    );
}
