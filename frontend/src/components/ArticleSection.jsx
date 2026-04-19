'use client';

import React, { useState, useEffect } from 'react';
import ArticleGrid from './ArticleGrid';
import api from '@/lib/api';

// Fallback placeholder articles shown only when the backend is unreachable
const PLACEHOLDER_ARTICLES = [
    {
        id: "placeholder_1",
        title: "The Golden Ratio for Your Salary",
        description: "Discover the time-tested proportions for splitting your monthly income into needs, wants, savings, and investments — and build wealth on autopilot.",
        content: "# The 50/30/20 Rule\n\nWhen managing your monthly income, follow the 50/30/20 rule:\n\n- **50%** → Needs (rent, groceries, bills)\n- **30%** → Wants (dining, entertainment)\n- **20%** → Savings & Investments\n\nConsistency beats perfection. Start today.",
        category: "Personal Finance Tips",
        section: "Financial Wisdom",
        tags: "salary, budgeting, savings",
        image: ""
    },
    {
        id: "placeholder_2",
        title: "Tax Saving Strategies 2026",
        description: "A comprehensive guide to legally minimizing your tax burden in India — from Section 80C to the new tax regime comparison.",
        content: "# Tax Saving Strategies 2026\n\nMaximize Section 80C (₹1.5L), invest in ELSS, contribute to NPS for extra ₹50K deduction, and buy health insurance under 80D.",
        category: "Taxation",
        section: "Financial Wisdom",
        tags: "tax, savings, India",
        image: ""
    },
    {
        id: "placeholder_3",
        title: "The Emergency Fund",
        description: "An emergency fund is your financial safety net. Learn why 3–6 months of expenses is the golden rule and simple tricks to build it fast.",
        content: "# The Emergency Fund\n\nBefore investing, save 3–6 months of expenses in a liquid account. Start with ₹1,000/month and automate it.",
        category: "Savings",
        section: "Both",
        tags: "emergency, savings",
        image: ""
    }
];

export default function ArticleSection() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usingFallback, setUsingFallback] = useState(false);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const res = await api.get('/articles');
                const dbArticles = res.data || [];
                if (dbArticles.length > 0) {
                    setArticles(dbArticles);
                    setUsingFallback(false);
                } else {
                    // DB connected but no articles yet — show placeholders
                    setArticles(PLACEHOLDER_ARTICLES);
                    setUsingFallback(true);
                }
            } catch (err) {
                console.warn("Backend unreachable, using placeholder articles.");
                setArticles(PLACEHOLDER_ARTICLES);
                setUsingFallback(true);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, []);

    if (loading) {
        return (
            <section className="py-24 px-4 max-w-7xl mx-auto flex justify-center">
                <div className="animate-pulse h-12 w-64 bg-gray-200 rounded-xl"></div>
            </section>
        );
    }

    return (
        <section className="py-24 px-4 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900">Financial Wisdom</h2>
                <p className="text-gray-600 mt-4 text-lg">Expert insights to guide your wealth journey.</p>
            </div>

            <ArticleGrid articles={articles} section="Financial Wisdom" />
        </section>
    );
}
