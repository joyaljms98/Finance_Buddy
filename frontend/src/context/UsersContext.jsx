'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const UsersContext = createContext();

export const useUsers = () => useContext(UsersContext);

export const UsersProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [activeUser, setActiveUser] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Verifies token on initial load
    useEffect(() => {
        const loadInitialData = async () => {
            const token = localStorage.getItem('finance_buddy_token');
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    setActiveUser(res.data);
                } catch (error) {
                    console.error("Token verification failed:", error);
                    localStorage.removeItem('finance_buddy_token');
                    setActiveUser(null);
                }
            }
            setIsLoaded(true);
        };
        loadInitialData();
    }, []);

    // Load full users list if active user is Admin
    useEffect(() => {
        const fetchUsers = async () => {
            if (activeUser && activeUser.role === 'Admin') {
                try {
                    const res = await api.get('/users');
                    setUsers(res.data);
                } catch (error) {
                    console.error("Failed to load user list:", error);
                }
            }
        };
        fetchUsers();
    }, [activeUser]);

    const checkUserIdExists = (userId, excludeId = null) => {
        return users.some(u => u.userId === userId && u.id !== excludeId);
    };

    const clearUserData = () => {
        const keysToRemove = [
            'finance_buddy_notes',
            'finance_buddy_folders',
            'finance_buddy_archived_reminders',
            'finance_buddy_goals',
            'financeBuddy_budgets',
            'finance_buddy_profile_',
            'active_tax_profile_id',
            'fb_chat_mode',
            'fb_chat_scope'
        ];
        Object.keys(localStorage).forEach(key => {
            if (keysToRemove.some(prefix => key.startsWith(prefix))) {
                localStorage.removeItem(key);
            }
        });
    };

    const login = async (userId, password) => {
        try {
            const formData = new URLSearchParams();
            formData.append('username', userId);
            formData.append('password', password);

            const res = await api.post('/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const token = res.data.access_token;
            clearUserData();
            localStorage.setItem('finance_buddy_token', token);

            // Fetch me data immediately
            const userRes = await api.get('/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setActiveUser(userRes.data);
            return { success: true, user: userRes.data };
        } catch (err) {
            return { success: false, error: err.response?.data?.detail || 'Invalid User ID or Password' };
        }
    };

    const logout = () => {
        clearUserData();
        localStorage.removeItem('finance_buddy_token');
        setActiveUser(null);
        window.location.href = '/login';
    };

    const addUser = async (newUser) => {
        try {
            // newUser is standard json payload
            const res = await api.post('/auth/register', newUser);
            setUsers(prev => [...prev, res.data]);
            return { success: true, user: res.data };
        } catch (err) {
            return { success: false, error: err.response?.data?.detail || 'Failed to add user' };
        }
    };

    const updateUser = async (id, updates) => {
        // Mock fallback since FastAPI update user wasn't implemented strictly in API
        // For frontend UI compatibility
        setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
        if (activeUser && activeUser.id === id) {
            setActiveUser(prev => ({ ...prev, ...updates }));
        }
        return { success: true };
    };

    const deleteUser = async (id) => {
        const u = users.find(x => x.id === id);
        if (!u) return { success: false, error: "User not found" };

        try {
            await api.delete(`/users/${u.user_id}`);
            setUsers(prev => prev.filter(x => x.id !== id));
            if (activeUser && activeUser.id === id) {
                logout();
            }
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.detail || 'Cannot delete user' };
        }
    };

    const value = {
        users,
        activeUser,
        isLoaded,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
        checkUserIdExists
    };

    return (
        <UsersContext.Provider value={value}>
            {children}
        </UsersContext.Provider>
    );
};
