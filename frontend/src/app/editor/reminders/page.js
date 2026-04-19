'use client';

import React, { useState } from 'react';
import { useReminders } from '@/context/RemindersContext';
import { useUsers } from '@/context/UsersContext';
import { usePermissions } from '@/context/PermissionsContext';
import { Bell, Plus, Trash2, Edit3, X, Users, CalendarClock, Lock, AlertTriangle } from 'lucide-react';

export default function EditorRemindersPage() {
    const { myReminders, addReminder, updateReminder, deleteReminder } = useReminders();
    const { activeUser } = useUsers();
    const { checkPermission } = usePermissions();

    const canCreate = checkPermission('Editor', 'reminders', 'create', activeUser?.user_id);
    const canEdit = true; // Still allow editing own existing reminders as per default but creation is the main toggle
    const canDelete = true;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReminder, setSelectedReminder] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        targetGroup: 'all_users'
    });

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
                targetGroup: 'all_users', // Enforce all_users target
                createdBy: activeUser.userId
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
        return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-bold">{target}</span>;
    };

    return (
        <div className="w-full p-6 md:p-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
            
            {!canCreate && (
                <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-800 animate-in slide-in-from-top-2">
                    <AlertTriangle size={20} className="shrink-0" />
                    <p className="text-sm font-medium">
                        <span className="font-bold underline">Role Note:</span> The Administrator has disabled your ability to **Create New Broadcasts**. You can still view existing reminders.
                    </p>
                </div>
            )}

            {/* Header */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute -left-20 -top-20 w-64 h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-3xl opacity-50 z-0 pointer-events-none"></div>
                <div className="relative z-10 flex items-center gap-5">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-inner">
                        <Bell className="text-blue-600" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Manage Reminders</h1>
                        <p className="text-gray-500">Create reminders that will appear in every user&apos;s calendar.</p>
                    </div>
                </div>
                {canCreate ? (
                    <button
                        onClick={() => handleOpenModal()}
                        className="relative z-10 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-blue-200 active:scale-95"
                    >
                        <Plus size={18} /> New Broadcast
                    </button>
                ) : (
                    <div className="relative z-10 bg-gray-100 text-gray-400 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 border border-gray-200 cursor-not-allowed group">
                        <Lock size={18} /> New Broadcast
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">Permission required</div>
                    </div>
                )}
            </div>

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
                                            <p>No reminders visible to you.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                myReminders.sort((a, b) => new Date(a.date) - new Date(b.date)).map((r) => {
                                    const isMine = r.createdBy === activeUser?.userId;

                                    return (
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
                                                <span className={`text-sm ${isMine ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                                                    {isMine ? 'Me' : r.createdBy === 'admin' ? 'System Admin' : r.createdBy}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {isMine ? (
                                                        <>
                                                            <button onClick={() => handleOpenModal(r)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit your reminder">
                                                                <Edit3 size={18} />
                                                            </button>
                                                            <button onClick={() => handleDelete(r.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete your reminder">
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="p-2 text-gray-300" title="You can only edit reminders you created">
                                                            <Lock size={16} />
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
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
                            <h3 className="text-xl font-bold text-gray-800">{selectedReminder ? 'Edit Broadcast' : 'New Broadcast'}</h3>
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
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                    placeholder="e.g. Weekly Survey Available"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Description / Note</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white min-h-[100px] resize-none"
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
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Target Group</label>
                                    <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed">
                                        All Users
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">Editors can only broadcast to all users.</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">
                                    {selectedReminder ? 'Save Changes' : 'Broadcast to Users'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
