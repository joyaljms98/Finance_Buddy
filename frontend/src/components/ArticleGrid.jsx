'use client';

import React, { useState, useMemo } from 'react';
import ArticleModal from './ArticleModal';

// Predefined set of professional, high-contrast gradients for placeholders
const PLACEHOLDER_GRADIENTS = [
    'from-indigo-600 to-purple-800',
    'from-blue-600 to-cyan-800',
    'from-emerald-600 to-teal-800',
    'from-rose-600 to-pink-800',
    'from-amber-600 to-orange-800',
    'from-slate-700 to-slate-900',
    'from-violet-600 to-fuchsia-800'
];

// Helper to reliably map a string (like a title or ID) to a consistent random gradient
const getConsistentGradient = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % PLACEHOLDER_GRADIENTS.length;
    return PLACEHOLDER_GRADIENTS[index];
};

export default function ArticleGrid({ articles, section = 'All' }) {
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [failedImages, setFailedImages] = useState({});

    const filteredArticles = section === 'All'
        ? articles
        : articles.filter(a => a.section === section || a.section === 'Both');

    if (filteredArticles.length === 0) {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded shadow-sm">
                <h3 className="text-lg font-medium text-red-800">No Articles Found</h3>
            </div>
        );
    }

    return (
        <>
            {/* Added justify-center to the flex container so if there are fewer than 3 items in the last row, they center */}
            <div className="flex flex-wrap justify-center gap-8 max-w-7xl mx-auto">
                {filteredArticles.map((article) => {
                    const hasValidImage = article.image && !failedImages[article.id];
                    // Determine placeholder gradient once per article
                    const gradientClass = hasValidImage ? '' : getConsistentGradient(article.title || article.id.toString());

                    return (
                        <div key={article.id} className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.333rem)] bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 flex flex-col">

                            <div className={`h-48 relative flex items-center justify-center overflow-hidden ${hasValidImage ? 'bg-gray-100' : `bg-gradient-to-br ${gradientClass}`} group`}>
                                {hasValidImage ? (
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="w-full h-full object-cover z-10"
                                        onError={() => setFailedImages(prev => ({ ...prev, [article.id]: true }))}
                                    />
                                ) : (
                                    <>
                                        {/* Ensure text is stylish (font-serif or custom if loaded), professional, centered, high-contrast, large font */}
                                        <div className="absolute inset-0 opacity-80 mix-blend-overlay bg-black/20 group-hover:bg-black/10 transition-colors duration-500"></div>
                                        <div className="relative z-10 p-6 w-full h-full flex flex-col items-center justify-center transition-transform duration-700 group-hover:scale-105">
                                            <h3 className="text-2xl font-serif font-black text-white text-center leading-snug tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] px-2">
                                                {article.title}
                                            </h3>
                                        </div>
                                    </>
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm z-20">
                                    {article.category}
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                                    {article.description}
                                </p>

                                <button
                                    className="text-blue-600 font-semibold hover:text-blue-800 transition-colors self-start mt-auto"
                                    onClick={() => setSelectedArticle(article)}
                                >
                                    Read Article
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedArticle && (
                <ArticleModal
                    article={selectedArticle}
                    onClose={() => setSelectedArticle(null)}
                />
            )}
        </>
    );
}
