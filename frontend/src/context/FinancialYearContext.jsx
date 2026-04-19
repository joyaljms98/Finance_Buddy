'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const FinancialYearContext = createContext();

export const getIndianFY = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0 is Jan, 3 is Apr
    if (month >= 3) {
        return `${year}-${(year + 1).toString().slice(-2)}`;
    } else {
        return `${year - 1}-${year.toString().slice(-2)}`;
    }
};

export const generateFYList = () => {
    const currentFY = getIndianFY(new Date());
    const startYear = 2020;
    const currentStartYear = parseInt(currentFY.split('-')[0]);
    const list = [];
    
    // As per request: limit to present
    for (let y = startYear; y <= currentStartYear; y++) {
        list.push(`${y}-${(y + 1).toString().slice(-2)}`);
    }
    
    // We can reverse it so newest is first, or keep ascending
    return list;
};

export const FinancialYearProvider = ({ children }) => {
    const [selectedFY, setSelectedFY] = useState('');
    const [fyOptions, setFyOptions] = useState([]);
    const [currentFY, setCurrentFY] = useState('');

    useEffect(() => {
        const current = getIndianFY(new Date());
        setCurrentFY(current);
        const options = generateFYList();
        setFyOptions(options);
        
        const stored = localStorage.getItem('finance_buddy_fy');
        if (stored && options.includes(stored)) {
            setSelectedFY(stored);
        } else {
            setSelectedFY(current);
            localStorage.setItem('finance_buddy_fy', current);
        }
    }, []);

    const handleSetFY = (fy) => {
        setSelectedFY(fy);
        localStorage.setItem('finance_buddy_fy', fy);
    };

    return (
        <FinancialYearContext.Provider value={{ selectedFY, setSelectedFY: handleSetFY, fyOptions, currentFY }}>
            {children}
        </FinancialYearContext.Provider>
    );
};

export const useFinancialYear = () => useContext(FinancialYearContext);
