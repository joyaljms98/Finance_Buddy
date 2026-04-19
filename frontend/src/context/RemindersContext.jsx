'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUsers } from './UsersContext';
import api from '../lib/api';

const RemindersContext = createContext();

export function RemindersProvider({ children }) {
    const { activeUser, isLoaded: usersLoaded } = useUsers();

    const [reminders, setReminders] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const fetchReminders = async () => {
            const token = localStorage.getItem('finance_buddy_token');
            if (!token) {
                setIsLoaded(true);
                return;
            }
            try {
                const res = await api.get('/communication/reminders');
                setReminders(res.data);
            } catch (e) { console.error(e); }
            setIsLoaded(true);
        };

        // Wait for UsersContext to verify token before loading secure communications
        if (usersLoaded) {
            fetchReminders();
        }
    }, [usersLoaded]);

    const addReminder = async (reminder) => {
        try {
            const payload = {
                ...reminder,
                createdAt: new Date().toISOString()
            };
            const res = await api.post('/communication/reminders', payload);
            setReminders(prev => [...prev, res.data]);
            window.dispatchEvent(new Event('finance_buddy_data_updated'));
        } catch (e) { console.error(e); }
    };

    const updateReminder = async (id, updatedFields) => {
        try {
            await api.put(`/communication/reminders/${id}`, updatedFields);
            setReminders(prev => prev.map(r => r.id === id ? { ...r, ...updatedFields } : r));
            window.dispatchEvent(new Event('finance_buddy_data_updated'));
        } catch (e) { console.error(e); }
    };

    const deleteReminder = async (id) => {
        try {
            await api.delete(`/communication/reminders/${id}`);
            setReminders(prev => prev.filter(r => r.id !== id));
            window.dispatchEvent(new Event('finance_buddy_data_updated'));
        } catch (e) { console.error(e); }
    };

    // Filtered list for the active user's view
    const myReminders = React.useMemo(() => {
        if (!activeUser) return [];

        if (activeUser.role === 'Admin') {
            return reminders; // Admin sees all
        }

        if (activeUser.role === 'Editor') {
            return reminders.filter(r =>
                r.targetGroup === 'all_users' ||
                r.targetGroup === 'all_editors' ||
                r.targetGroup === activeUser.userId ||
                r.createdBy === activeUser.userId
            );
        }

        // Regular User
        return reminders.filter(r => r.targetGroup === 'all_users');
    }, [reminders, activeUser]);

    return (
        <RemindersContext.Provider value={{
            reminders,
            myReminders,
            addReminder,
            updateReminder,
            deleteReminder,
            isLoaded: isLoaded && usersLoaded
        }}>
            {children}
        </RemindersContext.Provider>
    );
}

export function useReminders() {
    return useContext(RemindersContext);
}
