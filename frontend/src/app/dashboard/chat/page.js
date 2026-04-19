'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Plus, MessageSquare, Search, Trash2, FileText, X, Save, Palette, PanelLeftClose, PanelLeftOpen, Settings2, AlertTriangle, ToggleLeft, ToggleRight, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

export default function ChatPage() {
    // --- STATE ---
    const [history, setHistory] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentChatId, setCurrentChatId] = useState(null);

    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'ai',
            text: "Hello! I'm your Finance Buddy. I can help you analyze expenses, plan taxes, or explain complex financial terms. What's on your mind today?"
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    // --- CHAT MODE ---
    const [chatMode, setChatMode] = useState('simple'); // 'simple' | 'context'

    // --- RAG SCOPE SETTINGS ---
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isScopeModified, setIsScopeModified] = useState(false);
    const [scopeSaved, setScopeSaved] = useState(false);
    const [ragScope, setRagScope] = useState({
        include_profile: true,
        include_rag_docs: true,
        include_cashbook: true,
        include_goals: false,
        include_budget: false
    });
    
    // --- ABORT CONTROLLER ---
    const abortControllerRef = useRef(null);

    // --- SELECTION STATE ---
    const [selectionMenu, setSelectionMenu] = useState({ x: 0, y: 0, visible: false, text: '' });
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [noteData, setNoteData] = useState({ title: '', content: '', color: 'bg-white' });

    // --- SIDEBAR TOGGLE STATE ---
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const bgColors = [
        { name: 'White', value: 'bg-white' },
        { name: 'Red', value: 'bg-red-50' },
        { name: 'Orange', value: 'bg-orange-50' },
        { name: 'Yellow', value: 'bg-yellow-50' },
        { name: 'Green', value: 'bg-green-50' },
        { name: 'Blue', value: 'bg-blue-50' },
        { name: 'Purple', value: 'bg-purple-50' },
    ];

    // --- INITIALIZATION & PERSISTENCE ---
    useEffect(() => {
        fetchHistory();
        const savedMode = localStorage.getItem('fb_chat_mode');
        const savedScope = localStorage.getItem('fb_chat_scope');
        if (savedMode) setChatMode(savedMode);
        if (savedScope) {
            try {
                setRagScope(JSON.parse(savedScope));
            } catch (e) {}
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('fb_chat_mode', chatMode);
    }, [chatMode]);

    useEffect(() => {
        localStorage.setItem('fb_chat_scope', JSON.stringify(ragScope));
    }, [ragScope]);

    const handleScopeChange = (key, value) => {
        setRagScope(prev => ({ ...prev, [key]: value }));
        setIsScopeModified(true);
        setScopeSaved(false);
    };

    const handleSaveScope = () => {
        localStorage.setItem('fb_chat_scope', JSON.stringify(ragScope));
        setIsScopeModified(false);
        setScopeSaved(true);
        setTimeout(() => {
            setScopeSaved(false);
            setIsSettingsOpen(false);
        }, 1500);
    };

    const fetchHistory = async () => {
        try {
            const res = await api.get('/chatbot/history');
            setHistory(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const loadChat = (chat) => {
        setCurrentChatId(chat.id);
        const loadedMessages = chat.messages || [];
        setMessages(loadedMessages);
    };

    // --- ACTIONS ---
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        const handleSelection = () => {
            const selection = window.getSelection();
            if (!selection || selection.isCollapsed || !chatContainerRef.current) {
                setSelectionMenu(prev => ({ ...prev, visible: false }));
                return;
            }

            const text = selection.toString().trim();
            if (!text) return;

            if (!chatContainerRef.current.contains(selection.anchorNode)) return;

            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            setSelectionMenu({
                x: rect.left + rect.width / 2,
                y: rect.top - 40,
                visible: true,
                text: text
            });
        };

        const handleClearSelection = (e) => {
            if (e.target.closest('#selection-menu-btn')) return;
            setSelectionMenu(prev => ({ ...prev, visible: false }));
        };

        document.addEventListener('mouseup', handleSelection);
        document.addEventListener('mousedown', handleClearSelection);

        return () => {
            document.removeEventListener('mouseup', handleSelection);
            document.removeEventListener('mousedown', handleClearSelection);
        };
    }, []);

    const handleAddToNote = () => {
        setNoteData({
            title: 'Chat Excerpt',
            content: selectionMenu.text,
            color: 'bg-white',
            folderId: 'default'
        });
        setSelectionMenu(prev => ({ ...prev, visible: false }));
        setIsNoteModalOpen(true);
    };

    const handleSaveNote = () => {
        if (typeof window === 'undefined') return;
        const savedNotes = JSON.parse(localStorage.getItem('finance_buddy_notes') || '[]');
        const newNote = {
            id: Date.now(),
            title: noteData.title || 'Untitled Chat Note',
            content: noteData.content,
            tags: ['#chat-excerpt'],
            color: noteData.color,
            folderId: 'default',
            isPinned: false,
            timestamp: new Date().toISOString(),
            reminder: ''
        };
        const updatedNotes = [newNote, ...savedNotes];
        localStorage.setItem('finance_buddy_notes', JSON.stringify(updatedNotes));
        setIsNoteModalOpen(false);
        window.getSelection()?.removeAllRanges();
    };

    const handleDeleteChat = async (e, chatId) => {
        e.stopPropagation();
        if (confirm("Delete this conversation?")) {
            try {
                await api.delete(`/chatbot/history/${chatId}`);
                if (currentChatId === chatId) {
                    startNewChat();
                }
                fetchHistory();
            } catch (err) {
                console.error("Failed to delete chat", err);
            }
        }
    }

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userText = input;
        const msgIdUser = Date.now().toString();
        const userMsg = { id: msgIdUser, sender: 'user', text: userText };
        
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        const aiMsgId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: aiMsgId, sender: 'ai', text: "" }]);

        // Initialize new AbortController for this request
        abortControllerRef.current = new AbortController();

        try {
            const token = localStorage.getItem('finance_buddy_token');
            const res = await fetch('http://localhost:8000/api/chatbot/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                signal: abortControllerRef.current.signal,
                body: JSON.stringify({
                    query: userText,
                    chat_mode: chatMode,
                    conversation_id: currentChatId,
                    include_profile: chatMode === 'context' ? ragScope.include_profile : false,
                    include_rag_docs: chatMode === 'context' ? ragScope.include_rag_docs : false,
                    include_cashbook: chatMode === 'context' ? ragScope.include_cashbook : false,
                    include_goals: chatMode === 'context' ? ragScope.include_goals : false,
                    include_budget: chatMode === 'context' ? ragScope.include_budget : false
                })
            });

            if (!res.ok) {
                throw new Error("Chat request failed");
            }

            // Capture conversation_id from response headers for new chats
            const convId = res.headers.get('X-Conversation-Id');
            if (convId && !currentChatId) {
                setCurrentChatId(convId);
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedAiText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                accumulatedAiText += chunk;
                
                setMessages(prev => 
                    prev.map(m => m.id === aiMsgId ? { ...m, text: accumulatedAiText } : m)
                );
            }

            // Refresh history to update sidebar
            fetchHistory();

        } catch (err) {
            if (err.name === 'AbortError') {
                console.log('Fetch aborted manually');
                setMessages(prev => 
                    prev.map(m => m.id === aiMsgId ? { ...m, text: (m.text || '') + " [Generation Stopped by User]" } : m)
                );
            } else {
                console.error(err);
                setMessages(prev => 
                    prev.map(m => m.id === aiMsgId ? { ...m, text: "Error communicating with the Finance Buddy backend." } : m)
                );
            }
        } finally {
            setIsTyping(false);
            abortControllerRef.current = null;
        }
    };

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };

    const startNewChat = () => {
        setCurrentChatId(null);
        setMessages([{
            id: Date.now(),
            sender: 'ai',
            text: "Hello! Starting a new session. How can I assist you with your finances?"
        }]);
    };

    const filteredHistory = history.filter(chat =>
        chat.title && chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <main className="flex-1 w-full h-[calc(100vh-64px)] md:h-screen flex flex-col text-gray-800 font-sans p-4 animate-in fade-in zoom-in-95 duration-500">

            <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 shrink-0 relative z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors md:block"
                        title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                    >
                        {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                    </button>
                    <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl shadow-inner">
                        <Bot size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AI Financial Advisor</h1>
                        <p className="text-sm text-gray-500">Ask me anything about your finances.</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 relative">
                    {/* Chat Mode Toggle */}
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 p-1">
                        <button
                            onClick={() => setChatMode('simple')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                chatMode === 'simple'
                                    ? 'bg-white text-blue-700 shadow-sm border border-gray-200'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Simple Chat
                        </button>
                        <button
                            onClick={() => setChatMode('context')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                chatMode === 'context'
                                    ? 'bg-white text-purple-700 shadow-sm border border-gray-200'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Context Chat
                        </button>
                    </div>

                    {/* Settings button (only in Context mode) */}
                    {chatMode === 'context' && (
                        <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="p-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 border border-gray-200 transition-colors shadow-sm">
                            <Settings2 size={20} />
                        </button>
                    )}

                    {isSettingsOpen && chatMode === 'context' && (
                        <div className="absolute top-12 right-0 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                            <h3 className="font-bold text-gray-900 mb-2 border-b border-gray-100 pb-2">Context Settings</h3>
                            <div className="bg-orange-50 text-orange-800 p-2 rounded-lg flex gap-2 items-start mb-4 text-xs">
                                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                                <span><strong>Warning:</strong> These options include more context and use more AI credits.</span>
                            </div>
                            
                            <div className="space-y-3">
                                <label className="flex items-center justify-between text-sm text-gray-800 font-medium cursor-pointer">
                                    <span>Profile Information</span>
                                    <input type="checkbox" checked={ragScope.include_profile} onChange={(e) => handleScopeChange('include_profile', e.target.checked)} className="accent-blue-600 w-4 h-4" />
                                </label>
                                <label className="flex items-center justify-between text-sm text-gray-800 font-medium cursor-pointer">
                                    <span>RAG Documents Library</span>
                                    <input type="checkbox" checked={ragScope.include_rag_docs} onChange={(e) => handleScopeChange('include_rag_docs', e.target.checked)} className="accent-blue-600 w-4 h-4" />
                                </label>
                                <label className="flex items-center justify-between text-sm text-gray-800 font-medium cursor-pointer">
                                    <span>Include CashBook Details</span>
                                    <input type="checkbox" checked={ragScope.include_cashbook} onChange={(e) => handleScopeChange('include_cashbook', e.target.checked)} className="accent-blue-600 w-4 h-4" />
                                </label>
                                <label className="flex items-center justify-between text-sm text-gray-800 font-medium cursor-pointer">
                                    <span>Include Goals</span>
                                    <input type="checkbox" checked={ragScope.include_goals} onChange={(e) => handleScopeChange('include_goals', e.target.checked)} className="accent-blue-600 w-4 h-4" />
                                </label>
                                <label className="flex items-center justify-between text-sm text-gray-800 font-medium cursor-pointer">
                                    <span>Include Budgets</span>
                                    <input type="checkbox" checked={ragScope.include_budget} onChange={(e) => handleScopeChange('include_budget', e.target.checked)} className="accent-blue-600 w-4 h-4" />
                                </label>
                            </div>

                            <button
                                onClick={handleSaveScope}
                                className={`mt-4 w-full py-2 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${
                                    scopeSaved
                                        ? 'bg-green-500 text-white'
                                        : isScopeModified
                                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                                disabled={!isScopeModified && !scopeSaved}
                            >
                                {scopeSaved ? (
                                    <><CheckCircle2 size={15} /> Saved!</>
                                ) : (
                                    <><Save size={15} /> Save Context Settings</>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Mode indicator */}
                    <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full border ${
                        chatMode === 'simple'
                            ? 'text-blue-600 bg-blue-50 border-blue-100'
                            : 'text-purple-600 bg-purple-50 border-purple-100'
                    }`}>
                        <span className={`w-2 h-2 rounded-full animate-pulse ${chatMode === 'simple' ? 'bg-blue-500' : 'bg-purple-500'}`}></span>
                        {chatMode === 'simple' ? 'Simple' : 'Context'}
                    </div>
                </div>
            </header>

            <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden relative z-10">
                {/* --- LEFT SIDEBAR (History) --- */}
                <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden shrink-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-full md:w-80' : 'w-0 border-none hidden overflow-hidden'}`}>
                <div className="p-6 border-b border-gray-50 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Chat History</h2>
                        <div className="flex items-center gap-1">
                            <button onClick={startNewChat} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
                                <Plus size={20} />
                            </button>
                            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {filteredHistory.length === 0 ? (
                        <div className="text-center text-gray-400 text-sm mt-10">No chats found.</div>
                    ) : (
                        filteredHistory.map(chat => (
                            <button
                                key={chat.id}
                                onClick={() => loadChat(chat)}
                                className={`group w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${currentChatId === chat.id
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <MessageSquare size={18} className={`shrink-0 ${currentChatId === chat.id ? 'fill-blue-200' : ''}`} />
                                    <div className="flex-1 truncate">
                                        <div className="truncate text-sm">{chat.title}</div>
                                        <div className="text-[10px] text-gray-400">
                                            {chat.messages?.length || 0} messages · {new Date(chat.updated_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <Trash2 size={16} onClick={(e) => handleDeleteChat(e, chat.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                            </button>
                        ))
                    )}
                </div>
                </div>

            {/* --- RIGHT MAIN CHAT AREA --- */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-full">

                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 relative">
                    <div className="max-w-3xl mx-auto space-y-6">
                        {messages.map((msg, i) => (
                            <div
                                key={msg.id || i}
                                className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.sender === 'ai'
                                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                                    : 'bg-white border border-gray-200 text-gray-600'
                                    }`}>
                                    {msg.sender === 'ai' ? <Bot size={20} /> : <User size={20} />}
                                </div>

                                <div className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm selection:bg-blue-200 selection:text-blue-900 whitespace-pre-wrap ${msg.sender === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                    }`}>
                                    {msg.text || (msg.sender === 'ai' && <span className="opacity-50 italic">Thinking...</span>)}
                                </div>
                            </div>
                        ))}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {selectionMenu.visible && (
                    <div
                        id="selection-menu-btn"
                        style={{
                            position: 'fixed',
                            left: `${selectionMenu.x}px`,
                            top: `${selectionMenu.y}px`,
                            transform: 'translate(-50%, -100%)',
                            zIndex: 50
                        }}
                        className="animate-in fade-in zoom-in duration-200"
                    >
                        <button
                            onClick={handleAddToNote}
                            className="flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded-lg shadow-xl text-xs font-medium hover:scale-105 transition-transform"
                        >
                            <FileText size={14} /> Add to Notes
                            <div className="w-2 h-2 bg-gray-900 rotate-45 absolute bottom-[-4px] left-1/2 -translate-x-1/2"></div>
                        </button>
                    </div>
                )}

                {isNoteModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
                        <div className={`w-full max-w-lg ${noteData.color} rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}>

                            <div className="flex items-center justify-between p-4 border-b border-black/5 bg-white/50 backdrop-blur-sm">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <FileText size={18} className="text-blue-600" /> Save to Notes
                                </h3>
                                <button onClick={() => setIsNoteModalOpen(false)} className="p-1 hover:bg-black/10 rounded-full text-gray-500 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={noteData.title}
                                        onChange={(e) => setNoteData({ ...noteData, title: e.target.value })}
                                        className="w-full bg-white/60 border border-black/10 rounded-xl px-4 py-2 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        placeholder="Note Title..."
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Content</label>
                                    <textarea
                                        value={noteData.content}
                                        onChange={(e) => setNoteData({ ...noteData, content: e.target.value })}
                                        className="w-full h-32 bg-white/60 border border-black/10 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none font-mono leading-relaxed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                                        <Palette size={12} /> Color
                                    </label>
                                    <div className="flex gap-2">
                                        {bgColors.map((c) => (
                                            <button
                                                key={c.name}
                                                onClick={() => setNoteData({ ...noteData, color: c.value })}
                                                className={`w-6 h-6 rounded-full border border-black/10 shadow-sm transition-transform hover:scale-110 ${c.value} ${noteData.color === c.value ? 'ring-2 ring-blue-500 ring-offset-1 scale-110' : ''}`}
                                                title={c.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-black/5 border-t border-black/5 flex justify-end gap-2">
                                <button
                                    onClick={() => setIsNoteModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-black/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveNote}
                                    className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-black shadow-lg hover:shadow-xl transition-all flex items-center gap-2 active:scale-95"
                                >
                                    <Save size={16} /> Save Note
                                </button>
                            </div>

                        </div>
                    </div>
                )}

                <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                    <form onSubmit={handleSend} className="max-w-3xl mx-auto relative flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isTyping}
                            placeholder={chatMode === 'simple' ? "Ask me anything..." : "Ask about taxes, savings, or investment strategies..."}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-300 block p-4 pr-12 shadow-sm outline-none transition-all disabled:opacity-50"
                        />
                        {isTyping ? (
                            <button
                                type="button"
                                onClick={handleStop}
                                className="absolute right-2 bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-lg transition-all shadow-md active:scale-95"
                                title="Force Stop Generation"
                            >
                                <div className="w-4 h-4 bg-white rounded-sm"></div>
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="absolute right-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2.5 rounded-lg transition-all shadow-md active:scale-95"
                            >
                                <Sparkles size={18} />
                            </button>
                        )}
                    </form>
                    <p className="text-center text-xs text-gray-400 mt-3">
                        AI can make mistakes. Please verify critical financial data.
                    </p>
                </div>

            </div>
            </div>
        </main>
    );
}
