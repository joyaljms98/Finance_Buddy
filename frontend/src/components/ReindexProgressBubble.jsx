'use client';
import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle, X } from 'lucide-react';
import api from '../lib/api';

export default function ReindexProgressBubble() {
    const [progressData, setProgressData] = useState({ status: 'idle', progress: 0, total: 0 });
    const [isExpanded, setIsExpanded] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let pollInterval;
        
        const pollProgress = async () => {
            try {
                const res = await api.get('/chatbot/reindex/progress');
                const data = res.data;
                setProgressData(data);

                if (data.status === 'indexing') {
                    setIsVisible(true);
                } else if (data.status === 'completed' || data.status === 'stopped' || data.status === 'error') {
                    // Stop polling if done, but keep bubble visible for a few seconds
                    if (data.status !== 'idle') {
                        setIsVisible(true);
                    }
                    clearInterval(pollInterval);
                    setTimeout(() => {
                        setIsVisible(false);
                    }, 5000);
                }
            } catch (err) {
                console.error("Failed to poll reindex progress:", err);
            }
        };

        // Poll every 2 seconds
        pollInterval = setInterval(pollProgress, 2000);
        return () => clearInterval(pollInterval);
    }, [progressData.status]);

    const handleStop = async () => {
        try {
            await api.post('/chatbot/reindex/stop');
        } catch (err) {
            console.error("Failed to stop reindexing:", err);
        }
    };

    if (!isVisible) return null;

    const { status, progress, total } = progressData;
    const isCompleted = status === 'completed';
    const isError = status === 'error';
    const isStopped = status === 'stopped';
    const isIndexing = status === 'indexing';

    const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            {isExpanded ? (
                <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl p-5 w-80 relative overflow-hidden">
                    {/* Background Progress Bar */}
                    <div 
                        className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                    />

                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            {isIndexing && <Loader2 size={18} className="animate-spin text-blue-600" />}
                            {isCompleted && <CheckCircle2 size={18} className="text-green-600" />}
                            {(isError || isStopped) && <XCircle size={18} className="text-red-500" />}
                            Knowledge Base Engine
                        </h4>
                        <button onClick={() => setIsExpanded(false)} className="text-gray-400 hover:text-gray-900">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Status</span>
                            <span className="font-medium text-gray-900 capitalize">
                                {isIndexing ? 'Indexing...' : status}
                            </span>
                        </div>
                        {isIndexing && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Progress</span>
                                <span className="font-medium text-gray-900">{progress} / {total} chunks ({percentage}%)</span>
                            </div>
                        )}
                        {isIndexing && (
                            <button 
                                onClick={handleStop}
                                className="w-full mt-2 bg-red-50 text-red-600 font-bold py-2 rounded-xl text-sm hover:bg-red-100 transition-colors"
                            >
                                Force Stop
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setIsExpanded(true)}
                    className="bg-white border border-gray-200 shadow-xl rounded-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors group relative overflow-hidden"
                >
                    <div 
                        className="absolute bottom-0 left-0 h-full bg-blue-500/10 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                    />
                    {isIndexing ? (
                        <Loader2 size={24} className="animate-spin text-blue-600 relative z-10" />
                    ) : isCompleted ? (
                        <CheckCircle2 size={24} className="text-green-600 relative z-10" />
                    ) : (
                        <XCircle size={24} className="text-red-500 relative z-10" />
                    )}
                    
                    <div className="flex flex-col items-start relative z-10">
                        <span className="text-sm font-bold text-gray-900 capitalize">
                            {isIndexing ? 'Indexing...' : status}
                        </span>
                        {isIndexing && <span className="text-xs text-gray-500">{percentage}%</span>}
                    </div>
                </button>
            )}
        </div>
    );
}
