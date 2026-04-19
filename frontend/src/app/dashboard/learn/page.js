'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Search, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '@/lib/api';

const CATEGORIES = ['All', 'Wealth Management', 'Taxation', 'Savings', 'Market Trends', 'Personal Finance Tips', 'Investment Strategies', 'Debt & Loans'];

export default function Learn() {
    const [allArticles, setAllArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const res = await api.get('/articles');
                // Only show Published articles for the Knowledge Base or Both sections
                const filtered = (res.data || []).filter(a =>
                    a.status === 'Published' && (a.section === 'Knowledge Base' || a.section === 'Both')
                );
                setAllArticles(filtered);
            } catch (err) {
                console.warn("Could not fetch articles from backend.", err);
                setAllArticles([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchArticles();
    }, []);

    // Increment read count when user opens an article
    const handleOpenArticle = async (article) => {
        setSelectedArticle(article);
        try {
            await api.post(`/articles/${article.id}/read`);
        } catch (e) {
            // Silent fail — non-critical
        }
    };

    const displayedArticles = allArticles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (article.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'All' || article.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <main className="flex-1 w-full h-[calc(100vh-64px)] md:h-screen flex flex-col text-gray-800 font-sans p-4 animate-in fade-in zoom-in-95 duration-500">
            {/* Header */}
            <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSelectedArticle(null)}
                        className={`p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ${selectedArticle ? 'block' : 'hidden'}`}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-xl shadow-inner">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Knowledge Base</h1>
                        <p className="text-sm text-gray-500">Master your money with expert guides.</p>
                    </div>
                </div>

                {/* Search Bar - hidden when reading */}
                {!selectedArticle && (
                    <div className="relative w-full md:w-80 transition-all animate-in fade-in">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search for 'tax', 'stocks', 'loans'..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 text-sm rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>
                )}
            </header>

            <div className={`flex-1 overflow-y-auto ${selectedArticle ? 'p-0 bg-transparent' : 'p-6 bg-gray-50/50 rounded-2xl shadow-sm border border-gray-100'} space-y-8 relative`}>

                {/* --- Grid View --- */}
                {!selectedArticle && (
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                        {/* Category Pills */}
                        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap border ${
                                        activeCategory === cat
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Loading state */}
                        {isLoading ? (
                            <div className="flex justify-center items-center py-20">
                                <Loader2 className="animate-spin text-blue-500" size={36} />
                            </div>
                        ) : displayedArticles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <BookOpen size={48} className="mb-4 opacity-30" />
                                <p className="text-lg font-medium">No articles found</p>
                                <p className="text-sm mt-1">Try a different search term or category.</p>
                            </div>
                        ) : (
                            /* Articles Grid */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayedArticles.map((article) => (
                                    <div
                                        key={article.id}
                                        onClick={() => handleOpenArticle(article)}
                                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all group cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                                                {article.category}
                                            </span>
                                            <span className="text-xs text-gray-400">{article.readTime || 5} min read</span>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                            {article.title}
                                        </h3>

                                        <p className="text-gray-500 text-sm line-clamp-3">
                                            {article.description}
                                        </p>

                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-xs text-gray-400">
                                                by {(article.authors || []).join(', ') || 'Finance Buddy'}
                                            </span>
                                            <div className="flex items-center gap-1 text-sm font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                Read Now <ArrowRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* --- Reading View --- */}
                {selectedArticle && (
                    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-8 md:p-12">
                            <div className="flex items-center gap-3 mb-6 flex-wrap">
                                <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">{selectedArticle.category}</span>
                                <span className="text-gray-300">•</span>
                                <span className="text-sm text-gray-500">
                                    {new Date(selectedArticle.created_at || Date.now()).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                                <span className="text-gray-300">•</span>
                                <span className="text-sm text-gray-500">{selectedArticle.readTime || 5} min read</span>
                                <span className="text-gray-300">•</span>
                                <span className="text-sm text-gray-500">by {(selectedArticle.authors || []).join(', ') || 'Finance Buddy'}</span>
                            </div>

                            <div className="prose prose-lg max-w-none text-gray-700
                                prose-headings:text-gray-900 prose-headings:font-bold
                                prose-h1:text-2xl prose-h2:text-xl prose-h2:mt-8
                                prose-table:border-collapse prose-table:w-full
                                prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:p-3 prose-th:text-left
                                prose-td:border prose-td:border-gray-200 prose-td:p-3
                                prose-tr:even:bg-gray-50
                                prose-code:bg-gray-100 prose-code:px-2 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                                prose-blockquote:border-l-4 prose-blockquote:border-blue-400 prose-blockquote:pl-4 prose-blockquote:italic
                                prose-li:my-1
                            ">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {selectedArticle.content || '*No content available.*'}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};
