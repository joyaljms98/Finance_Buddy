'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Wifi, WifiOff } from 'lucide-react';

/**
 * BackendGuard — Polls the backend /health endpoint until it responds.
 * Shows a loading overlay until the backend is reachable, then renders children.
 * No manual page refresh needed.
 */
export default function BackendGuard({ children }) {
    const [isConnected, setIsConnected] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let cancelled = false;
        let timer = null;

        const checkBackend = async () => {
            try {
                const res = await fetch('http://localhost:8000/health', {
                    method: 'GET',
                    signal: AbortSignal.timeout(2000),
                });
                if (res.ok && !cancelled) {
                    setIsConnected(true);
                    return; // Stop polling
                }
            } catch {
                // Backend not ready yet
            }

            if (!cancelled) {
                setRetryCount(prev => prev + 1);
                timer = setTimeout(checkBackend, 2000);
            }
        };

        // Start polling immediately
        checkBackend();

        return () => {
            cancelled = true;
            if (timer) clearTimeout(timer);
        };
    }, []);

    if (isConnected) {
        return <>{children}</>;
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-6 max-w-sm text-center px-6">
                {/* Animated Logo */}
                <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/30 animate-pulse">
                        <Wifi size={32} className="text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                        <Loader2 size={14} className="text-white animate-spin" />
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Connecting to Finance Buddy</h2>
                    <p className="text-sm text-gray-500">
                        Waiting for the backend server to start...
                    </p>
                </div>

                {/* Loading indicator */}
                <div className="flex items-center gap-3 text-sm text-gray-400">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Attempt {retryCount + 1}...</span>
                </div>

                {retryCount > 5 && (
                    <div className="text-xs text-orange-600 bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
                        Taking longer than usual. Make sure the backend server is running on port 8000.
                    </div>
                )}
            </div>
        </div>
    );
}
