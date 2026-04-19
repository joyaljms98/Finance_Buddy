'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
import { useUsers } from './UsersContext';

const CashBookContext = createContext();

export const useCashBook = () => useContext(CashBookContext);

export const CashBookProvider = ({ children }) => {
    // Initial data for fresh accounts
    const initialBooks = [
        { name: 'My Main Book', initialBalance: 0, isSystem: false },
        { name: 'My side Hustle', initialBalance: 0, isSystem: false }
    ];

    const initialHeads = [
        { id: 'head-cash', name: 'Cash', type: 'income', isSystem: true },
        { id: 'head-bank', name: 'bank', type: 'income', isSystem: true },
        { id: 'head-gpay', name: 'Gpay', type: 'income', isSystem: true },
        { name: 'Food', type: 'expense', isSystem: true },
        { name: 'travel', type: 'expense', isSystem: true },
        { name: 'emi', type: 'expense', isSystem: true },
        { name: 'subscriptions', type: 'expense', isSystem: true }
    ];

    const [books, setBooks] = useState([]);
    const [heads, setHeads] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    
    const { activeUser } = useUsers();

    const bootstrapCashBook = async () => {
        try {
            // Check if active user has books
            const booksRes = await api.get('/cashbook/books');
            const headsRes = await api.get('/cashbook/heads');
            const transRes = await api.get('/cashbook/transactions');

            // If completely empty, bootstrap initial DB state
            let loadedBooks = booksRes.data;
            let loadedHeads = headsRes.data;

            if (loadedBooks.length === 0 && loadedHeads.length === 0) {
                // Bulk create initial
                for (const b of initialBooks) {
                    const res = await api.post('/cashbook/books', b);
                    loadedBooks.push(res.data);
                }
                for (const h of initialHeads) {
                    const res = await api.post('/cashbook/heads', h);
                    loadedHeads.push(res.data);
                }
            }

            setBooks(loadedBooks);
            setHeads(loadedHeads);
            setTransactions(transRes.data);
        } catch (err) {
            console.error("Failed to fetch CashBook data from backend", err);
        } finally {
            setIsLoaded(true);
        }
    };

    // Persistence Layer
    useEffect(() => {
        const token = localStorage.getItem('finance_buddy_token');
        if (token && activeUser?.user_id) {
            bootstrapCashBook();
        } else if (!token || !activeUser) {
            // Clear all data if not logged in
            setBooks([]);
            setHeads([]);
            setTransactions([]);
            setIsLoaded(true);
        }
    }, [activeUser?.user_id]);

    // -- Book Methods --
    const addBook = async (name, initialBalance = 0) => {
        try {
            const res = await api.post('/cashbook/books', {
                name,
                initialBalance: Number(initialBalance),
                isSystem: false
            });
            setBooks(prev => [...prev, res.data]);
            return res.data.id;
        } catch (err) { console.error(err); }
    };

    const updateBook = async (id, newName, newInitialBalance) => {
        try {
            await api.put(`/cashbook/books/${id}`, { name: newName, initialBalance: Number(newInitialBalance) });
            setBooks(prev => prev.map(b => b.id === id ? { ...b, name: newName, initialBalance: Number(newInitialBalance) } : b));
        } catch (err) { console.error(err); }
    };

    const deleteBook = async (id) => {
        try {
            await api.delete(`/cashbook/books/${id}`);
            setBooks(prev => prev.filter(b => b.id !== id));
            setTransactions(prev => prev.filter(t => t.bookId !== id)); // Cascade update frontend
        } catch (err) { console.error(err); }
    };

    // -- Head Methods --
    const addHead = async (name, type) => {
        try {
            const res = await api.post('/cashbook/heads', { name, type, isSystem: false });
            setHeads(prev => [...prev, res.data]);
            return res.data.id;
        } catch (err) { console.error(err); }
    };

    // -- Transaction Methods --
    const addTransaction = async ({ bookId, headId, type, amount, date, description, isRecurring, recurringType }) => {
        try {
            const res = await api.post('/cashbook/transactions', {
                bookId,
                headId,
                type,
                amount: Number(amount),
                date: date || new Date().toISOString(),
                description: description || '',
                isRecurring: !!isRecurring,
                recurringType: recurringType || 'none'
            });
            setTransactions(prev => [...prev, res.data]);
        } catch (err) { console.error(err); }
    };

    const updateTransaction = async (id, updatedData) => {
        try {
            const res = await api.put(`/cashbook/transactions/${id}`, {
                ...updatedData,
                amount: Number(updatedData.amount)
            });
            setTransactions(prev => prev.map(t => t.id === id ? res.data : t));
        } catch (err) { console.error(err); }
    };

    const deleteTransaction = async (id) => {
        try {
            await api.delete(`/cashbook/transactions/${id}`);
            setTransactions(prev => prev.filter(t => t.id !== id));
        } catch (err) { console.error(err); }
    };

    // -- Computed Balances --
    const getBookBalance = (bookId) => {
        const book = books.find(b => b.id === bookId);
        if (!book) return 0;

        let balance = book.initialBalance || 0;
        transactions.filter(t => t.bookId === bookId).forEach(t => {
            if (t.type === 'income') balance += t.amount;
            else if (t.type === 'expense') balance -= t.amount;
        });

        return balance;
    };

    const value = {
        books,
        heads,
        transactions,
        isLoaded,
        addBook,
        updateBook,
        deleteBook,
        addHead,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getBookBalance
    };

    return (
        <CashBookContext.Provider value={value}>
            {children}
        </CashBookContext.Provider>
    );
};
