'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function HeroCTA() {
    const [backendReady, setBackendReady] = useState(false);

    useEffect(() => {
        let attempts = 0;
        const MAX_ATTEMPTS = 30; // give up after 30 * 500ms = 15 seconds

        const check = async () => {
            try {
                const res = await fetch('http://localhost:8000/', { method: 'GET', cache: 'no-store' });
                if (res.ok) {
                    setBackendReady(true);
                    return; // stop polling
                }
            } catch {
                // backend not up yet — keep trying
            }
            attempts++;
            if (attempts < MAX_ATTEMPTS) {
                setTimeout(check, 500);
            } else {
                // Give up and show buttons anyway after 15s
                setBackendReady(true);
            }
        };

        check();
    }, []);

    if (!backendReady) {
        return (
            <div className="mt-8 flex gap-4 items-center">
                <div className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 opacity-60 cursor-not-allowed select-none">
                    <Loader2 size={18} className="animate-spin" />
                    Starting up...
                </div>
                <div className="px-8 py-3 rounded-xl font-semibold text-slate-400 border border-slate-200 opacity-60 cursor-not-allowed select-none">
                    Login
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8 flex gap-4">
            <Link href="/signup" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2">
                Get Started <ArrowRight size={20} />
            </Link>
            <Link href="/login" className="px-8 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition border border-slate-200">
                Login
            </Link>
        </div>
    );
}
