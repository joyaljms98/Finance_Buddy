'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, PenLine, Clock, List, Bold, CheckSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';

export default function NotesDrawer({ isOpen, onClose }) {
    const router = useRouter();
    const [notes, setNotes] = useState([]);
    const [folders, setFolders] = useState([]);
    const [isAdding, setIsAdding] = useState(false);

    // MERGED STATE: Includes title, content, folderId (New) AND color (Old)
    const [newNote, setNewNote] = useState({
        title: '',
        content: '',
        folderId: 'default',
        color: 'bg-yellow-100 border-yellow-200'
    });

    // OLD FEATURE: Colors Array
    const colors = [
        { name: 'Yellow', value: 'bg-yellow-100 border-yellow-200' },
        { name: 'Blue', value: 'bg-blue-100 border-blue-200' },
        { name: 'Green', value: 'bg-green-100 border-green-200' },
        { name: 'Red', value: 'bg-red-100 border-red-200' },
        { name: 'Purple', value: 'bg-purple-100 border-purple-200' },
        { name: 'White', value: 'bg-white border-gray-200' },
    ];

    // NEW FEATURE: Markdown Helper
    const insertMarkdown = (char) => {
        setNewNote(prev => ({ ...prev, content: prev.content + char }));
    };

    // LOAD DATA
    useEffect(() => {
        if (typeof window === 'undefined') return; // Client check

        if (isOpen) {
            const savedNotes = JSON.parse(localStorage.getItem('finance_buddy_notes') || '[]');
            const savedFolders = JSON.parse(localStorage.getItem('finance_buddy_folders') || '[{"id":"default","name":"Main Folder"}]');
            setNotes(savedNotes);
            setFolders(savedFolders);
        }
    }, [isOpen]);

    // SAVE DATA
    const handleSave = () => {
        if (!newNote.title.trim() && !newNote.content.trim()) return;

        // NEW: Extract tags
        const extractedTags = (newNote.content.match(/#[a-zA-Z0-9_]+/g) || []);

        const noteObj = {
            id: Date.now().toString(),
            title: newNote.title || 'Untitled Note',
            content: newNote.content,
            folderId: newNote.folderId,
            color: newNote.color, // Preserved Color
            tags: extractedTags,
            isPinned: false,
            timestamp: new Date().toLocaleString(),
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString()
        };

        const updatedNotes = [noteObj, ...notes];
        setNotes(updatedNotes);
        localStorage.setItem('finance_buddy_notes', JSON.stringify(updatedNotes));
        
        // Sync API
        const { default: api } = require('@/lib/api');
        api.post('/sync/data', { notes: updatedNotes.filter(n => n.id !== 'demo_note'), folders }).catch(e => console.error(e));
        
        setTimeout(() => window.dispatchEvent(new Event('finance_buddy_data_updated')), 50);

        // Reset form
        setNewNote({ title: '', content: '', folderId: 'default', color: 'bg-yellow-100 border-yellow-200' });
        setIsAdding(false);
    };

    // OLD FEATURE: Delete
    const handleDelete = (id) => {
        const updatedNotes = notes.filter(n => n.id !== id);
        setNotes(updatedNotes);
        localStorage.setItem('finance_buddy_notes', JSON.stringify(updatedNotes));
    };

    const openNote = (id) => {
        // router.push with query
        router.push(`/dashboard/notes?openNoteId=${id}`);
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Drawer Panel */}
            <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-[70] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-2 text-gray-800">
                        <PenLine size={20} />
                        <h2 className="font-bold text-lg">Quick Notes</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="h-[calc(100vh-4rem)] overflow-y-auto p-6 bg-gray-50/50">

                    {/* Add New Section */}
                    {!isAdding ? (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all mb-6 font-medium"
                        >
                            <Plus size={20} /> Add Quick Note
                        </button>
                    ) : (
                        <div className={`p-4 rounded-xl shadow-md border mb-6 animate-in fade-in slide-in-from-top-4 bg-white border-gray-200`}>

                            {/* Title Input */}
                            <input
                                type="text"
                                placeholder="Title..."
                                className="w-full font-bold text-gray-900 placeholder-gray-400 outline-none mb-3 bg-transparent"
                                value={newNote.title}
                                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                            />

                            {/* Markdown Toolbar (NEW) */}
                            <div className="flex gap-2 mb-2 border-b border-gray-100 pb-2">
                                <button onClick={() => insertMarkdown('**bold** ')} className="p-1 hover:bg-gray-100 rounded text-gray-500" title="Bold"><Bold size={14} /></button>
                                <button onClick={() => insertMarkdown('- ')} className="p-1 hover:bg-gray-100 rounded text-gray-500" title="List"><List size={14} /></button>
                                <button onClick={() => insertMarkdown('- [ ] ')} className="p-1 hover:bg-gray-100 rounded text-gray-500" title="Checkbox"><CheckSquare size={14} /></button>
                            </div>

                            {/* Content Input */}
                            <textarea
                                placeholder="#tag, **bold**, - list"
                                className="w-full text-sm text-gray-600 outline-none resize-none h-32 mb-3 font-mono bg-transparent"
                                value={newNote.content}
                                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                            />

                            {/* Controls: Color & Folder */}
                            <div className="space-y-3">

                                {/* Color Picker (OLD) */}
                                <div className="flex gap-2">
                                    {colors.map((c) => (
                                        <button
                                            key={c.name}
                                            onClick={() => setNewNote({ ...newNote, color: c.value })}
                                            className={`w-5 h-5 rounded-full border shadow-sm ${c.value.split(' ')[0]} ${newNote.color === c.value ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : ''}`}
                                            title={c.name}
                                        />
                                    ))}
                                </div>

                                {/* Footer Actions */}
                                <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                                    {/* Folder Select (NEW) */}
                                    <select
                                        className="bg-gray-50 border border-gray-200 rounded-lg text-xs p-1.5 outline-none max-w-[120px]"
                                        value={newNote.folderId}
                                        onChange={(e) => setNewNote({ ...newNote, folderId: e.target.value })}
                                    >
                                        {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>

                                    <div className="flex gap-2">
                                        <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600 text-sm">Cancel</button>
                                        <button onClick={handleSave} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-blue-700">
                                            <Save size={14} /> Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notes List */}
                    <div className="space-y-4">
                        {notes.length === 0 && !isAdding && (
                            <div className="text-center text-gray-400 mt-10">
                                <p>No notes yet.</p>
                                <p className="text-sm">Click "Add Quick Note" to get started.</p>
                            </div>
                        )}

                        {notes.map((note) => (
                            <div
                                key={note.id}
                                onClick={() => openNote(note.id)}
                                className={`p-4 rounded-xl border shadow-sm relative group hover:shadow-md transition-shadow cursor-pointer ${note.color || 'bg-white border-gray-200'}`}
                            >
                                <h3 className="font-bold text-gray-800 mb-1">{note.title}</h3>

                                {/* Markdown Render (NEW) */}
                                <div className="text-sm text-gray-700 prose prose-sm max-w-none mb-3">
                                    <ReactMarkdown>{note.content}</ReactMarkdown>
                                </div>

                                {/* Footer: Clock & Delete (OLD) */}
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/5">
                                    <div className="flex items-center gap-1 text-[10px] text-gray-600 font-medium uppercase tracking-wider">
                                        <Clock size={10} /> {note.timestamp}
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                                        className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                        title="Delete Note"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
