'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Bell, Lock, MessageSquare, Send, Plus, Clock, Shield, Check, AlertCircle, LogOut, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useFeedback } from '@/context/FeedbackContext';
import { useUsers } from '@/context/UsersContext';
import api from '../../../lib/api';

export default function Settings() {
    const router = useRouter();
    const { messages, submitFeedback, addReply, refreshFeedback } = useFeedback();
    const [activeTab, setActiveTab] = useState('profile');

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    const { activeUser } = useUsers();

    // Feedback State
    const [newMessage, setNewMessage] = useState('');
    const [replyText, setReplyText] = useState('');
    const [selectedThread, setSelectedThread] = useState(null);

    // Password Update State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [pwStatus, setPwStatus] = useState({ type: '', msg: '' });
    const [isUpdatingPw, setIsUpdatingPw] = useState(false);
    const [showPw1, setShowPw1] = useState(false);
    const [showPw2, setShowPw2] = useState(false);

    // Mock Regular User fallback (if context not loaded immediately)
    const displayUser = activeUser || {
        name: 'Jane User',
        email: 'jane@example.com',
        role: 'User',
    };

    const myMessages = messages.filter(m => m.senderEmail === displayUser.email || m.senderName === displayUser.name);

    const handleSendFeedback = () => {
        if (!newMessage.trim()) return;
        submitFeedback(
            displayUser.name,
            displayUser.role,
            'Feedback',
            newMessage.substring(0, 30) + '...',
            newMessage
        );
        setNewMessage('');
        setSelectedThread(null);
    };

    const handleSendReply = () => {
        if (!replyText.trim() || !selectedThread) return;
        addReply(selectedThread.id, displayUser.name, replyText);
        setReplyText('');
    };

    const handlePasswordUpdate = async () => {
        if (!currentPassword || !newPassword) {
            setPwStatus({ type: 'error', msg: 'Please fill in both password fields.' });
            return;
        }

        setIsUpdatingPw(true);
        setPwStatus({ type: '', msg: '' });

        try {
            await api.put('/auth/update-password', {
                current_password: currentPassword,
                new_password: newPassword
            });
            setPwStatus({ type: 'success', msg: 'Password updated successfully!' });
            setCurrentPassword('');
            setNewPassword('');
        } catch (err) {
            setPwStatus({
                type: 'error',
                msg: err.response?.data?.detail || 'Failed to update password.'
            });
        } finally {
            setIsUpdatingPw(false);
        }
    };

    return (
        <main className="flex-1 transition-all w-full flex text-gray-800 font-sans relative animate-in fade-in zoom-in-95 duration-500 h-full">
            <div className="flex-1 flex flex-col bg-gray-50/50 relative rounded-2xl shadow-sm m-4 border border-gray-100 overflow-hidden h-[calc(100vh-2rem)]">

                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Account Settings & Help</h1>
                        <p className="text-sm text-gray-500">Manage your profile and contact support.</p>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* Settings Sidebar Navigation */}
                    <div className="w-64 border-r border-gray-100 bg-white p-4 hidden md:block overflow-y-auto">
                        <nav className="space-y-1">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors font-medium ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <User size={18} /> Profile & Security
                            </button>
                            <button
                                onClick={() => setActiveTab('notifications')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors font-medium ${activeTab === 'notifications' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Bell size={18} /> Notifications
                            </button>
                            <button
                                onClick={() => { setActiveTab('feedback'); setSelectedThread(null); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors font-medium ${activeTab === 'feedback' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <MessageSquare size={18} /> Feedback & Help
                            </button>
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto bg-gray-50/30">
                        {/* Mobile Tabs */}
                        <div className="md:hidden flex overflow-x-auto border-b border-gray-100 bg-white p-2 gap-2 hide-scrollbar">
                            <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-gray-600'}`}>Profile</button>
                            <button onClick={() => setActiveTab('notifications')} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === 'notifications' ? 'bg-purple-50 text-purple-700' : 'text-gray-600'}`}>Notifications</button>
                            <button onClick={() => setActiveTab('feedback')} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === 'feedback' ? 'bg-green-50 text-green-700' : 'text-gray-600'}`}>Feedback</button>
                        </div>

                        {/* PROFILE TAB */}
                        {activeTab === 'profile' && (
                            <div className="max-w-3xl mx-auto p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                                    <div className="p-6 flex flex-col md:flex-row items-start gap-4">
                                        <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                            <User size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900">Profile Information</h3>
                                            <p className="text-sm text-gray-500 mb-4">View your registered details.</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
                                                    <input type="text" value={displayUser.name} readOnly className="w-full p-2.5 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Email Address</label>
                                                    <input type="email" value={displayUser.email} readOnly className="w-full p-2.5 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none" />
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1"><Shield size={12} /> Basic profile details are managed by the administrator.</p>
                                        </div>
                                    </div>

                                    <div className="p-6 flex flex-col md:flex-row items-start gap-4">
                                        <div className="bg-green-100 p-3 rounded-full text-green-600 shrink-0">
                                            <Lock size={24} />
                                        </div>
                                        <div className="flex-1 w-full">
                                            <h3 className="font-bold text-gray-900">Security</h3>
                                            <p className="text-sm text-gray-500 mb-4">Change your account password.</p>

                                            {pwStatus.msg && (
                                                <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-sm ${pwStatus.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                                                    {pwStatus.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
                                                    {pwStatus.msg}
                                                </div>
                                            )}

                                            <div className="space-y-4">
                                                <div className="relative w-full max-w-sm">
                                                    <input
                                                        type={showPw1 ? "text" : "password"}
                                                        placeholder="Current Password"
                                                        value={currentPassword}
                                                        onChange={e => setCurrentPassword(e.target.value)}
                                                        className="w-full p-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all pr-10"
                                                    />
                                                    <button type="button" onClick={() => setShowPw1(!showPw1)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                                                        {showPw1 ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                                <div className="relative w-full max-w-sm">
                                                    <input
                                                        type={showPw2 ? "text" : "password"}
                                                        placeholder="New Password"
                                                        value={newPassword}
                                                        onChange={e => setNewPassword(e.target.value)}
                                                        className="w-full p-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all block pr-10"
                                                    />
                                                    <button type="button" onClick={() => setShowPw2(!showPw2)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                                                        {showPw2 ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handlePasswordUpdate}
                                            disabled={isUpdatingPw}
                                            className="text-white bg-green-600 px-6 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 mt-4 md:mt-0 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                        >
                                            {isUpdatingPw ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </div>

                                    {/* Logout Section */}
                                    <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-red-100 p-3 rounded-full text-red-600 shrink-0">
                                                <LogOut size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">Sign Out</h3>
                                                <p className="text-sm text-gray-500">Log out of your account securely.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => router.push('/login')}
                                            className="text-white bg-red-600 px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-sm active:scale-95"
                                        >
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* NOTIFICATIONS TAB */}
                        {activeTab === 'notifications' && (
                            <div className="max-w-3xl mx-auto p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-start gap-4">
                                    <div className="bg-purple-100 p-3 rounded-full text-purple-600 shrink-0">
                                        <Bell size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-gray-900">Email Alerts</h3>
                                            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold border border-amber-200">Preview - Work in progress for Next update</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-6">Manage what we send to your inbox.</p>

                                        <div className="space-y-4">
                                            <label className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 text-sm">Product Updates</h4>
                                                    <p className="text-xs text-gray-500 mt-0.5">News about new features and tools.</p>
                                                </div>
                                                <div className="w-10 h-6 bg-blue-600 rounded-full relative">
                                                    <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                                                </div>
                                            </label>
                                            <label className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 text-sm">Account Activity</h4>
                                                    <p className="text-xs text-gray-500 mt-0.5">Security alerts and login notifications.</p>
                                                </div>
                                                <div className="w-10 h-6 bg-blue-600 rounded-full relative">
                                                    <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* FEEDBACK TAB */}
                        {activeTab === 'feedback' && (
                            <div className="flex-1 flex overflow-hidden w-full h-full">

                                {/* Left Sidebar - Messages List */}
                                <div className={`w-full md:w-1/3 min-w-[300px] bg-white border-r border-gray-100 flex flex-col ${selectedThread && selectedThread !== 'new' ? 'hidden md:flex' : 'flex'}`}>
                                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-2">
                                        <button
                                            onClick={() => setSelectedThread('new')}
                                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors shadow-sm"
                                        >
                                            <Plus size={18} /> New Conversation
                                        </button>
                                        <button
                                            onClick={refreshFeedback}
                                            className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-xl transition-colors shadow-sm focus:outline-none"
                                            title="Refresh Conversations"
                                        >
                                            <RefreshCw size={18} />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 bg-gray-50/30">
                                        {myMessages.length === 0 ? (
                                            <div className="p-8 text-center text-gray-400">No conversations yet.</div>
                                        ) : (
                                            myMessages.map(msg => (
                                                <button
                                                    key={msg.id}
                                                    onClick={() => setSelectedThread(msg)}
                                                    className={`w-full text-left p-4 rounded-xl transition-all border ${selectedThread?.id === msg.id
                                                        ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
                                                        : 'bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50 shadow-sm'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${msg.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                            msg.status === 'Replied' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                                'bg-blue-100 text-blue-700 border-blue-200'
                                                            }`}>
                                                            {msg.status}
                                                        </span>
                                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                                            <Clock size={12} />
                                                            {isMounted ? new Date(msg.time).toLocaleDateString() : '...'}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-bold text-gray-900 line-clamp-1 mb-1">{msg.title}</h4>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                                                        <MessageSquare size={12} /> {msg.replies.length} replies
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Right Pane - Chat Window / Create Form */}
                                <div className={`flex-1 flex flex-col bg-gray-50/30 ${!selectedThread && selectedThread !== 'new' ? 'hidden md:flex items-center justify-center' : 'flex'}`}>

                                    {!selectedThread ? (
                                        <div className="text-center text-gray-400 flex flex-col items-center">
                                            <MessageSquare size={48} className="mb-4 opacity-20" />
                                            <p>Select a conversation or start a new one.</p>
                                        </div>
                                    ) : selectedThread === 'new' ? (
                                        <div className="p-8 max-w-2xl w-full mx-auto animate-in fade-in slide-in-from-bottom-4">
                                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -z-10 blur-xl"></div>
                                                <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                    <MessageSquare size={20} className="text-green-600" /> Drop a Message to Support
                                                </h2>
                                                <p className="text-sm text-gray-500 mb-6">Need help with your account or found a bug? Let us know.</p>

                                                <div className="flex flex-col gap-4">
                                                    <textarea
                                                        value={newMessage}
                                                        onChange={(e) => setNewMessage(e.target.value)}
                                                        placeholder="Type your message here..."
                                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none bg-gray-50 min-h-[150px] custom-scrollbar"
                                                    />
                                                    <div className="flex justify-end gap-3">
                                                        <button
                                                            onClick={() => setSelectedThread(null)}
                                                            className="px-6 py-2.5 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={handleSendFeedback}
                                                            disabled={!newMessage.trim()}
                                                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                        >
                                                            <Send size={16} /> Send Message
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col overflow-hidden h-full relative">
                                            {/* Thread Header */}
                                            <div className="p-4 md:p-6 bg-white border-b border-gray-100 shrink-0">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <button
                                                                className="md:hidden text-gray-500 p-1.5 -ml-2 bg-gray-100 rounded-lg"
                                                                onClick={() => setSelectedThread(null)}
                                                            >
                                                                ←
                                                            </button>
                                                            <h2 className="text-lg font-bold text-gray-900 line-clamp-1">{selectedThread.title}</h2>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-3 text-sm md:ml-0 ml-8">
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${selectedThread.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                                selectedThread.status === 'Replied' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                                    'bg-blue-100 text-blue-700 border-blue-200'
                                                                }`}>
                                                                {selectedThread.status}
                                                            </span>
                                                            <span className="text-gray-400 text-xs">
                                                                Started {isMounted ? new Date(selectedThread.time).toLocaleDateString() : '...'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Thread Messages */}
                                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-gray-50/50">
                                                {/* Original Message */}
                                                <div className="flex gap-4 max-w-3xl ml-auto flex-row-reverse">
                                                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                                                        {selectedThread.senderName.charAt(0)}
                                                    </div>
                                                    <div className="bg-blue-50 p-4 rounded-2xl rounded-tr-sm shadow-sm border border-blue-100">
                                                        <div className="flex justify-between items-baseline mb-2 gap-8">
                                                            <span className="font-bold text-gray-900">You</span>
                                                            <span className="text-xs text-gray-400">{isMounted ? new Date(selectedThread.time).toLocaleString() : '...'}</span>
                                                        </div>
                                                        <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">{selectedThread.content}</p>
                                                    </div>
                                                </div>

                                                {/* Replies */}
                                                {selectedThread.replies.map((reply, idx) => {
                                                    const isMine = reply.sender === displayUser.name;
                                                    return (
                                                        <div key={idx} className={`flex gap-4 max-w-3xl ${isMine ? 'ml-auto flex-row-reverse' : ''}`}>
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${isMine ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                                                                {isMine ? 'Y' : 'A'}
                                                            </div>
                                                            <div className={`p-4 rounded-2xl shadow-sm border ${isMine ? 'bg-blue-50 border-blue-100 rounded-tr-sm' : 'bg-white border-gray-100 rounded-tl-sm'}`}>
                                                                <div className="flex justify-between items-baseline mb-2 gap-8">
                                                                    <span className="font-bold text-gray-900">{isMine ? 'You' : reply.sender}</span>
                                                                    <span className="text-xs text-gray-400">{isMounted ? new Date(reply.time).toLocaleString() : '...'}</span>
                                                                </div>
                                                                <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">{reply.content}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Reply Input Area */}
                                            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                                                {selectedThread.status === 'Resolved' ? (
                                                    <div className="text-center p-3 bg-gray-50 text-gray-500 rounded-xl text-sm font-medium border border-gray-100">
                                                        This conversation is marked as resolved.
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2 max-w-4xl mx-auto">
                                                        <input
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                            placeholder="Write a reply..."
                                                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleSendReply();
                                                            }}
                                                        />
                                                        <button
                                                            onClick={handleSendReply}
                                                            disabled={!replyText.trim()}
                                                            className="bg-blue-600 text-white px-5 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center shrink-0"
                                                        >
                                                            <Send size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </main>
    );
};
