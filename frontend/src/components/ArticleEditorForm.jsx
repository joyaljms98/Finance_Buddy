import React, { useState, useRef } from 'react';
import { ArrowLeft, Save, UploadCloud, X, FileText, Image as ImageIcon, CheckCircle, PenTool, FileDown } from 'lucide-react';

export default function ArticleEditorForm({ initialData, onClose, onSave, folders }) {
    const [formData, setFormData] = useState(initialData);
    const [dragActive, setDragActive] = useState(false);
    const [editorMode, setEditorMode] = useState('markdown'); // 'markdown' or 'upload'
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFile = (file) => {
        if (file.type === "application/pdf") {
            setFormData(prev => ({ ...prev, pdfFile: file, contentType: 'pdf' }));
        } else if (file.name.endsWith('.md')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setFormData(prev => ({ ...prev, content: e.target.result, contentType: 'markdown' }));
            };
            reader.readAsText(file);
        } else {
            alert("Please upload a PDF or Markdown (.md) file.");
        }
    };

    const handlePublish = () => {
        onSave({ ...formData, status: 'Published' });
    };

    const handleSaveDraft = () => {
        onSave({ ...formData, status: 'Draft' });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900">
                        {initialData.id ? 'Edit Article' : 'Create New Article'}
                    </h2>
                </div>
                <button
                    onClick={handleSaveDraft}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 px-6 py-2 rounded-xl font-medium transition-colors shadow-sm"
                >
                    <Save size={18} /> Save Draft
                </button>
            </div>

            {/* Form Body - Single Column */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col items-center">
                <div className="w-full max-w-3xl space-y-8">

                    {/* Basic Meta */}
                    <div className="space-y-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Article Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter a captivating title..."
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Short Description (SEO & Snippet)</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="2"
                                placeholder="Summarize the article in 1-2 sentences..."
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm resize-none"
                            ></textarea>
                        </div>
                    </div>

                    {/* Content Editor Toggle & Zone */}
                    <div className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-semibold text-gray-700">Content Source</label>

                            {/* Editor Toggle */}
                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                <button
                                    onClick={() => setEditorMode('markdown')}
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${editorMode === 'markdown' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    <PenTool size={16} /> Markdown Editor
                                </button>
                                <button
                                    onClick={() => setEditorMode('upload')}
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${editorMode === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    <FileDown size={16} /> Drag & Drop Files
                                </button>
                            </div>
                        </div>

                        {editorMode === 'upload' ? (
                            /* Drag and Drop Zone for Files */
                            <div
                                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <UploadCloud size={40} className={`mx-auto mb-4 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                                <h3 className="text-lg font-bold text-gray-700 mb-2">Drag & Drop Files Here</h3>
                                <p className="text-sm text-gray-500 mb-4">Accepts Markdown (.md) or PDF documents.</p>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                                    className="hidden"
                                    accept=".md,application/pdf"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                >
                                    Browse Files
                                </button>
                            </div>
                        ) : (
                            /* Markdown Editor */
                            <div className="flex flex-col h-64 min-h-[300px]">
                                <textarea
                                    name="content"
                                    value={formData.content || ''}
                                    onChange={handleChange}
                                    placeholder="# Write your financial wisdom here..."
                                    className="flex-1 w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm resize-none bg-gray-50"
                                ></textarea>
                            </div>
                        )}

                        {/* File Attachment Pill (Shared visibility) */}
                        {formData.contentType === 'pdf' && formData.pdfFile && (
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center justify-between mt-4">
                                <div className="flex items-center gap-3">
                                    <FileText className="text-blue-600" size={24} />
                                    <div>
                                        <p className="font-bold text-gray-900">{formData.pdfFile.name}</p>
                                        <p className="text-xs text-blue-600 font-medium">PDF Document attached.</p>
                                    </div>
                                </div>
                                <button onClick={() => setFormData(prev => ({ ...prev, pdfFile: null, contentType: 'markdown' }))} className="text-gray-400 hover:text-red-500 p-2 bg-white rounded-lg shadow-sm">
                                    <X size={20} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Thumbnail & Organization settings */}
                    <div className="space-y-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">

                        {/* Thumbnail Generator logic placeholder */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image</label>
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:bg-gray-100 transition-colors w-full sm:w-2/3 md:w-1/2">
                                <div className="w-full aspect-video bg-gradient-to-br from-indigo-100 to-purple-50 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400 relative overflow-hidden">
                                    {formData.thumbnail ? (
                                        <img src={formData.thumbnail} alt="Cover" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center p-6">
                                            <ImageIcon size={32} className="mb-2 opacity-50" />
                                            <span className="text-sm font-bold text-gray-600">16:9 Thumbnail</span>
                                            <span className="text-xs text-gray-500 mt-1">Leave blank for Auto-Generator</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                Organization Settings
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Visibility Section</label>
                                    <select name="section" value={formData.section} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-colors">
                                        <option value="Financial Wisdom">Financial Wisdom (Public/Homepage)</option>
                                        <option value="Knowledge Base">Knowledge Base (User Dashboard)</option>
                                        <option value="Both">Both (Shared)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Folder</label>
                                    <select name="folder" value={formData.folder} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-colors">
                                        {folders.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Category</label>
                                    <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-colors">
                                        <option>Wealth Management</option>
                                        <option>Taxation</option>
                                        <option>Savings</option>
                                        <option>Market Trends</option>
                                        <option>Personal Finance Tips</option>
                                        <option>Investment Strategies</option>
                                        <option>Debt & Loans</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Read Time (Mins)</label>
                                    <input type="number" name="readTime" value={formData.readTime} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-colors" />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tags (Comma Separated)</label>
                                    <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g. 2026, strategy, beginners" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-colors" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Publish Action */}
                    <div className="pt-4 pb-12 flex justify-end">
                        <button
                            onClick={handlePublish}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5"
                        >
                            <CheckCircle size={20} />
                            Publish Article
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
