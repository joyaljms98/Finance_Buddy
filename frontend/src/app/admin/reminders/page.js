'use client';

import React, { useState, useContext } from 'react';
import { useReminders } from '@/context/RemindersContext';
import { useUsers } from '@/context/UsersContext';
import { Bell, Plus, Trash2, Edit3, X, Users, UserCog, CalendarClock, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { AdminSidebarContext } from '@/components/AdminSidebarWrapper';

export default function AdminRemindersPage() {
    const { isSidebarOpen, setIsSidebarOpen } = useContext(AdminSidebarContext);
    const { myReminders, addReminder, updateReminder, deleteReminder } = useReminders();
    const { users } = useUsers();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReminder, setSelectedReminder] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        targetGroup: 'all_users'
    });

    const editors = users.filter(u => u.role === 'Editor');

    const handleOpenModal = (reminder = null) => {
        if (reminder) {
            setSelectedReminder(reminder);
            setFormData({
                title: reminder.title,
                description: reminder.description,
                date: reminder.date,
                targetGroup: reminder.targetGroup
            });
        } else {
            setSelectedReminder(null);

            // default date tomorrow 9am
            const d = new Date();
            d.setDate(d.getDate() + 1);
            d.setHours(9, 0, 0, 0);
            const tmrw = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);

            setFormData({
                title: '',
                description: '',
                date: tmrw,
                targetGroup: 'all_users'
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (selectedReminder) {
            updateReminder(selectedReminder.id, formData);
        } else {
            addReminder({
                ...formData,
                createdBy: 'admin'
            });
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this reminder?")) {
            deleteReminder(id);
        }
    };

    const getTargetBadge = (target) => {
        if (target === 'all_users') return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1"><Users size={12} /> All Users</span>;
        if (target === 'all_editors') return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1"><UserCog size={12} /> All Editors</span>;

        const editor = editors.find(e => e.email === target);
        if (editor) return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1"><UserCog size={12} /> {editor.name}</span>;

        return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-bold">{target}</span>;
    };

    return (
        <main className="flex-1 transition-all w-full flex text-gray-800 font-sans relative animate-in fade-in zoom-in-95 duration-500 h-full">
            <div className="flex-1 flex flex-col bg-gray-50/50 relative rounded-2xl shadow-sm m-4 border border-gray-100 overflow-hidden h-[calc(100vh-2rem)]">
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
                            <h1 className="text-xl font-bold text-gray-900">Manage Reminders</h1>
                            <p className="text-sm text-gray-500">Broadcast important dates to Users and Editors.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-lg shadow-blue-200 text-sm whitespace-nowrap"
                        >
                            <Plus size={18} /> New Reminder
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 relative">
            {/* List */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Target</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Creator</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myReminders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <CalendarClock size={48} className="text-gray-200" />
                                            <p>No global reminders found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                myReminders.sort((a, b) => new Date(a.date) - new Date(b.date)).map((r) => (
                                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <p className="font-bold text-gray-900">{r.title}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-xs">{r.description}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            {getTargetBadge(r.targetGroup)}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">
                                                {new Date(r.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm text-gray-500">{r.createdBy === 'admin' ? 'Admin' : r.createdBy}</span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(r)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                    <Edit3 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(r.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-800">{selectedReminder ? 'Edit Reminder' : 'New Reminder'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Reminder Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                    placeholder="e.g. System Maintenance, Market Holiday"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Description / Note</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white min-h-[100px] resize-none"
                                    placeholder="More details..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Target Group</label>
                                    <select
                                        value={formData.targetGroup}
                                        onChange={e => setFormData({ ...formData, targetGroup: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                    >
                                        <option value="all_users">All Normal Users</option>
                                        <option value="all_editors">All Editors</option>
                                        <optgroup label="Specific Editor">
                                            {editors.map(e => (
                                                <option key={e.email} value={e.email}>{e.name} ({e.email})</option>
                                            ))}
                                        </optgroup>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all active:scale-95">
                                    {selectedReminder ? 'Save Changes' : 'Broadcast Reminder'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
                </div>
            </div>
        </main>
    );
}
