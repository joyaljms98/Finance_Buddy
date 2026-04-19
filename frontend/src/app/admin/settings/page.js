'use client';

import React, { useState, useContext, useEffect } from 'react';
import { Save, AlertTriangle, Monitor, Globe, Mail, PanelLeftOpen, PanelLeftClose, Download, Database, Lock, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { useUsers } from '@/context/UsersContext';
import { AdminSidebarContext } from '@/components/AdminSidebarWrapper';

const AdminSettings = () => {
    const { isSidebarOpen, setIsSidebarOpen } = useContext(AdminSidebarContext);
    const { activeUser } = useUsers();
    
    const [settings, setSettings] = useState({
        adminName: 'Finance Buddy Admin',
        maintenanceMode: false,
        allowRegistration: true,
        supportEmail: 'support@financebuddy.com',
        contactNumber: '+91 98765 43210',
        officeAddress: 'Finance Buddy Admin HQ',
        adminCheatcode: 'admin123'
    });
    const [initialSettings, setInitialSettings] = useState(null);

    // Password Update State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [pwStatus, setPwStatus] = useState({ type: '', msg: '' });
    const [isUpdatingPw, setIsUpdatingPw] = useState(false);
    const [showPw1, setShowPw1] = useState(false);
    const [showPw2, setShowPw2] = useState(false);

    useEffect(() => {
        const storedSettings = localStorage.getItem('systemSettings');
        if (storedSettings) {
            const parsed = JSON.parse(storedSettings);
            setSettings(parsed);
            setInitialSettings(parsed);
        } else {
            // Fallback for previous cheatcode
            const storedCode = localStorage.getItem('adminCheatcode');
            if (storedCode) {
                setSettings(prev => ({ ...prev, adminCheatcode: storedCode }));
                setInitialSettings(prev => ({ ...prev, adminCheatcode: storedCode }));
            } else {
                setInitialSettings({
                    adminName: 'Finance Buddy Admin',
                    maintenanceMode: false,
                    allowRegistration: true,
                    supportEmail: 'support@financebuddy.com',
                    contactNumber: '+91 98765 43210',
                    officeAddress: 'Finance Buddy Admin HQ',
                    adminCheatcode: 'admin123'
                });
            }
        }
    }, []);

    const isDirty = initialSettings && JSON.stringify(settings) !== JSON.stringify(initialSettings);

    const handleSave = () => {
        localStorage.setItem('systemSettings', JSON.stringify(settings));
        localStorage.setItem('adminCheatcode', settings.adminCheatcode); // Required for cheatcode listener
        setInitialSettings(settings);
        alert("System Settings saved successfully!");
    };

    const handlePasswordUpdate = async () => {
        if (!currentPassword || !newPassword) {
            setPwStatus({ type: 'error', msg: 'Please fill in both password fields.' });
            return;
        }

        setIsUpdatingPw(true);
        setPwStatus({ type: '', msg: '' });

        try {
            await api.put('/auth/update-password', {
                current_password: currentPassword,
                new_password: newPassword
            });
            setPwStatus({ type: 'success', msg: 'Password updated successfully!' });
            setCurrentPassword('');
            setNewPassword('');
        } catch (err) {
            setPwStatus({
                type: 'error',
                msg: err.response?.data?.detail || 'Failed to update password.'
            });
        } finally {
            setIsUpdatingPw(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleBackup = () => {
        // Simple manual JSON backup of keys
        const backupData = {
            settings: localStorage.getItem('systemSettings'),
            users: localStorage.getItem('appUsers'),
            permissions: localStorage.getItem('appPermissions'),
            timestamp: new Date().toISOString()
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
        const element = document.createElement('a');
        element.setAttribute("href", dataStr);
        element.setAttribute("download", `finance_buddy_backup_${new Date().getTime()}.json`);
        document.body.appendChild(element);
        element.click();
        element.remove();
    };

    return (
        <main className="flex-1 transition-all w-full flex text-gray-800 font-sans relative animate-in fade-in zoom-in-95 duration-500 h-full">
            <div className="flex-1 flex flex-col bg-gray-50/50 relative rounded-2xl shadow-sm m-4 border border-gray-100 overflow-hidden h-[calc(100vh-2rem)]">
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
                            <h1 className="text-xl font-bold text-gray-900">System Settings</h1>
                            <p className="text-sm text-gray-500">Configure global application settings.</p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar relative" data-lenis-prevent="true">
                    <div className="flex flex-col gap-6 p-6">

                        {/* General Settings */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                                    <Globe size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">General Information</h3>
                                    <p className="text-sm text-gray-500">Basic site configuration.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name</label>
                                    <input
                                        type="text"
                                        name="adminName"
                                        value={settings.adminName || ''}
                                        onChange={handleChange}
                                        className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="email"
                                            name="supportEmail"
                                            value={settings.supportEmail || ''}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 select-none">📞</span>
                                        <input
                                            type="tel"
                                            name="contactNumber"
                                            value={settings.contactNumber || ''}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Office Address</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 select-none">🏢</span>
                                        <input
                                            type="text"
                                            name="officeAddress"
                                            value={settings.officeAddress || ''}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Access Control */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                                    <Monitor size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Access Control</h3>
                                    <p className="text-sm text-gray-500">Manage site availability and registration.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Allow New Registrations</h4>
                                        <p className="text-xs text-gray-500">If disabled, no new users can sign up.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name="allowRegistration" checked={settings.allowRegistration || false} onChange={handleChange} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div id="maintenance" className="flex items-center justify-between p-4 border border-orange-100 bg-orange-50/50 rounded-xl">
                                    <div>
                                        <h4 className="font-medium text-orange-900 flex items-center gap-2">
                                            <AlertTriangle size={16} /> Maintenance Mode
                                        </h4>
                                        <p className="text-xs text-orange-700">Disable access for all non-admin users.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode || false} onChange={handleChange} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Admin Security & Password Change */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="p-3 bg-red-100 rounded-xl text-red-600">
                                        <AlertTriangle size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Advanced Security</h3>
                                        <p className="text-sm text-gray-500">Configure hidden access points.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Admin Dashboard Cheatcode</label>
                                        <input
                                            type="text"
                                            name="adminCheatcode"
                                            value={settings.adminCheatcode || ''}
                                            onChange={handleChange}
                                            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm"
                                        />
                                        <p className="text-xs text-gray-500 mt-2">When typed sequentially on the Home Page, this phrase immediately redirects you to the Admin Dashboard. (Default: admin123)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Password Change Section */}
                            <div className="p-6">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                                        <Lock size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900">Change Admin Password</h3>
                                        <p className="text-sm text-gray-500">Update your login credentials securely.</p>
                                    </div>
                                </div>

                                {pwStatus.msg && (
                                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium border animate-in fade-in slide-in-from-top-2 ${
                                        pwStatus.type === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'
                                    }`}>
                                        {pwStatus.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
                                        {pwStatus.msg}
                                    </div>
                                )}

                                <div className="flex flex-col md:flex-row items-end gap-4 max-w-2xl">
                                    <div className="flex-1 w-full space-y-4">
                                        <div className="relative">
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Current Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPw1 ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    value={currentPassword}
                                                    onChange={e => setCurrentPassword(e.target.value)}
                                                    className="w-full p-2.5 pl-4 pr-10 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                                />
                                                <button type="button" onClick={() => setShowPw1(!showPw1)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                                    {showPw1 ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPw2 ? "text" : "password"}
                                                    placeholder="Min 6 characters"
                                                    value={newPassword}
                                                    onChange={e => setNewPassword(e.target.value)}
                                                    className="w-full p-2.5 pl-4 pr-10 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                                />
                                                <button type="button" onClick={() => setShowPw2(!showPw2)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                                    {showPw2 ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handlePasswordUpdate}
                                        disabled={isUpdatingPw}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap h-[41px] flex items-center justify-center min-w-[160px]"
                                    >
                                        {isUpdatingPw ? 'Updating...' : 'Update Login'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* System Backup */}
                        <div id="backup" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="p-3 bg-green-100 rounded-xl text-green-600">
                                    <Database size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">System Backup</h3>
                                    <p className="text-sm text-gray-500">Create a manual snapshot of users and settings.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <button
                                        onClick={handleBackup}
                                        className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-xl font-bold shadow-sm transition-colors"
                                    >
                                        <Download size={18} /> Download Localstate Snapshot
                                    </button>
                                    <p className="text-xs text-gray-500 mt-2">Downloads a `.json` backup containing your active user cache, permissions, and app settings.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="mt-auto pt-8 flex justify-end shrink-0 mb-4 px-6 relative z-10 bottom-0">
                    <button
                        onClick={isDirty ? handleSave : undefined}
                        disabled={!isDirty}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${isDirty
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 cursor-pointer'
                            : 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'
                            }`}
                    >
                        <Save size={20} /> Save Changes
                    </button>
                </div>
            </div>
        </main>
    );
};

export default AdminSettings;
