'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import {
    Folder, FolderPlus, Plus, Search, Save, X,
    Palette, Tag, Trash2, Edit3, Eye, Calendar,
    ArrowUpDown, Filter, Pin, Bell, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import api from '@/lib/api';

function NotesManagerContent({ basePath }) {
    const searchParams = useSearchParams();
    const router = useRouter();

    // --- STATE MANAGEMENT ---
    const [notes, setNotes] = useState([]);
    const [folders, setFolders] = useState([{ id: 'default', name: 'Main Folder' }]);
    const [activeFolder, setActiveFolder] = useState('default');
    const [searchQuery, setSearchQuery] = useState('');
    const [folderSearchQuery, setFolderSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [isLoaded, setIsLoaded] = useState(false); // Safety flag

    // Sidebar Toggle
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Modal State
    const [selectedNote, setSelectedNote] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('preview');

    // Temp Edit State
    const [editForm, setEditForm] = useState({
        title: '', content: '', tags: [], color: 'bg-white', folderId: 'default', reminder: ''
    });
    const [tagInput, setTagInput] = useState('');

    const bgColors = [
        { name: 'White', value: 'bg-white' },
        { name: 'Red', value: 'bg-red-50' },
        { name: 'Orange', value: 'bg-orange-50' },
        { name: 'Yellow', value: 'bg-yellow-50' },
        { name: 'Green', value: 'bg-green-50' },
        { name: 'Teal', value: 'bg-teal-50' },
        { name: 'Blue', value: 'bg-blue-50' },
        { name: 'Purple', value: 'bg-purple-50' },
    ];

    // --- 1. DATA LOADING & AUTO-OPEN LOGIC ---
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const loadData = async () => {
            let savedNotes = null;
            let savedFolders = null;

            try {
                const res = await api.get('/sync/data');
                if (res.data) {
                    if (res.data.notes) savedNotes = res.data.notes;
                    if (res.data.folders) savedFolders = res.data.folders;
                }
            } catch (e) { console.warn("Could not fetch notes from backend"); }

            if (!savedNotes) savedNotes = JSON.parse(localStorage.getItem('finance_buddy_notes') || '[]');
            if (!savedFolders) savedFolders = JSON.parse(localStorage.getItem('finance_buddy_folders') || '[]');

            // Migration helper
            let processedNotes = savedNotes.map(n => ({
            ...n,
            folderId: n.folderId || 'default',
            tags: n.tags || [],
            color: n.color && n.color.startsWith('bg-') ? n.color : 'bg-white',
            createdDate: n.createdDate || n.timestamp || new Date().toISOString(), // Stable ID
            updatedDate: n.updatedDate || n.timestamp || new Date().toISOString(), // Last edit
            reminder: n.reminder || ''
        }));

        if (processedNotes.length === 0) {
            processedNotes.push({
                 id: 'demo_note',
                 title: 'Sample Note',
                 content: 'This is a sample note to help you get started. You can delete it or edit it.',
                 folderId: 'default',
                 tags: ['Sample'],
                 color: 'bg-white',
                 createdDate: new Date().toISOString(),
                 updatedDate: new Date().toISOString(),
                 reminder: ''
            });
        }

        setNotes(processedNotes);
        if (savedFolders.length > 0) setFolders(savedFolders);
        setIsLoaded(true);
        };
        
        loadData();
        window.addEventListener('finance_buddy_data_updated', loadData);
        return () => window.removeEventListener('finance_buddy_data_updated', loadData);
    }, []);

    const allNotes = [...notes];
    const displayFolders = [...folders];

    useEffect(() => {
        if (!isLoaded) return;

        const openNoteId = searchParams.get('openNoteId');
        const createNew = searchParams.get('createNew');
        const defaultDate = searchParams.get('defaultDate');

        if (openNoteId) {
            // Logic for deep-linking into an existing note
            const targetNote = allNotes.find(n => n.id === (typeof openNoteId === 'string' && openNoteId.length > 10 ? openNoteId : Number(openNoteId)) || n.id === openNoteId);
            if (targetNote) {
                openViewModal(targetNote);
                setActiveFolder(targetNote.folderId);
            }
            router.replace(`${basePath}/notes`); // Reset URL
        } else if (createNew === 'true') {
            // AUTO OPEN CREATE
            // Determine Default Reminder
            let initialReminder = '';
            if (defaultDate) {
                // Provided from calendar
                const d = new Date(defaultDate);
                d.setHours(9, 0, 0, 0); // Default to 9 AM on that day
                initialReminder = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
            } else {
                // Default: Tomorrow same time
                const d = new Date();
                d.setDate(d.getDate() + 1);
                initialReminder = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
            }

            setSelectedNote(null);
            setEditForm({
                title: '',
                content: '',
                tags: [],
                color: 'bg-white',
                folderId: activeFolder,
                reminder: initialReminder
            });
            setModalMode('edit');
            setIsModalOpen(true);
            router.replace(`${basePath}/notes`); // Reset URL
        }
    }, [searchParams, isLoaded, notes, router, activeFolder, basePath]);

    // --- 2. DATA SAVING ---
    useEffect(() => {
        if (!isLoaded) return; // PREVENT OVERWRITE ON INITIAL MOUNT
        localStorage.setItem('finance_buddy_notes', JSON.stringify(notes));
        localStorage.setItem('finance_buddy_folders', JSON.stringify(folders));
        
        const notesToSync = notes.filter(n => n.id !== 'demo_note');
        api.post('/sync/data', { notes: notesToSync, folders }).catch(e => console.error("Failed to sync notes"));
    }, [notes, folders, isLoaded]);

    // --- ACTIONS ---
    const handleAddFolder = () => {
        const name = prompt("Enter Folder Name:");
        if (name) setFolders([...folders, { id: Date.now().toString(), name }]);
    };

    const openCreateModal = () => {
        // Default Reminder: Tomorrow same time
        const d = new Date();
        d.setDate(d.getDate() + 1);
        const tmrw = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);

        setSelectedNote(null);
        setEditForm({ title: '', content: '', tags: [], color: 'bg-white', folderId: activeFolder, reminder: tmrw });
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const openViewModal = (note) => {
        setSelectedNote(note);

        let formattedReminder = '';
        if (note.reminder) {
            try {
                formattedReminder = note.reminder;
            } catch (e) { console.error(e) }
        }

        setEditForm({
            title: note.title,
            content: note.content,
            tags: note.tags || [],
            color: note.color || 'bg-white',
            folderId: note.folderId,
            reminder: formattedReminder
        });
        setModalMode('preview');
        setIsModalOpen(true);
    };

    const handleSaveNote = () => {
        const now = new Date().toISOString();
        const isEditingDemo = selectedNote && selectedNote.id === 'demo_note';
        const finalId = isEditingDemo ? Date.now() : (selectedNote ? selectedNote.id : Date.now());

        const noteObj = {
            ...editForm,
            id: finalId,
            createdDate: selectedNote ? selectedNote.createdDate : now,
            updatedDate: now,
            isPinned: selectedNote ? selectedNote.isPinned : false,
        };

        if (selectedNote) {
            setNotes(notes.map(n => n.id === selectedNote.id ? noteObj : n));
        } else {
            const notesWithoutDemo = notes.filter(n => n.id !== 'demo_note');
            setNotes([noteObj, ...notesWithoutDemo]);
        }

        // Notify other components (Calendar)
        setTimeout(() => window.dispatchEvent(new Event('finance_buddy_data_updated')), 50);

        setIsModalOpen(false);
    };

    const handleDeleteNote = () => {
        if (!selectedNote) return;
        if (window.confirm("Are you sure you want to delete this note?")) {
            setNotes(notes.filter(n => n.id !== selectedNote.id));
            setTimeout(() => window.dispatchEvent(new Event('finance_buddy_data_updated')), 50);
            setIsModalOpen(false);
        }
    };

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!editForm.tags.includes(tagInput.trim())) {
                setEditForm({ ...editForm, tags: [...editForm.tags, tagInput.trim()] });
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setEditForm({ ...editForm, tags: editForm.tags.filter(t => t !== tagToRemove) });
    };

    // --- FILTERING ---
    const filteredNotes = allNotes
        .filter(n => n.folderId === activeFolder)
        .filter(n =>
            (n.title && n.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (n.content && n.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (n.tags && n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
        )
        .sort((a, b) => {
            if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
            switch (sortBy) {
                case 'newest': return new Date(b.createdDate) - new Date(a.createdDate);
                case 'oldest': return new Date(a.createdDate) - new Date(b.createdDate);
                case 'az': return (a.title || '').localeCompare(b.title || '');
                case 'za': return (b.title || '').localeCompare(a.title || '');
                default: return 0;
            }
        });

    return (
        <main className="flex-1 w-full h-[calc(100vh-64px)] md:h-screen flex flex-col text-gray-800 font-sans p-4 animate-in fade-in zoom-in-95 duration-500">

            <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors hidden md:block"
                        title={isSidebarOpen ? "Close Folders" : "Open Folders"}
                    >
                        {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                    </button>
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-xl shadow-inner">
                        <Folder size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notes Manager</h1>
                        <p className="text-sm text-gray-500">Organize your thoughts and financial plans.</p>

                            {/* Mobile Folder Selector */}
                            <div className="md:hidden mt-4 bg-gray-50 border border-gray-200 rounded-xl p-2 flex flex-col gap-2">
                                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 shadow-sm border border-gray-100">
                                    <Search size={14} className="text-gray-400 shrink-0" />
                                    <input
                                        type="text"
                                        placeholder="Search folder..."
                                        value={folderSearchQuery}
                                        onChange={(e) => setFolderSearchQuery(e.target.value)}
                                        className="bg-transparent border-none outline-none text-sm w-full"
                                    />
                                </div>
                                <select
                                    value={activeFolder}
                                    onChange={(e) => {
                                        if (e.target.value === '_add_new') {
                                            handleAddFolder();
                                            e.target.value = activeFolder; // revert visual selection to previous valid folder
                                        } else {
                                            setActiveFolder(e.target.value);
                                        }
                                    }}
                                    className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 outline-none shadow-sm"
                                >
                                    {displayFolders.filter(f => f.name.toLowerCase().includes(folderSearchQuery.toLowerCase())).map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                    <option value="_add_new">+ Add Folder</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search notes..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-200 transition-transform active:scale-95 whitespace-nowrap">
                            <Plus size={20} /> <span className="hidden sm:inline">New Note</span>
                        </button>
                    </div>
            </header>

            <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
                {/* COLUMN 1: FOLDERS (Desktop) */}
                <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden shrink-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-full md:w-80' : 'w-0 border-none hidden overflow-hidden'}`}>
                    <div className="p-6 border-b border-gray-50">
                        <h2 className="text-xl font-bold text-gray-900">Folders</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {displayFolders.map(folder => (
                            <button
                                key={folder.id}
                                onClick={() => setActiveFolder(folder.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeFolder === folder.id ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm ring-1 ring-blue-100' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Folder size={18} className={activeFolder === folder.id ? 'fill-blue-200' : ''} />
                                <span className="truncate">{folder.name}</span>
                            </button>
                        ))}
                        <button onClick={handleAddFolder} className="w-full flex items-center gap-3 p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl border-2 border-dashed border-gray-100 mt-4 transition-colors">
                            <FolderPlus size={18} />
                            <span className="text-sm font-medium">Add Folder</span>
                        </button>
                    </div>
                </div>

                {/* COLUMN 2: MAIN CONTENT */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-h-[50vh]">

                <div className="px-6 py-3 border-b border-gray-50 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm shrink-0">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate max-w-full">
                        {filteredNotes.length} Notes in {displayFolders.find(f => f.id === activeFolder)?.name}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Filter size={14} className="text-gray-400" />
                        <select
                            className="bg-transparent text-sm font-medium text-gray-600 outline-none cursor-pointer hover:text-blue-600 transition-colors"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">Sort by: Newest</option>
                            <option value="oldest">Sort by: Oldest</option>
                            <option value="az">Sort by: Title (A-Z)</option>
                            <option value="za">Sort by: Title (Z-A)</option>
                        </select>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 relative">
                    <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                        {filteredNotes.map(note => (
                            <div
                                key={note.id}
                                onClick={() => openViewModal(note)}
                                className={`break-inside-avoid rounded-2xl border border-gray-200/60 p-5 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 group relative ${note.color}`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-bold text-gray-800 text-lg leading-tight">{note.title || 'Untitled'}</h3>
                                    <div className="flex gap-1">
                                        {note.reminder && <Bell size={14} className="text-blue-500 fill-current" />}
                                        {note.isPinned && <Pin size={16} className="text-blue-600 fill-current shrink-0" />}
                                    </div>
                                </div>

                                <div className="text-sm text-gray-600 mb-4 line-clamp-6 prose prose-sm">
                                    <ReactMarkdown>{note.content}</ReactMarkdown>
                                </div>

                                <div className="flex flex-wrap gap-2 items-center mt-auto pt-3 border-t border-black/5">
                                    {note.tags && note.tags.slice(0, 3).map((tag, i) => (
                                        <span key={i} className="text-[10px] bg-black/5 text-gray-600 px-2 py-1 rounded-md font-medium">#{tag}</span>
                                    ))}
                                    {note.reminder && (
                                        <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-1 rounded-md">
                                            {new Date(note.reminder).toLocaleDateString()}
                                        </span>
                                    )}
                                    <span className="ml-auto text-[10px] text-gray-400 font-medium">
                                        {new Date(note.createdDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredNotes.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 pb-20 mt-10">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Search size={32} className="opacity-30" />
                            </div>
                            <p>No notes found here.</p>
                            <button onClick={openCreateModal} className="text-blue-600 font-medium mt-2 hover:underline">Create one?</button>
                        </div>
                    )}
                </div>
            </div>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className={`w-full max-w-2xl ${editForm.color} rounded-3xl shadow-2xl flex flex-col max-h-[90vh] transition-colors duration-300 animate-in zoom-in-95`}>

                        <div className="flex items-center justify-between p-6 border-b border-black/5">
                            <div className="flex bg-white/50 p-1 rounded-xl backdrop-blur-sm">
                                <button onClick={() => setModalMode('preview')} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${modalMode === 'preview' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-white/50'}`}>
                                    <Eye size={14} /> Preview
                                </button>
                                {(!selectedNote || !selectedNote.isGlobal) && (
                                    <button onClick={() => setModalMode('edit')} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${modalMode === 'edit' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-white/50'}`}>
                                        <Edit3 size={14} /> Edit
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {selectedNote && !selectedNote.isGlobal && (
                                    <button onClick={handleDeleteNote} className="p-2 hover:bg-red-100 text-gray-400 hover:text-red-600 rounded-full transition-colors" title="Delete Note">
                                        <Trash2 size={20} />
                                    </button>
                                )}
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full text-gray-500"><X size={24} /></button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-8">
                            {modalMode === 'edit' ? (
                                <div className="space-y-4">
                                    <input type="text" placeholder="Title" className="w-full text-2xl font-bold bg-transparent outline-none placeholder-gray-400 text-gray-900" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                                    <textarea placeholder="Type something... (Markdown supported)" className="w-full h-64 bg-transparent outline-none resize-none text-gray-700 leading-relaxed font-mono text-sm" value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} />
                                </div>
                            ) : (
                                <div className="prose prose-lg max-w-none text-gray-800">
                                    <h2 className="text-3xl font-bold mb-4 leading-tight">{editForm.title || 'Untitled'}</h2>
                                    <ReactMarkdown>{editForm.content || '*No content yet... switch to edit mode to add some!*'}</ReactMarkdown>
                                </div>
                            )}
                        </div>

                        <div className="p-4 md:p-6 border-t border-black/5 bg-black/5 space-y-4">
                            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">

                                {/* Color Picker */}
                                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                                    <Palette size={16} className="text-gray-400 shrink-0" />
                                    {bgColors.map((c) => (
                                        <button key={c.name} onClick={() => setEditForm({ ...editForm, color: c.value })} className={`w-6 h-6 rounded-full border border-black/10 shadow-sm ${c.value} ${editForm.color === c.value ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`} title={c.name} />
                                    ))}
                                </div>

                                {/* Reminder & Tags */}
                                <div className="flex-1 w-full md:w-auto flex gap-2">
                                    {/* REMINDER INPUT */}
                                    <div className="flex items-center bg-white rounded-xl px-3 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100">
                                        <Bell size={14} className="text-gray-400 mr-2" />
                                        <input
                                            type="datetime-local"
                                            className="text-xs bg-transparent outline-none text-gray-600"
                                            value={editForm.reminder}
                                            onChange={(e) => setEditForm({ ...editForm, reminder: e.target.value })}
                                        />
                                    </div>

                                    {/* TAG INPUT */}
                                    <div className="flex items-center bg-white rounded-xl px-3 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100">
                                        <Tag size={14} className="text-gray-400 mr-2" />
                                        <input
                                            type="text"
                                            placeholder="Tag..."
                                            className="bg-transparent outline-none text-sm w-20"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={handleAddTag}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Tags Display */}
                            {editForm.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {editForm.tags.map(tag => (
                                        <span key={tag} className="flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-md text-gray-700 shadow-sm">
                                            #{tag}
                                            {(!selectedNote || !selectedNote.isGlobal) && (
                                                <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={10} /></button>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {(!selectedNote || !selectedNote.isGlobal) && (
                                <button onClick={handleSaveNote} className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors shadow-lg flex items-center justify-center gap-2">
                                    <Save size={18} /> Save & Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default function NotesManager({ basePath = '/dashboard' }) {
    return (
        <Suspense fallback={<div className="p-8">Loading...</div>}>
            <NotesManagerContent basePath={basePath} />
        </Suspense>
    )
}
