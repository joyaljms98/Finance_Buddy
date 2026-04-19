'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, Calendar, User, Clock, Eye } from 'lucide-react';
import api from '@/lib/api';

export default function ArticleModal({ article, onClose }) {
    if (!article) return null;

    // Track read when modal opens
    React.useEffect(() => {
        if (article.id) {
            api.post(`/articles/${article.id}/read`).catch(() => {});
        }
    }, [article.id]);

    const authors = (article.authors || []).join(', ') || 'Finance Buddy Team';
    const dateStr = article.created_at
        ? new Date(article.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date().getFullYear() + ' Edition';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">

            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* --- Header Banner --- */}
                <div className="relative h-48 md:h-56 flex-shrink-0 bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center overflow-hidden">
                    {article.thumbnail ? (
                        <img
                            src={article.thumbnail}
                            alt={article.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="relative z-10 px-10 text-center">
                            <span className="text-xs font-bold uppercase tracking-widest text-white/70 mb-2 block">{article.category}</span>
                            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-md">
                                {article.title}
                            </h2>
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* --- Scrollable Content Area --- */}
                <div className="overflow-y-auto p-8 custom-scrollbar">

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm mb-6 pb-6 border-b border-gray-100">
                        <div className="flex items-center gap-1.5">
                            <User size={15} />
                            <span>{authors}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar size={15} />
                            <span>{dateStr}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock size={15} />
                            <span>{article.readTime || 5} min read</span>
                        </div>
                        {article.read_count !== undefined && (
                            <div className="flex items-center gap-1.5">
                                <Eye size={15} />
                                <span>{article.read_count} reads</span>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {article.description && (
                        <p className="text-gray-600 text-base leading-relaxed mb-8 italic border-l-4 border-blue-300 pl-4">
                            {article.description}
                        </p>
                    )}

                    {/* Markdown Content */}
                    <div className="prose prose-lg prose-blue max-w-none text-gray-700
                        prose-headings:text-gray-900 prose-headings:font-bold
                        prose-h1:text-2xl prose-h2:text-xl prose-h2:mt-8
                        prose-p:leading-relaxed
                        prose-table:border-collapse prose-table:w-full
                        prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:p-3 prose-th:text-left
                        prose-td:border prose-td:border-gray-200 prose-td:p-3
                        prose-tr:even:bg-gray-50
                        prose-code:bg-gray-100 prose-code:px-2 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                        prose-blockquote:border-l-4 prose-blockquote:border-blue-400 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
                        prose-li:my-1
                    ">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {article.content || '*No content available for this article yet.*'}
                        </ReactMarkdown>
                    </div>

                </div>

                {/* --- Footer --- */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center flex-shrink-0">
                    <span className="text-xs text-gray-400 px-2">
                        {article.tags ? `Tags: ${article.tags}` : ''}
                    </span>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
