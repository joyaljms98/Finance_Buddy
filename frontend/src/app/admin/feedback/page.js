'use client';

import React, { useState, useContext, useEffect } from 'react';
import { PanelLeftOpen, PanelLeftClose, MessageSquare, Tag, Clock, User, Send, CheckCircle2, RefreshCw } from 'lucide-react';
import { AdminSidebarContext } from '@/components/AdminSidebarWrapper';
import { useFeedback } from '@/context/FeedbackContext';

const AdminFeedback = () => {
    const { isSidebarOpen, setIsSidebarOpen } = useContext(AdminSidebarContext);
    const { messages, addReply, updateStatus, refreshFeedback } = useFeedback();

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    // View state: 'All', 'User', 'Editor'
    const [viewFilter, setViewFilter] = useState('All');

    // Currently selected message to view/reply
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [replyText, setReplyText] = useState('');

    const filteredMessages = messages.filter(msg => {
        if (viewFilter === 'All') return true;
        return msg.senderRole === viewFilter;
    });

    const handleSendReply = () => {
        if (!replyText.trim() || !selectedMessage) return;

        addReply(selectedMessage.id, 'Admin', replyText);
        setReplyText('');

        // Update selected message locally to show the new reply immediately
        setSelectedMessage(prev => ({
            ...prev,
            status: 'Replied',
            replies: [...prev.replies, { sender: 'Admin', time: new Date().toISOString(), content: replyText }]
        }));
    };

    const handleMarkResolved = () => {
        if (!selectedMessage) return;
        updateStatus(selectedMessage.id, 'Resolved');
        setSelectedMessage(prev => ({ ...prev, status: 'Resolved' }));
    };

    const getStatusColor = (status) => {
        if (status === 'New') return 'bg-blue-100 text-blue-700 border-blue-200';
        if (status === 'Replied') return 'bg-amber-100 text-amber-700 border-amber-200';
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    };

    const getTypeColor = (type) => {
        if (type === 'Feature Request') return 'bg-purple-100 text-purple-700';
        if (type === 'Error Reporting') return 'bg-red-100 text-red-700';
        return 'bg-slate-100 text-slate-700'; // Feedback / Comment
    };

    return (
        <main className="flex-1 transition-all w-full flex text-gray-800 font-sans relative animate-in fade-in zoom-in-95 duration-500 h-full">
            <div className="flex-1 flex flex-col bg-gray-50/50 relative rounded-2xl shadow-sm m-4 border border-gray-100 overflow-hidden h-[calc(100vh-2rem)]">
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
                            <h1 className="text-xl font-bold text-gray-900">Feedback & Requests</h1>
                            <p className="text-sm text-gray-500">Manage messages from Users and Editors.</p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-hidden flex relative">

                    {/* Inbox List */}
                    <div className={`w-full md:w-1/3 min-w-[300px] bg-white border-r border-gray-100 flex flex-col ${selectedMessage ? 'hidden md:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-2 items-center">
                            {['All', 'User', 'Editor'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setViewFilter(filter)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex-1 ${viewFilter === filter
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                            <button
                                onClick={refreshFeedback}
                                className="p-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors shadow-sm focus:outline-none shrink-0"
                                title="Refresh Feedback"
                            >
                                <RefreshCw size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                            {filteredMessages.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">No messages found.</div>
                            ) : (
                                filteredMessages.map(msg => (
                                    <button
                                        key={msg.id}
                                        onClick={() => setSelectedMessage(msg)}
                                        className={`w-full text-left p-4 rounded-xl transition-all border ${selectedMessage?.id === msg.id
                                            ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
                                            : 'bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50 shadow-sm'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(msg.status)}`}>
                                                {msg.status}
                                            </span>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Clock size={12} />
                                                {isMounted ? new Date(msg.time).toLocaleDateString() : '...'}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-gray-900 line-clamp-1 mb-1">{msg.title}</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span className={`px-2 py-0.5 rounded ${getTypeColor(msg.type)}`}>{msg.type}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><User size={12} /> {msg.senderName} ({msg.senderRole})</span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Message Details & Thread */}
                    <div className={`flex-1 bg-gray-50/30 flex flex-col ${!selectedMessage ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
                        {!selectedMessage ? (
                            <div className="text-center text-gray-400 flex flex-col items-center">
                                <MessageSquare size={48} className="mb-4 opacity-20" />
                                <p>Select a message to view the thread</p>
                            </div>
                        ) : (
                            <>
                                {/* Thread Header */}
                                <div className="p-6 bg-white border-b border-gray-100 shrink-0">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedMessage.title}</h2>
                                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedMessage.status)}`}>
                                                    {selectedMessage.status}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(selectedMessage.type)} flex items-center gap-1`}>
                                                    <Tag size={14} /> {selectedMessage.type}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                className="md:hidden text-gray-500 p-2 bg-gray-100 rounded-lg"
                                                onClick={() => setSelectedMessage(null)}
                                            >
                                                Back
                                            </button>
                                            {selectedMessage.status !== 'Resolved' && (
                                                <button
                                                    onClick={handleMarkResolved}
                                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-medium transition-colors text-sm border border-emerald-200"
                                                >
                                                    <CheckCircle2 size={16} /> Mark Resolved
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Thread Messages */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                    {/* Original Message */}
                                    <div className="flex gap-4 max-w-3xl">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold shrink-0">
                                            {selectedMessage.senderName.charAt(0)}
                                        </div>
                                        <div className="bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100">
                                            <div className="flex justify-between items-baseline mb-2 gap-8">
                                                <span className="font-bold text-gray-900">{selectedMessage.senderName} <span className="text-xs font-normal text-gray-500 ml-1">({selectedMessage.senderRole})</span></span>
                                                <span className="text-xs text-gray-400">{isMounted ? new Date(selectedMessage.time).toLocaleString() : '...'}</span>
                                            </div>
                                            <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{selectedMessage.content}</p>
                                        </div>
                                    </div>

                                    {/* Replies */}
                                    {selectedMessage.replies.map((reply, idx) => (
                                        <div key={idx} className={`flex gap-4 max-w-3xl ${reply.sender === 'Admin' ? 'ml-auto flex-row-reverse' : ''}`}>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${reply.sender === 'Admin' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                                {reply.sender === 'Admin' ? 'A' : selectedMessage.senderName.charAt(0)}
                                            </div>
                                            <div className={`p-4 rounded-2xl shadow-sm border ${reply.sender === 'Admin' ? 'bg-blue-50 border-blue-100 rounded-tr-sm' : 'bg-white border-gray-100 rounded-tl-sm'}`}>
                                                <div className="flex justify-between items-baseline mb-2 gap-8">
                                                    <span className="font-bold text-gray-900">{reply.sender}</span>
                                                    <span className="text-xs text-gray-400">{isMounted ? new Date(reply.time).toLocaleString() : '...'}</span>
                                                </div>
                                                <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{reply.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Reply Input Area */}
                                {selectedMessage.status !== 'Resolved' && (
                                    <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                                        <div className="flex gap-2 max-w-4xl mx-auto">
                                            <textarea
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Write a reply..."
                                                className="flex-1 resize-none border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none h-14 custom-scrollbar"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendReply();
                                                    }
                                                }}
                                            />
                                            <button
                                                onClick={handleSendReply}
                                                disabled={!replyText.trim()}
                                                className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center shrink-0 w-14"
                                            >
                                                <Send size={20} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default AdminFeedback;
