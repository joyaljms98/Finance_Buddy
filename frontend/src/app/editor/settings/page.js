'use client';

import React, { useState, useContext, useEffect } from 'react';
import { Settings, Shield, User, MessageSquare, Send, Bell, Lock, Activity, PanelLeftOpen, PanelLeftClose, Check, Plus, Tag, Clock, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { EditorSidebarContext } from '@/components/EditorSidebarWrapper';
import { usePermissions } from '@/context/PermissionsContext';
import { useFeedback } from '@/context/FeedbackContext';
import { useUsers } from '@/context/UsersContext';
import api from '@/lib/api';

const EditorSettings = () => {
    const { isSidebarOpen, setIsSidebarOpen } = useContext(EditorSidebarContext);
    const { roles } = usePermissions();
    const { messages, submitFeedback, addReply, refreshFeedback } = useFeedback();
    const { activeUser, updateUser, checkUserIdExists } = useUsers();

    const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'feedback'

    const [isMounted, setIsMounted] = useState(false);

    // Password Update State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
    const [isUpdatingPw, setIsUpdatingPw] = useState(false);
    const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Feedback State
    const [newMessage, setNewMessage] = useState('');
    const [replyText, setReplyText] = useState('');
    const [selectedThread, setSelectedThread] = useState(null);

    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== 'undefined' && window.location.hash === '#feedback-new') {
            setActiveTab('feedback');
            setSelectedThread('new');
            // Clear hash to prevent layout jump on refresh
            window.history.replaceState(null, '', window.location.pathname);
        }
    }, []);

    useEffect(() => {
        if (activeUser) {
            setProfileDataEmail(activeUser.email || '');
        }
    }, [activeUser]);

    const [profileDataEmail, setProfileDataEmail] = useState('');

    // Derived Data
    const myMessages = activeUser ? messages.filter(m => m.senderEmail === activeUser.email || m.senderName === activeUser.name) : [];

    const handleProfileUpdate = async () => {
        setProfileMessage({ type: '', text: '' });

        if (!profileDataEmail.trim()) {
            setProfileMessage({ type: 'error', text: 'Email cannot be empty.' });
            return;
        }

        const cleanEmail = profileDataEmail.trim().toLowerCase();

        if (cleanEmail === activeUser.email) {
            setProfileMessage({ type: 'error', text: 'No changes detected to email.' });
            return;
        }

        setIsUpdatingEmail(true);
        try {
            await updateUser(activeUser.id, { email: cleanEmail });
            setProfileMessage({ type: 'success', text: 'Email updated successfully.' });
        } catch (err) {
            setProfileMessage({ type: 'error', text: 'Failed to update email.' });
        } finally {
            setIsUpdatingEmail(false);
        }
    };

    const handlePasswordUpdate = async () => {
        setPasswordMessage({ type: '', text: '' });

        if (!currentPassword) {
            setPasswordMessage({ type: 'error', text: 'Please enter your current password.' });
            return;
        }
        if (!newPassword) {
            setPasswordMessage({ type: 'error', text: 'Please enter a new password.' });
            return;
        }
        if (newPassword.length < 6) {
            setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
            return;
        }
        if (newPassword === currentPassword) {
            setPasswordMessage({ type: 'error', text: 'New password must be different from the current password.' });
            return;
        }

        setIsUpdatingPw(true);
        try {
            await api.put('/auth/update-password', {
                current_password: currentPassword,
                new_password: newPassword
            });
            setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
            setCurrentPassword('');
            setNewPassword('');
        } catch (err) {
            setPasswordMessage({
                type: 'error',
                text: err.response?.data?.detail || 'Failed to update password. Current password may be incorrect.'
            });
        } finally {
            setIsUpdatingPw(false);
        }
    };

    const handleSendFeedback = () => {
        if (!newMessage.trim() || !activeUser) return;
        submitFeedback(
            activeUser.name,
            activeUser.role,
            'Feedback',
            newMessage.substring(0, 30) + '...',
            newMessage
        );
        setNewMessage('');
        setSelectedThread(null); // Go back to empty
    };

    const handleSendReply = () => {
        if (!replyText.trim() || !selectedThread || !activeUser) return;
        addReply(selectedThread.id, activeUser.name, replyText);
        setReplyText('');
    };

    useEffect(() => {
        if (selectedThread && selectedThread !== 'new') {
            const updatedThread = myMessages.find(m => m.id === selectedThread.id);
            if (updatedThread) {
                setSelectedThread(updatedThread);
            }
        }
    }, [myMessages, selectedThread]);

    if (!activeUser) return null; // Let the layout wrapper handle unauthenticated state

    return (
        <main className="flex-1 transition-all w-full flex text-gray-800 font-sans relative animate-in fade-in zoom-in-95 duration-500 h-full">
            <div className="flex-1 flex flex-col bg-gray-50/50 relative rounded-2xl shadow-sm m-4 border border-gray-100 overflow-hidden h-[calc(100vh-2rem)]">

                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors hidden md:block"
                            title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                        >
                            {isSidebarOpen ? <PanelLeftClose size={24} /> : <PanelLeftOpen size={24} />}
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Settings & Feedback</h1>
                            <p className="text-sm text-gray-500">Manage your profile credentials and contact admin.</p>
                        </div>
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
                                <User size={18} /> Account Details
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

                    {/* Settings Content Area */}
                    <div className="flex-1 overflow-y-auto bg-gray-50/30 w-full h-full">
                        {/* Mobile Tabs */}
                        <div className="md:hidden flex overflow-x-auto border-b border-gray-100 bg-white p-2 gap-2 hide-scrollbar">
                            <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-gray-600'}`}>Account</button>
                            <button onClick={() => setActiveTab('feedback')} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === 'feedback' ? 'bg-green-50 text-green-700' : 'text-gray-600'}`}>Feedback</button>
                        </div>

                        {/* PROFILE TAB */}
                        {activeTab === 'profile' && (
                            <div className="max-w-3xl mx-auto p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-3xl shadow-inner shrink-0">
                                            {activeUser.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 w-full">
                                            <h2 className="text-2xl font-bold text-gray-900">{activeUser.name}</h2>
                                            <p className="text-gray-500 mb-2">{activeUser.email}</p>
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
                                                <Activity size={12} /> Active Editor Profile
                                            </div>

                                            {/* Note from Admin */}
                                            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800 text-left">
                                                <strong>Note:</strong> Your Name, Role, User ID, and base permissions are managed by the System Administrator. You can only update your Login Email and Password here to protect your account.
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 space-y-6">
                                        {profileMessage.text && (
                                            <div className={`p-4 rounded-xl text-sm font-medium border ${profileMessage.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                                {profileMessage.text}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Login Email Address</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">@</span>
                                                    <input
                                                        type="email"
                                                        value={profileDataEmail}
                                                        onChange={(e) => setProfileDataEmail(e.target.value)}
                                                        className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-2">You use this email to log in.</p>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-gray-100">
                                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Lock size={18} className="text-gray-400" /> Password Updates</h3>
                                            <p className="text-sm text-gray-500 mb-4">Enter your current password to set a new one.</p>

                                            {passwordMessage.text && (
                                                <div className={`mb-4 p-4 rounded-xl text-sm font-medium border ${passwordMessage.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                                    {passwordMessage.text}
                                                </div>
                                            )}

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                                    <div className="relative w-full max-w-md">
                                                        <input
                                                            type={showCurrentPassword ? "text" : "password"}
                                                            placeholder="••••••••"
                                                            value={currentPassword}
                                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                                            className="w-full px-4 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                        >
                                                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password <span className="text-xs font-normal text-gray-400">(Min 6 chars)</span></label>
                                                    <div className="relative w-full max-w-md">
                                                        <input
                                                            type={showNewPassword ? "text" : "password"}
                                                            placeholder="Enter new password"
                                                            value={newPassword}
                                                            onChange={(e) => setNewPassword(e.target.value)}
                                                            className="w-full px-4 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                                        >
                                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4 flex justify-end">
                                                <button
                                                    onClick={handlePasswordUpdate}
                                                    disabled={isUpdatingPw}
                                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isUpdatingPw ? 'Updating...' : 'Update Password'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="pt-6 flex justify-end border-t border-gray-100">
                                            <button
                                                onClick={handleProfileUpdate}
                                                disabled={isUpdatingEmail}
                                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isUpdatingEmail ? 'Saving...' : 'Save Email Changes'}
                                            </button>
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
                                                    <MessageSquare size={20} className="text-green-600" /> Drop a Message to Admin
                                                </h2>
                                                <p className="text-sm text-gray-500 mb-6">Request new permissions, report a bug, or send general feedback.</p>

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
                                                    const isMine = reply.sender === activeUser.name;
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

export default EditorSettings;
