'use client';
import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';

export default function ViewCounter({ slug, initialViews }) {
    const [views, setViews] = useState(initialViews);

    useEffect(() => {
        const memoryKey = `finance_buddy_views_${slug}`;
        let currentViews = parseInt(localStorage.getItem(memoryKey));
        
        if (isNaN(currentViews)) {
            currentViews = initialViews + 1;
        } else {
            // Check if we already viewed it this session to prevent spam counting
            const sessionViewKey = `finance_buddy_session_view_${slug}`;
            if (!sessionStorage.getItem(sessionViewKey)) {
                currentViews += 1;
                sessionStorage.setItem(sessionViewKey, 'true');
            }
        }
        
        localStorage.setItem(memoryKey, currentViews.toString());
        setViews(currentViews);
    }, [slug, initialViews]);

    return (
        <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            <Eye size={14} /> {views} views
        </span>
    );
}
