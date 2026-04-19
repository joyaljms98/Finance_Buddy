'use client';

import React, { useContext, useState } from 'react';
import { Bot, Save, Database, Sliders, MessageSquare, PanelLeftOpen, PanelLeftClose, AlertTriangle, Lock, RefreshCw, Loader2, CheckCircle2 } from 'lucide-react';
import { EditorSidebarContext } from '@/components/EditorSidebarWrapper';
import { usePermissions } from '@/context/PermissionsContext';
import { useUsers } from '@/context/UsersContext';
import RAGDocsViewer from '@/components/RAGDocsViewer';
import TestChatbotDrawer from '@/components/TestChatbotDrawer';
import api from '@/lib/api';

const EditorChatbot = () => {
    const { isSidebarOpen, setIsSidebarOpen } = useContext(EditorSidebarContext);
    const [isTestDrawerOpen, setIsTestDrawerOpen] = useState(false);
    const [reindexState, setReindexState] = useState({ status: 'idle', progress: 0, total: 0 });
    const { checkPermission } = usePermissions();
    const { activeUser } = useUsers();
    const editorId = activeUser?.user_id;
    const canEditSettings = checkPermission('Editor', 'chatbot', 'edit', editorId);

    const [settings, setSettings] = useState({
        rag_folder_path: '',
        ai_model: 'gemini-2.0-flash',
        provider: 'gemini',
        ollama_endpoint: 'http://127.0.0.1:11434',
        embedding_model: 'gemini-embedding-001',
        temperature: 0.7,
        max_tokens: 500,
        chunk_size: 1000,
        top_k: 5,
        system_prompt: `You are Finance Buddy, an AI financial advisor designed for the Indian context. \nYour goal is to help users manage their personal finances, explain tax concepts, and provide budgeting advice.\n\nRules:\n1. Always be polite and encouraging.\n2. Use Simple English.\n3. When discussing tax, refer to the latest Indian IT Act laws (FY 2025-26).\n4. Do not provide specific stock recommendations (e.g., "Buy Reliance"). instead, explain concepts (e.g., "What is a Blue-chip stock?").`,
        api_key: ''
    });
    const [initialSettings, setInitialSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [ollamaModels, setOllamaModels] = useState([]);

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/chatbot/settings');
                if (res.data) {
                    setSettings(res.data);
                    setInitialSettings(res.data);
                }
            } catch (err) {
                console.error("Failed to load settings", err);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchModels = async () => {
            try {
                const res = await api.get('/chatbot/ollama_models');
                if (res.data && res.data.models) {
                    setOllamaModels(res.data.models);
                }
            } catch (err) {
                console.error("Failed to fetch ollama models", err);
            }
        };

        fetchSettings();
        fetchModels();
    }, []);

    const isDirty = JSON.stringify(settings) !== JSON.stringify(initialSettings);

    const handleSave = async () => {
        try {
            const res = await api.post('/chatbot/settings', settings);
            setInitialSettings(res.data);
            setSettings(res.data);
            alert("Chatbot & RAG Settings saved successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to save settings.");
        }
    };

    const handleReindex = async () => {
        try {
            await api.post('/chatbot/reindex', {});
            setReindexState({ status: 'indexing', progress: 0, total: 0 });
            startPolling();
        } catch (err) {
            console.error(err);
            alert("Failed to start re-indexing. Please check your folder path.");
        }
    };

    const startPolling = () => {
        const poll = setInterval(async () => {
            try {
                const res = await api.get('/chatbot/reindex/progress');
                setReindexState(res.data);
                if (res.data.status !== 'indexing') {
                    clearInterval(poll);
                }
            } catch (e) { clearInterval(poll); }
        }, 1500);
    };

    return (
        <main className="flex-1 transition-all w-full flex text-gray-800 font-sans relative animate-in fade-in zoom-in-95 duration-500 h-full">
            <div className="flex-1 flex flex-col bg-gray-50/50 relative rounded-2xl shadow-sm m-4 border border-gray-100 overflow-hidden h-[calc(100vh-2rem)]">
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
                            <h1 className="text-xl font-bold text-gray-900">Chatbot & RAG Settings (Editor)</h1>
                            <p className="text-sm text-gray-500">Configure your AI Advisor's behavior and knowledge base.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                        <button 
                            onClick={() => setIsTestDrawerOpen(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                            <MessageSquare size={16} /> Test Chatbot
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar relative" data-lenis-prevent="true">
                    {!canEditSettings && (
                        <div className="px-6 pt-4">
                             <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-800 animate-in slide-in-from-top-2">
                                <AlertTriangle size={20} className="shrink-0" />
                                <p className="text-sm font-medium">
                                    <span className="font-bold underline">Role Note:</span> The Administrator has disabled your ability to **Edit Chatbot Settings**. You can still view current configurations and test the chatbot.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-6 p-6">

                        {/* General Settings */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 opacity-90">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                    <Bot size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Model Configuration</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">AI Model</label>
                                    <select 
                                        disabled={!canEditSettings} 
                                        value={settings.ai_model}
                                        onChange={(e) => setSettings({...settings, ai_model: e.target.value, provider: e.target.value.includes('gemini') ? 'gemini' : 'ollama'})}
                                        className="w-full p-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        <optgroup label="Google Gemini API">
                                            <option value="gemini-2.0-flash">Gemini 2.0 Flash (Recommended)</option>
                                            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                                        </optgroup>
                                        <optgroup label="Local Ollama Models">
                                            {ollamaModels.map(model => (
                                                <option key={model} value={model}>{model}</option>
                                            ))}
                                            {ollamaModels.length === 0 && (
                                                <option value="llama3">Llama 3 (Ollama)</option>
                                            )}
                                        </optgroup>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Creativity (Temperature)</label>
                                    <div className="flex items-center gap-4">
                                        <input 
                                            disabled={!canEditSettings} 
                                            type="range" 
                                            min="0" 
                                            max="1" 
                                            step="0.1" 
                                            value={settings.temperature} 
                                            onChange={(e) => setSettings({...settings, temperature: parseFloat(e.target.value)})}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50 disabled:cursor-not-allowed" 
                                        />
                                        <span className="text-sm text-gray-500 w-8">{settings.temperature}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Lower values are more deterministic, higher values are more creative.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Response Tokens</label>
                                    <input 
                                        disabled={!canEditSettings} 
                                        type="number" 
                                        value={settings.max_tokens} 
                                        onChange={(e) => setSettings({...settings, max_tokens: parseInt(e.target.value)})}
                                        className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed text-sm" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* RAG Settings */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 opacity-90">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                    <Database size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">RAG (Retrieval) Settings</h3>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">RAG Folder Location</label>
                                    <input
                                        type="text"
                                        disabled={!canEditSettings}
                                        value={settings.rag_folder_path}
                                        onChange={(e) => setSettings({...settings, rag_folder_path: e.target.value})}
                                        className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                                        placeholder="C:\path\to\your\RAG_Docs"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Specify the absolute path to the folder containing your RAG knowledge base. Ensure the backend has permissions to read it.</p>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <h4 className="block text-sm font-bold text-gray-900 mb-2">Available RAG Documents</h4>
                                    <p className="text-xs text-gray-500 mb-4">Live secure view of the physical external filesystem mapped to <code className="bg-gray-100 font-mono px-1.5 py-0.5 rounded text-gray-700 border border-gray-200">{settings.rag_folder_path}</code>.</p>
                                    <RAGDocsViewer folderPath={settings.rag_folder_path} />
                                </div>

                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
                                    <span className="font-bold">Knowledge Base Status:</span> Please ensure your files are inside <code>{settings.rag_folder_path || "the folder"}</code> before syncing.
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Chunk Size</label>
                                        <input 
                                            disabled={!canEditSettings} 
                                            type="number" 
                                            value={settings.chunk_size} 
                                            onChange={(e) => setSettings({...settings, chunk_size: parseInt(e.target.value)})}
                                            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed text-sm" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Top-K Results</label>
                                        <input 
                                            disabled={!canEditSettings} 
                                            type="number" 
                                            value={settings.top_k} 
                                            onChange={(e) => setSettings({...settings, top_k: parseInt(e.target.value)})}
                                            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed text-sm" 
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Number of similar documents to retrieve for context.</p>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={handleReindex}
                                                disabled={!canEditSettings || reindexState.status === 'indexing'}
                                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {reindexState.status === 'indexing' ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <RefreshCw size={16} />
                                                )}
                                                {reindexState.status === 'indexing' ? 'Syncing...' : 'Sync Knowledge Base'}
                                            </button>
                                            {reindexState.status === 'completed' && (
                                                <span className="text-green-600 text-sm font-medium flex items-center gap-1 animate-in fade-in">
                                                    <CheckCircle2 size={16} /> Sync complete!
                                                </span>
                                            )}
                                            {reindexState.status === 'error' && (
                                                <span className="text-red-500 text-sm font-medium animate-in fade-in">Sync failed. Check console.</span>
                                            )}
                                        </div>
                                        {reindexState.status === 'indexing' && (
                                            <div className="space-y-1">
                                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div 
                                                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${reindexState.total > 0 ? Math.round((reindexState.progress / reindexState.total) * 100) : 0}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    Indexing {reindexState.progress} / {reindexState.total} chunks ({reindexState.total > 0 ? Math.round((reindexState.progress / reindexState.total) * 100) : 0}%) — Please wait...
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* System Prompts */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 opacity-90">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                    <MessageSquare size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">System Prompt</h3>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Base System Instruction</label>
                                <textarea
                                    disabled={!canEditSettings}
                                    rows={8}
                                    data-lenis-prevent="true"
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm bg-gray-50 custom-scrollbar disabled:cursor-not-allowed"
                                    value={settings.system_prompt}
                                    onChange={(e) => setSettings({...settings, system_prompt: e.target.value})}
                                />
                                <p className="text-xs text-gray-500 mt-2">This instruction is prepended to every user session.</p>
                            </div>
                        </div>

                        {/* API Key Settings */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 opacity-90">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <Database size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">API Key Configuration</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gemini API Key</label>
                                    <input 
                                        disabled={!canEditSettings}
                                        type="password" 
                                        value={settings.api_key || ''} 
                                        onChange={(e) => setSettings({...settings, api_key: e.target.value})}
                                        className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed text-sm" 
                                        placeholder="AIzaSy..."
                                    />
                                    <p className="text-xs text-blue-600 mt-2 font-medium">
                                        <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noopener noreferrer" className="hover:underline">Click here to get your Gemini API key from Google AI Studio &rarr;</a>
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Fixed Action Bar at the Bottom */}
                <div className="mt-auto pt-8 flex justify-end shrink-0 mb-4 px-6 relative z-10 bottom-0">
                    {canEditSettings ? (
                        <button
                            onClick={isDirty ? handleSave : undefined}
                            disabled={!isDirty}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${isDirty
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 cursor-pointer'
                                : 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'
                                }`}
                        >
                            <Save size={20} /> Save Changes
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed group relative">
                            <Lock size={20} /> Save Changes
                            <div className="absolute bottom-full right-0 mb-2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">Permission required</div>
                        </div>
                    )}
                </div>
            </div>

            <TestChatbotDrawer 
                isOpen={isTestDrawerOpen} 
                onClose={() => setIsTestDrawerOpen(false)} 
            />
        </main>
    );
};

export default EditorChatbot;
