import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import api from '@/lib/api';

const TestChatbotDrawer = ({ isOpen, onClose, defaultMode = 'simple' }) => {
    const [mode, setMode] = useState(defaultMode);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{ role: 'model', content: "Hello! I am ready to test my configuration. How can I help you today?" }]);
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (!isOpen) return null;

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsTyping(true);

        try {
            const token = localStorage.getItem('finance_buddy_token');
            const payload = {
                query: userMsg,
                chat_mode: mode === 'rag' ? 'context' : 'simple',
                include_profile: mode === 'rag',
                include_cashbook: mode === 'rag',
                include_budget: mode === 'rag',
                include_rag_docs: mode === 'rag'
            };

            const res = await fetch('http://localhost:8000/api/chatbot/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const reader = res.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let fullResponse = "";

            setMessages(prev => [...prev, { role: 'model', content: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, {stream: true});
                fullResponse += chunk;
                
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = fullResponse;
                    return newMessages;
                });
            }

        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: 'model', content: "Error communicating with backend endpoint. Check console for details." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white w-full max-w-md h-full relative z-10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <Bot size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900">Test Configuration</h2>
                            <p className="text-xs text-gray-500">Live test window</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Mode Switcher */}
                <div className="p-2 bg-gray-100 flex gap-2">
                    <button 
                        onClick={() => setMode('simple')} 
                        className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all flex justify-center items-center gap-1 ${mode === 'simple' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <MessageSquare size={14} /> Simple Chat
                    </button>
                    <button 
                        onClick={() => setMode('rag')} 
                        className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all flex justify-center items-center gap-1 ${mode === 'rag' ? 'bg-white shadow-sm text-purple-700 border border-purple-100' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Sparkles size={14} /> RAG Context Chat
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-purple-100 text-purple-600'}`}>
                                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>
                            <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm shadow-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'}`}>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    
                    {isTyping && (
                        <div className="flex gap-3 max-w-[85%]">
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                <Bot size={16} />
                            </div>
                            <div className="p-3 bg-white border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin text-purple-400" />
                                <span className="text-sm text-gray-400">Generating response...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100">
                    <div className="relative flex items-center">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a test message..."
                            disabled={isTyping}
                            className="w-full pl-4 pr-12 py-3 bg-gray-100 border-transparent focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-100 rounded-full text-sm outline-none transition-all disabled:opacity-50"
                        />
                        <button 
                            type="submit" 
                            disabled={!input.trim() || isTyping}
                            className="absolute right-2 p-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-full transition-colors"
                        >
                            <Send size={16} className="ml-0.5" />
                        </button>
                    </div>
                    <div className="text-center mt-2">
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Using Live Settings</span>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default TestChatbotDrawer;
