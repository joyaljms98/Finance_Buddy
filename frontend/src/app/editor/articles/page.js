'use client';

import React, { useState, useContext, useEffect } from 'react';
import { EditorSidebarContext } from '@/components/EditorSidebarWrapper';
import { usePermissions } from '@/context/PermissionsContext';
import { useUsers } from '@/context/UsersContext';
import { Plus, Search, BookOpen, Edit, Trash2, ExternalLink, PanelLeftOpen, PanelLeftClose, Folder, FolderPlus, Grid, List as ListIcon, AlertTriangle, Lock } from 'lucide-react';
import ArticleEditorForm from '@/components/ArticleEditorForm';
import api from '@/lib/api';

export default function EditorArticlesPage() {
    const { isSidebarOpen, setIsSidebarOpen } = useContext(EditorSidebarContext);
    const { checkPermission } = usePermissions();
    const { activeUser } = useUsers();

    // Pass the active user's ID to properly fetch their personalized permissions
    const editorId = activeUser?.user_id;
    const canCreate = checkPermission('Editor', 'articles', 'create', editorId);
    const canEdit = true; // Editor can edit their articles
    const canDelete = true;
    const canPublish = true;
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
    const [sectionFilter, setSectionFilter] = useState('Both'); // 'Both', 'Financial Wisdom', 'Knowledge Base'
    const [activeFolder, setActiveFolder] = useState('All Articles');
    const [isLocalSidebarOpen, setIsLocalSidebarOpen] = useState(true);
    const [editingArticle, setEditingArticle] = useState(null);

    const handleCreateNew = () => {
        setEditingArticle({
            title: '', description: '', content: '', category: 'Investing', section: 'Both',
            folder: 'Beginner Basics', readTime: 5, tags: '', status: 'Draft'
        });
    };

    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.hash === '#create') {
            if (canCreate) {
                handleCreateNew();
            }
            // Clear the hash to prevent re-triggering
            window.history.replaceState(null, '', window.location.pathname);
        }
    }, [canCreate]);

    // Folders (kept as static UI structure)
    const [folders, setFolders] = useState([
        { id: 'f1', name: 'General', count: 5 },
        { id: 'f2', name: 'Tax Guides', count: 2 },
        { id: 'f3', name: 'Beginner Basics', count: 12 },
    ]);

    // Articles from database
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/articles');
            setArticles(res.data);
        } catch (err) {
            console.error('Failed to load articles', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveArticle = async (data) => {
        try {
            if (data.id) {
                const res = await api.put(`/articles/${data.id}`, data, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('finance_buddy_token')}` }
                });
                setArticles(articles.map(a => a.id === res.data.id ? res.data : a));
            } else {
                const res = await api.post('/articles', data, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('finance_buddy_token')}` }
                });
                setArticles([res.data, ...articles]);
            }
            setEditingArticle(null);
        } catch (err) {
            console.error('Failed to save article', err);
            alert('Failed to save article. Please check your permissions.');
        }
    };

    const handleDeleteArticle = async (id) => {
        if (!confirm('Are you sure you want to delete this article?')) return;
        try {
            await api.delete(`/articles/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('finance_buddy_token')}` }
            });
            setArticles(articles.filter(a => a.id !== id));
        } catch (err) {
            console.error('Failed to delete article', err);
            alert('Failed to delete article.');
        }
    };

    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFolder = activeFolder === 'All Articles' || article.folder === activeFolder;
        const matchesSection = sectionFilter === 'Both' || article.section === 'Both' || article.section === sectionFilter;
        return matchesSearch && matchesFolder && matchesSection;
    });

    return (
        <main className="flex-1 transition-all w-full flex text-gray-800 font-sans relative animate-in fade-in zoom-in-95 duration-500 h-full">
            {/* Secondary Local Folder Sidebar (Only visible if space permits or toggled) */}
            {isLocalSidebarOpen && (
                <aside className="w-64 border-r border-gray-100 bg-white shadow-sm flex flex-col shrink-0 mx-4 my-4 rounded-2xl overflow-hidden hidden md:flex">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <span className="font-bold text-gray-700 flex items-center gap-2">
                            <Folder size={18} className="text-blue-500" /> Folders
                        </span>
                        <button className="text-gray-400 hover:text-blue-600 transition-colors p-1" title="Add Folder">
                            <FolderPlus size={18} />
                        </button>
                    </div>
                    <div className="p-3 flex-1 overflow-y-auto space-y-1">
                        <button
                            onClick={() => setActiveFolder('All Articles')}
                            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors flex justify-between items-center ${activeFolder === 'All Articles' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                        >
                            <span className="flex items-center gap-2"><BookOpen size={16} /> All Articles</span>
                            <span className="bg-white border border-gray-200 text-gray-500 text-xs px-2 py-0.5 rounded-full">{articles.length}</span>
                        </button>

                        <div className="pt-2 pb-1 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Custom Folders</div>

                        {folders.map(folder => (
                            <button
                                key={folder.id}
                                onClick={() => setActiveFolder(folder.name)}
                                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors flex justify-between items-center ${activeFolder === folder.name ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                            >
                                <span className="flex items-center gap-2 truncate"><Folder size={16} className={activeFolder === folder.name ? 'text-blue-500' : 'text-gray-400'} /> {folder.name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${activeFolder === folder.name ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                                    {articles.filter(a => a.folder === folder.name).length}
                                </span>
                            </button>
                        ))}
                    </div>
                </aside>
            )}

            <div className="flex-1 flex flex-col bg-gray-50/50 relative rounded-2xl shadow-sm my-4 mx-4 md:ml-0 border border-gray-100 overflow-hidden h-[calc(100vh-2rem)]">
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between sticky top-0 z-10 shrink-0 gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors hidden md:block"
                            title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                        >
                            {isSidebarOpen ? <PanelLeftClose size={24} /> : <PanelLeftOpen size={24} />}
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Manage Articles (Editor)</h1>
                            <p className="text-sm text-gray-500">Create and edit financial literacy content.</p>
                        </div>
                    </div>
                    {canCreate ? (
                        <button
                            onClick={handleCreateNew}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-lg shadow-blue-200 text-sm">
                            <Plus size={18} /> Create New Article
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 bg-gray-100 text-gray-400 px-4 py-2 rounded-xl font-medium border border-gray-200 text-sm cursor-not-allowed group relative">
                            <Lock size={18} /> Create New Article
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">Permission required</div>
                        </div>
                    )}
                </header>

                <div className="flex-1 overflow-y-auto p-6 relative">
                    
                    {!canCreate && (
                        <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-800 animate-in slide-in-from-top-2">
                             <AlertTriangle size={20} className="shrink-0" />
                             <p className="text-sm font-medium">
                                 <span className="font-bold underline">Role Note:</span> The Administrator has disabled your ability to **Create New Articles**. You can still view, search and organize existing content.
                             </p>
                        </div>
                    )}

                    {editingArticle ? (
                        <ArticleEditorForm
                            initialData={editingArticle}
                            onClose={() => setEditingArticle(null)}
                            onSave={handleSaveArticle}
                            folders={folders}
                        />
                    ) : (
                        <>
                            {/* Search and Filters */}
                            <div className="flex flex-col xl:flex-row gap-4 mb-6 justify-between">
                                <div className="flex gap-4 flex-1">
                                    <div className="relative flex-1 max-w-md">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            placeholder={`Search in ${activeFolder}...`}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        />
                                    </div>

                                    {/* Section Toggle */}
                                    <div className="bg-gray-200/50 p-1 rounded-xl flex items-center">
                                        {['Both', 'Financial Wisdom', 'Knowledge Base'].map(filter => (
                                            <button
                                                key={filter}
                                                onClick={() => setSectionFilter(filter)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${sectionFilter === filter ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                {filter}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* View Mode Toggle */}
                                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1 shrink-0 h-fit">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                        title="List View"
                                    >
                                        <ListIcon size={18} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                        title="Grid View"
                                    >
                                        <Grid size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Articles List / Grid */}
                            {viewMode === 'list' ? (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto animate-in fade-in slide-in-from-bottom-2">
                                    <table className="w-full text-left border-collapse" style={{minWidth: '800px'}}>
                                        <thead>
                                            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                                                <th className="p-4 font-medium" style={{minWidth:'220px'}}>Title</th>
                                                <th className="p-4 font-medium" style={{minWidth:'110px'}}>Section</th>
                                                <th className="p-4 font-medium" style={{minWidth:'110px'}}>Category</th>
                                                <th className="p-4 font-medium" style={{minWidth:'100px'}}>Date</th>
                                                <th className="p-4 font-medium" style={{minWidth:'90px'}}>Status</th>
                                                <th className="p-4 font-medium" style={{minWidth:'70px'}}>Views</th>
                                                <th className="p-4 font-medium text-right" style={{minWidth:'100px'}}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredArticles.map((article) => (
                                                <tr key={article.id} className="hover:bg-gray-50 transition-colors group">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                                                                <BookOpen size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{article.title}</p>
                                                                <p className="text-xs text-gray-500">by {((article.authors || []).join(', ') || 'Unknown')}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`text-xs font-semibold ${article.section === 'Both' ? 'text-purple-600' : 'text-gray-600'}`}>
                                                            {article.section}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200 whitespace-nowrap">
                                                            {article.category}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap">{new Date(article.created_at || Date.now()).toLocaleDateString()}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${article.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {article.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap">{article.read_count || 0}</td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            {canEdit && (
                                                                <button
                                                                    onClick={() => setEditingArticle(article)}
                                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                                                                    <Edit size={18} />
                                                                </button>
                                                            )}
                                                            {canDelete && (
                                                                <button
                                                                    onClick={() => handleDeleteArticle(article.id)}
                                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {filteredArticles.length === 0 && (
                                        <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                                            <BookOpen size={32} className="mb-2 opacity-50" />
                                            <p>No articles found for the selected filters.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* GRID VIEW */
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-2">
                                    {filteredArticles.map(article => (
                                        <div key={article.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group flex flex-col">
                                            <div className="h-40 relative flex items-center justify-center overflow-hidden">
                                                {/* Auto-Placeholder Thumbnail Mockup */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90 transition-transform duration-700 group-hover:scale-105"></div>
                                                <span className="relative z-10 text-xl font-black text-white px-6 text-center leading-snug tracking-tight drop-shadow-md">{article.title}</span>

                                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-gray-700 shadow-sm z-20">
                                                    {article.section}
                                                </div>
                                            </div>
                                            <div className="p-5 flex flex-col flex-1">
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-md border border-gray-200">{article.category}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${article.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {article.status}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">{article.title}</h3>
                                                <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">{article.description}</p>

                                                <div className="flex justify-between items-center mt-auto border-t border-gray-50 pt-4">
                                                    <span className="text-xs text-gray-400 font-medium">{article.author}</span>
                                                    <div className="flex gap-1">
                                                        {canEdit && (
                                                            <button
                                                                onClick={() => setEditingArticle(article)}
                                                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                                                                <Edit size={16} />
                                                            </button>
                                                        )}
                                                        {canDelete && (
                                                            <button
                                                                onClick={() => handleDeleteArticle(article.id)}
                                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {filteredArticles.length === 0 && (
                                        <div className="col-span-full p-12 text-center text-gray-400 flex flex-col items-center bg-white rounded-2xl border border-gray-100 border-dashed">
                                            <BookOpen size={32} className="mb-2 opacity-50" />
                                            <p>No articles found for the selected filters.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                </div>
            </div>
        </main>
    );
}
