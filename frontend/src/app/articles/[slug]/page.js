import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Tag, ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ReactMarkdown from 'react-markdown';
import { getArticles } from '@/lib/articles';
import ViewCounter from '@/components/ViewCounter';

// Dynamic SEO Metadata Generation for Google Indexing
export async function generateMetadata({ params }) {
    const articles = getArticles();
    const article = articles.find(a => a.id === params.slug);

    if (!article) {
        return { title: 'Article Not Found | Finance Buddy' };
    }

    return {
        title: `${article.title} | Finance Buddy Financial Wisdom`,
        description: article.description,
        openGraph: {
            title: article.title,
            description: article.description,
            type: 'article',
            // images: [article.image],
        }
    };
}

export default function ArticlePage({ params }) {
    const articles = getArticles();
    const article = articles.find(a => a.id === params.slug);

    if (!article) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-6 text-center">
                    <div className="max-w-md">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Article Not Found</h1>
                        <p className="text-gray-500 mb-8">The financial wisdom you are looking for might have been moved or removed.</p>
                        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold px-6 py-3 bg-blue-50 rounded-xl transition-colors">
                            <ArrowLeft size={18} /> Return to Homepage
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Mock "Similar Articles" (Takes first 2 distinct articles)
    const similarArticles = articles.filter(a => a.id !== article.id).slice(0, 2);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans selection:bg-blue-100 selection:text-blue-900">
            <Navbar />

            {/* --- Hero Article Header --- */}
            <header className="bg-white border-b border-gray-100 pt-24 pb-12 px-4 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row gap-12 items-center">
                    
                    {/* Left: Title & Description */}
                    <div className="flex-1 w-full relative z-10">
                        <Link href="/#articles" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-8 group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Wisdom
                        </Link>

                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                Financial Wisdom
                            </span>
                            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                <Clock size={14} /> 5 min read
                            </span>
                            <ViewCounter slug={article.id} initialViews={article.views} />
                        </div>

                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                            {article.title}
                        </h1>

                        <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
                            {article.description}
                        </p>
                    </div>

                    {/* Right: Thumbnail Image */}
                    <div className="w-full md:w-[450px] shrink-0 relative z-10">
                        {article.image ? (
                            <img src={article.image} alt={article.title} className="w-full aspect-[16/10] object-cover rounded-3xl shadow-xl shadow-blue-500/10 border border-gray-100" />
                        ) : (
                            <div className="w-full aspect-[16/10] bg-gradient-to-br from-indigo-50/50 to-blue-50/50 border-2 border-dashed border-indigo-200/50 rounded-3xl flex items-center justify-center text-indigo-300 shadow-xl shadow-blue-500/5 flex-col gap-3">
                                <ExternalLink size={32} className="opacity-50" />
                                <span className="text-sm font-medium opacity-70">16:10 Thumbnail Image</span>
                            </div>
                        )}
                    </div>

                </div>
            </header>

            {/* --- Article Body --- */}
            <main className="flex-1 py-12 px-4">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 items-start">

                    {/* Content Column */}
                    <article className="flex-1 w-full bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 prose prose-lg prose-blue max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-a:text-blue-600 prose-img:rounded-2xl">

                        <ReactMarkdown>
                            {article.fullContent || "This article has no content yet."}
                        </ReactMarkdown>
                    </article>

                    {/* Sidebar / sticky column */}
                    <aside className="w-full md:w-80 flex flex-col gap-6 sticky top-24 shrink-0">
                        {/* Call to Action Box */}
                        <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg shadow-blue-200">
                            <h3 className="font-bold text-xl mb-2">Ready to take control?</h3>
                            <p className="text-blue-100 text-sm mb-6">Join Finance Buddy today and start utilizing AI-driven wealth architecture.</p>
                            <Link href="/signup" className="block text-center w-full bg-white text-blue-700 font-bold py-3 px-4 rounded-xl hover:bg-blue-50 transition-colors shadow-sm">
                                Create Free Account
                            </Link>
                        </div>

                        {/* Tags */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                                <Tag size={18} className="text-gray-400" /> Topic Tags
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm font-medium">Investing</span>
                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm font-medium">Strategy</span>
                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm font-medium">2026</span>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            {/* --- Similar Articles Bottom Grid --- */}
            {similarArticles.length > 0 && (
                <section className="bg-white border-t border-gray-100 py-16 px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Financial Wisdom</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {similarArticles.map(sim => (
                                <Link href={`/articles/${sim.id}`} key={sim.id} className="group flex flex-col bg-gray-50 border border-gray-100 p-6 rounded-2xl hover:bg-blue-50 hover:border-blue-100 transition-colors">
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 mb-2 leading-tight">{sim.title}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{sim.description}</p>
                                    <div className="mt-auto flex items-center text-sm font-semibold text-blue-600">
                                        Read More <ArrowLeft size={16} className="ml-1 rotate-180 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* --- Footer --- */}
            <footer className="bg-slate-900 text-slate-400 py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p>&copy; 2026 Finance Buddy. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
