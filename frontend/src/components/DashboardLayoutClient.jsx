'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import NotesDrawer from './NotesDrawer';
import { PenTool, Bell, GripVertical, Menu, Calendar, ChevronRight, ChevronLeft } from 'lucide-react';

export default function DashboardLayoutClient({ children }) {
    // Sidebar States
    const [isLeftOpen, setIsLeftOpen] = useState(true);
    const [isRightOpen, setIsRightOpen] = useState(false);

    // Existing States
    const [isNotesOpen, setIsNotesOpen] = useState(false);
    const [activeReminder, setActiveReminder] = useState(null);
    const pathname = usePathname();
    const isChatPage = pathname === '/dashboard/chat';

    // Dragging State
    const defaultBottom = isChatPage ? 128 : 40;
    const [bottomPos, setBottomPos] = useState(defaultBottom);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setBottomPos(isChatPage ? 128 : 40);
    }, [isChatPage]);

    // Screen Size & Initial State Setup
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) {
                setIsLeftOpen(false);
                setIsRightOpen(false);
            } else {
                setIsLeftOpen(true);
                setIsRightOpen(true);
            }
        };

        // Run once on mount
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Reminder Logic
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

    return (
        <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">

            {/* Overlay for mobile when sidebars are open */}
            {isMobile && (isLeftOpen || isRightOpen) && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 transition-opacity"
                    onClick={() => { setIsLeftOpen(false); setIsRightOpen(false); }}
                />
            )}

            {/* 1. LEFT SIDEBAR */}
            <Sidebar isOpen={isLeftOpen} toggleSidebar={() => setIsLeftOpen(!isLeftOpen)} />

            {/* 2. MAIN CONTENT WRAPPER */}
            <div
                className={`flex-1 flex flex-col min-h-screen relative transition-all duration-500 ease-in-out`}
                style={{
                    // On mobile, sidebars act as overlays, so zero margins.
                    marginLeft: (!isMobile && isLeftOpen) ? '16rem' : '0',
                    marginRight: (!isMobile && isRightOpen) ? '20rem' : '0',

                    // Only show padding for buttons if sidebar is closed OR we're on mobile
                    paddingLeft: isMobile ? '0.5rem' : (isLeftOpen ? '0' : '4rem'),
                    paddingRight: isMobile ? '0.5rem' : (isRightOpen ? '0' : '4rem'),
                }}
            >

                {/* 5. SIDEBAR TOGGLES (When closed) */}
                {!isLeftOpen && (
                    <button
                        onClick={() => setIsLeftOpen(true)}
                        className="fixed top-6 left-0 z-50 bg-white p-2 pl-2 rounded-r-xl shadow-lg border border-l-0 border-gray-200 text-gray-500 hover:text-blue-600 transition-all active:scale-95"
                        title="Open Menu"
                    >
                        <Menu size={20} />
                    </button>
                )}

                {!isRightOpen && (
                    <button
                        onClick={() => setIsRightOpen(true)}
                        className="fixed top-6 right-0 z-50 bg-white p-2 pr-2 rounded-l-xl shadow-lg border border-r-0 border-gray-200 text-gray-500 hover:text-blue-600 transition-all active:scale-95"
                        title="Open Calendar"
                    >
                        <Calendar size={20} />
                    </button>
                )}

                {/* Page Content */}
                {children}
            </div>

            {/* 3. RIGHT SIDEBAR */}
            <RightSidebar isOpen={isRightOpen} toggleSidebar={() => setIsRightOpen(!isRightOpen)} />

            {/* 4. NOTES DRAWER & FLOATING ACTION BUTTON */}
            <NotesDrawer isOpen={isNotesOpen} onClose={() => setIsNotesOpen(false)} />

            {/* Floating Action Button (Draggable) */}
            <div
                className="fixed right-8 z-50 flex flex-col gap-3 items-center group touch-none"
                style={{ bottom: `${bottomPos}px`, cursor: isDragging ? 'grabbing' : 'grab' }}
                onMouseDown={handleMouseDown}
            >
                {/* Drag Handle */}
                <div className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1">
                    <GripVertical size={16} />
                </div>

                {/* Main Button */}
                <button
                    onClick={() => !isDragging && setIsNotesOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg shadow-blue-600/30 transition-all hover:scale-110 active:scale-95 flex items-center justify-center relative"
                    title="Quick Notes"
                >
                    <PenTool size={24} />
                    {/* Badge */}
                    <span className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full border-2 border-white"></span>
                </button>
            </div>

            {/* REMINDER TOAST */}
            {activeReminder && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500 border border-gray-700/50">
                    <div className="bg-purple-500/20 p-2 rounded-full">
                        <Bell className="text-purple-400 animate-bounce" size={24} />
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
        </div>
    );
}
