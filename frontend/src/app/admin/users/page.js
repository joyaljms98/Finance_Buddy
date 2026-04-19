'use client';

import React, { useState, useContext } from 'react';
import { Search, Edit, Trash2, PanelLeftOpen, PanelLeftClose, UserPlus } from 'lucide-react';
import { AdminSidebarContext } from '@/components/AdminSidebarWrapper';
import { useUsers } from '@/context/UsersContext';
import { usePermissions } from '@/context/PermissionsContext';

export default function AdminUsersPage() {
    const { isSidebarOpen, setIsSidebarOpen } = useContext(AdminSidebarContext);
    const { users, addUser, updateUser, deleteUser } = useUsers();
    const { initializeEditorOverride } = usePermissions();

    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('Asc'); 
    const [roleFilter, setRoleFilter] = useState('All'); 

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);

    // Forms
    const [formData, setFormData] = useState({ name: '', email: '', role: 'User', status: 'Active' });
    const [formError, setFormError] = useState('');
    const [toastMessage, setToastMessage] = useState('');

    const filteredUsers = users
        .filter(user => user.role !== 'Admin') // Hide search/admin from list if needed, or filter specifically
        .filter(user =>
            (roleFilter === 'All' || user.role === roleFilter) &&
            (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.user_id && user.user_id.includes(searchTerm)))
        )
        .sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            if (sortOrder === 'Asc') return nameA.localeCompare(nameB);
            return nameB.localeCompare(nameA);
        });

    const handleAddUser = async (e) => {
        e.preventDefault();
        setFormError('');

        const result = await addUser({
            ...formData,
            password: '12345678' // default password
        });

        if (result.success) {
            if (formData.role === 'Editor' && result.user) {
                initializeEditorOverride(result.user.user_id);
            }
            setIsAddModalOpen(false);
            setFormData({ name: '', email: '', role: 'User', status: 'Active' });
            setToastMessage('New user successfully created!');
            setTimeout(() => setToastMessage(''), 3000);
        } else {
            setFormError(result.error);
        }
    };

    const handleEditUser = async (e) => {
        e.preventDefault();
        setFormError('');

        const result = await updateUser(userToEdit.id || userToEdit.user_id, formData);

        if (result.success) {
            setIsEditModalOpen(false);
            setUserToEdit(null);
            setToastMessage('User updated successfully!');
            setTimeout(() => setToastMessage(''), 3000);
        } else {
            setFormError(result.error);
        }
    };

    const handleDelete = (id, name) => {
        if (confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) {
            deleteUser(id);
        }
    };

    const openEditModal = (user) => {
        setUserToEdit(user);
        setFormData({ name: user.name, email: user.email, role: user.role, status: user.status });
        setIsEditModalOpen(true);
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
                            <h1 className="text-xl font-bold text-gray-900">User Management</h1>
                            <p className="text-sm text-gray-500">Manage user & editor access.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => {
                                setFormData({ name: '', email: '', role: 'User', status: 'Active' });
                                setFormError('');
                                setIsAddModalOpen(true);
                            }}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap"
                        >
                            <UserPlus size={18} /> Add User/Editor
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 relative">
                    {toastMessage && (
                        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-2 rounded-full shadow-lg font-bold text-sm z-[100] animate-in fade-in slide-in-from-top-4">
                            {toastMessage}
                        </div>
                    )}

                    {/* Controls Bar */}
                    <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-4 w-full lg:w-auto">
                            <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-medium">
                                <button
                                    onClick={() => setRoleFilter('All')}
                                    className={`px-4 py-1.5 rounded-md transition-all ${roleFilter === 'All' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                >All</button>
                                <button
                                    onClick={() => setRoleFilter('Editor')}
                                    className={`px-4 py-1.5 rounded-md transition-all ${roleFilter === 'Editor' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                >Editors</button>
                                <button
                                    onClick={() => setRoleFilter('User')}
                                    className={`px-4 py-1.5 rounded-md transition-all ${roleFilter === 'User' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                >Users</button>
                            </div>

                            <div className="relative w-full lg:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search details..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm bg-gray-50"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full lg:w-auto">
                            <span className="text-sm font-medium text-gray-500">Sort by Name:</span>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="border border-gray-200 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                            >
                                <option value="Asc">A to Z</option>
                                <option value="Desc">Z to A</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                                        <th className="p-4 font-medium">User Profile</th>
                                        <th className="p-4 font-medium">User ID</th>
                                        <th className="p-4 font-medium">Role</th>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-gray-400">No users found matching your criteria.</td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id || user.user_id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 ${user.role === 'Editor' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 line-clamp-1">{user.name}</p>
                                                            <p className="text-xs text-gray-500 line-clamp-1">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm font-medium text-gray-700">
                                                    #{user.user_id}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${user.role === 'Editor' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : user.status === 'Suspended' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => openEditModal(user)}
                                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit Profile">
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user.id || user.user_id, user.name)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete User">
                                                            <Trash2 size={16} />
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
                </div>
            </div>

            {/* Add User Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 text-center">
                            <h2 className="text-xl font-bold text-gray-900">Add New Profile</h2>
                            <p className="text-sm text-gray-500 mt-1">Default password: <span className="font-mono font-bold bg-gray-200 px-1 py-0.5 rounded italic">12345678</span></p>
                        </div>
                        <form onSubmit={handleAddUser} className="p-6 space-y-4">
                            {formError && <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">{formError}</div>}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Full Name</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" placeholder="e.g. John Doe" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Email Address</label>
                                <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" placeholder="john@example.com" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Account Role</label>
                                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50">
                                        <option value="User">Regular User</option>
                                        <option value="Editor">Editor</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Status</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50">
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-100 transition-all active:scale-95">Create Profile</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">Edit User Profile</h2>
                        </div>
                        <form onSubmit={handleEditUser} className="p-6 space-y-4">
                            {formError && <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">{formError}</div>}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Full Name</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Email Address</label>
                                <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Role</label>
                                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50">
                                        <option value="User">Regular User</option>
                                        <option value="Editor">Editor</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Status</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50">
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Suspended">Suspended</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-100 transition-all active:scale-95">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}