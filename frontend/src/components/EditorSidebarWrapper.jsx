'use client';

import React, { useState, createContext } from 'react';
import EditorSidebar from './EditorSidebar';
import RightSidebar from './RightSidebar';
import { ChevronLeft } from 'lucide-react';

export const EditorSidebarContext = createContext();

export default function EditorSidebarWrapper({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

    return (
        <EditorSidebarContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
            <div className="h-screen bg-slate-50 relative flex overflow-hidden">
                {/* Sidebar */}
                <EditorSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

                {/* Main Content */}
                <div
                    className={`flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar transition-all duration-300 ease-in-out`}
                    style={{
                        marginLeft: isSidebarOpen ? '16rem' : '0',
                        marginRight: isRightSidebarOpen ? '20rem' : '0'
                    }}
                >
                    {/* Page Content */}
                    <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col items-center">
                        {children}
                    </div>
                </div>

                {!isRightSidebarOpen && (
                    <button
                        onClick={() => setIsRightSidebarOpen(true)}
                        className="fixed top-1/2 -translate-y-1/2 right-0 z-50 bg-white p-2 pr-1 rounded-l-xl shadow-lg border border-r-0 border-gray-200 text-gray-500 hover:text-blue-600 transition-all active:scale-95"
                        title="Open Calendar"
                    >
                        <ChevronLeft size={20} />
                    </button>
                )}

                <RightSidebar isOpen={isRightSidebarOpen} toggleSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)} basePath="/editor" />
            </div>
        </EditorSidebarContext.Provider>
    );
}
