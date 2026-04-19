'use client';

import React, { useState } from 'react';

export default function HeroVisual() {
    const [imageError, setImageError] = useState(false);

    return (
        <div className="md:w-1/2 mt-10 md:mt-0 relative w-full flex justify-center items-center">
            {!imageError ? (
                <img
                    src="/hero-dashboard.png"
                    alt="Dashboard Preview"
                    onError={() => setImageError(true)}
                    className="w-auto max-w-full max-h-[70vh] object-contain rounded-2xl shadow-xl border border-gray-200/50 animate-in fade-in zoom-in-95 duration-700 mx-auto"
                />
            ) : (
                <div className="w-full bg-blue-100 rounded-2xl p-8 h-80 flex items-center justify-center border-2 border-blue-500 border-dashed">
                    <span className="text-blue-600 font-medium text-center">[ Hero Image / Dashboard Preview ]</span>
                </div>
            )}
        </div>
    );
}
