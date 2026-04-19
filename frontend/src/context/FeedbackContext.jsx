'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const FeedbackContext = createContext();

export const useFeedback = () => {
    return useContext(FeedbackContext);
};

export const FeedbackProvider = ({ children }) => {
    // Using local storage to persist mock messages
    const [messages, setMessages] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const fetchFeedback = async () => {
        try {
            const token = localStorage.getItem('finance_buddy_token');
            if (!token) {
                setIsLoaded(true);
                return;
            }
            const res = await api.get('/communication/feedback');
            setMessages(res.data);
        } catch (err) {
            console.error("Failed to load feedback from backend", err);
        } finally {
            setIsLoaded(true);
        }
    };

    useEffect(() => {
        fetchFeedback();
        // Removed websocket connection per user's request
    }, []);

    const submitFeedback = async (senderName, senderRole, type, title, content) => {
        try {
            const newMessagePayload = {
                senderName,
                senderRole,
                time: new Date().toISOString(),
                type,
                title,
                content,
                status: 'New',
                replies: []
            };
            const res = await api.post('/communication/feedback', newMessagePayload);
            setMessages(prev => [res.data, ...prev]);
        } catch (err) { console.error(err); }
    };

    const addReply = async (messageId, sender, content) => {
        try {
            const targetMsg = messages.find(m => m.id === messageId);
            if (!targetMsg) return;

            const newStatus = sender === 'Admin' ? 'Replied' : 'New';
            const newReplies = [...targetMsg.replies, { sender, time: new Date().toISOString(), content }];

            await api.put(`/communication/feedback/${messageId}`, {
                status: newStatus,
                replies: newReplies
            });

            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    msg.id === messageId ? { ...msg, status: newStatus, replies: newReplies } : msg
                )
            );
        } catch (err) { console.error(err); }
    };

    const updateStatus = async (messageId, newStatus) => {
        try {
            await api.put(`/communication/feedback/${messageId}`, { status: newStatus });
            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    msg.id === messageId ? { ...msg, status: newStatus } : msg
                )
            );
        } catch (err) { console.error(err); }
    };

    return (
        <FeedbackContext.Provider value={{ messages, submitFeedback, addReply, updateStatus, refreshFeedback: fetchFeedback }}>
            {children}
        </FeedbackContext.Provider>
    );
};
