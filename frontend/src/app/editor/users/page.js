'use client';

import React, { useState, useContext } from 'react';
import { Search, MoreVertical, Edit, Trash2, Shield, Eye, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { EditorSidebarContext } from '@/components/EditorSidebarWrapper';
import { usePermissions } from '@/context/PermissionsContext';
import { useUsers } from '@/context/UsersContext';

export default function EditorUsersPage() {
    const { isSidebarOpen, setIsSidebarOpen } = useContext(EditorSidebarContext);
    const { checkPermission } = usePermissions();
    const { users, activeUser } = useUsers();

    // Check specific Editor ID
    const editorId = activeUser?.userId;
    const canView = checkPermission('Editor', 'users', 'view', editorId);
    const canEdit = checkPermission('Editor', 'users', 'edit', editorId);
    const canDelete = checkPermission('Editor', 'users', 'delete', editorId);

    const [searchTerm, setSearchTerm] = useState('');

    // Filter out super Admin to match admin portal logic, though Editor likely shouldn't see Admin either
    // Enforce "View Users" permission
    const viewableUsers = canView ? users.filter(u => u.role !== 'Admin') : [];

    const filteredUsers = viewableUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="flex-1 transition-all w-full flex text-gray-800 font-sans relative animate-in fade-in zoom-in-95 duration-500 h-[calc(100vh-2rem)]">
            <div className="flex-1 flex flex-col bg-gray-50/50 relative rounded-2xl shadow-sm m-4 border border-gray-100 overflow-hidden">
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shrink-0">
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
                            <p className="text-sm text-gray-500">View platform users. Permissions govern actions available.</p>
                        </div>
                    </div>
                    {/* Decorative element or standard button here if needed */}
                </header>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    {!canView ? (
                        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-red-200">
                            <Shield className="text-red-300 mb-4" size={48} />
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Access Restricted</h3>
                            <p className="text-gray-500">You do not have permission to view the user list.</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                                <div className="relative w-full sm:w-96">
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                    />
                                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="p-8 text-center text-gray-500">No users found matching your search.</td>
                                                </tr>
                                            ) : (
                                                filteredUsers.map((user) => (
                                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold shrink-0 shadow-inner">
                                                                    {user.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{user.name}</div>
                                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${user.role === 'Admin' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                user.role === 'Editor' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                                    'bg-blue-50 text-blue-700 border-blue-200'
                                                                }`}>
                                                                {user.role === 'Admin' && <Shield size={12} />}
                                                                {user.role}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${user.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                user.status === 'Suspended' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                    'bg-gray-100 text-gray-600 border-gray-200'
                                                                }`}>
                                                                <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-green-500' : user.status === 'Suspended' ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                                                                {user.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {canEdit ? (
                                                                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip-trigger" title="Edit Profile (Mock)">
                                                                        <Edit size={16} />
                                                                    </button>
                                                                ) : (
                                                                    <button className="p-2 text-gray-300 cursor-not-allowed" title="No Edit Permission">
                                                                        <Eye size={16} /> {/* View only fallback */}
                                                                    </button>
                                                                )}

                                                                {canDelete && (
                                                                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip-trigger" title="Delete User (Mock)">
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
