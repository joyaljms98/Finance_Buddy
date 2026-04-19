'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import api from '../lib/api';

const AnimatedNumber = ({ value }) => {
    const [displayVal, setDisplayVal] = useState(0);
    // Remove commas to parse as float
    const target = parseFloat(String(value).replace(/,/g, ''));
    
    useEffect(() => {
        if (isNaN(target)) return;
        
        let startTime = null;
        const duration = 1500; // 1.5s animation

        const animate = (time) => {
            if (!startTime) startTime = time;
            const progress = Math.min((time - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 4); // easeOutQuart
            setDisplayVal(target * ease);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setDisplayVal(target);
            }
        };
        requestAnimationFrame(animate);
    }, [target, value]);

    if (isNaN(target)) return <span>{value}</span>;
    return <span>{displayVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
};

// Fallback skeleton data
const fallbackData = [
    { name: "NIFTY 50", price: "24,120.50", change_pct: "+0.45%", is_positive: true },
    { name: "SENSEX", price: "79,500.20", change_pct: "+0.38%", is_positive: true },
    { name: "BANK NIFTY", price: "51,200.10", change_pct: "-0.12%", is_positive: false },
    { name: "GOLD", price: "72,000.00", change_pct: "+0.05%", is_positive: true },
    { name: "USD/INR", price: "83.50", change_pct: "+0.01%", is_positive: true },
    { name: "CRUDE OIL", price: "6,450.00", change_pct: "-0.80%", is_positive: false },
];

export default function MarketTicker() {
    const [marketData, setMarketData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                const res = await api.get('/market/tickers');
                if (res.data && res.data.data) {
                    setMarketData(res.data.data);
                } else {
                    setMarketData(fallbackData);
                }
            } catch (err) {
                console.error("Failed to fetch market tickers", err);
                setMarketData(fallbackData);
            } finally {
                setLoading(false);
            }
        };

        fetchMarketData();
        // Optional: refresh every 5 minutes
        const interval = setInterval(fetchMarketData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const displayData = marketData.length > 0 ? marketData : fallbackData;

    return (
        <div className="bg-slate-900 text-white border-y border-slate-800 overflow-hidden py-3 relative flex items-center">
            {loading && (
                <div className="absolute left-4 z-10 opacity-50 flex items-center gap-2 text-xs font-mono">
                    <Loader2 size={12} className="animate-spin" /> LIVE
                </div>
            )}
            {/* w-max: ensures content doesn't wrap  */}
            <div className="flex animate-infinite-scroll w-max gap-12 hover:[animation-play-state:paused]">
                {/* Render the list TWICE to create the seamless loop */}
                {[...displayData, ...displayData, ...displayData, ...displayData].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm font-medium whitespace-nowrap">
                        <span className="text-slate-400">{item.name}</span>

                        <span className="text-white min-w-[70px] text-right">
                            <AnimatedNumber value={item.price} />
                        </span>

                        <span className={`flex items-center gap-1 ${item.is_positive ? 'text-green-400' : 'text-red-400'}`}>
                            {item.is_positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {item.change_pct}
                        </span>

                        {/* Separator Dot */}
                        <span className="text-slate-700 text-xs">•</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
