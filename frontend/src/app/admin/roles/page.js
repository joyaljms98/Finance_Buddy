'use client';

import React, { useState, useContext, useEffect } from 'react';
import { Shield, Plus, Check, X, PanelLeftOpen, PanelLeftClose, User as UserIcon } from 'lucide-react';
import { AdminSidebarContext } from '@/components/AdminSidebarWrapper';
import { usePermissions } from '@/context/PermissionsContext';
import { useUsers } from '@/context/UsersContext';

export default function AdminRoles() {
    const { isSidebarOpen, setIsSidebarOpen } = useContext(AdminSidebarContext);
    const { roles, isLoaded: rolesLoaded, updateRolePermissions, updateEditorOverrides } = usePermissions();
    const { users, isLoaded: usersLoaded } = useUsers();

    // The primary mode: Are we configuring the generic 'User' role, or a specific 'Editor'?
    const [selectedRoleType, setSelectedRoleType] = useState('Editor'); // 'User', 'Editor'

    // For specific Editors
    const editors = users.filter(u => u.role === 'Editor');
    const [selectedEditorId, setSelectedEditorId] = useState(null);

    // Active unsaved permission state
    const [editedPermissions, setEditedPermissions] = useState(null);
    const [isDirty, setIsDirty] = useState(false);

    // Initialization logic when shifting selections
    useEffect(() => {
        if (!rolesLoaded || !usersLoaded) return;

        if (selectedRoleType === 'User') {
            const userRole = roles.find(r => r.name === 'User');
            if (userRole) {
                setEditedPermissions(JSON.parse(JSON.stringify(userRole.permissions)));
                setIsDirty(false);
            }
        } else if (selectedRoleType === 'Editor') {
            if (editors.length > 0 && !selectedEditorId) {
                setSelectedEditorId(editors[0].user_id);
            }
        }
    }, [selectedRoleType, rolesLoaded, usersLoaded, roles]); // `roles` added so it updates when we save

    useEffect(() => {
        if (!rolesLoaded || selectedRoleType !== 'Editor' || !selectedEditorId) return;

        const editorRole = roles.find(r => r.name === 'Editor');
        if (editorRole) {
            // Load overrides if they exist, else load generic Editor defaults
            const overrides = editorRole.editorOverrides?.[selectedEditorId] || editorRole.permissions;
            setEditedPermissions(JSON.parse(JSON.stringify(overrides)));
            setIsDirty(false);
        }
    }, [selectedEditorId, selectedRoleType, rolesLoaded, roles]);

    const handleRoleSelect = (type) => {
        if (isDirty) {
            if (!confirm("You have unsaved changes. Discard them?")) return;
        }
        setSelectedRoleType(type);
    };

    const handleEditorSelect = (editorId) => {
        if (isDirty) {
            if (!confirm("You have unsaved changes. Discard them?")) return;
        }
        setSelectedEditorId(editorId);
    };

    const handleTogglePermission = (group, action) => {
        setEditedPermissions(prev => {
            const newPerms = JSON.parse(JSON.stringify(prev));
            if (!newPerms[group]) newPerms[group] = {};
            newPerms[group][action] = !newPerms[group][action];
            return newPerms;
        });
        setIsDirty(true);
    };

    const handleSave = () => {
        if (selectedRoleType === 'User') {
            const userRole = roles.find(r => r.name === 'User');
            if (userRole) updateRolePermissions(userRole.id, editedPermissions);
            alert("User permissions updated successfully.");
        } else if (selectedRoleType === 'Editor' && selectedEditorId) {
            updateEditorOverrides(selectedEditorId, editedPermissions);
            alert("Editor permissions customized successfully.");
        }
        setIsDirty(false);
    };

    const handleCancel = () => {
        if (selectedRoleType === 'User') {
            const userRole = roles.find(r => r.name === 'User');
            if (userRole) setEditedPermissions(JSON.parse(JSON.stringify(userRole.permissions)));
        } else if (selectedRoleType === 'Editor' && selectedEditorId) {
            const editorRole = roles.find(r => r.name === 'Editor');
            if (editorRole) {
                const overrides = editorRole.editorOverrides?.[selectedEditorId] || editorRole.permissions;
                setEditedPermissions(JSON.parse(JSON.stringify(overrides)));
            }
        }
        setIsDirty(false);
    };

    if (!rolesLoaded || !usersLoaded) {
        return <div className="p-8 flex items-center justify-center">Loading Permissions...</div>;
    }

    const renderPermissionBlock = (groupKey, groupTitle, colorClass, actionsList) => (
        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className={`${colorClass} p-4 border-b border-gray-100 text-white flex justify-between items-center`}>
                <h3 className="font-bold">{groupTitle}</h3>
            </div>
            <div className="p-2 bg-white flex flex-col gap-1">
                {actionsList.map((actionCfg) => {
                    const isOn = editedPermissions[groupKey]?.[actionCfg.action] || false;
                    return (
                        <div
                            key={actionCfg.action}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                            onClick={() => handleTogglePermission(groupKey, actionCfg.action)}
                        >
                            <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">{actionCfg.label}</span>
                            <div className={`w-12 h-6 rounded-full transition-colors relative ${isOn ? 'bg-green-500' : 'bg-gray-300'}`}>
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${isOn ? 'left-7' : 'left-1'}`} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderEditorToggle = (groupKey, groupTitle, description, iconColor, action = 'create') => {
        const isOn = editedPermissions[groupKey]?.[action] || false;
        return (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${iconColor} bg-opacity-10 text-opacity-100`}>
                        <Shield size={24} />
                    </div>
                    <div 
                        className={`w-14 h-7 rounded-full transition-colors relative cursor-pointer ${isOn ? 'bg-green-500' : 'bg-gray-300'}`}
                        onClick={() => handleTogglePermission(groupKey, action)}
                    >
                        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${isOn ? 'left-8' : 'left-1'}`} />
                    </div>
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{groupTitle}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Status</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${isOn ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {isOn ? 'ENABLED' : 'DISABLED'}
                    </span>
                </div>
            </div>
        );
    };

    // Dynamic Title Logic
    let currentTitle = '';
    let currentDesc = '';

    if (selectedRoleType === 'User') {
        currentTitle = 'User Permissions';
        currentDesc = 'Base access for registered users on the platform.';
    } else {
        const editorObj = editors.find(e => e.user_id === selectedEditorId);
        currentTitle = editorObj ? `Editing: ${editorObj.name}` : 'Editor Configuration';
        currentDesc = 'Customize what this specific Editor can manage.';
    }

    return (
        <main className="flex-1 transition-all w-full flex text-gray-800 font-sans relative animate-in fade-in zoom-in-95 duration-500 min-h-screen">
            <div className="flex-1 flex flex-col bg-gray-50/50 relative rounded-2xl shadow-sm my-4 mx-4 border border-gray-100 overflow-hidden">
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
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-xl font-bold text-gray-900">Roles & Permissions</h1>
                                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold border border-amber-200">Preview - Work in progress for Next update</span>
                            </div>
                            <p className="text-sm text-gray-500">Configure access control levels system-wide.</p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-hidden p-6 relative flex flex-col md:flex-row gap-6">

                    {/* Roles List Sidebar */}
                    <div className="w-full md:w-64 flex flex-col gap-2 shrink-0 h-full overflow-y-auto pr-2 custom-scrollbar">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Role Types</h3>

                        <button
                            onClick={() => handleRoleSelect('User')}
                            className={`w-full text-left p-4 rounded-xl transition-all flex flex-col gap-1 border-2 ${selectedRoleType === 'User'
                                ? 'bg-blue-50 border-blue-500 shadow-sm'
                                : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <span className={`font-bold ${selectedRoleType === 'User' ? 'text-blue-700' : 'text-gray-700'}`}>Public User</span>
                            <span className="text-xs text-gray-500 leading-snug">Base viewing access</span>
                        </button>

                        <button
                            onClick={() => handleRoleSelect('Editor')}
                            className={`w-full text-left p-4 rounded-xl transition-all flex flex-col gap-1 border-2 ${selectedRoleType === 'Editor'
                                ? 'bg-blue-50 border-blue-500 shadow-sm'
                                : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <span className={`font-bold ${selectedRoleType === 'Editor' ? 'text-blue-700' : 'text-gray-700'}`}>Editors</span>
                            <span className="text-xs text-gray-500 leading-snug">Customized content teams</span>
                        </button>

                        {/* Editor Sub-List */}
                        {selectedRoleType === 'Editor' && (
                            <div className="pl-4 mt-2 space-y-1 border-l-2 border-gray-200 ml-4 animate-in slide-in-from-left-2 duration-300">
                                {editors.length === 0 ? (
                                    <div className="text-xs text-gray-500 py-2">No editors found. Please add them in User Management.</div>
                                ) : (
                                    editors.map(editor => (
                                        <button
                                            key={editor.user_id}
                                            onClick={() => handleEditorSelect(editor.user_id)}
                                            className={`w-full text-left py-2 px-3 rounded-lg flex items-center gap-2 transition-all ${selectedEditorId === editor.user_id
                                                    ? 'bg-indigo-100 text-indigo-800 font-bold'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            <UserIcon size={14} />
                                            <span className="text-sm truncate">@{editor.user_id}</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Permissions Grid */}
                    {editedPermissions && (!(selectedRoleType === 'Editor' && !selectedEditorId)) ? (
                        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-full">
                            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Shield className={selectedRoleType === 'Editor' ? 'text-purple-600' : 'text-blue-600'} size={20} />
                                        {currentTitle}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">{currentDesc}</p>
                                </div>
                                <div className="flex gap-3">
                                    {isDirty && (
                                        <button
                                            onClick={handleCancel}
                                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            Discard
                                        </button>
                                    )}
                                    <button
                                        onClick={handleSave}
                                        disabled={!isDirty}
                                        className={`px-6 py-2 text-sm font-bold rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isDirty
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                                {selectedRoleType === 'Editor' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {renderEditorToggle('articles', 'Articles', 'Allow creation of financial wisdom and knowledge base articles.', 'text-blue-600')}
                                        {renderEditorToggle('reminders', 'Reminders', 'Allow creation of system-wide broadcast reminders for users.', 'text-purple-600')}
                                        {renderEditorToggle('chatbot', 'Chatbot & RAG', 'Allow editing of AI model settings, rag paths and system prompts.', 'text-slate-700', 'edit')}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {renderPermissionBlock('content', 'Content & Resources', 'bg-blue-600', [
                                            { action: 'view', label: 'View Content Base' },
                                            { action: 'create', label: 'Create Drafts' },
                                            { action: 'edit', label: 'Edit Content' },
                                            { action: 'publish', label: 'Publish Live' },
                                            { action: 'delete', label: 'Delete Content' }
                                        ])}
                                        {renderPermissionBlock('users', 'User Management', 'bg-purple-600', [
                                            { action: 'view', label: 'View Users' },
                                            { action: 'create', label: 'Create Users' },
                                            { action: 'edit', label: 'Edit Users' },
                                            { action: 'delete', label: 'Delete Users' }
                                        ])}
                                        {renderPermissionBlock('settings', 'System Settings', 'bg-slate-700', [
                                            { action: 'view', label: 'View Settings' },
                                            { action: 'edit', label: 'Modify Settings' }
                                        ])}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center p-8 text-center h-full">
                            <Shield className="text-gray-300 mb-4" size={48} />
                            <h3 className="text-lg font-bold text-gray-500 mb-2">No Item Selected</h3>
                            <p className="text-sm text-gray-400 max-w-sm">
                                Please select a Role or specific Editor from the sidebar to preview and configure their permission capabilities.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
