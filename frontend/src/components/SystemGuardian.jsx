'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Wrench } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useUsers } from '@/context/UsersContext';

export default function SystemGuardian() {
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [supportEmail, setSupportEmail] = useState('support@financebuddy.com');
    const pathname = usePathname();
    const { user } = useUsers();

    useEffect(() => {
        const stored = localStorage.getItem('systemSettings');
        if (stored) {
            const parsed = JSON.parse(stored);

            // Allow Admins to bypass maintenance. Also keep /login open so logged-out Admins can get in.
            // Furthermore, never block /admin routes because the AdminLayoutClient already strictly secures them,
            // and blocking them here might lock out the admin before their token finishes loading.
            if (parsed.maintenanceMode && user?.role !== 'Admin' && pathname !== '/login' && !pathname.startsWith('/admin')) {
                setIsMaintenance(true);
            } else {
                setIsMaintenance(false);
            }

            if (parsed.supportEmail) {
                setSupportEmail(parsed.supportEmail);
            }
        }
    }, [user, pathname]);

    // If not in maintenance mode, render nothing
    if (!isMaintenance) return null;

    // Full screen opaque overlay that prevents users from seeing the rest of the app.
    return (
        <div className="fixed inset-0 z-[99999] bg-slate-900 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
            <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-bl-full -z-0 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-100 rounded-tr-full -z-0 opacity-50"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mb-6 shrink-0 relative">
                        <Wrench size={40} className="absolute animate-[spin_4s_linear_infinite]" />
                        <AlertTriangle size={20} className="bg-orange-100 rounded-full shadow-sm z-10" />
                    </div>

                    <h2 className="text-lg font-bold text-orange-600 mb-1 tracking-wider uppercase">Error 503</h2>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Your Buddy is Down for Maintenance</h1>
                    <p className="text-gray-500 mb-8 max-w-sm">
                        We are currently performing scheduled maintenance to improve your experience. We'll be back online shortly.
                    </p>

                    <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600">
                        Need urgent help? Contact us at <br />
                        <a href={`mailto:${supportEmail}`} className="font-bold text-blue-600 hover:underline">{supportEmail}</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
